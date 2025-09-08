// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: '2025-09-08',
  
  // SEO and accessibility configuration
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: 'VetSignup - Veterinary Product Registration',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Professional veterinary product registration platform using NordHealth Design System' }
      ]
    }
  },
  
  typescript: {
    strict: true,
    typeCheck: false
  },
  css: [
    '@nordhealth/css', 
    '@nordhealth/themes/lib/vet.css',
    '@nordhealth/icons'
  ],
  plugins: ['~/plugins/nordhealth.client.ts'],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('nord-')
    }
  },
  runtimeConfig: {
    public: {
      passwordConfig: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        minSpecialChars: 2
      }
    }
  }
})