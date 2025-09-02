<!-- pages/index.vue -->
<template>
  <main
    class="h-screen flex bg-gradient-to-br z-[9999] from-slate-50 to-slate-100
           dark:from-slate-900 dark:to-slate-800 p-4 gap-4"
  >
    <ToastList />
    <!-- 左侧列表 -->
    <NoteSidebar
      :notes="sortedNotes"
      :active-id="(editingId as string) || ''"
      @create="handleAddNote"
      @select="changeNote"
      @delete="handleDeleteNote"
      @toggle-pin="store.togglePin"
    />
    <!--  -->

    <!-- 右侧详情 / 骨架屏 -->
    <div class="flex-1">
      <NoteSkeleton v-if="loading" />
      <NoteDetail
        v-else-if="editingId"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '~/stores/notes'

const store = useNotesStore()
const { notes, editingId, sortedNotes } = storeToRefs(store)
const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(true)

provide('currentTitle', computed(() => notes.value.find(n => n.id === editingId.value)?.title || ''))
provide('currentBody', computed(() => notes.value.find(n => n.id === editingId.value)?.body || ''))
provide('updateCurrentTitle', async (title: string) => {
  if (editingId.value) await store.updateNote(editingId.value, { title })
})
provide('updateCurrentBody', async (body: string) => {
  if (editingId.value) await store.updateNote(editingId.value, { body })
})

function changeNote(id: string) {
  router.push({ query: { id } })
}

async function handleAddNote() {
  const id = await store.addNote()
  router.push({ query: { id } })
}

function handleDeleteNote(id: string) {
  if (editingId.value === id) {
    router.push({ query: {} })
  }
  store.removeNote(id)
}

onMounted(async () => {
  /* ---------- 初始化：把 IndexedDB 数据拉进内存 ---------- */
  await store.loadAll()
  loading.value = false
})

/* ---------- 路由变化监听 ---------- */
watch(
  () => route.query.id,
  async id => await store.updateEditingId(id as string),
  { immediate: true }
)
</script>