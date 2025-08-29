<template>
    <NuxtPage />
</template>

<script setup lang="ts">
onMounted(() => {
  if (import.meta.client && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data.type === 'SKIP_WAITING') {
        location.reload()
      }
    })
  }
})
</script>