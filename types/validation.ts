// types/validation.ts
import { z } from 'zod'

// Password validation schema
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least 2 special characters')
  .refine(
    (val) => (val.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= 2,
    'Password must contain at least 2 special characters'
  )

// Email validation schema
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Signup form validation schema
export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  receiveUpdates: z.boolean()
})

// User data schema
export const userDataSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  receiveUpdates: z.boolean(),
  timestamp: z.string().datetime()
})

// Preferences update schema
export const preferencesUpdateSchema = z.object({
  receiveUpdates: z.boolean()
})

// Password config schema
export const passwordConfigSchema = z.object({
  minLength: z.number().min(8).max(128),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  minSpecialChars: z.number().min(0).max(10)
})

// API response schemas
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional()
})

export const apiSuccessSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional()
})

// Form validation result schema
export const validationResultSchema = z.object({
  success: z.boolean(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string()
  }))
})

// Type exports from schemas
export type SignupFormData = z.infer<typeof signupFormSchema>
export type UserData = z.infer<typeof userDataSchema>
export type PreferencesUpdate = z.infer<typeof preferencesUpdateSchema>
export type PasswordConfig = z.infer<typeof passwordConfigSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
export type ApiSuccess = z.infer<typeof apiSuccessSchema>
export type ValidationResult = z.infer<typeof validationResultSchema>

// Validation helper functions
export const validateSignupForm = (data: unknown): ValidationResult => {
  try {
    signupFormSchema.parse(data)
    return { success: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }]
    }
  }
}

export const validateUserData = (data: unknown): UserData | null => {
  try {
    return userDataSchema.parse(data)
  } catch {
    return null
  }
}

export const validatePasswordConfig = (data: unknown): PasswordConfig | null => {
  try {
    return passwordConfigSchema.parse(data)
  } catch {
    return null
  }
}