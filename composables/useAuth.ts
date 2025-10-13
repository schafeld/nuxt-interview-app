// composables/useAuth.ts
import { SignJWT, jwtVerify } from 'jose'
import type { SignupForm, StoredUser } from '~/types'

interface UserData {
  id: string
  email: string
  receiveUpdates: boolean
  timestamp: string
}

interface AuthState {
  user: UserData | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

const JWT_SECRET = new TextEncoder().encode('your-256-bit-secret-key-here-for-development-only')
const TOKEN_KEY = 'vet_auth_token'
const TOKEN_EXPIRY_HOURS = 24

export const useAuth = () => {
  const state = reactive<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  })

  // Create JWT token with user data
  const createToken = async (userData: UserData): Promise<string> => {
    try {
      const payload: Record<string, any> = {
        id: userData.id,
        email: userData.email,
        receiveUpdates: userData.receiveUpdates,
        timestamp: userData.timestamp
      }
      
      const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${TOKEN_EXPIRY_HOURS}h`)
        .sign(JWT_SECRET)
      
      return jwt
    } catch (error) {
      console.error('Error creating JWT token:', error)
      throw new Error('Failed to create authentication token')
    }
  }

  // Verify and decode JWT token
  const verifyToken = async (token: string): Promise<UserData | null> => {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Validate payload has required fields
      if (payload.id && payload.email && typeof payload.receiveUpdates === 'boolean' && payload.timestamp) {
        return {
          id: payload.id as string,
          email: payload.email as string,
          receiveUpdates: payload.receiveUpdates as boolean,
          timestamp: payload.timestamp as string
        }
      }
      
      return null
    } catch (error) {
      console.error('Invalid token:', error)
      return null
    }
  }

  // Helper function to get registered users from localStorage
  const getRegisteredUsers = (): StoredUser[] => {
    if (!process.client) return []
    
    try {
      const storedUsers = localStorage.getItem('registeredUsers')
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers)
        // Handle migration from old array format to new object format
        if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
          return [] // Clear old format, users will need to re-register
        }
        return parsed as StoredUser[]
      }
    } catch (error) {
      console.warn('Could not load stored users:', error)
    }
    return []
  }

  // Helper function to save registered users to localStorage
  const saveRegisteredUsers = (users: StoredUser[]): void => {
    if (!process.client) return
    
    try {
      localStorage.setItem('registeredUsers', JSON.stringify(users))
    } catch (error) {
      console.warn('Could not save registered users:', error)
    }
  }

  // Check if user exists and return user data
  const findRegisteredUser = (email: string): StoredUser | null => {
    const users = getRegisteredUsers()
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
  }

  // Remove user from registered users (for clear account data)
  const removeRegisteredUser = (email: string): void => {
    if (!process.client) return
    
    const users = getRegisteredUsers()
    const filteredUsers = users.filter(user => user.email.toLowerCase() !== email.toLowerCase())
    saveRegisteredUsers(filteredUsers)
  }

  // Sign in existing user
  const signIn = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    state.loading = true
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const registeredUser = findRegisteredUser(email)
      
      if (!registeredUser) {
        return { success: false, error: 'No account found with this email address.' }
      }
      
      // Verify password using encryption utility
      const { verifyPassword } = useEncryption()
      if (!verifyPassword(password, registeredUser.encryptedPassword)) {
        return { success: false, error: 'Incorrect password. Please try again or request a password reset.' }
      }
      
      const userData: UserData = {
        id: crypto.randomUUID(),
        email: registeredUser.email,
        receiveUpdates: registeredUser.receiveUpdates,
        timestamp: registeredUser.timestamp
      }

      const token = await createToken(userData)
      
      // Store token securely (in production, use httpOnly cookies)
      if (process.client) {
        localStorage.setItem(TOKEN_KEY, token)
      }

      state.user = userData
      state.token = token
      state.isAuthenticated = true
      
      return { success: true }
    } catch (error) {
      console.error('Sign in failed:', error)
      return { success: false, error: 'Sign in failed. Please try again.' }
    } finally {
      state.loading = false
    }
  }

  // Register new user
  const register = async (formData: SignupForm): Promise<{ success: boolean, error?: string }> => {
    state.loading = true
    
    try {
      // Check if user already exists
      const existingUser = findRegisteredUser(formData.email)
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists.' }
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Encrypt password and store user
      const { encrypt } = useEncryption()
      const newUser: StoredUser = {
        email: formData.email.toLowerCase(),
        encryptedPassword: encrypt(formData.password),
        receiveUpdates: formData.receiveUpdates,
        timestamp: new Date().toISOString()
      }
      
      // Save to localStorage
      const users = getRegisteredUsers()
      users.push(newUser)
      saveRegisteredUsers(users)
      
      // Create user session
      const userData: UserData = {
        id: crypto.randomUUID(),
        email: formData.email,
        receiveUpdates: formData.receiveUpdates,
        timestamp: newUser.timestamp
      }

      const token = await createToken(userData)
      
      if (process.client) {
        localStorage.setItem(TOKEN_KEY, token)
      }

      state.user = userData
      state.token = token
      state.isAuthenticated = true
      
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    } finally {
      state.loading = false
    }
  }

  // Login with signup form data (simulated) - kept for backward compatibility
  const login = async (formData: SignupForm): Promise<void> => {
    const result = await register(formData)
    if (!result.success) {
      throw new Error(result.error || 'Login failed')
    }
  }

  // Logout user
  const logout = async (): Promise<void> => {
    state.loading = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (process.client) {
        localStorage.removeItem(TOKEN_KEY)
        // Also clear any legacy session storage
        sessionStorage.removeItem('signupCompleted')
        sessionStorage.removeItem('signupData')
      }

      state.user = null
      state.token = null
      state.isAuthenticated = false
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    } finally {
      state.loading = false
    }
  }

  // Clear account data - removes user from registered users and logs out
  const clearAccountData = async (): Promise<void> => {
    if (state.user) {
      // Remove user from registered users
      removeRegisteredUser(state.user.email)
    }
    
    // Then logout
    await logout()
  }

  // Update user preferences
  const updatePreferences = async (receiveUpdates: boolean): Promise<void> => {
    if (!state.user) {
      throw new Error('No authenticated user')
    }

    state.loading = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const updatedUser: UserData = {
        ...state.user,
        receiveUpdates,
        timestamp: new Date().toISOString()
      }

      const token = await createToken(updatedUser)
      
      if (process.client) {
        localStorage.setItem(TOKEN_KEY, token)
      }

      state.user = updatedUser
      state.token = token
    } catch (error) {
      console.error('Update preferences failed:', error)
      throw error
    } finally {
      state.loading = false
    }
  }

  // Initialize auth state from stored token
  const initializeAuth = async (): Promise<void> => {
    if (!process.client) return

    state.loading = true
    
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      
      if (!storedToken) {
        // Check for legacy session storage and migrate
        const legacyCompleted = sessionStorage.getItem('signupCompleted')
        const legacyData = sessionStorage.getItem('signupData')
        
        if (legacyCompleted && legacyData) {
          try {
            const userData = JSON.parse(legacyData)
            const migratedUser: UserData = {
              id: crypto.randomUUID(),
              email: userData.email,
              receiveUpdates: userData.receiveUpdates || false,
              timestamp: userData.timestamp || new Date().toISOString()
            }
            
            const token = await createToken(migratedUser)
            localStorage.setItem(TOKEN_KEY, token)
            
            // Clean up legacy storage
            sessionStorage.removeItem('signupCompleted')
            sessionStorage.removeItem('signupData')
            
            state.user = migratedUser
            state.token = token
            state.isAuthenticated = true
            
            return
          } catch (error) {
            console.error('Failed to migrate legacy auth:', error)
          }
        }
        
        state.isAuthenticated = false
        return
      }

      const userData = await verifyToken(storedToken)
      
      if (userData) {
        state.user = userData
        state.token = storedToken
        state.isAuthenticated = true
      } else {
        // Invalid token, clear it
        localStorage.removeItem(TOKEN_KEY)
        state.isAuthenticated = false
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      localStorage.removeItem(TOKEN_KEY)
      state.isAuthenticated = false
    } finally {
      state.loading = false
    }
  }

  // Check if token is about to expire (within 1 hour)
  const isTokenExpiring = (): boolean => {
    if (!state.token) return false
    
    try {
      const payload = JSON.parse(atob(state.token.split('.')[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      
      return exp - now < oneHour
    } catch {
      return true // If we can't parse, assume it's expiring
    }
  }

  // Refresh token if needed
  const refreshTokenIfNeeded = async (): Promise<void> => {
    if (state.isAuthenticated && state.user && isTokenExpiring()) {
      try {
        const newToken = await createToken(state.user)
        
        if (process.client) {
          localStorage.setItem(TOKEN_KEY, newToken)
        }
        
        state.token = newToken
      } catch (error) {
        console.error('Token refresh failed:', error)
        await logout()
      }
    }
  }

  return {
    // State
    ...toRefs(state),
    
    // Methods
    login,
    signIn,
    register,
    logout,
    clearAccountData,
    updatePreferences,
    initializeAuth,
    refreshTokenIfNeeded,
    findRegisteredUser,
    
    // Computed
    user: computed(() => state.user),
    isAuthenticated: computed(() => state.isAuthenticated),
    loading: computed(() => state.loading)
  }
}