<template>
    <NuxtPage />
</template>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
import { watchEffect } from 'vue'

const settingsStore = useSettingsStore()

// 初始化设置
onMounted(() => {
  settingsStore.loadFromStorage()
  
  if (import.meta.client && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data.type === 'SKIP_WAITING') {
        location.reload()
      }
    })
  }
})

// 全局字体同步
watchEffect(() => {
  if (import.meta.client) {
    const { family, size, lineHeight } = settingsStore.font
    document.documentElement.style.setProperty('--font-family', family)
    document.documentElement.style.setProperty('--font-size', `${size}px`)
    document.documentElement.style.setProperty('--line-height', `${lineHeight}`)
  }
})
</script>

<style>
/* 全局字体样式 */
body {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
}
</style>