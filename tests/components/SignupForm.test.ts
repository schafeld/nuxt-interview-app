// tests/components/SignupForm.test.ts
import { describe, it, expect } from 'vitest'

// Import composables after mocking
import { usePasswordValidation } from '~/composables/usePasswordValidation'
import { useFormValidation } from '~/composables/useFormValidation'

describe('Form Validation', () => {
  describe('Password Validation', () => {
    it('should validate password correctly with all requirements', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('weak')
      expect(errors.length).toBeGreaterThan(0)
      expect(errors).toContain('Password must be at least 12 characters long')
      expect(errors).toContain('Password must contain at least one uppercase letter')
    })
    
    it('should pass strong password validation', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('StrongPassword123!@')
      expect(errors).toHaveLength(0)
    })

    it('should validate minimum length requirement', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('Short1!')
      expect(errors).toContain('Password must be at least 12 characters long')
    })

    it('should validate uppercase requirement', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('lowercase123!@')
      expect(errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should validate lowercase requirement', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('UPPERCASE123!@')
      expect(errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should validate number requirement', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('NoNumbers!@#')
      expect(errors).toContain('Password must contain at least one number')
    })

    it('should validate special character requirement', () => {
      const { validatePassword } = usePasswordValidation()
      
      const errors = validatePassword('NoSpecialChars123')
      expect(errors).toContain('Password must contain at least 2 special characters')
    })
  })

  describe('Email Validation', () => {
    it('should validate email format', () => {
      const { validateEmail } = useFormValidation()
      
      const errors = validateEmail('invalid-email')
      expect(errors).toContain('Please enter a valid email address')
    })

    it('should accept valid email', () => {
      const { validateEmail } = useFormValidation()
      
      const errors = validateEmail('test@example.com')
      expect(errors).toHaveLength(0)
    })

    it('should require email', () => {
      const { validateEmail } = useFormValidation()
      
      const errors = validateEmail('')
      expect(errors).toContain('Email is required')
    })
  })

  describe('Form Validation Integration', () => {
    it('should validate complete form', () => {
      const { validateForm } = useFormValidation()
      
      const form = {
        email: 'test@example.com',
        password: 'StrongPassword123!@',
        receiveUpdates: true
      }
      
      const errors = validateForm(form)
      expect(errors).toHaveLength(0)
    })

    it('should return multiple errors for invalid form', () => {
      const { validateForm } = useFormValidation()
      
      const form = {
        email: 'invalid',
        password: 'weak',
        receiveUpdates: false
      }
      
      const errors = validateForm(form)
      expect(errors.length).toBeGreaterThan(1)
      expect(errors.some(e => e.field === 'email')).toBe(true)
      expect(errors.some(e => e.field === 'password')).toBe(true)
    })
  })
})