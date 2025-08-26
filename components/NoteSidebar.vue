<!-- NoteSidebar.vue -->
<template>
  <aside
    class="w-72 shrink-0 flex flex-col bg-white/80 dark:bg-slate-800/80
           backdrop-blur-md border-r border-slate-200/50 dark:border-slate-700/50
           shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
  >
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="删除此笔记？"
      message="这条笔记将被永久删除，不可恢复及撤销"
      @confirm="confirmDelete"
    />
    
    <!-- 新建按钮 -->
    <div class="p-4">
      <button
        @click="$emit('create')"
        class="flex items-center justify-center gap-2 w-full
               bg-sky-500 hover:bg-sky-600 active:bg-sky-700
               text-white font-medium rounded-xl py-2.5 text-sm
               transition-colors duration-200 shadow-sm shadow-sky-500/25"
      >
        ＋ 新建笔记
      </button>
    </div>

    <!-- 列表：点击直接 emit id，父组件改 query -->
    <ul class="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
      <li v-for="note in notes" :key="note.id" class="group relative">
        <button
          @click="$emit('select', note.id)"
          :class="[
            activeId === note.id
              ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shadow-sm'
              : 'hover:bg-slate-100/80 dark:hover:bg-slate-700/60',
            'block w-full text-left pr-16 pl-4 py-3 rounded-xl text-sm truncate transition-colors duration-200'
          ]"
        >
          {{ note.title || '无标题' }}
          <span 
            v-if="note.pinned" 
            class="absolute right-16 top-1/2 -translate-y-1/2 text-sky-500/75"
          >
            📌
          </span>
        </button>
        <!-- 操作按钮 -->
        <div 
          class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                 transition-opacity duration-200 flex gap-1"
        >
          <button
            @click="handleTogglePin(note)"
            class="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10
                   rounded-lg transition-colors duration-200"
            :title="note.pinned ? '取消置顶' : '置顶'"
          >
            📌
          </button>
          <button
            @click="handleDelete(note)"
            class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                   rounded-lg transition-colors duration-200"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { Note } from '@/db'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ notes: Note[]; activeId: string }>()
const emit = defineEmits<{
  create: []
  select: [id: string]
  delete: [id: string]
  togglePin: [id: string, isPinned: boolean]
}>()

const { addToast } = useToast()

const handleTogglePin = (note: Note) => {
  emit('togglePin', note.id, !note.pinned)
  addToast(
    `"${note.title || '无标题'}" ${!note.pinned ? '已置顶' : '已取消置顶'}`,
    'success'
  )
}

const showDeleteConfirm = ref(false)
const noteToDelete = ref<Note | null>(null)

const handleDelete = (note: Note) => {
  noteToDelete.value = note
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (noteToDelete.value) {
    emit('delete', noteToDelete.value.id)
    addToast(`"${noteToDelete.value.title || '无标题'}" 已删除`, 'success')
    noteToDelete.value = null
  }
}
</script>