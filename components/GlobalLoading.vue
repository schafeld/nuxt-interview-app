<!-- components/GlobalLoading.vue -->
<template>
  <Teleport to="body">
    <Transition name="loading-fade">
      <div v-if="globalLoading" class="global-loading-overlay" role="dialog" aria-modal="true" aria-labelledby="loading-title">
        <div class="loading-content">
          <nord-spinner size="l" class="loading-spinner" aria-hidden="true"></nord-spinner>
          <h2 id="loading-title" class="loading-title">{{ loadingMessage || 'Loading...' }}</h2>
          <p class="loading-description" aria-live="polite">Please wait while we process your request.</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { globalLoading, loadingMessage } = useGlobalLoading()

// Prevent body scroll when loading overlay is visible
watchEffect(() => {
  if (process.client) {
    if (globalLoading.value) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--n-space-m);
}

.loading-content {
  background: var(--n-color-surface-raised);
  border-radius: var(--n-border-radius-l);
  padding: var(--n-space-xl);
  box-shadow: var(--n-box-shadow-l);
  text-align: center;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--n-space-m);
}

.loading-spinner {
  color: var(--n-color-status-info);
}

.loading-title {
  margin: 0;
  color: var(--n-color-text);
  font-size: var(--n-font-size-l);
  font-weight: var(--n-font-weight-active);
}

.loading-description {
  margin: 0;
  color: var(--n-color-text-weak);
  font-size: var(--n-font-size-s);
  line-height: 1.4;
}

/* Transitions */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.loading-fade-enter-active .loading-content,
.loading-fade-leave-active .loading-content {
  transition: transform 0.3s ease;
}

.loading-fade-enter-from .loading-content,
.loading-fade-leave-to .loading-content {
  transform: scale(0.95) translateY(-10px);
}

@media (max-width: 768px) {
  .loading-content {
    padding: var(--n-space-l);
    margin: var(--n-space-s);
  }
}
</style>