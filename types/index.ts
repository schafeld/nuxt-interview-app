// types/index.ts
export interface SignupForm {
  email: string
  password: string
  receiveUpdates: boolean
}

export interface StoredUser {
  email: string
  encryptedPassword: string
  receiveUpdates: boolean
  timestamp: string
}

export interface PasswordConfig {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  minSpecialChars: number
}

export interface ValidationError {
  field: string
  message: string
}