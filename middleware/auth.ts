// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Client-side: check JWT authentication
  if (process.client) {
    const { isAuthenticated, initializeAuth } = useAuth()
    
    // Initialize auth state if not already done
    if (!isAuthenticated.value) {
      await initializeAuth()
    }
    
    // Check if user is authenticated
    if (!isAuthenticated.value) {
      return navigateTo('/')
    }
  }
  
  // Server-side in SPA mode: allow access since we can't check localStorage
  // The client-side check will handle redirection if needed
})
