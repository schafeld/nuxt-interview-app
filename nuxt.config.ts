// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: '2025-09-08',
  typescript: {
    strict: true,
    typeCheck: false
  },
  css: [
    '@nordhealth/css', 
    '@nordhealth/themes/lib/vet.css',
    '@nordhealth/icons',
    '~/assets/css/nord-override.css'
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