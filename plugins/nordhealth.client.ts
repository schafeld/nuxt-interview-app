// plugins/nordhealth.client.ts
import { useTimeoutFn } from '@vueuse/core'

export default defineNuxtPlugin(async () => {
  try {
    // Use modern event-based approach instead of polling
    const componentsReady = new Promise<void>(async (resolve, reject) => {
      // Import the main component bundle
      await import('@nordhealth/components')

      // List of components we need
      const requiredComponents = [
        'nord-button', 'nord-card', 'nord-input', 'nord-icon',
        'nord-banner', 'nord-badge', 'nord-checkbox', 'nord-spinner',
        'nord-header', 'nord-footer', 'nord-dropdown',
        'nord-dropdown-group', 'nord-dropdown-item', 'nord-avatar'
      ]

      // Track which components are loaded
      const loadedComponents = new Set<string>()

      // Function to check if all components are defined
      const checkComponents = () => {
        requiredComponents.forEach(tag => {
          if (customElements.get(tag) && !loadedComponents.has(tag)) {
            loadedComponents.add(tag)
          }
        })
        return loadedComponents.size === requiredComponents.length
      }

      // If all components are already defined, resolve immediately
      if (checkComponents()) {
        console.log('All NordHealth components are already registered')
        resolve()
        return
      }

      // Set up timeout as fallback using VueUse
      const { start: startTimeout, stop: stopTimeout } = useTimeoutFn(() => {
        console.warn('Timeout waiting for NordHealth components, proceeding anyway...')
        resolve()
      }, 5000)

      startTimeout()

      // Use MutationObserver to watch for component registration
      let observerConnected = false

      // Also use whenDefined promises for better reliability
      const whenDefinedPromises = requiredComponents.map(async (tag) => {
        try {
          await customElements.whenDefined(tag)
          loadedComponents.add(tag)

          if (checkComponents() && !observerConnected) {
            stopTimeout()
            console.log(`All NordHealth components registered`)
            resolve()
          }
        } catch (error) {
          console.warn(`Failed to wait for component ${tag}:`, error)
        }
      })

      // Race between individual component loading and timeout
      Promise.allSettled(whenDefinedPromises).then(() => {
        if (!observerConnected) {
          stopTimeout()
          console.log('All component loading attempts completed')
          resolve()
        }
      }).catch((error) => {
        console.warn('Error in component loading:', error)
        stopTimeout()
        resolve() // Resolve anyway to prevent blocking
      })

      observerConnected = true
    })

    // Wait for components to be ready
    await componentsReady

    // Final check and log
    const componentTags = [
      'nord-button', 'nord-card', 'nord-input', 'nord-icon',
      'nord-banner', 'nord-badge', 'nord-checkbox', 'nord-spinner',
      'nord-header', 'nord-footer', 'nord-dropdown',
      'nord-dropdown-group', 'nord-dropdown-item', 'nord-avatar'
    ]

    const definedComponents = componentTags.filter(tag =>
      customElements.get(tag)
    )

    console.log(`NordHealth plugin ready: ${definedComponents.length}/${componentTags.length} components registered`)
  } catch (error) {
    console.error('Failed to load NordHealth components:', error)
  }
})