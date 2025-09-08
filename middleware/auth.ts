// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  // Client-side: check session storage
  if (process.client) {
    const hasCompletedSignup = sessionStorage.getItem('signupCompleted')
    const hasUserData = sessionStorage.getItem('signupData')
    
    if (!hasCompletedSignup || !hasUserData) {
      return navigateTo('/')
    }
  }
  
  // Server-side in SPA mode: allow access since we can't check session storage
  // The client-side check will handle redirection if needed
})
