// ~/stores/notes.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { type Note, db } from '~/db'
import { useToast } from '@/composables/useToast'

/* ---------- 类型工具 ---------- */
interface ConflictPayload extends Partial<Pick<Note, 'title' | 'body' | 'pinned'>> { }

// 定义操作队列项类型
interface QueueItem {
    id: string
    type: 'update' | 'delete'
    payload?: ConflictPayload
    timestamp: number
}

/* ---------- Store ---------- */
export const useNotesStore = defineStore('notes', () => {
    // 组件卸载时清理超时，避免内存泄漏
    onUnmounted(() => {
        if (batchWriteTimeout) {
            clearTimeout(batchWriteTimeout)
            batchWriteTimeout = null
        }
    })
    /* --- state --- */
    const notes = ref<Note[]>([])
    const editingId = ref<string | null>(null)
    const isSaving = ref(false)

    // 操作队列
    let operationQueue: QueueItem[] = []
    let batchWriteTimeout: ReturnType<typeof setTimeout> | null = null

    /* --- getters --- */
    const sortedNotes = computed(() =>
        [...notes.value].sort((a, b) => {
            if (a.pinned && b.pinned) return b.pinned - a.pinned
            if (a.pinned) return -1
            if (b.pinned) return 1
            return b.updatedAt - a.updatedAt
        })
    )

    /* --- 工具：统一错误处理 --- */
    const { addToast } = useToast()

    function handleError(e: unknown, fallback = '操作失败') {
        const msg = e instanceof Error ? e.message : fallback
        console.error(msg, e)
        addToast(msg, 'error')
    }

    /* --- 冲突检测 --- */
    async function checkConflict(id: string, clientUpdatedAt: number) {
        const remote = await db.notes.get(id)
        // console.log('冲突检测：', remote?.updatedAt, clientUpdatedAt)
        if (!remote) {
            throw new Error('笔记不存在或已被删除')
        }
        if (remote.updatedAt > clientUpdatedAt) {
            throw new Error('冲突：远程版本较新，请先刷新')
        }
    }

    /* --- actions --- */
    async function loadAll() {
        try {
            notes.value = await db.notes.orderBy('updatedAt').reverse().toArray()
        } catch (e) {
            handleError(e, '加载笔记失败')
        }
    }

    async function addNote(title = '', body = '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[]}]}') {
        try {
            const now = Date.now()
            const note: Note = { id: crypto.randomUUID(), title, body, createdAt: now, updatedAt: now }

            await db.notes.add(note)
            notes.value.unshift(note)
            return note.id
        } catch (e) {
            handleError(e, '新建笔记失败')
        }
    }

    async function updateNote(id: string, payload: ConflictPayload) {
        try {
            const idx = notes.value.findIndex(n => n.id === id)
            if (idx === -1) throw new Error('本地不存在该笔记')

            const old = notes.value[idx]!
            await checkConflict(id, old.updatedAt)

            const now = Date.now()
            const updated: Note = { ...old, ...payload, updatedAt: now }
            notes.value[idx] = updated

            operationQueue.push({
                id,
                type: 'update',
                payload,
                timestamp: now
            })
            scheduleProcessQueue()
        } catch (e) {
            handleError(e, '保存失败')
        }
    }

    /* --- 防抖持久化 --- */
    const debouncedUpdate = useDebounceFn(
        async (id: string, payload: ConflictPayload) => {
            await updateNote(id, payload)
        },
        300
    )

    async function removeNote(id: string) {
        try {
            const noteIndex = notes.value.findIndex(n => n.id === id)
            if (noteIndex === -1) return

            const noteToDelete = notes.value[noteIndex]!
            await checkConflict(id, noteToDelete.updatedAt)

            notes.value.splice(noteIndex, 1)
            if (editingId.value === id) {
                editingId.value = null
            }

            operationQueue.push({
                id,
                type: 'delete',
                timestamp: Date.now()
            })
            scheduleProcessQueue()
            addToast(`"${noteToDelete.title || '无标题'}" 已删除`, 'success')
        } catch (e) {
            handleError(e, '删除失败')
        }
    }

    async function togglePin(id: string) {
        try {
            const idx = notes.value.findIndex(n => n.id === id)
            if (idx === -1) throw new Error('笔记不存在')

            const note = notes.value[idx]!

            // 置顶前进行冲突检测
            await checkConflict(id, note.updatedAt)

            const now = Date.now()
            const pinned = note.pinned ? undefined : now

            // 立即更新内存
            const updated: Note = { ...note, pinned, updatedAt: now }
            notes.value[idx] = updated
            // 立即同步到数据库
            await db.notes.update(id, { pinned, updatedAt: now })

            addToast(`"${note.title || '无标题'}" ${!note.pinned ? '已置顶' : '已取消置顶'}`, 'success')
        } catch (e) {
            handleError(e, '置顶操作失败')
        }
    }
    async function updateEditingId(id: string) {
        try {
            editingId.value = id
        } catch (e) {
            handleError(e, '切换失败')
        }
    }

    /* --- 批量写入队列处理 --- */
    const processOperationQueue = async () => {
        if (isSaving.value || operationQueue.length === 0) return

        isSaving.value = true
        const currentQueue = [...operationQueue]
        operationQueue = []

        try {
            await db.transaction('readwrite', 'notes', async (transaction) => {
                const notesStore = transaction.notes

                // 去重处理 - 保留最新的操作
                const uniqueOperations = new Map<string, QueueItem>()
                currentQueue.forEach(item => {
                    const existing = uniqueOperations.get(item.id)
                    if (!existing || item.timestamp > existing.timestamp || item.type === 'delete') {
                        uniqueOperations.set(item.id, item)
                    }
                })

                // 执行操作
                for (const [id, item] of uniqueOperations.entries()) {
                    if (item.type === 'delete') {
                        await notesStore.delete(id)
                    } else if (item.type === 'update' && item.payload) {
                        const note = notes.value.find(n => n.id === id)
                        if (!note) continue

                        const updated: Note = { ...note, ...item.payload, updatedAt: Date.now() }
                        await notesStore.put(updated)

                        // 更新内存中的时间戳
                        const idx = notes.value.findIndex(n => n.id === id)
                        if (idx !== -1) {
                            notes.value[idx]!.updatedAt = Date.now()
                        }
                    }
                }
            })
        } catch (e) {
            console.error('批量处理操作队列失败:', e)
            operationQueue = [...currentQueue, ...operationQueue]
            handleError(e, '批量保存失败，请稍后重试')
        } finally {
            isSaving.value = false
            if (operationQueue.length > 0) {
                scheduleProcessQueue()
            }
        }
    }

    // 安排队列处理
    const scheduleProcessQueue = () => {
        if (batchWriteTimeout) {
            clearTimeout(batchWriteTimeout)
        }
        // console.log('📝 队列调度：将在1.5秒后批量处理', operationQueue.length, '个操作')
        batchWriteTimeout = setTimeout(processOperationQueue, 1500)
    }

    /* --- 暴露供模板的防抖包装 --- */
    function queueUpdate(id: string, payload: ConflictPayload) {
        debouncedUpdate(id, payload)
    }

    return {
        notes: readonly(notes),
        editingId,
        isSaving,
        sortedNotes,
        loadAll,
        updateEditingId,
        addNote,
        updateNote,
        queueUpdate,
        removeNote,
        togglePin
    }
})
