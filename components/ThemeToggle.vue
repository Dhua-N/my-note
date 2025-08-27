<template>
  <button
    @click="toggle"
    class="fixed right-4 bottom-4 ... text-slate-700 dark:text-slate-300"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
  >
    {{ isDark ? '🌙' : '☀️' }}
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')
const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>