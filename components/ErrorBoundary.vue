<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <nord-card class="error-card" padding="l">
      <div class="error-content">
        <div class="error-header">
          <nord-icon name="interface-warning" size="l" class="error-icon" aria-hidden="true"></nord-icon>
          <h2 class="error-title">Something went wrong</h2>
        </div>
        
        <div class="error-body">
          <p class="error-message">{{ errorMessage }}</p>
          
          <div v-if="showDetails && errorDetails" class="error-details">
            <details>
              <summary>Technical Details</summary>
              <pre class="error-stack">{{ errorDetails }}</pre>
            </details>
          </div>
        </div>
        
        <div class="error-actions">
          <nord-button @click="retry" class="retry-button">
            <nord-icon name="interface-reload" size="s" slot="start"></nord-icon>
            Try Again
          </nord-button>
          
          <nord-button @click="goHome" variant="plain">
            <nord-icon name="interface-home" size="s" slot="start"></nord-icon>
            Go Home
          </nord-button>
          
          <nord-button 
            v-if="!showDetails" 
            @click="toggleDetails" 
            variant="plain" 
            size="s"
          >
            Show Details
          </nord-button>
        </div>
      </div>
    </nord-card>
  </div>
  
  <slot v-else></slot>
</template>

<script setup lang="ts">
interface Props {
  fallback?: string
  showRetry?: boolean
  showDetails?: boolean
  onRetry?: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  fallback: 'An unexpected error occurred. Please try again.',
  showRetry: true,
  showDetails: false
})

// Error state
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showDetailsState = ref(props.showDetails)

// Error boundary implementation
const handleError = (error: Error, instance?: any, info?: string) => {
  console.error('Error Boundary caught error:', error)
  
  hasError.value = true
  errorMessage.value = error.message || props.fallback
  errorDetails.value = `${error.stack}\n\nComponent Info: ${info || 'N/A'}`
  
  // Report error to monitoring service (mock)
  reportError(error, { component: instance, info })
}

// Mock error reporting
const reportError = (error: Error, context: any) => {
  // In a real app, this would send to error tracking service like Sentry
  console.warn('Error reported:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  })
}

// Actions
const retry = async () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  showDetailsState.value = props.showDetails
  
  if (props.onRetry) {
    try {
      await props.onRetry()
    } catch (error) {
      if (error instanceof Error) {
        handleError(error)
      }
    }
  }
}

const goHome = () => {
  navigateTo('/')
}

const toggleDetails = () => {
  showDetailsState.value = !showDetailsState.value
}

// Vue error handling
onErrorCaptured((error, instance, info) => {
  handleError(error, instance, info)
  return false // Prevent error from propagating
})

// Global error handling for promises
if (process.client) {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))
    
    handleError(error, null, 'Unhandled Promise Rejection')
  })
}

// Computed
const showDetails = computed(() => showDetailsState.value)

// Expose error state for testing
defineExpose({
  hasError,
  errorMessage,
  errorDetails,
  handleError,
  retry
})
</script>

<style scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-space-m);
}

.error-card {
  max-width: 600px;
  width: 100%;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-l);
}

.error-header {
  display: flex;
  align-items: center;
  gap: var(--n-space-m);
}

.error-icon {
  color: var(--n-color-status-danger);
}

.error-title {
  margin: 0;
  color: var(--n-color-text);
  font-size: var(--n-font-size-l);
  font-weight: var(--n-font-weight-active);
}

.error-body {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-m);
}

.error-message {
  margin: 0;
  color: var(--n-color-text);
  line-height: 1.5;
}

.error-details {
  border: 1px solid var(--n-color-border);
  border-radius: var(--n-border-radius);
  padding: var(--n-space-s);
  background: var(--n-color-surface-raised);
}

.error-details summary {
  cursor: pointer;
  font-weight: var(--n-font-weight-active);
  color: var(--n-color-text-weak);
  padding: var(--n-space-xs) 0;
}

.error-stack {
  margin: var(--n-space-s) 0 0 0;
  padding: var(--n-space-s);
  background: var(--n-color-surface);
  border-radius: var(--n-border-radius);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--n-font-size-xs);
  color: var(--n-color-text-weak);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: var(--n-space-s);
  flex-wrap: wrap;
  align-items: center;
}

.retry-button {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .error-boundary {
    padding: var(--n-space-s);
  }
  
  .error-header {
    flex-direction: column;
    text-align: center;
    gap: var(--n-space-s);
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>