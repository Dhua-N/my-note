// composables/useToast.ts
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const toast: Toast = {
      id: nextId++,
      message,
      type
    }
    // 新消息添加到顶部
    toasts.value.unshift(toast)
    // 3秒后自动移除
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === toast.id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }, 3000)
  }

  return {
    toasts,
    addToast
  }
}
