// plugins/errorHandler.client.ts
export default defineNuxtPlugin(() => {
  // Global error handler composable
  const useGlobalErrorHandler = () => {
    const isOnline = ref(true)
    const errors = ref<Array<{ id: string; message: string; timestamp: Date; type: string }>>([])
    
    // Check online status
    if (process.client) {
      isOnline.value = navigator.onLine
      
      window.addEventListener('online', () => {
        isOnline.value = true
        console.log('Network connection restored')
      })
      
      window.addEventListener('offline', () => {
        isOnline.value = false
        console.warn('Network connection lost')
        showNetworkError()
      })
    }

    // Show network error notification
    const showNetworkError = () => {
      addError('network', 'Network connection lost. Some features may not work properly.')
    }

    // Add error to global error list
    const addError = (type: string, message: string) => {
      const error = {
        id: crypto.randomUUID(),
        message,
        timestamp: new Date(),
        type
      }
      
      errors.value.push(error)
      
      // Auto-remove error after 5 seconds
      setTimeout(() => {
        removeError(error.id)
      }, 5000)
      
      return error.id
    }

    // Remove error by ID
    const removeError = (id: string) => {
      const index = errors.value.findIndex(error => error.id === id)
      if (index > -1) {
        errors.value.splice(index, 1)
      }
    }

    // Clear all errors
    const clearErrors = () => {
      errors.value = []
    }

    // Handle async operation errors
    const handleAsyncError = async <T>(
      operation: () => Promise<T>,
      errorMessage = 'Operation failed'
    ): Promise<T | null> => {
      try {
        return await operation()
      } catch (error) {
        console.error('Async operation failed:', error)
        
        let message = errorMessage
        if (error instanceof Error) {
          message = error.message || errorMessage
        }
        
        addError('async', message)
        return null
      }
    }

    // Handle form submission errors
    const handleFormError = (error: unknown, fallbackMessage = 'Form submission failed') => {
      console.error('Form error:', error)
      
      let message = fallbackMessage
      if (error instanceof Error) {
        message = error.message || fallbackMessage
      }
      
      return addError('form', message)
    }

    // Handle navigation errors
    const handleNavigationError = (error: unknown) => {
      console.error('Navigation error:', error)
      return addError('navigation', 'Navigation failed. Please try again.')
    }

    return {
      isOnline: readonly(isOnline),
      errors: readonly(errors),
      addError,
      removeError,
      clearErrors,
      handleAsyncError,
      handleFormError,
      handleNavigationError
    }
  }

  // Register global error handlers
  if (process.client) {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Prevent default browser behavior (console error)
      event.preventDefault()
      
      const { addError } = useGlobalErrorHandler()
      addError('promise', 'An unexpected error occurred. Please refresh the page if problems persist.')
    })

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error)
      
      const { addError } = useGlobalErrorHandler()
      addError('javascript', 'A technical error occurred. Please refresh the page.')
    })

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        console.error('Resource loading error:', event.target)
        
        const { addError } = useGlobalErrorHandler()
        addError('resource', 'Failed to load some resources. Please check your connection.')
      }
    }, true)
  }

  // Provide global error handler
  return {
    provide: {
      errorHandler: useGlobalErrorHandler()
    }
  }
})