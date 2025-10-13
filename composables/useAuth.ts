// composables/useAuth.ts
import { SignJWT, jwtVerify } from 'jose'
import type { SignupForm } from '~/types'

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

  // Login with signup form data (simulated)
  const login = async (formData: SignupForm): Promise<void> => {
    state.loading = true
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: UserData = {
        id: crypto.randomUUID(),
        email: formData.email,
        receiveUpdates: formData.receiveUpdates,
        timestamp: new Date().toISOString()
      }

      const token = await createToken(userData)
      
      // Store token securely (in production, use httpOnly cookies)
      if (process.client) {
        localStorage.setItem(TOKEN_KEY, token)
      }

      state.user = userData
      state.token = token
      state.isAuthenticated = true
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      state.loading = false
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
    logout,
    updatePreferences,
    initializeAuth,
    refreshTokenIfNeeded,
    
    // Computed
    user: computed(() => state.user),
    isAuthenticated: computed(() => state.isAuthenticated),
    loading: computed(() => state.loading)
  }
}