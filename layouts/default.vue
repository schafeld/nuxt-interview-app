<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <nord-icon name="interface-medical" size="m" class="app-logo"></nord-icon>
          <h2 class="app-title">VetSignup</h2>
        </div>
        
        <nav class="header-nav" v-if="isSignedIn">
          <nord-button 
            @click="navigateToProfile"
            variant="plain"
            size="s"
            class="profile-button"
            :title="userEmail ? `Profile for ${userEmail}` : 'Profile'"
          >
            <nord-icon name="interface-user-single" size="s" class="profile-icon"></nord-icon>
            <span class="profile-text">Profile</span>
          </nord-button>
        </nav>
      </div>
    </header>
    
    <main class="app-main">
      <slot />
    </main>
    
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2025 VetSignup - Veterinary Product Registration</p>
        <p class="footer-note">Built with NordHealth Design System</p>
      </div>
    </footer>
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
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--n-color-surface);
}

.app-header {
  background-color: var(--n-color-surface-raised);
  border-bottom: 1px solid var(--n-color-border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-logo {
  color: var(--n-color-text);
}

.app-title {
  color: var(--n-color-text);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  transition: background-color 0.2s;
}

.profile-button:hover {
  background-color: var(--n-color-surface);
}

.profile-icon {
  color: var(--n-color-text);
}

.profile-text {
  color: var(--n-color-text);
  font-weight: 500;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-footer {
  background-color: var(--n-color-surface-raised);
  border-top: 1px solid var(--n-color-border);
  padding: 1.5rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.footer-content p {
  margin: 0.25rem 0;
  color: var(--n-color-text-weak);
  font-size: 0.875rem;
}

.footer-note {
  font-size: 0.75rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 0.5rem;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .profile-text {
    display: none;
  }
  
  .profile-button {
    padding: 0.5rem;
  }
}
</style>
