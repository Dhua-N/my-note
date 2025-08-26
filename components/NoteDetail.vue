<!-- NoteDetail.vue -->
<template>
  <section class="flex-1 flex flex-col bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
    <!-- 标题 -->
    <header class="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
      <input
        :value="title"
        placeholder="无标题"
        class="text-2xl font-bold bg-transparent w-full outline-none
               text-slate-900 dark:text-slate-100 placeholder:text-slate-400
               dark:placeholder:text-slate-600 transition-colors duration-200"
        @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
      />
    </header>

    <!-- 正文 -->
    <div class="flex-1 overflow-auto">
      <textarea
        :value="body"
        placeholder="开始写作…"
        class="w-full h-full p-8 bg-transparent resize-none outline-none
               text-slate-700 dark:text-slate-300 placeholder:text-slate-400
               dark:placeholder:text-slate-600 leading-relaxed transition-colors
               duration-200"
        @input="$emit('update:body', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  body: string
}>()
defineEmits<{
  'update:title': [value: string]
  'update:body': [value: string]
}>()
</script>