// composables/useLoading.ts
interface LoadingState {
  [key: string]: boolean
}

interface LoadingOptions {
  minDuration?: number // Minimum loading duration in ms
  showDelay?: number // Delay before showing loading state in ms
}

export const useLoading = () => {
  const loadingStates = reactive<LoadingState>({})
  const loadingTimers = new Map<string, { showTimer?: NodeJS.Timeout; minTimer?: NodeJS.Timeout }>()

  // Set loading state for a specific key
  const setLoading = (key: string, loading: boolean, options: LoadingOptions = {}) => {
    const { minDuration = 0, showDelay = 0 } = options
    
    // Clear any existing timers for this key
    const timers = loadingTimers.get(key)
    if (timers) {
      if (timers.showTimer) clearTimeout(timers.showTimer)
      if (timers.minTimer) clearTimeout(timers.minTimer)
    }

    if (loading) {
      // If there's a show delay, wait before setting loading to true
      if (showDelay > 0) {
        const showTimer = setTimeout(() => {
          loadingStates[key] = true
        }, showDelay)
        
        loadingTimers.set(key, { showTimer })
      } else {
        loadingStates[key] = true
      }
    } else {
      // If there's a minimum duration and we're currently loading
      if (minDuration > 0 && loadingStates[key]) {
        const minTimer = setTimeout(() => {
          loadingStates[key] = false
          loadingTimers.delete(key)
        }, minDuration)
        
        loadingTimers.set(key, { ...loadingTimers.get(key), minTimer })
      } else {
        loadingStates[key] = false
        loadingTimers.delete(key)
      }
    }
  }

  // Get loading state for a specific key
  const isLoading = (key: string): boolean => {
    return loadingStates[key] || false
  }

  // Check if any loading state is active
  const isAnyLoading = computed(() => {
    return Object.values(loadingStates).some(loading => loading)
  })

  // Wrap an async function with loading state
  const withLoading = async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    setLoading(key, true, options)
    
    try {
      const result = await asyncFn()
      return result
    } finally {
      setLoading(key, false, options)
    }
  }

  // Clear all loading states
  const clearAll = () => {
    // Clear all timers
    loadingTimers.forEach(({ showTimer, minTimer }) => {
      if (showTimer) clearTimeout(showTimer)
      if (minTimer) clearTimeout(minTimer)
    })
    
    loadingTimers.clear()
    Object.keys(loadingStates).forEach(key => {
      loadingStates[key] = false
    })
  }

  // Create a loading state manager for a specific context
  const createLoadingManager = (prefix = '') => {
    const getKey = (key: string) => prefix ? `${prefix}.${key}` : key
    
    return {
      setLoading: (key: string, loading: boolean, options?: LoadingOptions) => 
        setLoading(getKey(key), loading, options),
      isLoading: (key: string) => isLoading(getKey(key)),
      withLoading: <T>(key: string, asyncFn: () => Promise<T>, options?: LoadingOptions) =>
        withLoading(getKey(key), asyncFn, options)
    }
  }

  // Common loading states
  const common = {
    form: createLoadingManager('form'),
    auth: createLoadingManager('auth'),
    navigation: createLoadingManager('nav'),
    api: createLoadingManager('api')
  }

  // Cleanup on unmount
  if (process.client) {
    onBeforeUnmount(() => {
      clearAll()
    })
  }

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    clearAll,
    createLoadingManager,
    common
  }
}

// Global loading composable for app-wide loading states
export const useGlobalLoading = () => {
  const globalLoading = useState<boolean>('global.loading', () => false)
  const loadingMessage = useState<string>('global.loading.message', () => '')
  
  const setGlobalLoading = (loading: boolean, message = '') => {
    globalLoading.value = loading
    loadingMessage.value = message
  }

  const withGlobalLoading = async <T>(
    asyncFn: () => Promise<T>,
    message = 'Loading...'
  ): Promise<T> => {
    setGlobalLoading(true, message)
    
    try {
      const result = await asyncFn()
      return result
    } finally {
      setGlobalLoading(false)
    }
  }

  return {
    globalLoading: readonly(globalLoading),
    loadingMessage: readonly(loadingMessage),
    setGlobalLoading,
    withGlobalLoading
  }
}