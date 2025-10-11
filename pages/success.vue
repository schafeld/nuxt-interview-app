<!-- pages/success.vue -->
<template>
  <div class="success-container">
    <nord-card class="success-card">
      <div class="success-content">
        <div class="success-header">
            <h1 class="success-title">Welcome to Our Veterinary Community!</h1>
          <p class="success-subtitle">
            Thank you for signing up! Your account has been successfully created.
          </p>
        </div>
        
        <div v-if="signupData" class="signup-details">
          <nord-banner variant="success" class="details-banner">
            <div class="banner-content">
              <div class="banner-title">
                <h2>
                  Account Details
                </h2>
              </div>
              <div class="detail-row">
                <nord-icon name="interface-email" size="s" class="detail-icon"></nord-icon>
                <p>
                  <strong>Email:</strong> {{ signupData.email }}
                </p>
              </div>
              <div class="detail-row">
                <nord-icon name="interface-alarm" size="s" class="detail-icon"></nord-icon>
                <p>
                  <strong>Updates:</strong> 
                  {{ signupData.receiveUpdates ? 'Yes, you will receive updates' : 'No updates requested' }}
                </p>
              </div>
              <div class="detail-row">
                <nord-icon name="interface-time" size="s" class="detail-icon"></nord-icon>
                <p>
                  <strong>Created:</strong> {{ formatDate(signupData.timestamp) }}
                </p>
              </div>
            </div>
          </nord-banner>
        </div>
        
        <div class="next-steps">
          <div class="steps-title">
            <h2>
              <nord-icon name="interface-checked" size="s"></nord-icon>
              What's Next?
            </h2>
          </div>
          <ol class="steps-list">
            <li class="step-item">
              <p>Check your email for a confirmation message</p>
            </li>
            <li class="step-item">
              <p>Complete your profile setup</p>
            </li>
            <li class="step-item">
              <p>Explore our veterinary tools and resources</p>
            </li>
          </ol>
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
  text-align: left;
  /* display: flex;
  flex-direction: column;
  gap: var(--n-space-m); */
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
  font-size: var(--n-font-size-xl);
  font-weight: var(--n-font-weight-active);
  margin-bottom: var(--n-space-m);
}

.success-subtitle {
  margin: 0;
  line-height: 1.5;
  font-size: var(--n-font-size-m);
  color: var(--n-color-text-weak);
}

.banner-title h2 {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  margin: 0;
  margin-bottom: var(--n-space-s);
  color: #0f5d1a; /* Darker green for better contrast */
  font-size: var(--n-font-size-m);
  font-weight: var(--n-font-weight-active);
}

.detail-row p {
  margin: 0;
  font-size: var(--n-font-size-m);
  color: var(--n-color-text);
}

.steps-title h2 {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  margin: 0;
  margin-bottom: var(--n-space-m);
  color: var(--n-color-text);
  font-size: var(--n-font-size-s);
  font-weight: var(--n-font-weight-active);
}

.step-item p {
  margin: 0;
  font-size: var(--n-font-size-m);
  color: var(--n-color-text);
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
  padding-left: var(--n-space-l);
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
    /* flex-direction: column; */
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
    /* text-align: center; */
  }
}
</style>