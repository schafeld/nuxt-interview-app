// tests/composables/useFormValidation.test.ts
import { describe, it, expect } from 'vitest'
import { useFormValidation } from '~/composables/useFormValidation'

describe('useFormValidation', () => {
  const { validateEmail, validateForm } = useFormValidation()

  describe('validateEmail', () => {
    it('should require email', () => {
      const errors = validateEmail('')
      expect(errors).toContain('Email is required')
    })

    it('should validate email format', () => {
      const errors = validateEmail('invalid-email')
      expect(errors).toContain('Please enter a valid email address')
    })

    it('should accept valid email', () => {
      const errors = validateEmail('test@example.com')
      expect(errors).toHaveLength(0)
    })
  })

  describe('validateForm', () => {
    it('should validate complete valid form', () => {
      const form = {
        email: 'test@example.com',
        password: 'StrongPassword123!@',
        receiveUpdates: true
      }
      
      const errors = validateForm(form)
      expect(errors).toHaveLength(0)
    })

    it('should return errors for invalid form', () => {
      const form = {
        email: 'invalid',
        password: 'weak',
        receiveUpdates: false
      }
      
      const errors = validateForm(form)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.field === 'email')).toBe(true)
      expect(errors.some(e => e.field === 'password')).toBe(true)
    })
  })
})
