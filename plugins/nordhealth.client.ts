// plugins/nordhealth.client.ts
export default defineNuxtPlugin(async () => {
  if (process.client) {
    try {
      // Import the main component bundle which should register all components
      await import('@nordhealth/components')
      
      // Wait a bit for components to register
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if components are defined
      const componentTags = [
        'nord-button', 'nord-card', 'nord-input', 'nord-icon', 
        'nord-banner', 'nord-badge', 'nord-checkbox', 'nord-spinner'
      ]
      
      const definedComponents = componentTags.filter(tag => 
        customElements.get(tag)
      )
      
      console.log('NordHealth components registered:', definedComponents)
      
      if (definedComponents.length === 0) {
        console.warn('No NordHealth components were registered. Falling back to styled HTML elements.')
      }
      
    } catch (error) {
      console.error('Failed to load NordHealth components:', error)
    }
  }
})