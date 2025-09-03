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
      enabled: false,       // 开发环境禁用PWA
      type: 'module'       // 使用ES模块模式避免冲突
    },
    workbox: {
      skipWaiting: true,     // 生产环境立即激活
      clientsClaim: true,    // 生产环境立即接管
      globPatterns: process.env.NODE_ENV === 'production'
        ? ['**/*.{js,css,html,ico,woff2,png,svg,jpg,jpeg,webp}']
        : [],
      additionalManifestEntries: [
        { url: '/', revision: null }   // 显式把“/”塞到预缓存清单
      ],
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\//],
      // 生产环境优化：精细缓存策略
      runtimeCaching: process.env.NODE_ENV === 'production' ? [
        // 1. Google字体（永久缓存）
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
            }
          }
        },
        // 2. 图标库（长期缓存）
        {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-assets',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
            }
          }
        },
        // 3. 用户笔记数据（网络优先，离线兜底）
        {
          urlPattern: /\/api\/notes/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-notes',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 5 // 5分钟
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
      meta: [{ name: 'theme-color', content: '#3b82f6' }]
    }
  }
})