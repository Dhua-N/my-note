export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],
  colorMode: {
    preference: 'system', // 默认跟随系统
    fallback: 'light',    // 系统关闭时兜底
    classSuffix: ''       // 让 <html class="dark"> 而不是 class="dark-mode"
  }, 
  ssr: false,
  pwa: {
    registerType: 'autoUpdate',
    devOptions: { enabled: true },        // 本地也能看
    workbox: {
      globPatterns: process.env.NODE_ENV === 'production'
      ? ['**/*.{js,css,html,ico,woff2}']
      : []
    },
    manifest: {
      name: 'My Notes PWA',
      short_name: 'Notes',
      description: '离线 Markdown 笔记',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone'
    }
  },
  app: {
    head: {
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
      meta: [{ name: 'theme-color', content: '#3b82f6' }]
    }
  }
})