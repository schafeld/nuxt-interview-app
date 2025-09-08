// plugins/nordhealth.client.ts
export default defineNuxtPlugin(async () => {
  if (process.client) {
    try {
      // Create a promise that resolves when components are ready
      const componentsReady = new Promise<void>(async (resolve) => {
        // Import the main component bundle
        await import('@nordhealth/components')
        
        // List of components we need
        const requiredComponents = [
          'nord-button', 'nord-card', 'nord-input', 'nord-icon', 
          'nord-banner', 'nord-badge', 'nord-checkbox', 'nord-spinner',
          'nord-header', 'nord-footer', 'nord-dropdown',
          'nord-dropdown-group', 'nord-dropdown-item', 'nord-avatar'
        ]
        
        // Function to check if all components are defined
        const checkComponents = () => {
          const definedComponents = requiredComponents.filter(tag => 
            customElements.get(tag)
          )
          return definedComponents.length === requiredComponents.length
        }
        
        // If all components are already defined, resolve immediately
        if (checkComponents()) {
          resolve()
          return
        }
        
        // Otherwise, poll until they're all defined (with timeout)
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max
        
        const poll = () => {
          attempts++
          if (checkComponents()) {
            console.log(`All NordHealth components registered after ${attempts * 100}ms`)
            resolve()
          } else if (attempts >= maxAttempts) {
            console.warn('Timeout waiting for NordHealth components to register')
            resolve()
          } else {
            setTimeout(poll, 100)
          }
        }
        
        poll()
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
  }
})