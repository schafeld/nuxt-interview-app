// composables/useValidation.ts
import { z } from 'zod'
import { 
  signupFormSchema, 
  passwordSchema, 
  emailSchema,
  validateSignupForm,
  type ValidationResult,
  type SignupFormData 
} from '~/types/validation'

export const useValidation = () => {
  // Validate individual email field
  const validateEmail = (email: string): string[] => {
    try {
      emailSchema.parse(email)
      return []
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map(issue => issue.message)
      }
      return ['Email validation failed']
    }
  }

  // Validate individual password field
  const validatePassword = (password: string): string[] => {
    try {
      passwordSchema.parse(password)
      return []
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map(issue => issue.message)
      }
      return ['Password validation failed']
    }
  }

  // Get password strength analysis
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      specialChars: (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= 2
    }

    const score = Object.values(checks).filter(Boolean).length
    const maxScore = Object.keys(checks).length

    return {
      checks,
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : score === maxScore ? 'strong' : 'good'
    }
  }

  // Validate entire form
  const validateForm = (formData: unknown): ValidationResult => {
    return validateSignupForm(formData)
  }

  // Get specific field error from validation result
  const getFieldError = (validationResult: ValidationResult, fieldName: string): string | null => {
    const fieldError = validationResult.errors.find(error => error.field === fieldName)
    return fieldError?.message || null
  }

  // Validate form field by field for real-time validation
  const validateFormField = (fieldName: keyof SignupFormData, value: any, formData?: Partial<SignupFormData>) => {
    const testData = { ...formData, [fieldName]: value }
    
    try {
      // Validate just this field using partial schema
      const fieldSchema = signupFormSchema.pick({ [fieldName]: true })
      fieldSchema.parse(testData)
      return []
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues
          .filter(issue => issue.path.includes(fieldName))
          .map(issue => issue.message)
      }
      return [`${fieldName} validation failed`]
    }
  }

  // Create a reactive validation state
  const createValidationState = () => {
    const validationState = reactive({
      errors: {} as Record<string, string[]>,
      isValid: false,
      isValidating: false,
      touched: {} as Record<string, boolean>
    })

    const setFieldTouched = (fieldName: string, touched = true) => {
      validationState.touched[fieldName] = touched
    }

    const setFieldError = (fieldName: string, errors: string[]) => {
      validationState.errors[fieldName] = errors
      updateValidState()
    }

    const clearFieldError = (fieldName: string) => {
      delete validationState.errors[fieldName]
      updateValidState()
    }

    const updateValidState = () => {
      const hasErrors = Object.values(validationState.errors).some(errors => errors.length > 0)
      validationState.isValid = !hasErrors
    }

    const validateField = async (fieldName: keyof SignupFormData, value: any, formData?: Partial<SignupFormData>) => {
      validationState.isValidating = true
      setFieldTouched(fieldName)
      
      try {
        const errors = validateFormField(fieldName, value, formData)
        setFieldError(fieldName, errors)
      } catch (error) {
        setFieldError(fieldName, ['Validation error occurred'])
      } finally {
        validationState.isValidating = false
      }
    }

    const validateAllFields = async (formData: SignupFormData) => {
      validationState.isValidating = true
      
      try {
        const result = validateForm(formData)
        
        // Clear existing errors
        validationState.errors = {}
        
        // Set new errors
        result.errors.forEach(error => {
          if (!validationState.errors[error.field]) {
            validationState.errors[error.field] = []
          }
          validationState.errors[error.field].push(error.message)
        })
        
        // Mark all fields as touched
        Object.keys(formData).forEach(key => {
          validationState.touched[key] = true
        })
        
        updateValidState()
        return result.success
      } finally {
        validationState.isValidating = false
      }
    }

    const resetValidation = () => {
      validationState.errors = {}
      validationState.isValid = false
      validationState.touched = {}
      validationState.isValidating = false
    }

    return {
      ...toRefs(validationState),
      setFieldTouched,
      validateField,
      validateAllFields,
      resetValidation,
      getFieldErrors: (fieldName: string) => validationState.errors[fieldName] || [],
      isFieldTouched: (fieldName: string) => validationState.touched[fieldName] || false
    }
  }

  return {
    validateEmail,
    validatePassword,
    validateForm,
    validateFormField,
    getFieldError,
    getPasswordStrength,
    createValidationState
  }
}