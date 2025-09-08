// composables/usePasswordValidation.ts
export const usePasswordValidation = () => {
  const config = useRuntimeConfig()
  
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    const { passwordConfig } = config.public
    
    if (password.length < passwordConfig.minLength) {
      errors.push(`Password must be at least ${passwordConfig.minLength} characters long`)
    }
    
    if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (passwordConfig.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (passwordConfig.requireSpecialChars) {
      const specialChars = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length
      if (specialChars < passwordConfig.minSpecialChars) {
        errors.push(`Password must contain at least ${passwordConfig.minSpecialChars} special characters`)
      }
    }
    
    return errors
  }
  
  return {
    validatePassword
  }
}