<!-- pages/index.vue -->
<template>
  <div class="signup-container">
    <nord-card class="signup-card">
      <h1 slot="header">Sign Up for Our Veterinary Product</h1>
      
      <form @submit.prevent="handleSubmit" class="signup-form">
        <!-- Email Field -->
        <nord-input
          :value="form.email"
          @input="updateEmail"
          label="Email Address"
          type="email"
          required
          :error="getFieldError('email')"
          placeholder="Enter your email address"
        />
        
        <!-- Password Field -->
        <div class="password-field">
          <nord-input
            :value="form.password"
            @input="updatePassword"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            required
            :error="getFieldError('password')"
            placeholder="Enter a secure password"
          />
          <nord-button
            type="button"
            variant="plain"
            size="s"
            @click="togglePasswordVisibility"
            class="password-toggle"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </nord-button>
        </div>
        
        <!-- Password Requirements -->
        <div v-if="form.password" class="password-requirements">
          <nord-banner variant="info" size="s">
            <h4>Password Requirements:</h4>
            <ul>
              <li :class="{ valid: passwordChecks.length }">
                At least {{ passwordConfig.minLength }} characters
              </li>
              <li :class="{ valid: passwordChecks.uppercase }">
                At least one uppercase letter
              </li>
              <li :class="{ valid: passwordChecks.lowercase }">
                At least one lowercase letter
              </li>
              <li :class="{ valid: passwordChecks.numbers }">
                At least one number
              </li>
              <li :class="{ valid: passwordChecks.specialChars }">
                At least {{ passwordConfig.minSpecialChars }} special characters
              </li>
            </ul>
          </nord-banner>
        </div>
        
        <!-- Updates Checkbox -->
        <nord-checkbox
          :checked="form.receiveUpdates"
          @change="updateReceiveUpdates"
          label="I would like to receive occasional product updates and announcements"
        />
        
        <!-- Submit Button -->
        <nord-button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="submit-button"
        >
          {{ isSubmitting ? 'Creating Account...' : 'Sign Up' }}
        </nord-button>
        
        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="error-messages">
          <nord-banner variant="danger">
            <h4>Please fix the following errors:</h4>
            <ul>
              <li v-for="error in errors" :key="`${error.field}-${error.message}`">
                {{ error.message }}
              </li>
            </ul>
          </nord-banner>
        </div>
      </form>
    </nord-card>
  </div>
</template>

<script setup lang="ts">
import type { SignupForm, ValidationError } from '~/types'

// Meta
definePageMeta({
  title: 'Sign Up - Veterinary Product'
})

// Reactive state
const form = reactive<SignupForm>({
  email: '',
  password: '',
  receiveUpdates: false
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errors = ref<ValidationError[]>([])

// Composables
const { validateForm } = useFormValidation()
const config = useRuntimeConfig()
const passwordConfig = config.public.passwordConfig

// Computed
const passwordChecks = computed(() => {
  const password = form.password
  return {
    length: password.length >= passwordConfig.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    specialChars: (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length >= passwordConfig.minSpecialChars
  }
})

const isFormValid = computed(() => {
  return form.email && 
         form.password && 
         Object.values(passwordChecks.value).every(check => check)
})

// Methods
const updateEmail = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.email = target.value
  clearFieldErrors('email')
}

const updatePassword = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.password = target.value
  clearFieldErrors('password')
}

const updateReceiveUpdates = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.receiveUpdates = target.checked
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const getFieldError = (fieldName: string): string => {
  const fieldError = errors.value.find(error => error.field === fieldName)
  return fieldError ? fieldError.message : ''
}

const clearFieldErrors = (fieldName: string) => {
  errors.value = errors.value.filter(error => error.field !== fieldName)
}

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = []
  
  try {
    // Validate form
    const validationErrors = validateForm(form)
    
    if (validationErrors.length > 0) {
      errors.value = validationErrors
      return
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Store signup completion in session storage
    if (process.client) {
      sessionStorage.setItem('signupCompleted', 'true')
      sessionStorage.setItem('signupData', JSON.stringify({
        email: form.email,
        receiveUpdates: form.receiveUpdates,
        timestamp: new Date().toISOString()
      }))
    }
    
    // Navigate to success page
    await navigateTo('/success')
    
  } catch (error) {
    errors.value = [{ field: 'general', message: 'An error occurred. Please try again.' }]
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: var(--n-color-surface-raised);
}

.signup-card {
  width: 100%;
  max-width: 500px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 2.5rem;
}

.password-requirements ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.password-requirements li {
  color: var(--n-color-text-weak);
}

.password-requirements li.valid {
  color: var(--n-color-status-success);
}

.submit-button {
  margin-top: 1rem;
}

.error-messages {
  margin-top: 1rem;
}

.error-messages ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}
</style>