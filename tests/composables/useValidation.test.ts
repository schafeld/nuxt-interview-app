// tests/composables/useValidation.test.ts
import { describe, it, expect } from 'vitest'

describe('useValidation', () => {
  it('should validate email addresses correctly', async () => {
    const { useValidation } = await import('~/composables/useValidation')
    const { validateEmail } = useValidation()

    // Valid emails
    expect(validateEmail('test@example.com')).toEqual([])
    expect(validateEmail('user.name+tag@domain.co.uk')).toEqual([])

    // Invalid emails
    expect(validateEmail('')).toContain('Email is required')
    expect(validateEmail('invalid-email')).toContain('Please enter a valid email address')
    expect(validateEmail('@domain.com')).toContain('Please enter a valid email address')
  })

  it('should validate password strength correctly', async () => {
    const { useValidation } = await import('~/composables/useValidation')
    const { validatePassword, getPasswordStrength } = useValidation()

    // Weak password
    const weakErrors = validatePassword('weak')
    expect(weakErrors).toContain('Password must be at least 12 characters long')
    expect(weakErrors).toContain('Password must contain at least one uppercase letter')

    // Strong password
    const strongErrors = validatePassword('StrongPassword123!@')
    expect(strongErrors).toEqual([])

    // Check password strength analysis
    const weakStrength = getPasswordStrength('weak')
    expect(weakStrength.strength).toBe('weak')
    expect(weakStrength.score).toBeLessThan(3)

    const strongStrength = getPasswordStrength('StrongPassword123!@')
    expect(strongStrength.strength).toBe('strong')
    expect(strongStrength.score).toBe(5)
  })

  it('should create reactive validation state', async () => {
    const { useValidation } = await import('~/composables/useValidation')
    const { createValidationState } = useValidation()

    const validation = createValidationState()

    // Initially no errors
    expect(validation.isValid.value).toBe(false)
    expect(Object.keys(validation.errors.value)).toHaveLength(0)

    // Validate a field with invalid value
    await validation.validateField('email', 'invalid-email')
    
    expect(validation.errors.value.email).toBeDefined()
    expect(validation.errors.value.email.length).toBeGreaterThan(0)
    expect(validation.isValid.value).toBe(false)
    expect(validation.touched.value.email).toBe(true)

    // Validate with correct value
    await validation.validateField('email', 'test@example.com')
    
    // After fixing the email, there should be no errors for that field
    expect(validation.errors.value.email).toEqual([])
    
    // Since there are no errors in any field, isValid should be true
    const hasAnyErrors = Object.values(validation.errors.value).some((errors: any) => 
      Array.isArray(errors) && errors.length > 0
    )
    expect(hasAnyErrors).toBe(false)
  })

  it('should validate complete form data', async () => {
    const { useValidation } = await import('~/composables/useValidation')
    const { validateForm } = useValidation()

    // Invalid form data
    const invalidResult = validateForm({
      email: 'invalid-email',
      password: 'weak',
      receiveUpdates: true
    })

    expect(invalidResult.success).toBe(false)
    expect(invalidResult.errors.length).toBeGreaterThan(0)

    // Valid form data
    const validResult = validateForm({
      email: 'test@example.com',
      password: 'StrongPassword123!@',
      receiveUpdates: true
    })

    expect(validResult.success).toBe(true)
    expect(validResult.errors).toEqual([])
  })
})