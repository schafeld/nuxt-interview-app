// tests/composables/usePasswordValidation.test.ts
import { describe, it, expect } from 'vitest'
import { usePasswordValidation } from '~/composables/usePasswordValidation'

describe('usePasswordValidation', () => {
  const { validatePassword } = usePasswordValidation()

  it('should validate password length', () => {
    const errors = validatePassword('short')
    expect(errors).toContain('Password must be at least 12 characters long')
  })

  it('should validate uppercase requirement', () => {
    const errors = validatePassword('lowercase123!@')
    expect(errors).toContain('Password must contain at least one uppercase letter')
  })

  it('should validate lowercase requirement', () => {
    const errors = validatePassword('UPPERCASE123!@')
    expect(errors).toContain('Password must contain at least one lowercase letter')
  })

  it('should validate number requirement', () => {
    const errors = validatePassword('NoNumbers!@#$')
    expect(errors).toContain('Password must contain at least one number')
  })

  it('should validate special character requirement', () => {
    const errors = validatePassword('NoSpecialChars123')
    expect(errors).toContain('Password must contain at least 2 special characters')
  })

  it('should pass with strong password', () => {
    const errors = validatePassword('StrongPassword123!@')
    expect(errors).toHaveLength(0)
  })
})
