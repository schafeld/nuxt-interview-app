<!-- pages/success.vue -->
<template>
  <div class="success-container">
    <nord-card class="success-card">
      <div class="success-content">
        <nord-icon name="interface-validation" size="xl" class="success-icon"></nord-icon>
        
        <h1>Welcome to Our Veterinary Community!</h1>
        
        <p class="success-message">
          Thank you for signing up! Your account has been successfully created.
        </p>
        
        <div v-if="signupData" class="signup-details">
          <nord-banner variant="success">
            <h3>Account Details:</h3>
            <p><strong>Email:</strong> {{ signupData.email }}</p>
            <p><strong>Product Updates:</strong> 
              {{ signupData.receiveUpdates ? 'Yes, you will receive updates' : 'No updates requested' }}
            </p>
            <p><strong>Signed up:</strong> {{ formatDate(signupData.timestamp) }}</p>
          </nord-banner>
        </div>
        
        <div class="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Check your email for a confirmation message</li>
            <li>Complete your profile setup</li>
            <li>Explore our veterinary tools and resources</li>
          </ul>
        </div>
        
        <div class="action-buttons">
          <nord-button @click="startOver" variant="secondary">
            Sign Up Another Account
          </nord-button>
          <nord-button @click="goToDashboard">
            Continue to Dashboard
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
  // In a real app, this would navigate to the main dashboard
  alert('Dashboard functionality would be implemented here!')
}
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: var(--n-color-surface-raised);
}

.success-card {
  width: 100%;
  max-width: 600px;
}

.success-content {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  color: var(--n-color-status-success);
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  color: var(--n-color-text);
}

.signup-details {
  margin: 2rem 0;
  text-align: left;
}

.next-steps {
  margin: 2rem 0;
  text-align: left;
}

.next-steps ul {
  padding-left: 1.5rem;
}

.next-steps li {
  margin-bottom: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>