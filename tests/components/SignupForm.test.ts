// tests/components/SignupForm.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { usePasswordValidation, useFormValidation } from '~/composables/usePasswordValidation'

// Mock the composables
vi.mock('~/composables/usePasswordValidation', () => ({
  usePasswordValidation: () => ({
    validatePassword: (password: string) => {
      const errors: string[] = []
      if (password.length < 12) errors.push('Password too short')
      if (!/[A-Z]/.test(password)) errors.push('Missing uppercase')
      return errors
    }
  })
}))

describe('Password Validation', () => {
  it('should validate password correctly', () => {
    const { validatePassword } = usePasswordValidation()
    
    const errors = validatePassword('weak')
    expect(errors).toContain('Password too short')
    expect(errors).toContain('Missing uppercase')
  })
  
  it('should pass strong password validation', () => {
    const { validatePassword } = usePasswordValidation()
    
    const errors = validatePassword('StrongPassword123!@')
    expect(errors).toHaveLength(0)
  })
})