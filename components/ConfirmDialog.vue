<!-- ConfirmDialog.vue -->
<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="$emit('update:modelValue', false)"></div>
      
      <!-- 对话框 -->
      <div class="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ title }}
        </h3>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {{ message }}
        </p>
        
        <!-- 按钮组 -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300
                   hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg"
          >
            取消
          </button>
          <button
            @click="onConfirm"
            class="px-4 py-2 text-sm font-medium text-white bg-red-500
                   hover:bg-red-600 rounded-lg"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const onConfirm = () => {
  emit('update:modelValue', false)
  emit('confirm')
}
</script>
