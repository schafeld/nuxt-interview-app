<!-- pages/index.vue -->
<template>
  <div class="signup-container">
    <nord-card class="signup-card" padding="none">
      <header class="card-header">
        <div class="card-title">
          <h1 id="signup-title">
            <nord-icon name="interface-love-heart-medical" size="m" class="title-icon" aria-hidden="true"></nord-icon>
            Sign Up for Our Veterinary Product
          </h1>
        </div>
        <div class="card-subtitle">
          <p>Join our platform to access professional veterinary tools and resources</p>
        </div>
      </header>
      
      <form @submit.prevent="handleSubmit" class="signup-form" aria-labelledby="signup-title" novalidate>
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
            :aria-describedby="getFieldError('email') ? 'email-error' : undefined"
            :aria-invalid="getFieldError('email') ? 'true' : 'false'"
          >
            <nord-icon slot="start" name="interface-email" size="s" aria-hidden="true"></nord-icon>
          </nord-input>
          <div v-if="getFieldError('email')" id="email-error" class="error-message" role="alert">
            {{ getFieldError('email') }}
          </div>
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
            :aria-describedby="form.password ? 'password-requirements' : (getFieldError('password') ? 'password-error' : undefined)"
            :aria-invalid="getFieldError('password') ? 'true' : 'false'"
          >
            <nord-icon slot="start" name="interface-lock" size="s" aria-hidden="true"></nord-icon>
            <nord-button
              slot="end"
              variant="plain"
              size="s"
              @click="togglePasswordVisibility"
              type="button"
              :aria-pressed="showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :title="showPassword ? 'Hide password' : 'Show password'"
              class="password-toggle"
              ref="passwordToggleButton"
            >
              <nord-icon :name="showPassword ? 'interface-edit-on' : 'interface-edit-off'" size="s"></nord-icon>
              <span class="visually-hidden">{{ showPassword ? 'Hide password' : 'Show password' }}</span>
            </nord-button>
          </nord-input>
        </div>
        
        <!-- Password Requirements -->
        <div v-if="form.password" class="password-requirements">
          <nord-banner variant="info" class="requirements-banner" role="region" aria-labelledby="password-requirements-title">
            <div id="password-requirements" class="requirements-content">
              <div class="requirements-title">
                <h2 id="password-requirements-title">
                  <nord-icon name="interface-security-shield-check" size="s" aria-hidden="true"></nord-icon>
                  Password Requirements:
                </h2>
              </div>
              <ul class="requirements-list" role="list">
                <li :class="{ valid: passwordChecks.length }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.length ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.length ? 'icon-valid' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.length ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least {{ passwordConfig.minLength }} characters
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.uppercase }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.uppercase ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.uppercase ? 'icon-valid' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.uppercase ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least one uppercase letter
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.lowercase }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.lowercase ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.lowercase ? 'icon-valid' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.lowercase ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least one lowercase letter
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.numbers }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.numbers ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.numbers ? 'icon-valid' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.numbers ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least one number
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.specialChars }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.specialChars ? 'interface-tick-circle' : 'interface-dot'" 
                    size="xs"
                    :class="passwordChecks.specialChars ? 'icon-valid' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.specialChars ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least {{ passwordConfig.minSpecialChars }} special characters
                  </span>
                </li>
              </ul>
            </div>
          </nord-banner>
        </div>
        
        <!-- Updates Checkbox -->
        <fieldset class="form-field">
          <nord-checkbox
            :checked="form.receiveUpdates"
            @change="updateReceiveUpdates"
            label="I would like to receive occasional product updates and announcements about new features."
            class="updates-checkbox"
            aria-describedby="updates-description"
          >
            <!-- <nord-icon name="interface-email-action-send" size="s" slot="icon" aria-hidden="true"></nord-icon> -->
          </nord-checkbox>
          <div id="updates-description" class="visually-hidden">
            Optional: Check this box to receive product updates and announcements via email
          </div>
        </fieldset>
        
        <!-- Submit Button -->
        <nord-button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
          :aria-describedby="!isFormValid ? 'form-validation-status' : undefined"
          size="l"
          class="submit-button"
        >
          <nord-icon name="user-add" size="s" slot="start"></nord-icon>
          {{ isSubmitting ? 'Creating Account...' : 'Sign Up' }}
        </nord-button>
        
        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="error-messages">
          <nord-banner variant="danger" class="error-banner">
            <div class="error-content">
              <div class="error-title">
                <nord-icon name="interface-alert-triangle" size="s"></nord-icon>
                Please fix the following errors:
              </div>
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
const passwordToggleButton = ref<HTMLElement | null>(null)

// Composables
const { validateForm } = useFormValidation()
const config = useRuntimeConfig()
const passwordConfig = config.public.passwordConfig

// Update password toggle accessibility when showPassword changes
watch(showPassword, (newValue) => {
  nextTick(() => {
    if (passwordToggleButton.value) {
      const innerButton = passwordToggleButton.value.querySelector('button')
      if (innerButton) {
        innerButton.setAttribute('aria-label', newValue ? 'Hide password' : 'Show password')
      }
    }
  })
}, { immediate: true })

// Ensure accessibility is set on mount
onMounted(() => {
  if (passwordToggleButton.value) {
    const innerButton = passwordToggleButton.value.querySelector('button')
    if (innerButton) {
      innerButton.setAttribute('aria-label', showPassword.value ? 'Hide password' : 'Show password')
    }
  }
})

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
  border-top-left-radius: var(--n-border-radius);
  border-top-right-radius: var(--n-border-radius);
}

.card-title h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--n-space-s);
  margin: 0;
  font-size: var(--n-font-size-l);
  font-weight: var(--n-font-weight-active);
  color: var(--n-color-text);
}

.card-subtitle p {
  margin: 0;
  line-height: 1.5;
  font-size: var(--n-font-size-m);
  color: var(--n-color-text-weak);
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
  background: transparent;
  border: none;
  padding: var(--n-space-xs);
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

.card-title {
  margin-bottom: var(--n-space-s);
}

.title-icon {
  color: var(--n-color-status-info);
}

.requirements-title h2 {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-weight: var(--n-font-weight-active);
  margin: 0;
  font-size: var(--n-font-size-s);
  color: var(--n-color-text);
}

.error-title {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-weight: var(--n-font-weight-active);
  margin: 0;
  color: var(--n-color-status-danger);
  font-size: var(--n-font-size-s);
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

fieldset {
  border: none;
  padding: 0;
  margin: 0;
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

/* Accessibility helpers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.error-message {
  font-size: var(--n-font-size-s);
  color: var(--n-color-status-danger);
  margin-top: var(--n-space-xs);
}

/* Focus styles for better accessibility */
.password-toggle:focus-visible {
  outline: 2px solid var(--n-color-border-focus);
  outline-offset: 2px;
}

/* Password requirements accessibility improvements */
.requirements-list li.valid span {
  color: #0f5d1a; /* Darker green for better contrast on blue background */
  font-weight: var(--n-font-weight-active);
}

.requirements-list li .icon-valid {
  color: #0f5d1a; /* Match the text color */
}

.requirements-list li:not(.valid) span {
  color: var(--n-color-text);
}

.requirements-list li .icon-pending {
  color: var(--n-color-text-weak);
}
</style>