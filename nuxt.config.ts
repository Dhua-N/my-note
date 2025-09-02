export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@pinia/nuxt', 
  ],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  }, 
  ssr: false,
  pwa: {
    registerType: 'autoUpdate',
    devOptions: { enabled: true },        // 本地也能看到 PWA 的效果
    workbox: {
      skipWaiting: true,      // 立即激活新 SW
      clientsClaim: true,     // 立即接管所有标签
      globPatterns: process.env.NODE_ENV === 'production'
      ? ['**/*.{js,css,html,ico,woff2,png,svg,jpg,jpeg,webp}']
      : []
    },
    manifest: {
      name: 'My Notes PWA',
      short_name: 'Notes',
      description: '离线 Markdown 笔记',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ],
      display: 'standalone',
      start_url: '/'
    }
  },
  app: {
    head: {
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }],
      meta: [{ name: 'theme-color', content: '#3b82f6' }]
    }
  }
})