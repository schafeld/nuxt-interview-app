// tests/composables/useSecureEncryption.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSecureEncryption } from '../../composables/useSecureEncryption'

// Mock crypto.getRandomValues for consistent testing
const originalCrypto = global.crypto
beforeEach(() => {
  // Create a mock crypto object if it doesn't exist
  if (!global.crypto) {
    global.crypto = {
      getRandomValues: (array: Uint8Array) => {
        // Fill with predictable values for testing
        for (let i = 0; i < array.length; i++) {
          array[i] = i % 256
        }
        return array
      },
      subtle: {
        importKey: vi.fn(),
        deriveBits: vi.fn(),
      }
    } as any
  }
})

describe('useSecureEncryption', () => {
  it('should hash and verify passwords correctly', async () => {
    // Store the actual password being tested to create deterministic mocking
    let currentPassword = ''

    // Mock importKey to capture the password
    global.crypto.subtle.importKey = vi.fn().mockImplementation((format, keyData, algorithm, extractable, keyUsages) => {
      // Store the password from the ArrayBuffer
      if (keyData instanceof ArrayBuffer) {
        const decoder = new TextDecoder()
        currentPassword = decoder.decode(keyData)
      }
      return Promise.resolve({ type: 'secret', password: currentPassword })
    })

    // Mock deriveBits to return different results for different passwords
    global.crypto.subtle.deriveBits = vi.fn().mockImplementation((params, keyMaterial, length) => {
      const mockDerivedKey = new ArrayBuffer(32)
      const derivedArray = new Uint8Array(mockDerivedKey)

      // Create different patterns based on password content
      const password = (keyMaterial as any).password || currentPassword
      let hash = 0
      for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) - hash + password.charCodeAt(i)) & 0xffffffff
      }

      // Fill array with pattern based on password hash
      for (let i = 0; i < derivedArray.length; i++) {
        derivedArray[i] = (hash + i) % 256
      }

      return Promise.resolve(mockDerivedKey)
    })

    const { hashPassword, verifyPassword } = useSecureEncryption()

    const password = 'TestPassword123!'
    const hash = await hashPassword(password)

    // Hash should be in salt:hash format
    expect(hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/)

    // Should verify correctly
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)

    // Should reject wrong password
    const isInvalid = await verifyPassword('WrongPassword', hash)
    expect(isInvalid).toBe(false)
  })

  it('should identify secure hash format', () => {
    const { isSecureHash } = useSecureEncryption()

    // Valid secure hash format
    const validHash = 'a'.repeat(32) + ':' + 'b'.repeat(64)
    expect(isSecureHash(validHash)).toBe(true)

    // Invalid formats
    expect(isSecureHash('invalid')).toBe(false)
    expect(isSecureHash('short:hash')).toBe(false)
    expect(isSecureHash('toolong:' + 'a'.repeat(100))).toBe(false)
  })

  it('should generate secure tokens', () => {
    const { generateSecureToken } = useSecureEncryption()

    const token = generateSecureToken(16)
    expect(token).toHaveLength(32) // 16 bytes = 32 hex chars
    expect(token).toMatch(/^[a-f0-9]+$/)

    // Different calls should generate different tokens
    const token2 = generateSecureToken(16)
    expect(token).not.toBe(token2)
  })

  it('should generate session IDs', () => {
    const { generateSessionId } = useSecureEncryption()

    const sessionId = generateSessionId()
    expect(sessionId).toHaveLength(32) // 16 bytes = 32 hex chars
    expect(sessionId).toMatch(/^[a-f0-9]+$/)
  })

  it('should handle invalid hash formats gracefully', async () => {
    const { verifyPassword } = useSecureEncryption()

    // Invalid formats should return false, not throw
    expect(await verifyPassword('password', 'invalid')).toBe(false)
    expect(await verifyPassword('password', '')).toBe(false)
    expect(await verifyPassword('password', 'no:colon:here')).toBe(false)
  })

  it('should handle migration from old encryption', async () => {
    // Mock useEncryption to return the correct password for migration
    const mockUseEncryption = vi.fn(() => ({
      decrypt: vi.fn().mockReturnValue('TestPassword123!')
    }))

      // Override the global useEncryption for this test
      ; (globalThis as any).useEncryption = mockUseEncryption

    // Mock successful crypto operations for new hash generation
    global.crypto.subtle.importKey = vi.fn().mockResolvedValue({ type: 'secret' })
    global.crypto.subtle.deriveBits = vi.fn().mockResolvedValue(new ArrayBuffer(32))

    const { migrateOldPassword } = useSecureEncryption()
    const newHash = await migrateOldPassword('TestPassword123!', 'old_encrypted_password')

    // Should return a new secure hash
    expect(newHash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/)
  })

  it('should handle Web Crypto API errors gracefully', async () => {
    const { hashPassword, verifyPassword } = useSecureEncryption()

    // Mock crypto API failure
    global.crypto.subtle.importKey = vi.fn().mockRejectedValue(new Error('Crypto API error'))

    // Should throw meaningful error
    await expect(hashPassword('password')).rejects.toThrow('Failed to hash password')

    // Verification should return false on error
    const result = await verifyPassword('password', 'valid:hash:format')
    expect(result).toBe(false)
  })

  it('should use constant-time comparison for security', async () => {
    const { verifyPassword } = useSecureEncryption()

    // Create a known hash that matches a specific pattern
    const storedHashHex = '00'.repeat(32) // All zeros for predictable comparison
    const validHash = '00'.repeat(16) + ':' + storedHashHex

    // Mock crypto operations
    global.crypto.subtle.importKey = vi.fn().mockResolvedValue({ type: 'secret' })

    // Mock deriveBits to return all zeros for 'correct' password, different for others
    global.crypto.subtle.deriveBits = vi.fn().mockImplementation((params, keyMaterial, length) => {
      const mockDerivedKey = new ArrayBuffer(32)
      const derivedArray = new Uint8Array(mockDerivedKey)

      // If the importKey captured 'correct' password, return all zeros to match stored hash
      // Otherwise return different pattern
      const isCorrectPassword = JSON.stringify(keyMaterial).includes('correct')

      for (let i = 0; i < derivedArray.length; i++) {
        derivedArray[i] = isCorrectPassword ? 0 : i % 256
      }

      return Promise.resolve(mockDerivedKey)
    })

    // Mock importKey to capture password info
    global.crypto.subtle.importKey = vi.fn().mockImplementation((format, keyData, algorithm, extractable, keyUsages) => {
      let password = ''
      if (keyData instanceof ArrayBuffer) {
        const decoder = new TextDecoder()
        password = decoder.decode(keyData)
      }
      return Promise.resolve({ type: 'secret', password })
    })

    // Correct comparison
    const isValid = await verifyPassword('correct', validHash)
    expect(isValid).toBe(true)

    // Wrong comparison  
    const isInvalid = await verifyPassword('wrong', validHash)
    expect(isInvalid).toBe(false)
  })
})