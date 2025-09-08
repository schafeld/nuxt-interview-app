// middleware/signup.ts
export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const hasCompletedSignup = sessionStorage.getItem('signupCompleted')
    
    if (to.path === '/success' && !hasCompletedSignup) {
      return navigateTo('/')
    }
  }
})
