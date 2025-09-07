// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  typescript: {
    strict: true,
    typeCheck: true
  },
  css: ['@nordhealth/components/lib/theme-vet.css'],
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