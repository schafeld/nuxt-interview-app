// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const hasCompletedSignup = sessionStorage.getItem('signupCompleted')
    const hasUserData = sessionStorage.getItem('signupData')
    
    if (to.path === '/profile' && (!hasCompletedSignup || !hasUserData)) {
      return navigateTo('/')
    }
  }
})
