<template>
  <div class="help-menu-container fixed bottom-4 left-4 z-50">
    <!-- 主按钮 -->
    <button
      @click="toggleMenu"
      class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 
             text-slate-700 dark:text-slate-200 shadow-lg
             border border-slate-200 dark:border-slate-700
             hover:shadow-md transition-all duration-200
             flex items-center justify-center text-lg"
      :class="{ 'rotate-45': showMenu }"
      title="帮助菜单"
    >
      <span class="transition-transform duration-200">
        {{ showMenu ? '✕' : '❓' }}
      </span>
    </button>

    <!-- 向上展开的菜单 -->
    <Transition name="slide-up">
      <div
        v-if="showMenu"
        class="absolute bottom-full left-0 mb-2 w-36
               bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
               rounded-lg shadow-lg overflow-hidden"
      >
        <button
          @click="openHelp"
          class="block w-full px-4 py-3 text-left text-sm
                 text-slate-700 dark:text-slate-300
                 hover:bg-slate-100 dark:hover:bg-slate-700
                 transition-colors duration-200"
        >
          📒 帮助说明
        </button>
        <button
          @click="openFontSettings"
          class="block w-full px-4 py-3 text-left text-sm
                 text-slate-700 dark:text-slate-300
                 hover:bg-slate-100 dark:hover:bg-slate-700
                 transition-colors duration-200 border-t
                 border-slate-200 dark:border-slate-700"
        >
          🔤 字体设置
        </button>
      </div>
    </Transition>

    <!-- 帮助弹窗 -->
    <HelpModal v-model="showHelpModal" />
    
    <!-- 字体设置弹窗 -->
    <FontSettingsModal v-model="showFontSettingsModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HelpModal from './HelpModal.vue'
import FontSettingsModal from './FontSettingsModal.vue'

const showMenu = ref(false)
const showHelpModal = ref(false)
const showFontSettingsModal = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const openHelp = () => {
  showHelpModal.value = true
  showMenu.value = false
}

const openFontSettings = () => {
  showFontSettingsModal.value = true
  showMenu.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.help-menu-container')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 向上滑动动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 旋转动画 */
.help-menu-container button span {
  display: inline-block;
}

.help-menu-container button.rotate-45 span {
  transform: rotate(45deg);
}
</style>