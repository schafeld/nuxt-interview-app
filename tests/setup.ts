// tests/setup.ts
import { vi } from 'vitest'

// Mock Nuxt runtime config
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    passwordConfig: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      minSpecialChars: 2
    }
  }
}))

// Mock usePasswordValidation composable
global.usePasswordValidation = vi.fn(() => ({
  validatePassword: (password: string) => {
    const errors: string[] = []
    if (password.length < 12) errors.push('Password must be at least 12 characters long')
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter')
    if (!/\d/.test(password)) errors.push('Password must contain at least one number')
    if ((password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length < 2) {
      errors.push('Password must contain at least 2 special characters')
    }
    return errors
  }
}))

// Mock process.client
Object.defineProperty(global, 'process', {
  value: {
    client: true,
    env: process.env
  }
})
