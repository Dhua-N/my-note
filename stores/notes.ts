// ~/stores/notes.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { type Note, db } from '~/db'
import { createError } from 'h3'

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
    function handleError(e: unknown, fallback = '操作失败') {
        console.error(e)
        // 你可以换成 toast、modal、logger 等
        throw createError({ message: fallback, statusCode: 500 })
    }

    /* --- 工具：冲突检测 --- */
    async function checkConflict(id: string, clientUpdatedAt: number) {
        const remote = await db.notes.get(id)
        if (!remote) throw new Error('笔记不存在')
        if (remote.updatedAt > clientUpdatedAt) {
            throw new Error('冲突：远程版本较新，请先刷新')
        }
    }

    /* --- 批量写入队列处理 --- */
    // 批量处理操作队列
    const processOperationQueue = async () => {
        if (isSaving.value || operationQueue.length === 0) return

        isSaving.value = true
        const currentQueue = [...operationQueue]
        operationQueue = []

        // console.log('🔍 开始批量处理，当前队列：', currentQueue.length, '个操作')
        try {
            // 使用Dexie.transaction确保队列的原子性
            await db.transaction('readwrite', 'notes', async (transaction) => {
                const notesStore = transaction.notes

                // 去重处理 - 保留最新的操作
                const uniqueOperations = new Map<string, QueueItem>()
                currentQueue.forEach(item => {
                    // 如果已有同id的操作且新操作时间更新，或者新操作是删除，则替换
                    const existing = uniqueOperations.get(item.id)
                    if (!existing || item.timestamp > existing.timestamp || item.type === 'delete') {
                        uniqueOperations.set(item.id, item)
                    }
                })
                // console.log('💾 执行数据库事务，处理：', uniqueOperations.size, '个唯一操作')

                // 为更新操作进行冲突检测
                const conflictChecks: Promise<void>[] = []
                for (const [id, item] of uniqueOperations.entries()) {
                    if (item.type === 'update' && item.payload) {
                        const note = notes.value.find(n => n.id === id)
                        if (note) {
                            conflictChecks.push(checkConflict(id, note.updatedAt))
                        }
                    }
                }

                // 并行进行所有冲突检测
                await Promise.all(conflictChecks)

                // 处理每个唯一操作
                for (const [id, item] of uniqueOperations.entries()) {
                    const note = notes.value.find(n => n.id === id)
                    if (!note) continue

                    if (item.type === 'delete') {
                        await notesStore.delete(id)
                    } else if (item.type === 'update' && item.payload) {
                        const now = Date.now()
                        const updated: Note = { ...note, ...item.payload, updatedAt: now }
                        await notesStore.put(updated)

                        // 更新内存中的时间戳
                        const idx = notes.value.findIndex(n => n.id === id)
                        if (idx !== -1) {
                            notes.value[idx]!.updatedAt = now
                        }
                    }
                }
            })
        } catch (e) {
            console.error('批量处理操作队列失败:', e)
            // 失败时将未处理的操作放回队列
            operationQueue = [...currentQueue, ...operationQueue]
            // 不再抛出错误，避免中断其他操作
            // 使用更友好的错误处理方式
            handleError(e, '批量保存失败，请稍后重试')
        } finally {
            isSaving.value = false

            // 如果队列中还有操作，继续处理
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

    /* --- 防抖持久化 --- */
    const debouncedUpdate = useDebounceFn(
        async (id: string, payload: ConflictPayload) => {
            try {
                // 立即更新内存，保证用户体验
                const idx = notes.value.findIndex(n => n.id === id)
                if (idx === -1) return

                const now = Date.now()
                const old = notes.value[idx]!
                const updated: Note = { ...old, ...payload, updatedAt: now }
                notes.value[idx] = updated

                // 将操作添加到队列，用于后续批量持久化
                operationQueue.push({
                    id,
                    type: 'update',
                    payload,
                    timestamp: now
                })
                scheduleProcessQueue()
            } catch (e) {
                console.error('添加到队列失败:', e)
                // 降级处理：直接调用updateNote进行保存
                try {
                    await updateNote(id, payload)
                } catch (fallbackError) {
                    console.error('降级保存也失败:', fallbackError)
                }
            }
        },
        300 // 减少防抖时间，因为批量处理会进一步优化
    )

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

    async function updateEditingId(id: string) {
        try {
            editingId.value = id
        } catch (e) {
            handleError(e, '切换失败')
        }
    }

    /**
     * 更新标题或正文（会检测冲突）
     * 供外部「立即保存」调用
     */
    async function updateNote(id: string, payload: ConflictPayload) {
        try {
            const idx = notes.value.findIndex(n => n.id === id)
            if (idx === -1) throw new Error('本地不存在该笔记')

            const old = notes.value[idx]!
            await checkConflict(id, old.updatedAt) // 冲突检测

            const now = Date.now()
            const updated: Note = { ...old, ...payload, updatedAt: now }

            // 立即更新到数据库，不经过队列
            await db.transaction('readwrite', 'notes', async (transaction) => {
                await transaction.notes.put(updated)
            })

            notes.value[idx] = updated
        } catch (e) {
            handleError(e, '保存失败')
        }
    }

    async function removeNote(id: string) {
        try {
            // 先检查是否存在该笔记
            const noteIndex = notes.value.findIndex(n => n.id === id)
            if (noteIndex === -1) {
                console.warn(`尝试删除不存在的笔记: ${id}`)
                return
            }

            // 保存笔记引用，用于可能的撤销操作
            const noteToDelete = notes.value[noteIndex]

            // 立即从内存中移除
            notes.value.splice(noteIndex, 1)

            // 如果当前正在编辑的是这个笔记，清除编辑状态
            if (editingId.value === id) {
                editingId.value = null
            }

            // 添加到删除队列，延迟实际删除操作
            operationQueue.push({
                id,
                type: 'delete',
                timestamp: Date.now()
            })
            scheduleProcessQueue()
        } catch (e) {
            console.error('删除笔记失败:', e)
            // 不抛出错误，避免影响用户体验
            // 可以考虑添加toast提示
        }
    }

    async function togglePin(id: string) {
        try {
            const idx = notes.value.findIndex(n => n.id === id)
            if (idx === -1) return
            const note = notes.value[idx]!
            const pinned = note.pinned ? undefined : Date.now()
            await updateNote(id, { pinned })
        } catch (e) {
            handleError(e, '置顶失败')
        }
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