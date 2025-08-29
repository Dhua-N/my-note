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

    <!-- 帮助按钮：折叠后隐藏 -->
    <div 
      :class="[
        'p-3 mt-auto border-t border-slate-200/50 dark:border-slate-700/50',
        'transition-opacity duration-200 ease-in-out',
        collapsed ? 'opacity-0 invisible' : 'opacity-100 delay-300'
      ]"
    >
      <button
        @click="showHelp = true"
        class="flex items-center justify-center gap-2 w-full
               bg-slate-100 hover:bg-slate-200 active:bg-slate-300
               dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-500
               text-slate-700 dark:text-slate-300 font-medium rounded-xl py-2.5 text-sm
               transition-colors duration-200"
      >
        ❓ 帮助说明
      </button>
    </div>

    <!-- 帮助弹窗（保持不变） -->
    <Transition name="fade">
      <div
        v-if="showHelp"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="showHelp = false"
      >
        <div
          class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
                 w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 text-sm"
        >
          <h2 class="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">
            📒 使用帮助
          </h2>
          <div class="space-y-3 text-slate-700 dark:text-slate-300">
            <h3 class="font-semibold">支持的基本语法</h3>
            <ul class="list-disc list-inside space-y-1 pl-2">
              <li><code>#</code> 一级标题、<code>##</code> 二级、<code>###</code> 三级</li>
              <li><code>**粗体**</code>、<code>*斜体*</code>、<code>~~删除线~~</code></li>
              <li><code>`行内代码`</code>、<code>```js\n...\n```</code> 代码块（高亮）</li>
              <li><code>- 无序</code> / <code>1. 有序</code> / <code>- [ ] 任务</code></li>
              <li><code>> 引用</code>、<code>---</code> 水平线</li>
              <li><code>| 表头 |</code></li>
              <li>粘贴/拖拽图片自动上传为 base64</li>
              <li>粘贴链接自动识别为超链接</li>
            </ul>
            <h3 class="font-semibold mt-4">快捷操作</h3>
            <ul class="list-disc list-inside space-y-1 pl-2">
              <li>侧边栏置顶/删除按钮悬浮可见</li>
              <li>左侧目录可点击快速跳转标题</li>
            </ul>
          </div>
          <button
            @click="showHelp = false"
            class="absolute top-4 right-4 p-1.5 rounded-full
                   hover:bg-slate-100 dark:hover:bg-slate-700
                   text-slate-400 dark:text-slate-500"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
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