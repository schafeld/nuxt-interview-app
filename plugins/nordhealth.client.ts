// plugins/nordhealth.client.ts
import { defineCustomElements } from '@nordhealth/components/loader'

export default defineNuxtPlugin(() => {
  if (process.client) {
    defineCustomElements()
  }
})