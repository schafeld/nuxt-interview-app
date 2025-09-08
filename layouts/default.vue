<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <!-- Nord Header -->
    <nord-header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <nord-icon name="medical-heart-rate" size="l" class="app-logo"></nord-icon>
          <nord-text variant="heading-m" class="app-title">VetSignup</nord-text>
        </div>
        
        <div class="header-right" v-if="isSignedIn">
          <nord-dropdown>
            <nord-button slot="toggle" variant="plain" class="profile-button">
              <nord-avatar size="s" name="User Profile" class="profile-avatar">
                <nord-icon name="user-single" size="s"></nord-icon>
              </nord-avatar>
              <span class="profile-email">{{ userEmail }}</span>
              <nord-icon name="arrow-down" size="s" class="dropdown-arrow"></nord-icon>
            </nord-button>
            
            <nord-dropdown-group>
              <nord-dropdown-item @click="navigateToProfile">
                <nord-icon name="user-single" size="s"></nord-icon>
                View Profile
              </nord-dropdown-item>
              <nord-dropdown-item @click="signOut" variant="destructive">
                <nord-icon name="interface-logout" size="s"></nord-icon>
                Sign Out
              </nord-dropdown-item>
            </nord-dropdown-group>
          </nord-dropdown>
        </div>
      </div>
    </nord-header>
    
    <!-- Main Content -->
    <main class="app-main">
      <slot />
    </main>
    
    <!-- Nord Footer -->
    <nord-footer class="app-footer">
      <div class="footer-content">
        <nord-text variant="body-s" color="weak">
          &copy; 2025 VetSignup - Veterinary Product Registration
        </nord-text>
        <nord-text variant="caption" color="weak" class="footer-note">
          <nord-icon name="interface-love-heart" size="xs"></nord-icon>
          Built with NordHealth Design System by Oliver Schafeld
        </nord-text>
      </div>
    </nord-footer>
  </div>
</template>

<script setup lang="ts">
// State
const isSignedIn = ref(false)
const userEmail = ref('')

// Lifecycle
onMounted(() => {
  checkSigninStatus()
})

// Watch for route changes to update signin status
watch(() => useRoute().path, () => {
  checkSigninStatus()
})

// Methods
const checkSigninStatus = () => {
  if (process.client) {
    const hasCompleted = sessionStorage.getItem('signupCompleted')
    const userData = sessionStorage.getItem('signupData')
    
    isSignedIn.value = !!hasCompleted && !!userData
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData)
        userEmail.value = parsedData.email || ''
      } catch (error) {
        userEmail.value = ''
      }
    }
  }
}

const navigateToProfile = () => {
  navigateTo('/profile')
}

const signOut = () => {
  if (process.client) {
    sessionStorage.removeItem('signupCompleted')
    sessionStorage.removeItem('signupData')
    isSignedIn.value = false
    userEmail.value = ''
    navigateTo('/')
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--n-color-surface);
}

.app-header {
  border-bottom: 1px solid var(--n-color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--n-color-surface-raised);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--n-space-m);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--n-space-s);
}

.app-logo {
  color: var(--n-color-status-info);
}

.app-title {
  color: var(--n-color-text);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  padding: var(--n-space-xs) var(--n-space-s);
}

.profile-avatar {
  border: 2px solid var(--n-color-border);
}

.profile-email {
  color: var(--n-color-text);
  font-size: var(--n-font-size-s);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  color: var(--n-color-text-weak);
  transition: transform 0.2s ease;
}

.profile-button[aria-expanded="true"] .dropdown-arrow {
  transform: rotate(180deg);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Allows flex children to shrink */
}

.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--n-color-border);
  background: var(--n-color-surface-raised);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--n-space-m);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--n-space-xs);
}

.footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--n-space-xs);
}

@media (max-width: 768px) {
  .header-content {
    padding: var(--n-space-s);
  }
  
  .profile-email {
    display: none;
  }
  
  .profile-button {
    padding: var(--n-space-xs);
  }
}
</style>