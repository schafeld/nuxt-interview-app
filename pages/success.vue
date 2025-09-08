<!-- pages/success.vue -->
<template>
  <div class="success-container">
    <nord-card class="success-card">
      <div class="success-content">
        <div class="success-header">
          <nord-icon name="interface-tick-circle" size="xl" class="success-icon"></nord-icon>
          <nord-text variant="heading-l" class="success-title">
            Welcome to Our Veterinary Community!
          </nord-text>
          <nord-text variant="body-l" color="weak" class="success-subtitle">
            Thank you for signing up! Your account has been successfully created.
          </nord-text>
        </div>
        
        <div v-if="signupData" class="signup-details">
          <nord-banner variant="success" class="details-banner">
            <div class="banner-content">
              <nord-text variant="heading-s" class="banner-title">
                <nord-icon name="interface-security-shield-check" size="s"></nord-icon>
                Account Details
              </nord-text>
              <div class="detail-row">
                <nord-icon name="interface-email" size="s" class="detail-icon"></nord-icon>
                <nord-text variant="body-m">
                  <strong>Email:</strong> {{ signupData.email }}
                </nord-text>
              </div>
              <div class="detail-row">
                <nord-icon name="interface-email-action-send" size="s" class="detail-icon"></nord-icon>
                <nord-text variant="body-m">
                  <strong>Updates:</strong> 
                  {{ signupData.receiveUpdates ? 'Yes, you will receive updates' : 'No updates requested' }}
                </nord-text>
              </div>
              <div class="detail-row">
                <nord-icon name="interface-time" size="s" class="detail-icon"></nord-icon>
                <nord-text variant="body-m">
                  <strong>Created:</strong> {{ formatDate(signupData.timestamp) }}
                </nord-text>
              </div>
            </div>
          </nord-banner>
        </div>
        
        <div class="next-steps">
          <nord-text variant="heading-s" class="steps-title">
            <nord-icon name="interface-list-check" size="s"></nord-icon>
            What's Next?
          </nord-text>
          <ul class="steps-list">
            <li class="step-item">
              <nord-icon name="interface-email" size="s" class="step-icon"></nord-icon>
              <nord-text variant="body-m">Check your email for a confirmation message</nord-text>
            </li>
            <li class="step-item">
              <nord-icon name="interface-user-single" size="s" class="step-icon"></nord-icon>
              <nord-text variant="body-m">Complete your profile setup</nord-text>
            </li>
            <li class="step-item">
              <nord-icon name="interface-love-heart-medical" size="s" class="step-icon"></nord-icon>
              <nord-text variant="body-m">Explore our veterinary tools and resources</nord-text>
            </li>
          </ul>
        </div>
        
        <div class="action-buttons">
          <nord-button @click="startOver" variant="secondary" size="l">
            <nord-icon name="user-add" size="s" slot="start"></nord-icon>
            Sign Up Another Account
          </nord-button>
          <nord-button @click="goToDashboard" size="l">
            <nord-icon name="arrow-right" size="s" slot="end"></nord-icon>
            Continue to Profile
          </nord-button>
        </div>
      </div>
    </nord-card>
  </div>
</template>

<script setup lang="ts">
// Meta and middleware
definePageMeta({
  title: 'Success - Account Created',
  middleware: 'signup'
})

// State
const signupData = ref<any>(null)

// Lifecycle
onMounted(() => {
  if (process.client) {
    const data = sessionStorage.getItem('signupData')
    if (data) {
      signupData.value = JSON.parse(data)
    }
  }
})

// Methods
const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString()
}

const startOver = () => {
  if (process.client) {
    sessionStorage.removeItem('signupCompleted')
    sessionStorage.removeItem('signupData')
  }
  navigateTo('/')
}

const goToDashboard = () => {
  navigateTo('/profile')
}
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-space-m);
  background: linear-gradient(135deg, var(--n-color-surface-raised) 0%, var(--n-color-surface) 100%);
}

.success-card {
  width: 100%;
  max-width: 650px;
  box-shadow: var(--n-box-shadow-l);
}

.success-content {
  padding: var(--n-space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--n-space-l);
}

.success-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--n-space-m);
  padding-bottom: var(--n-space-l);
  border-bottom: 1px solid var(--n-color-border);
}

.success-icon {
  color: var(--n-color-status-success);
  margin: 0 auto;
}

.success-title {
  margin: 0;
  color: var(--n-color-text);
}

.success-subtitle {
  margin: 0;
  line-height: 1.5;
}

.signup-details {
  width: 100%;
}

.details-banner {
  background: var(--n-color-status-success-background);
  border-color: var(--n-color-status-success);
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
}

.banner-title {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  margin-bottom: var(--n-space-s);
  color: var(--n-color-status-success);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--n-space-s);
  padding: var(--n-space-xs) 0;
}

.detail-icon {
  color: var(--n-color-status-success);
  flex-shrink: 0;
}

.next-steps {
  width: 100%;
}

.steps-title {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  margin-bottom: var(--n-space-m);
  color: var(--n-color-text);
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: var(--n-space-s);
  padding: var(--n-space-s);
  background: var(--n-color-surface-raised);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-color-border);
  transition: all 0.2s ease;
}

.step-item:hover {
  border-color: var(--n-color-accent);
  box-shadow: var(--n-box-shadow-s);
}

.step-icon {
  color: var(--n-color-accent);
  margin-top: 2px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: var(--n-space-m);
  justify-content: center;
  flex-wrap: wrap;
  padding-top: var(--n-space-l);
  border-top: 1px solid var(--n-color-border);
}

.action-buttons nord-button {
  flex: 1;
  min-width: 200px;
}

@media (max-width: 768px) {
  .success-container {
    padding: var(--n-space-s);
    align-items: flex-start;
    padding-top: var(--n-space-l);
  }
  
  .success-content {
    padding: var(--n-space-l);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons nord-button {
    width: 100%;
  }
  
  .detail-row,
  .step-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--n-space-xs);
  }
  
  .step-item {
    padding: var(--n-space-s) var(--n-space-m);
  }
}

@media (max-width: 480px) {
  .success-header {
    gap: var(--n-space-s);
  }
  
  .banner-title,
  .steps-title {
    flex-direction: column;
    text-align: center;
    gap: var(--n-space-xs);
  }
  
  .detail-row {
    align-items: center;
    text-align: center;
  }
}
</style>