// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  compatibilityDate: '2025-09-08',
  typescript: {
    strict: true,
    typeCheck: false
  },
  css: ['@nordhealth/css', '@nordhealth/themes/lib/vet.css'],
  plugins: ['~/plugins/nordhealth.client.ts'],
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