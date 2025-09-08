// plugins/nordhealth.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Import and register all Nord components
    import('@nordhealth/components').then((module) => {
      // The components are registered automatically when imported
      console.log('NordHealth components loaded')
    })
  }
})