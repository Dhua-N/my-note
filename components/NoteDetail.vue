<!-- NoteDetail.vue -->
<template>
  <section class="flex-1 flex flex-col h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
    <!-- 标题 -->
    <header class="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 relative">
      <input
        :value="currentTitle"
        placeholder="无标题"
        class="text-2xl font-bold bg-transparent w-full outline-none
               text-slate-900 dark:text-slate-100 placeholder:text-slate-400
               dark:placeholder:text-slate-600 transition-colors duration-200"
        @input="updateCurrentTitle(($event.target as HTMLInputElement).value)"
      />

      <!-- 导出按钮 -->
      <button
        @click="handleExport"
        class="absolute top-1/2 right-6 -translate-y-1/2
               shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md
               bg-slate-100 hover:bg-slate-200
               dark:bg-slate-700 dark:hover:bg-slate-600
               text-slate-700 dark:text-slate-200
               text-sm font-medium transition"
      >
        <!-- heroicon: arrow-down-tray 16x16 -->
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        导出.md
      </button>
    </header>

    <!-- 正文 -->
    <div class="flex-1 overflow-auto h-full" >
      <RichEditor />
    </div>
  </section>
</template>

<script setup lang="ts">
import { tiptapToMarkdown, downloadMarkdown } from '~/utils/exportMarkdown'

const currentTitle = inject<Ref<string>>('currentTitle')!
const updateCurrentTitle = inject<(v: string) => void>('updateCurrentTitle')!
const currentBody = inject<Ref<string>>('currentBody')!

// 点击导出
function handleExport() {
  try {
    const json = JSON.parse(currentBody.value)   // 如果 currentBody 存的是 JSON
    const md = tiptapToMarkdown(json)
    downloadMarkdown(md, currentTitle.value || 'untitled')
  } catch {
    // 如果 currentBody 存的是纯文本，直接导出
    downloadMarkdown(currentBody.value, currentTitle.value || 'untitled')
  } 
}
</script>