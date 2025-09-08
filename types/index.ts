// types/index.ts
export interface SignupForm {
  email: string
  password: string
  receiveUpdates: boolean
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