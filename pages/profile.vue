<!-- pages/profile.vue -->
<template>
  <div class="profile-container">
    <nord-card class="profile-card">
      <h1 slot="header">User Profile</h1>
      
      <div v-if="userData" class="profile-content">
        <div class="profile-section">
          <nord-banner variant="info">
            <h3>Account Information</h3>
            <div class="profile-details">
              <p><strong>Email:</strong> {{ userData.email }}</p>
              <p><strong>Account Created:</strong> {{ formatDate(userData.timestamp) }}</p>
              <p><strong>Product Updates:</strong> 
                <nord-badge :variant="userData.receiveUpdates ? 'success' : 'neutral'">
                  {{ userData.receiveUpdates ? 'Enabled' : 'Disabled' }}
                </nord-badge>
              </p>
            </div>
          </nord-banner>
        </div>

        <div class="profile-section">
          <h3>Update Preferences</h3>
          <form @submit.prevent="updatePreferences" class="preferences-form">
            <nord-checkbox
              :checked="form.receiveUpdates"
              @change="updateReceiveUpdates"
              label="Receive product updates and announcements"
            />
            
            <div class="form-actions">
              <nord-button type="submit" :disabled="isUpdating">
                {{ isUpdating ? 'Updating...' : 'Update Preferences' }}
              </nord-button>
            </div>
          </form>
        </div>

        <div class="profile-section">
          <h3>Account Actions</h3>
          <div class="account-actions">
            <nord-button @click="signOut" variant="secondary">
              Sign Out
            </nord-button>
            <nord-button @click="clearData" variant="danger">
              Clear Account Data
            </nord-button>
          </div>
        </div>

        <!-- Success message -->
        <div v-if="updateMessage" class="update-message">
          <nord-banner variant="success">
            {{ updateMessage }}
          </nord-banner>
        </div>
      </div>

      <div v-else class="no-data">
        <nord-banner variant="warning">
          <h3>No Profile Data Found</h3>
          <p>It looks like you haven't signed up yet or your session has expired.</p>
          <nord-button @click="goToSignup">
            Go to Signup
          </nord-button>
        </nord-banner>
      </div>
    </nord-card>
  </div>
</template>

<script setup lang="ts">
import type { SignupForm } from '~/types'

// Meta and middleware
definePageMeta({
  title: 'Profile - User Account',
  middleware: 'auth'
})

// State
const userData = ref<any>(null)
const isUpdating = ref(false)
const updateMessage = ref('')

const form = reactive({
  receiveUpdates: false
})

// Lifecycle
onMounted(() => {
  loadUserData()
})

// Methods
const loadUserData = () => {
  if (process.client) {
    const data = sessionStorage.getItem('signupData')
    if (data) {
      userData.value = JSON.parse(data)
      form.receiveUpdates = userData.value.receiveUpdates
    }
  }
}

const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString()
}

const updateReceiveUpdates = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.receiveUpdates = target.checked
}

const updatePreferences = async () => {
  isUpdating.value = true
  updateMessage.value = ''
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update stored data
    if (process.client && userData.value) {
      const updatedData = {
        ...userData.value,
        receiveUpdates: form.receiveUpdates,
        lastUpdated: new Date().toISOString()
      }
      
      sessionStorage.setItem('signupData', JSON.stringify(updatedData))
      userData.value = updatedData
      
      updateMessage.value = 'Preferences updated successfully!'
      
      // Clear message after 3 seconds
      setTimeout(() => {
        updateMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    updateMessage.value = 'Error updating preferences. Please try again.'
  } finally {
    isUpdating.value = false
  }
}

const signOut = () => {
  if (process.client) {
    sessionStorage.removeItem('signupCompleted')
    sessionStorage.removeItem('signupData')
  }
  navigateTo('/')
}

const clearData = () => {
  if (confirm('Are you sure you want to clear all your account data? This action cannot be undone.')) {
    if (process.client) {
      sessionStorage.clear()
    }
    navigateTo('/')
  }
}

const goToSignup = () => {
  navigateTo('/')
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--n-color-surface-raised);
}

.profile-card {
  width: 100%;
  max-width: 700px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.preferences-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

.account-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.update-message {
  margin-top: 1rem;
}

.no-data {
  text-align: center;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
  
  .account-actions {
    flex-direction: column;
  }
}
</style>
