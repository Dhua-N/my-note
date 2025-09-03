<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
               w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 text-sm"
        @click.stop
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
          @click="$emit('update:modelValue', false)"
          class="absolute top-4 right-4 p-1.5 rounded-full
                 hover:bg-slate-100 dark:hover:bg-slate-700
                 text-slate-400 dark:text-slate-500"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>