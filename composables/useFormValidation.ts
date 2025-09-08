// composables/useFormValidation.ts
import type { SignupForm, ValidationError } from '~/types'

export const useFormValidation = () => {
  const { validatePassword } = usePasswordValidation()
  
  const validateEmail = (email: string): string[] => {
    const errors: string[] = []
    
    if (!email) {
      errors.push('Email is required')
      return errors
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address')
    }
    
    return errors
  }
  
  const validateForm = (form: SignupForm): ValidationError[] => {
    const errors: ValidationError[] = []
    
    const emailErrors = validateEmail(form.email)
    emailErrors.forEach(message => {
      errors.push({ field: 'email', message })
    })
    
    const passwordErrors = validatePassword(form.password)
    passwordErrors.forEach(message => {
      errors.push({ field: 'password', message })
    })
    
    return errors
  }
  
  return {
    validateEmail,
    validatePassword,
    validateForm
  }
}
