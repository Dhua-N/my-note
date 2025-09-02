// ~/stores/notes.ts
import { defineStore } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { type Note, db } from '~/db'

/* ---------- 类型工具 ---------- */
interface ConflictPayload extends Partial<Pick<Note, 'title' | 'body' | 'pinned'>> {}

/* ---------- Store ---------- */
export const useNotesStore = defineStore('notes', () => {
    /* --- state --- */
    const notes = ref<Note[]>([])
    const editingId = ref<string | null>(null)

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

    /* --- 防抖持久化 --- */
    const debouncedUpdate = useDebounceFn(
        (id: string, payload: ConflictPayload) => updateNote(id, payload),
        600
        )

    /* --- actions --- */
    async function loadAll() {
        try {
            notes.value = await db.notes.orderBy('updatedAt').reverse().toArray()
        } catch (e) {
            handleError(e, '加载笔记失败')
        }
    }

    async function addNote(title = '', body = '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[]}]}' ) {
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
   * 供防抖函数或外部「立即保存」调用
   */
    async function updateNote(id: string, payload: ConflictPayload) {
        try {
            const idx = notes.value.findIndex(n => n.id === id)
            if (idx === -1) throw new Error('本地不存在该笔记')

            const old = notes.value[idx]!
            await checkConflict(id, old.updatedAt) // 冲突检测

            const now = Date.now()
            const updated: Note = { ...old, ...payload, updatedAt: now }
            await db.notes.update(id, updated)
            notes.value[idx] = updated
        } catch (e) {
            handleError(e, '保存失败')
        }
    }

    async function removeNote(id: string) {
        try {
            await db.notes.delete(id)
            notes.value = notes.value.filter(n => n.id !== id)
        } catch (e) {
            handleError(e, '删除失败')
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