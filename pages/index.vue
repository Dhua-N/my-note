<!-- pages/index.vue -->
<template>
  <main
    class="h-screen flex bg-gradient-to-br z-[9999] from-slate-50 to-slate-100
           dark:from-slate-900 dark:to-slate-800 p-4 gap-4"
  >
    <ToastList />
    <!-- 左侧列表 -->
    <NoteSidebar
      :notes="notes"
      :active-id="(route.query.id as string) || ''"
      @create="createNote"
      @select="selectNote"
      @delete="deleteNote"
      @toggle-pin="togglePin"
    />

    <!-- 右侧详情 / 骨架屏 -->
    <div class="flex-1">
      <NoteSkeleton v-if="loading" />
      <NoteDetail
        v-else-if="current"
      />
      <div
        v-else
        class="h-full flex items-center justify-center text-slate-500"
      >
        选择或新建一条笔记
      </div>
    </div>
    <ThemeToggle />
  </main>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
import { ref, watch, onMounted, provide } from 'vue'
import { nanoid } from 'nanoid'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { db, type Note } from '@/db'
import { useDebounceFn } from '@vueuse/core'

const notes = ref<Note[]>([])
const current = ref<Note | null>(null)
const loading = ref(false)
const route = useRoute()
const router = useRouter()

provide('currentTitle', computed(() => current.value?.title))
provide('currentBody', computed(() => current.value?.body))
provide('updateCurrentTitle', (v: string) => {
  if (current.value) current.value.title = v
})
provide('updateCurrentBody',  (v: string) => {
  if (current.value) current.value.body = v
})

/* ---------- 删除/置顶 ---------- */
const deleteNote = async (noteId: string) => {
  try {
    await db.notes.delete(noteId)
    if (route.query.id === noteId) {
      router.push({ query: {} })
    }
    await loadNotes()
  } catch (err) {
    console.error('删除笔记失败:', err)
  }
}

const togglePin = async (noteId: string, isPinned: boolean) => {
  try {
    if(noteId == current.value?.id) {
      current.value.pinned = isPinned ? Date.now() : undefined
    }
    const note = await db.notes.get(noteId)
    if (note) {
      await db.notes.put({
        ...note,
        pinned: isPinned ? Date.now() : undefined
      })
      await loadNotes()
    }
  } catch (err) {
    console.error('置顶笔记失败:', err)
  }
}

/* ---------- 列表 ---------- */
const loadNotes = async () => {
  try {
    loading.value = true
    const allNotes = await db.notes.toArray()
    // 分开置顶和非置顶笔记
    const pinnedNotes = allNotes.filter(n => n.pinned).sort((a, b) => (b.pinned || 0) - (a.pinned || 0))
    const unpinnedNotes = allNotes.filter(n => !n.pinned).sort((a, b) => b.createdAt - a.createdAt)
    notes.value = [...pinnedNotes, ...unpinnedNotes]
  } catch (err) {
    console.error('加载笔记失败:', err)
    notes.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNotes()
})

/* ---------- 选中/新建 ---------- */
const selectNote = async (id: string) => {
  // 如果当前有笔记，先保存
  if (current.value) {
    const updatedNote = { ...current.value, updatedAt: Date.now() }
    await db.notes.put(updatedNote)
    const index = notes.value.findIndex(n => n.id === updatedNote.id)
    if (index !== -1) {
      notes.value[index] = updatedNote
    }
  }
  // 仅改 query，不整页刷新
  router.push({ query: { id } })
}

const createNote = async () => {
  try {
    const id = nanoid()
    await db.notes.add({
      id,
      title: '',
      body: '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[]}]}',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    await loadNotes()
    selectNote(id)
  } catch (err) {
    console.error('创建笔记失败:', err)
  }
}

/* ---------- 路由变化监听 ---------- */
watch(
  () => route.query.id,
  async (raw) => {
    try {
      const id = Array.isArray(raw) ? raw[0] : raw
      if (!id) {
        current.value = null
        return
      }
      current.value = (await db.notes.get(id)) ?? null
    } catch (err) {
      console.error('加载笔记详情失败:', err)
      current.value = null
    }
  },
  { immediate: true }
)

/* ---------- 实时防抖保存 ---------- */
const debounceSave = useDebounceFn(async (note: Note) => {
  try {
    const updatedNote = { ...note, updatedAt: Date.now() }
    await db.notes.put(updatedNote)
    // 只更新列表中对应的笔记标题
    const index = notes.value.findIndex(n => n.id === note.id)
    if (index !== -1) {
      notes.value[index] = updatedNote
    }
  } catch (err) {
    console.error('自动保存失败:', err)
  }
}, 500)

watch(current, (note) => {
  if (note) debounceSave(note)
}, { deep: true })

/* ---------- 路由离开时兜底保存 ---------- */
onBeforeRouteLeave(async () => {
  if (current.value) {
    await debounceSave(current.value)
  }
})
</script>