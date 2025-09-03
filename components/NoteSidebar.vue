<!-- components/NoteSidebar.vue -->
<template>
  <aside
    :class="[
      'shrink-0 flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-md \
       border-r border-slate-200/50 dark:border-slate-700/50 \
       shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 \
       transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-72'
    ]"
  >
    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="删除此笔记？"
      message="这条笔记将被永久删除，不可恢复及撤销"
      @confirm="confirmDelete"
    />

    <!-- 顶部：新建按钮（左） + 折叠按钮（右） -->
    <div class="flex items-center px-3 pt-3 gap-2 my-2">
      <!-- 新建按钮：固定 40×40 -->
      <button
        @click="$emit('create')"
        :class="[
          'w-10 h-10 flex-shrink-0 \
          flex items-center justify-center rounded-xl bg-sky-500 \
          hover:bg-sky-600 active:bg-sky-700 text-white transition-all \
          duration-200',
          collapsed ? '' : 'w-auto flex-1 gap-2 text-sm font-medium'
        ]"
      >
        <span class="text-lg leading-none">＋</span>
        <span
          v-show="!collapsed"
          class="overflow-hidden whitespace-nowrap"
          :class="[
            'transition-[width,opacity] duration-200 ease-in-out',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 delay-200'
          ]"
        >
          新建笔记
        </span>
      </button>

      <!-- 折叠按钮：独立，永远不被挤压 -->
      <button
        @click="collapsed = !collapsed"
        class="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10"
        :title="collapsed ? '展开' : '折叠'"
      >
        <svg
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': collapsed }"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
    </div>

    <!-- 列表区域：折叠后完全隐藏 -->
    <ul
      :class="[
        'flex-1 overflow-y-auto px-3 pb-3 space-y-1.5',
        'transition-opacity duration-200 ease-in-out',
        collapsed ? 'opacity-0 invisible' : 'opacity-100 delay-300'
      ]"
    >
      <li v-for="note in notes" :key="note.id" class="group relative">
        <span
          v-if="note.pinned"
          class="absolute left-0 top-1/2 -translate-y-1/2 text-sky-500/75"
        >
          📌
        </span>
        <button
          @click="$emit('select', note.id)"
          :class="[
            activeId === note.id
              ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shadow-sm'
              : 'hover:bg-slate-100/80 dark:hover:bg-slate-700/60 dark:text-slate-400',
            'block w-full text-left pr-16 pl-4 py-3 rounded-xl text-sm truncate transition-colors duration-200'
          ]"
        >
          {{ note.title || '无标题' }}
        </button>

        <!-- 置顶 / 删除 -->
        <div
          class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                 transition-opacity duration-200 flex gap-1"
        >
          <button
            @click="handleTogglePin(note)"
            class="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg"
            :title="note.pinned ? '取消置顶' : '置顶'"
          >
            📌
          </button>
          <button
            @click="handleDelete(note)"
            class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
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
import FontSettingsModal from './FontSettingsModal.vue'

const props = defineProps<{ notes: Note[]; activeId: string }>()
const emit = defineEmits<{
  create: []
  select: [id: string]
  delete: [id: string]
  togglePin: [id: string, isPinned: boolean]
}>()

const { addToast } = useToast()

/* ---------- 折叠状态 ---------- */
const collapsed = ref(false)

/* ---------- 置顶、删除逻辑 ---------- */
const showDeleteConfirm = ref(false)
const noteToDelete = ref<Note | null>(null)

const handleTogglePin = (note: Note) => {
  emit('togglePin', note.id, !note.pinned)
  addToast(
    `"${note.title || '无标题'}" ${!note.pinned ? '已置顶' : '已取消置顶'}`,
    'success'
  )
}

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

/* ---------- 帮助弹出状态 ---------- */
const showHelp = ref(false)
const showHelpMenu = ref(false)
const showFontSettings = ref(false)
</script>

<style scoped>
/* 淡入动画 */
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>