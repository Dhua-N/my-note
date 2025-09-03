<template>
  <Transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
               w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
            🔤 字体设置
          </h2>
          <button
            @click="$emit('update:modelValue', false)"
            class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700
                   text-slate-400 dark:text-slate-500"
          >
            ✕
          </button>
        </div>
        
        <!-- 字体设置内容 -->
        <div class="space-y-6">
          <!-- 字体样式选择 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              字体样式
            </label>
            <select
              v-model="fontFamily"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Noto Sans SC, sans-serif">思源黑体</option>
              <option value="Fira Code, monospace">Fira Code</option>
            </select>
          </div>

          <!-- 字体大小 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              字体大小: {{ fontSize }}px
            </label>
            <input
              v-model="fontSize"
              type="range"
              min="12"
              max="24"
              step="1"
              class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>

          <!-- 行高 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              行高: {{ lineHeight }}
            </label>
            <input
              v-model="lineHeight"
              type="range"
              min="1.2"
              max="2.0"
              step="0.1"
              class="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>

          <!-- 预览区域 -->
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">预览效果：</p>
            <div
              class="text-slate-800 dark:text-slate-200"
              :style="{ fontFamily, fontSize: fontSize + 'px', lineHeight }"
            >
              这是预览文本。The quick brown fox jumps over the lazy dog.
              <br>
              这是一段测试文字，用于展示当前字体设置的效果。
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
import { storeToRefs } from 'pinia'
import { watchEffect } from 'vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

defineProps<Props>()
defineEmits<Emits>()

// 使用 Pinia store
const settingsStore = useSettingsStore()
const { font } = storeToRefs(settingsStore)

// 映射 Pinia store 到本地响应式变量
const fontFamily = ref(font.value.family)
const fontSize = ref(font.value.size)
const lineHeight = ref(font.value.lineHeight)

// 监听本地变量变化，同步到 Pinia store
watch([fontFamily, fontSize, lineHeight], ([newFamily, newSize, newLineHeight]) => {
  settingsStore.updateFont({
    family: newFamily,
    size: newSize,
    lineHeight: newLineHeight
  })
})

// 监听 Pinia store 变化，同步到本地变量
watch(font, (newFont) => {
  fontFamily.value = newFont.family
  fontSize.value = newFont.size
  lineHeight.value = newFont.lineHeight
}, { deep: true })
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