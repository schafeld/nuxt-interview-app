// middleware/signup.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.client) {
    const { isAuthenticated, initializeAuth } = useAuth()
    
    // Initialize auth state if needed
    await initializeAuth()
    
    if (to.path === '/success' && !isAuthenticated.value) {
      return navigateTo('/')
    }
  }
})
