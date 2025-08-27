export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],
  colorMode: {
    preference: 'system', // 默认跟随系统
    fallback: 'light',    // 系统关闭时兜底
    classSuffix: ''       // 让 <html class="dark"> 而不是 class="dark-mode"
  }, 
  ssr: false,
})