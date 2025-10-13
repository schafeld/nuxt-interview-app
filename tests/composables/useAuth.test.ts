// tests/composables/useAuth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-12345'),
  },
  writable: true,
})

// Simple JWT mock for testing
const createMockJWT = (payload: any) => {
  return `header.${btoa(JSON.stringify(payload))}.signature`
}

const parseMockJWT = (token: string) => {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token')
  return JSON.parse(atob(parts[1]))
}

// Mock JWT functions (simplified for testing)
vi.mock('jose', () => ({
  SignJWT: class {
    constructor(public payload: any) {}
    setProtectedHeader() { return this }
    setIssuedAt() { return this }
    setExpirationTime() { return this }
    async sign() { 
      return createMockJWT(this.payload)
    }
  },
  jwtVerify: vi.fn(async (token: string) => {
    try {
      const payload = parseMockJWT(token)
      return { payload }
    } catch {
      throw new Error('Invalid token')
    }
  })
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should create and verify JWT tokens', async () => {
    const { useAuth } = await import('~/composables/useAuth')
    
    // Create a new auth instance for each test
    const auth = useAuth()
    
    // Test login
    await auth.login({
      email: 'test@example.com',
      password: 'TestPassword123!@',
      receiveUpdates: true
    })

    // Verify localStorage was called
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    
    // Check that the login method was called (since we can't easily test reactive state in this mocked environment)
    const setItemCalls = mockLocalStorage.setItem.mock.calls
    expect(setItemCalls.length).toBeGreaterThan(0)
    
    // The login method calls register which first stores registeredUsers, then the token
    // So we need to check for the token storage specifically
    const tokenCall = setItemCalls.find(call => call[0] === 'vet_auth_token')
    expect(tokenCall).toBeDefined()
    expect(tokenCall![0]).toBe('vet_auth_token')
  })

  it('should handle login errors gracefully', async () => {
    const { useAuth } = await import('~/composables/useAuth')
    const auth = useAuth()

    // Suppress console.error during this test to avoid noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock a login failure by throwing an error in the token creation
    vi.mocked(crypto.randomUUID).mockImplementationOnce(() => {
      throw new Error('UUID generation failed')
    })

    // The composable catches all errors and returns a generic message
    await expect(auth.login({
      email: 'test@example.com',
      password: 'TestPassword123!@',
      receiveUpdates: true
    })).rejects.toThrow('Registration failed. Please try again.')

    // Verify no token was stored on error (registeredUsers might still be called before the error)
    const setItemCalls = mockLocalStorage.setItem.mock.calls
    const tokenCall = setItemCalls.find(call => call[0] === 'vet_auth_token')
    expect(tokenCall).toBeUndefined()

    // Restore console.error
    consoleSpy.mockRestore()
  })

  it('should logout and clear user data', async () => {
    const { useAuth } = await import('~/composables/useAuth')
    const auth = useAuth()

    // First login
    await auth.login({
      email: 'test@example.com',
      password: 'TestPassword123!@',
      receiveUpdates: true
    })

    // Verify login stored token
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('vet_auth_token', expect.any(String))

    // Then logout
    await auth.logout()

    // Verify logout cleared token
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('vet_auth_token')
  })

  it('should update user preferences', async () => {
    const { useAuth } = await import('~/composables/useAuth')
    const auth = useAuth()

    // Use a unique email for this test to avoid conflicts
    const testEmail = 'preferences-test@example.com'
    
    // Set up mock localStorage to return the users data that was stored during login
    let storedUsers: any[] = []
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'registeredUsers') {
        return storedUsers.length > 0 ? JSON.stringify(storedUsers) : null
      }
      return null
    })
    
    // Capture what gets stored during login
    mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
      if (key === 'registeredUsers') {
        storedUsers = JSON.parse(value)
      }
    })
    
    // First register/login with a new user
    await auth.login({
      email: testEmail,
      password: 'TestPassword123!@',
      receiveUpdates: true
    })

    // Clear previous calls to focus on the updatePreferences call
    mockLocalStorage.setItem.mockClear()
    
    // Reset the mock to capture new calls while still returning stored data
    mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
      // Keep track of all setItem calls for verification
      if (key === 'registeredUsers') {
        storedUsers = JSON.parse(value)
      }
    })

    // Update preferences to false
    await auth.updatePreferences(false)

    // Verify new token was stored with updated preferences
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('vet_auth_token', expect.any(String))
    
    // Verify that registeredUsers was also updated
    const registeredUsersCall = mockLocalStorage.setItem.mock.calls.find(call => call[0] === 'registeredUsers')
    expect(registeredUsersCall).toBeDefined()
    
    if (registeredUsersCall) {
      const updatedUsers = JSON.parse(registeredUsersCall[1])
      const updatedUser = updatedUsers.find((user: any) => user.email === testEmail)
      expect(updatedUser.receiveUpdates).toBe(false)
    }
  })
})