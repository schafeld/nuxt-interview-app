<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <!-- Skip Link for Accessibility -->
    <a href="#main-content" class="skip-link" @click="handleSkipLink">Skip to main content</a>
    
    <!-- Nord Header -->
    <nord-header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <nord-icon name="medical-heart-rate" size="l" class="app-logo" aria-hidden="true"></nord-icon>
          <h1 class="app-title">
            VetSignup
          </h1>
        </div>
        
        <nav class="header-right" v-if="isSignedIn" aria-label="User navigation">
          <nord-dropdown>
            <nord-button 
              slot="toggle" 
              variant="plain" 
              class="profile-button"
              :aria-label="`User menu for ${userEmail}`"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              <nord-avatar size="s" :name="`Profile picture for ${userEmail}`" class="profile-avatar">
                <nord-icon name="user-single" size="s" aria-hidden="true"></nord-icon>
              </nord-avatar>
              <span class="profile-email">{{ userEmail }}</span>
              <nord-icon name="arrow-down" size="s" class="dropdown-arrow" aria-hidden="true"></nord-icon>
            </nord-button>
            
            <nord-dropdown-group role="menu">
              <nord-dropdown-item @click="navigateToProfile" role="menuitem">
                <nord-icon name="user-single" size="s" aria-hidden="true"></nord-icon>
                View Profile
              </nord-dropdown-item>
              <nord-dropdown-item @click="signOut" variant="destructive" role="menuitem">
                <nord-icon name="interface-logout" size="s" aria-hidden="true"></nord-icon>
                Sign Out
              </nord-dropdown-item>
            </nord-dropdown-group>
          </nord-dropdown>
        </nav>
      </div>
    </nord-header>
    
    <!-- Main Content -->
    <main id="main-content" class="app-main" role="main" tabindex="-1">
            <NuxtPage />
    </main>
    
    <!-- Global Loading Overlay -->
    <GlobalLoading />
    
    <!-- Nord Footer -->
    <nord-footer class="app-footer" role="contentinfo">
      <div class="footer-content">
        <p class="footer-text">
          &copy; 2025 VetSignup - Veterinary Product Registration
        </p>
        <p class="footer-note">
          Built with <nord-icon name="interface-favorite" size="xs" aria-hidden="true"></nord-icon> &amp; NordHealth Design System by <a href="https://github.com/schafeld/nuxt-interview-app" title="Github repository" target="_blank" class="author-link">Oliver Schafeld <nord-icon name="generic-github" size="s" class="github-icon" aria-hidden="true"></nord-icon></a>
        </p>
      </div>
    </nord-footer>
  </div>
</template>

<script setup lang="ts">
// Auth state using new auth composable
const { isAuthenticated, user, initializeAuth, logout } = useAuth() // todo: refactor? use in middleware
const { setGlobalLoading } = useGlobalLoading()

// Computed values
const isSignedIn = computed(() => isAuthenticated.value)
const userEmail = computed(() => user.value?.email || '')

// Lifecycle
onMounted(async () => {
  // initializeAuth already includes process.client check internally
  await initializeAuth()
})

// Watch for route changes to refresh auth state and token if needed
watch(() => useRoute().path, async () => {
  // Always refresh auth state on route change to ensure nav menu updates
  await initializeAuth()
  
  if (isAuthenticated.value) {
    const { refreshTokenIfNeeded } = useAuth()
    await refreshTokenIfNeeded()
  }
})

// Watch for authentication state changes to ensure reactivity
watch(isAuthenticated, (newValue) => {
  // Auth state changed, navigation will automatically update
}, { immediate: true })

const navigateToProfile = () => {
  navigateTo('/profile')
}

const handleSkipLink = (event: Event) => {
  // Let the default behavior happen (scroll to target)
  // But also ensure focus moves to the main content for screen readers
  nextTick(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
    }
  })
}

const signOut = async () => {
  try {
    setGlobalLoading(true, 'Signing out...')
    await logout()
    // Use await to ensure navigation completes before loading finishes
    await navigateTo('/')
  } catch (error) {
    console.error('Sign out failed:', error)
  } finally {
    setGlobalLoading(false)
  }
}
</script>

<style scoped>
/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--n-color-surface);
  color: var(--n-color-text);
  padding: var(--n-space-s);
  text-decoration: none;
  border-radius: var(--n-border-radius);
  z-index: 1000;
  font-weight: var(--n-font-weight-active);
  border: 2px solid var(--n-color-border-focus);
}

.skip-link:focus {
  top: 6px;
}

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
  font-size: var(--n-font-size-m);
  font-weight: var(--n-font-weight-active);
}

.footer-text {
  margin: 0;
  font-size: var(--n-font-size-s);
  color: var(--n-color-text-weaker);
}

.footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--n-space-xs);
  margin: 0;
  font-size: var(--n-font-size-xs);
  color: var(--n-color-text-weaker);
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
  margin-right: var(--n-space-s);
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
  margin-left: var(--n-space-s);
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
  color: var(--n-color-text-weakest);
  font-family: Arial, Helvetica, sans-serif;
  visibility: visible;
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

.author-link {
  color: var(--n-color-text-weaker);
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}

.author-link:hover {
  text-decoration: underline;
}

.github-icon {
  color: var(--n-color-text-weak);
  opacity: 0.6;
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