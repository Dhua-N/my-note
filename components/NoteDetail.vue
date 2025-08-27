<!-- NoteDetail.vue -->
<template>
  <section class="flex-1 flex flex-col h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
    <!-- 标题 -->
    <header class="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
      <input
        :value="currentTitle"
        placeholder="无标题"
        class="text-2xl font-bold bg-transparent w-full outline-none
               text-slate-900 dark:text-slate-100 placeholder:text-slate-400
               dark:placeholder:text-slate-600 transition-colors duration-200"
        @input="updateCurrentTitle(($event.target as HTMLInputElement).value)"
      />
    </header>

    <!-- 正文 -->
    <div class="flex-1 overflow-auto h-full" >
      <RichEditor />
    </div>
  </section>
</template>

<script setup lang="ts">
const currentTitle = inject<Ref<string>>('currentTitle')!
const updateCurrentTitle  = inject<(v: string) => void>('updateCurrentTitle')!
</script>