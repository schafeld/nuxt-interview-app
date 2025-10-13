<!-- pages/profile.vue -->
<template>
  <div class="profile-container">
    <nord-card class="profile-card" padding="none">
      <div class="profile-header">
        <div class="header-content">
          <nord-avatar size="l" name="User Avatar" class="profile-avatar">
            <nord-icon name="user-single" size="m"></nord-icon>
          </nord-avatar>
          <div class="header-text">
            <h1 class="profile-title">User Profile</h1>
            <p class="profile-subtitle">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="userData" class="profile-content">
        <div class="profile-section">
          <nord-banner variant="info" class="info-banner">
            <div class="banner-content">
              <div class="section-title">
                <h2>
                  <nord-icon name="interface-security-shield-check" size="s"></nord-icon>
                  Account Information
                </h2>
              </div>
              <div class="profile-details">
                <div class="detail-row">
                  <nord-icon name="interface-email" size="s" class="detail-icon"></nord-icon>
                  <div class="detail-content">
                    <span class="detail-label">Email Address:</span>
                    <span class="detail-value">{{ userData.email }}</span>
                  </div>
                </div>
                <div class="detail-row">
                  <nord-icon name="interface-time" size="s" class="detail-icon"></nord-icon>
                  <div class="detail-content">
                    <span class="detail-label">Account Created:</span>
                    <span class="detail-value">{{ formatDate(userData.timestamp) }}</span>
                  </div>
                </div>
                <div class="detail-row">
                  <nord-icon name="generic-module" size="s" class="detail-icon"></nord-icon>
                  <div class="detail-content">
                    <span class="detail-label">Product Updates:</span>
                    <nord-badge :variant="userData.receiveUpdates ? 'success' : 'neutral'">
                      <nord-icon 
                        :name="userData.receiveUpdates ? 'interface-checked-circle' : 'interface-close-small'" 
                        size="xs"
                      ></nord-icon>
                      {{ userData.receiveUpdates ? 'Enabled' : 'Disabled' }}
                    </nord-badge>
                  </div>
                </div>
              </div>
            </div>
          </nord-banner>
        </div>

        <div class="profile-section">
          <div class="section-title">
            <h2>
              <nord-icon name="interface-sort-up-small" size="s"></nord-icon>
              Update Preferences
            </h2>
          </div>
          <nord-card class="preferences-card">
            <form @submit.prevent="updatePreferences" class="preferences-form">
              <nord-checkbox
                :checked="form.receiveUpdates"
                @change="updateReceiveUpdates"
                label="Receive product updates and announcements"
                class="preference-checkbox"
              >
                <!-- <nord-icon name="interface-email-action-send" size="s" slot="icon"></nord-icon> -->
              </nord-checkbox>
              
              <div class="form-actions">
                <nord-button type="submit" :disabled="isUpdating" :loading="isUpdating" size="l">
                  <nord-icon name="interface-fast-forward" size="l" slot="start"></nord-icon>
                  {{ isUpdating ? 'Updating...' : 'Update Preferences' }}
                </nord-button>
              </div>
            </form>
          </nord-card>
        </div>

        <div class="profile-section">
          <div class="section-title">
            <h2>
              <nord-icon name="interface-shield" size="s"></nord-icon>
              Account Actions
            </h2>
          </div>
          <nord-card class="actions-card">
            <div class="account-actions">
              <nord-button @click="signOut" variant="secondary" size="l" class="action-button">
                <nord-icon name="interface-logout" size="s" slot="start"></nord-icon>
                Sign Out
              </nord-button>
              <nord-button @click="clearData" variant="danger" size="l" class="action-button">
                <nord-icon name="interface-delete" size="s" slot="start"></nord-icon>
                Clear Account Data
              </nord-button>
            </div>
          </nord-card>
        </div>

        <!-- Success message -->
        <div v-if="updateMessage" class="update-message">
          <nord-banner variant="success" class="success-banner">
            <nord-icon name="interface-checked-circle" size="s"></nord-icon>
            {{ updateMessage }}
          </nord-banner>
        </div>
      </div>

      <div v-else class="no-data">
        <nord-banner variant="warning" class="warning-banner">
          <div class="banner-content">
            <nord-icon name="interface-alert-triangle" size="m" class="warning-icon"></nord-icon>
            <div class="warning-text">
              <h2>No Profile Data Found</h2>
              <p>
                It looks like you haven't signed up yet or your session has expired.
              </p>
            </div>
          </div>
          <nord-button @click="goToSignup" size="l" class="signup-button">
            <nord-icon name="user-add" size="s" slot="start"></nord-icon>
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

// Composables
const { user, isAuthenticated, initializeAuth, updatePreferences: updateUserPreferences, logout } = useAuth()

// State
const isUpdating = ref(false)
const updateMessage = ref('')

const form = reactive({
  receiveUpdates: false
})

// Computed
const userData = computed(() => user.value)

// Lifecycle
onMounted(async () => {
  await initializeAuth()
  if (user.value) {
    form.receiveUpdates = user.value.receiveUpdates
  }
})

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
    // Use the JWT auth system to update preferences
    await updateUserPreferences(form.receiveUpdates)
    
    updateMessage.value = 'Preferences updated successfully!'
    
    // Clear message after 3 seconds
    setTimeout(() => {
      updateMessage.value = ''
    }, 3000)
  } catch (error) {
    updateMessage.value = 'Error updating preferences. Please try again.'
  } finally {
    isUpdating.value = false
  }
}

const signOut = async () => {
  try {
    await logout()
    navigateTo('/')
  } catch (error) {
    console.error('Sign out failed:', error)
    // Force navigation anyway
    navigateTo('/')
  }
}

const clearData = async () => {
  if (confirm('Are you sure you want to clear all your account data? This action cannot be undone.')) {
    try {
      await logout()
      navigateTo('/')
    } catch (error) {
      console.error('Clear data failed:', error)
      navigateTo('/')
    }
  }
}

const goToSignup = () => {
  navigateTo('/')
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  padding: var(--n-space-l);
  background: linear-gradient(135deg, var(--n-color-surface-raised) 0%, var(--n-color-surface) 100%);
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: var(--n-box-shadow-l);
}

.profile-header {
  padding: var(--n-space-xl);
  background: var(--n-color-surface-raised);
  border-bottom: 1px solid var(--n-color-border);
  border-top-left-radius: var(--n-border-radius);
  border-top-right-radius: var(--n-border-radius);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--n-space-l);
}

.profile-avatar {
  color: var(--n-color-text-on-accent);
  margin-right: var(--n-space-s);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-xs);
}

.profile-title {
  margin: 0;
  color: var(--n-color-text);
  font-size: var(--n-font-size-l);
  font-weight: var(--n-font-weight-active);
}

.profile-subtitle {
  margin: 0;
  line-height: 1.5;
  font-size: var(--n-font-size-m);
  color: var(--n-color-text-weak);
}

.section-title h2 {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  color: var(--n-color-text);
  margin: 0;
  margin-bottom: var(--n-space-s);
  font-size: var(--n-font-size-s);
  font-weight: var(--n-font-weight-active);
}

.detail-label {
  font-size: var(--n-font-size-s);
  color: var(--n-color-text-weak);
  font-weight: var(--n-font-weight-active);
  margin-right: var(--n-space-xs);
}

.detail-value {
  margin: 0;
  font-size: var(--n-font-size-s);
  color: var(--n-color-text);
  font-weight: var(--n-font-weight-normal);
}

.warning-text h2 {
  margin: 0;
  font-size: var(--n-font-size-s);
  font-weight: var(--n-font-weight-active);
  color: var(--n-color-status-warning);
}

.warning-text p {
  margin: 0;
  font-size: var(--n-font-size-m);
  color: var(--n-color-text-weak);
}

.profile-content {
  padding: var(--n-space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--n-space-xl);
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-m);
}

.section-title {
  margin-bottom: var(--n-space-s);
}

.info-banner {
  background: var(--n-color-status-info-background);
  border-color: var(--n-color-status-info);
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-m);
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
  align-items: center;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--n-space-s);
  padding: var(--n-space-s);
  background: var(--n-color-surface);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-color-border);
  text-align: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
}

.detail-icon {
  color: var(--n-color-status-info);
  margin-top: 2px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  flex: 1;
  text-align: left;
}

.preferences-card,
.actions-card {
  border: 1px solid var(--n-color-border);
  background: var(--n-color-surface-raised);
}

.preferences-form {
  padding: var(--n-space-l);
  display: flex;
  flex-direction: column;
  gap: var(--n-space-l);
}

.preference-checkbox {
  padding: var(--n-space-s);
  background: var(--n-color-surface);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-color-border);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.account-actions {
  padding: var(--n-space-l);
  display: flex;
  gap: var(--n-space-m);
  flex-wrap: wrap;
}

.action-button {
  flex: 1;
  min-width: 200px;
}

.update-message {
  position: fixed;
  top: var(--n-space-l);
  right: var(--n-space-l);
  z-index: 1000;
  max-width: 400px;
}

.success-banner {
  background: var(--n-color-status-success-background);
  border-color: var(--n-color-status-success);
  display: flex;
  align-items: center;
  gap: var(--n-space-s);
}

.no-data {
  padding: var(--n-space-xl);
}

.warning-banner {
  background: var(--n-color-status-warning-background);
  border-color: var(--n-color-status-warning);
  display: flex;
  flex-direction: column;
  gap: var(--n-space-l);
  text-align: center;
}

.warning-icon {
  color: var(--n-color-status-warning);
  margin: 0 auto;
}

.warning-text {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
}

.signup-button {
  margin: 0 auto;
  max-width: 200px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--n-space-m);
  }
  
  .profile-header {
    padding: var(--n-space-l);
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: var(--n-space-m);
  }
  
  .profile-content {
    padding: var(--n-space-l);
  }
  
  .detail-row {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
  }
  
  .detail-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--n-space-xs);
  }
  
  .account-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
  
  .update-message {
    position: relative;
    top: auto;
    right: auto;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .preferences-form,
  .account-actions {
    padding: var(--n-space-m);
  }
  
  .section-title {
    flex-direction: column;
    text-align: center;
    gap: var(--n-space-xs);
  }
}
</style>