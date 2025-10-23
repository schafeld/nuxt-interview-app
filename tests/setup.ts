// tests/setup.ts
import { vi } from 'vitest'

// Mock Vue reactivity functions for testing
Object.defineProperty(globalThis, 'reactive', {
  value: vi.fn((obj) => {
    // Create a proper reactive-like object for testing
    return new Proxy(obj, {
      get(target, prop) {
        return target[prop]
      },
      set(target, prop, value) {
        target[prop] = value
        return true
      }
    })
  }),
  writable: true
})

Object.defineProperty(globalThis, 'ref', {
  value: vi.fn((val) => ({ value: val })),
  writable: true
})

Object.defineProperty(globalThis, 'computed', {
  value: vi.fn((fn) => ({
    value: typeof fn === 'function' ? fn() : fn
  })),
  writable: true
})

Object.defineProperty(globalThis, 'watch', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(globalThis, 'watchEffect', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(globalThis, 'onMounted', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(globalThis, 'onBeforeUnmount', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(globalThis, 'onUnmounted', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(globalThis, 'toRefs', {
  value: vi.fn((obj) => {
    const refs: Record<string, any> = {}
    Object.keys(obj).forEach(key => {
      refs[key] = { value: obj[key] }
    })
    return refs
  }),
  writable: true
})

Object.defineProperty(globalThis, 'readonly', {
  value: vi.fn((val) => val),
  writable: true
})

Object.defineProperty(globalThis, 'useState', {
  value: vi.fn((key, defaultValue) => ({ value: defaultValue() })),
  writable: true
})

Object.defineProperty(globalThis, 'navigateTo', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(globalThis, 'useRoute', {
  value: vi.fn(() => ({ path: '/' })),
  writable: true
})

Object.defineProperty(globalThis, 'useRuntimeConfig', {
  value: vi.fn(() => ({
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
  })),
  writable: true
})

// Mock process.client and process.env
Object.defineProperty(globalThis, 'process', {
  value: {
    client: true,
    env: {
      NODE_ENV: 'test'
    }
  },
  writable: true
})

// Mock usePasswordValidation composable
Object.defineProperty(globalThis, 'usePasswordValidation', {
  value: vi.fn(() => ({
    validatePassword: (password: string) => {
      const errors: string[] = []
      if (password.length < 12) {
        errors.push('Password must be at least 12 characters long')
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number')
      }
      const specialCount = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length
      if (specialCount < 2) {
        errors.push('Password must contain at least 2 special characters')
      }
      return errors
    }
  })),
  writable: true
})

// Mock useEncryption composable
Object.defineProperty(globalThis, 'useEncryption', {
  value: vi.fn(() => ({
    encrypt: (text: string) => {
      // Simple base64 encoding for testing
      return btoa(text)
    },
    decrypt: (encryptedText: string) => {
      try {
        return atob(encryptedText)
      } catch {
        return ''
      }
    },
    verifyPassword: (plainPassword: string, encryptedPassword: string) => {
      try {
        const decrypted = atob(encryptedPassword)
        return decrypted === plainPassword
      } catch {
        return false
      }
    }
  })),
  writable: true
})

// Mock useSecureEncryption composable
Object.defineProperty(globalThis, 'useSecureEncryption', {
  value: vi.fn(() => ({
    hashPassword: async (password: string, salt?: string) => {
      // Mock PBKDF2 hash format for testing
      const mockSalt = salt || 'mocksalt123456789'
      return `pbkdf2$${mockSalt}$mockhash123456789`
    },
    verifyPassword: async (password: string, hash: string) => {
      // Mock verification - always return true for 'correct' password
      return password === 'correct'
    },
    isSecureHash: (hash: string) => {
      return hash.startsWith('pbkdf2$')
    },
    migrateOldPassword: async (plainPassword: string, legacyHash: string) => {
      // Mock migration
      if (plainPassword === 'correct') {
        return `pbkdf2$mocksalt$mockhash123456789`
      }
      throw new Error('Password verification failed during migration')
    },
    generateSecureToken: () => {
      return 'mock-secure-token-123456789'
    },
    generateSessionId: () => {
      return 'mock-session-id-123456789'
    }
  })),
  writable: true
})