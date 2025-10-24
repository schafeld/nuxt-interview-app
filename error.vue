<!-- error.vue - Global error page following Nuxt 3 conventions -->
<template>
  <div class="error-page">
    <nord-card class="error-card" padding="l">
      <div class="error-content">
        <div class="error-header">
          <nord-icon name="interface-warning" size="l" class="error-icon" aria-hidden="true"></nord-icon>
          <h1 class="error-title">{{ errorTitle }}</h1>
        </div>
        
        <div class="error-body">
          <p class="error-message">{{ errorMessage }}</p>
          
          <div v-if="showDetails && error.stack" class="error-details">
            <details>
              <summary>Technical Details</summary>
              <pre class="error-stack">{{ error.stack }}</pre>
            </details>
          </div>
        </div>
        
        <div class="error-actions">
          <nord-button @click="handleError" class="retry-button">
            <nord-icon name="interface-reload" size="s" slot="start"></nord-icon>
            {{ error.statusCode === 404 ? 'Go Home' : 'Try Again' }}
          </nord-button>
          
          <nord-button @click="goHome" variant="plain">
            <nord-icon name="interface-home" size="s" slot="start"></nord-icon>
            Home
          </nord-button>
          
          <nord-button 
            v-if="!showDetails && error.stack" 
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
</template>

<script setup lang="ts">
interface ErrorProps {
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
    stack?: string
    data?: any
  }
}

const props = defineProps<ErrorProps>()

// VueUse replacements for client-side checks
const { $router } = useNuxtApp()

// Error state
const showDetails = ref(false)

// Computed error information
const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'Page Not Found'
    case 500:
      return 'Server Error'
    case 403:
      return 'Access Forbidden'
    default:
      return 'Something went wrong'
  }
})

const errorMessage = computed(() => {
  if (props.error.statusCode === 404) {
    return "The page you're looking for doesn't exist or has been moved."
  }
  
  return props.error.statusMessage || 
         props.error.message || 
         'An unexpected error occurred. Please try again.'
})

// Actions
const handleError = () => {
  if (props.error.statusCode === 404) {
    goHome()
  } else {
    // For other errors, try to reload the page
    if (process.client) {
      window.location.reload()
    } else {
      goHome()
    }
  }
}

const goHome = () => {
  // Clear error and navigate to home
  clearError({ redirect: '/' })
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// Report error to monitoring service (mock)
const reportError = (error: any, context: any) => {
  // In a real app, this would send to error tracking service like Sentry
  console.warn('Error reported:', {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: process.client ? navigator.userAgent : 'Server',
    url: process.client ? window.location.href : 'Server'
  })
}

// Report error on mount
onMounted(() => {
  reportError(props.error, {
    component: 'error.vue',
    timestamp: new Date().toISOString()
  })
})

// Set proper page title and meta
useHead({
  title: computed(() => `${props.error.statusCode} - ${errorTitle.value}`),
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-space-m);
  background: var(--n-color-surface);
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
  .error-page {
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