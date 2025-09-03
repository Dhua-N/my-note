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
    devOptions: {
      enabled: false,
      type: 'module'
    },
    workbox: {
      // 修复：避免立即激活，允许用户控制更新
      skipWaiting: false,
      clientsClaim: false,
      globPatterns: process.env.NODE_ENV === 'production'
        ? ['**/*.{js,css,html,ico,woff2,png,svg,jpg,jpeg,webp}']
        : [],
      additionalManifestEntries: [
        { url: '/', revision: Date.now().toString() } // 添加版本号避免缓存
      ],
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\//],
      // 修复：添加缓存清理策略
      cleanupOutdatedCaches: true,
      runtimeCaching: process.env.NODE_ENV === 'production' ? [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365
            }
          }
        },
        {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-assets',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        }
      ] : []
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
      meta: [
        { name: 'theme-color', content: '#3b82f6' },
        // 修复：添加缓存控制
        { name: 'cache-control', content: 'no-cache, no-store, must-revalidate' }
      ]
    }
  },
  // 修复：添加构建配置
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})