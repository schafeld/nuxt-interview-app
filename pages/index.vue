<!-- pages/index.vue -->
<template>
  <div class="signup-container">
    <nord-card class="signup-card">
      <div class="card-header">
        <nord-text variant="heading-l" class="card-title">
          <nord-icon name="interface-love-heart-medical" size="m" class="title-icon"></nord-icon>
          Sign Up for Our Veterinary Product
        </nord-text>
        <nord-text variant="body-m" color="weak" class="card-subtitle">
          Join our platform to access professional veterinary tools and resources
        </nord-text>
      </div>
      
      <form @submit.prevent="handleSubmit" class="signup-form">
        <!-- Email Field -->
        <div class="form-field">
          <nord-input
            type="email"
            :value="form.email"
            @input="updateEmail"
            :error="getFieldError('email')"
            label="Email Address"
            placeholder="Enter your email address"
            required
            class="email-input"
          >
            <nord-icon slot="start" name="interface-email" size="s"></nord-icon>
          </nord-input>
        </div>
        
        <!-- Password Field -->
        <div class="form-field">
          <nord-input
            :type="showPassword ? 'text' : 'password'"
            :value="form.password"
            @input="updatePassword"
            :error="getFieldError('password')"
            label="Password"
            placeholder="Enter a secure password"
            required
            class="password-input"
          >
            <nord-icon slot="start" name="interface-lock" size="s"></nord-icon>
            <nord-button
              slot="end"
              variant="plain"
              size="s"
              @click="togglePasswordVisibility"
              type="button"
              class="password-toggle"
            >
              <nord-icon :name="showPassword ? 'interface-view-hide' : 'interface-view-show'" size="s"></nord-icon>
            </nord-button>
          </nord-input>
        </div>
        
        <!-- Password Requirements -->
        <div v-if="form.password" class="password-requirements">
          <nord-banner variant="info" class="requirements-banner">
            <div class="requirements-content">
              <nord-text variant="body-s" color="default" class="requirements-title">
                <nord-icon name="interface-security-shield-check" size="s"></nord-icon>
                Password Requirements:
              </nord-text>
              <ul class="requirements-list">
                <li :class="{ valid: passwordChecks.length }">
                  <nord-icon 
                    :name="passwordChecks.length ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.length ? 'icon-valid' : 'icon-pending'"
                  ></nord-icon>
                  At least {{ passwordConfig.minLength }} characters
                </li>
                <li :class="{ valid: passwordChecks.uppercase }">
                  <nord-icon 
                    :name="passwordChecks.uppercase ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.uppercase ? 'icon-valid' : 'icon-pending'"
                  ></nord-icon>
                  At least one uppercase letter
                </li>
                <li :class="{ valid: passwordChecks.lowercase }">
                  <nord-icon 
                    :name="passwordChecks.lowercase ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.lowercase ? 'icon-valid' : 'icon-pending'"
                  ></nord-icon>
                  At least one lowercase letter
                </li>
                <li :class="{ valid: passwordChecks.numbers }">
                  <nord-icon 
                    :name="passwordChecks.numbers ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.numbers ? 'icon-valid' : 'icon-pending'"
                  ></nord-icon>
                  At least one number
                </li>
                <li :class="{ valid: passwordChecks.specialChars }">
                  <nord-icon 
                    :name="passwordChecks.specialChars ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.specialChars ? 'icon-valid' : 'icon-pending'"
                  ></nord-icon>
                  At least {{ passwordConfig.minSpecialChars }} special characters
                </li>
              </ul>
            </div>
          </nord-banner>
        </div>
        
        <!-- Updates Checkbox -->
        <div class="form-field">
          <nord-checkbox
            :checked="form.receiveUpdates"
            @change="updateReceiveUpdates"
            label="I would like to receive occasional product updates and announcements"
            class="updates-checkbox"
          >
            <nord-icon name="interface-email-action-send" size="s" slot="icon"></nord-icon>
          </nord-checkbox>
        </div>
        
        <!-- Submit Button -->
        <nord-button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
          size="l"
          class="submit-button"
        >
          <nord-icon name="interface-user-add" size="s" slot="start"></nord-icon>
          {{ isSubmitting ? 'Creating Account...' : 'Sign Up' }}
        </nord-button>
        
        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="error-messages">
          <nord-banner variant="danger" class="error-banner">
            <div class="error-content">
              <nord-text variant="body-s" class="error-title">
                <nord-icon name="interface-alert-triangle" size="s"></nord-icon>
                Please fix the following errors:
              </nord-text>
              <ul class="error-list">
                <li v-for="error in errors" :key="`${error.field}-${error.message}`">
                  <nord-icon name="interface-dot" size="xs"></nord-icon>
                  {{ error.message }}
                </li>
              </ul>
            </div>
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
  padding: var(--n-space-m);
  background: linear-gradient(135deg, var(--n-color-surface-raised) 0%, var(--n-color-surface) 100%);
}

.signup-card {
  width: 100%;
  max-width: 520px;
  box-shadow: var(--n-box-shadow-l);
}

.card-header {
  padding: var(--n-space-l);
  text-align: center;
  border-bottom: 1px solid var(--n-color-border);
  background: var(--n-color-surface-raised);
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--n-space-s);
  margin-bottom: var(--n-space-s);
}

.title-icon {
  color: var(--n-color-status-info);
}

.card-subtitle {
  margin: 0;
  line-height: 1.5;
}

.signup-form {
  padding: var(--n-space-l);
  display: flex;
  flex-direction: column;
  gap: var(--n-space-l);
}

.form-field {
  display: flex;
  flex-direction: column;
}

.email-input,
.password-input {
  width: 100%;
}

.password-toggle {
  background: transparent !important;
  border: none !important;
  padding: var(--n-space-xs) !important;
}

.password-requirements {
  margin-top: calc(-1 * var(--n-space-s));
}

.requirements-banner {
  background: var(--n-color-status-info-background);
  border-color: var(--n-color-status-info);
}

.requirements-content {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
}

.requirements-title {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-weight: var(--n-font-weight-active);
  margin: 0;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--n-space-xs);
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-size: var(--n-font-size-s);
  color: var(--n-color-text-weak);
  transition: color 0.2s ease;
}

.requirements-list li.valid {
  color: var(--n-color-status-success);
}

.icon-valid {
  color: var(--n-color-status-success);
}

.icon-pending {
  color: var(--n-color-text-weaker);
}

.updates-checkbox {
  padding: var(--n-space-s);
  background: var(--n-color-surface-raised);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-color-border);
}

.submit-button {
  margin-top: var(--n-space-s);
  width: 100%;
  justify-content: center;
}

.error-messages {
  margin-top: calc(-1 * var(--n-space-s));
}

.error-banner {
  background: var(--n-color-status-danger-background);
  border-color: var(--n-color-status-danger);
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
}

.error-title {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-weight: var(--n-font-weight-active);
  margin: 0;
  color: var(--n-color-status-danger);
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--n-space-xs);
}

.error-list li {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-size: var(--n-font-size-s);
  color: var(--n-color-status-danger);
}

@media (max-width: 768px) {
  .signup-container {
    padding: var(--n-space-s);
    align-items: flex-start;
    padding-top: var(--n-space-xl);
  }
  
  .signup-card {
    max-width: 100%;
  }
  
  .card-header,
  .signup-form {
    padding: var(--n-space-m);
  }
  
  .card-title {
    flex-direction: column;
    gap: var(--n-space-xs);
  }
}

@media (max-width: 480px) {
  .requirements-list {
    font-size: var(--n-font-size-xs);
  }
  
  .card-subtitle {
    font-size: var(--n-font-size-s);
  }
}
</style>