// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts'
  ],
  
  // Module configurations
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  
  googleFonts: {
    families: {
      Roboto: [300, 400, 500, 700],
      'Open+Sans': [300, 400, 600, 700],
    },
    display: 'swap',
  },
  
  // App configuration
  app: {
    head: {
      title: 'English Learning App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Learn English with interactive articles and audio pronunciation' }
      ],
    }
  },
  
  // Runtime config for API endpoints
  runtimeConfig: {
    // 私有配置（僅後端可訪問）
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    },
    // 可在前端使用的公開配置
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
      // 將Google Client ID暴露給前端
      googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    }
  },

  vite: {
    server: {
      watch: {
        // Exclude PostgreSQL data directories from file watching
        ignored: [
          '**/postgres_data/**',
          '**/node_modules/**',
          '**/.git/**'
        ]
      }
    }
  }
})
