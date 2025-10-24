<!-- pages/index.vue -->
<template>
  <div class="signup-container">
    <nord-card class="signup-card" padding="none">
      <header class="card-header">
        <div class="card-title">
          <h1 id="signup-title">
            Sign Up for Our Veterinary Product
          </h1>
        </div>
        <div class="card-subtitle">
          <p>Join our platform to access professional veterinary tools and resources</p>
          <p>If you already have an account, log in with your credentials.</p>
        </div>
      </header>
      
      <form @submit.prevent="handleSubmit" class="signup-form" aria-labelledby="signup-title" novalidate>
        <!-- Email Field -->
        <div class="form-field">
          <nord-input
            inputId="email-input"
            type="email"
            :value="form.email"
            @input="updateEmail"
            @blur="handleEmailBlur"
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
        </div>
        
        <!-- Password Field -->
        <div class="form-field">
          <nord-input
            inputId="password-input"
            :type="showPassword ? 'text' : 'password'"
            :value="form.password"
            @input="updatePassword"
            @blur="handlePasswordBlur"
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
              @click="togglePasswordVisibility"
              type="button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :title="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword ? 'true' : 'false'"
              class="password-toggle"
              ref="passwordToggleButton"
              square
            >
              <nord-icon name="interface-edit-on" size="s"></nord-icon>
              <nord-icon name="interface-edit-off" size="s"></nord-icon>
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
                  Password Requirements:
                </h2>
              </div>
              <ul class="requirements-list" role="list">
                <li :class="{ valid: passwordChecks.length }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.length ? 'interface-checked' : 'interface-close'" 
                    size="xs"
                    :class="passwordChecks.length ? 'icon-valid checkmark' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.length ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least {{ passwordConfig.minLength }} characters
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.uppercase }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.uppercase ? 'interface-checked' : 'interface-close'" 
                    size="xs"
                    :class="passwordChecks.uppercase ? 'icon-valid checkmark' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.uppercase ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least one uppercase letter
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.lowercase }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.lowercase ? 'interface-checked' : 'interface-close'" 
                    size="xs"
                    :class="passwordChecks.lowercase ? 'icon-valid checkmark' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.lowercase ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least one lowercase letter
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.numbers }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.numbers ? 'interface-checked' : 'interface-close'" 
                    size="xs"
                    :class="passwordChecks.numbers ? 'icon-valid checkmark' : 'icon-pending'"
                    aria-hidden="true"
                  ></nord-icon>
                  <span>
                    <span class="visually-hidden">{{ passwordChecks.numbers ? 'Requirement met: ' : 'Requirement not met: ' }}</span>
                    At least one number
                  </span>
                </li>
                <li :class="{ valid: passwordChecks.specialChars }" role="listitem">
                  <nord-icon 
                    :name="passwordChecks.specialChars ? 'interface-checked' : 'interface-close'" 
                    size="xs"
                    :class="passwordChecks.specialChars ? 'icon-valid checkmark' : 'icon-pending'"
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
            inputId="updates-checkbox"
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
          :disabled="!isFormValid || isSubmitting || !form.email || !form.password"
          :loading="isSubmitting"
          :aria-describedby="!isFormValid ? 'form-validation-status' : undefined"
          size="l"
          class="submit-button"
        >
          <nord-icon name="user-add" size="s" slot="start"></nord-icon>
          {{ isSubmitting ? 'Processing...' : 'Sign Up' }}
        </nord-button>

        <p>
          Have you forgotten your password? <a href="#" @click.prevent="resetPassword" role="button" class="reset-password-link">Reset password</a>
        </p>

        
        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="error-messages" role="alert" aria-live="assertive">
          <nord-banner variant="danger" class="error-banner">
            <div class="error-content">
              <div class="error-title">
                Please fix the following errors:
              </div>
              <ul class="error-list">
                <li v-for="error in errors" :key="`${error.field}-${error.message}`">
                  {{ error.message }}
                </li>
              </ul>
            </div>
          </nord-banner>
        </div>

      </form>
    </nord-card>

    <!-- Reset Password Modal -->
    <nord-modal
      v-if="showResetModal"
      @close="closeResetModal"
      :open="showResetModal"
      aria-labelledby="reset-modal-title"
      size="s"
    >
      <h2 slot="header" id="reset-modal-title">
        <nord-icon name="interface-email-action-send" size="s" aria-hidden="true"></nord-icon>
        Password Reset Email Sent
      </h2>
      
      <div class="reset-modal-content">
        <nord-banner variant="success" class="reset-success-banner">
          <div class="reset-success-content">
            <div class="reset-success-text">
              <p class="reset-success-title">Reset link sent successfully!</p>
              <p class="reset-success-description">
                We've sent a password reset link to <strong>{{ form.email }}</strong>. Please check your inbox and follow the instructions to reset your password.
              </p>
              <p class="reset-success-note">
                <strong>Note:</strong> The email may take a few minutes to arrive. Don't forget to check your spam folder if you don't see it in your inbox.
              </p>
            </div>
          </div>
        </nord-banner>
      </div>
      
      <div slot="footer" class="reset-modal-footer">
        <nord-button variant="primary" @click="closeResetModal">
          <nord-icon name="interface-checked" size="s" slot="start"></nord-icon>
          Got it
        </nord-button>
      </div>
    </nord-modal>
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
const emailTouched = ref(false)
const passwordTouched = ref(false)
const showResetModal = ref(false)

// Composables
const { validateForm, validateEmail } = useFormValidation()
const { signIn, register, findRegisteredUser } = useAuth()
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
  // For sign up, need all validation to pass
  return form.email && 
         form.password && 
         Object.values(passwordChecks.value).every(check => check)
})

// Methods
const updateEmail = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.email = target.value
  // Clear email errors when user is typing
  errors.value = errors.value.filter(error => error.field !== 'email')
}

const handleEmailBlur = () => {
  emailTouched.value = true
  
  // Always clear existing email errors first
  errors.value = errors.value.filter(error => error.field !== 'email')
  
  // Only validate if email has content (avoid "required" errors on blur)
  if (form.email && form.email.trim()) {
    const emailErrors = validateEmail(form.email)
    if (emailErrors.length > 0) {
      emailErrors.forEach(message => {
        errors.value.push({ field: 'email', message })
      })
    }
  }
}



const updatePassword = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.password = target.value
  clearFieldErrors('password')
}

const handlePasswordBlur = () => {
  passwordTouched.value = true
}

const updateReceiveUpdates = (event: Event) => {
  const target = event.target as HTMLInputElement
  form.receiveUpdates = target.checked
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const getFieldError = (fieldName: string): string => {
  // For password field, only show errors if field has been touched
  if (fieldName === 'password' && !passwordTouched.value) {
    return ''
  }
  
  const fieldError = errors.value.find(error => error.field === fieldName)
  return fieldError ? fieldError.message : ''
}

const clearFieldErrors = (fieldName: string) => {
  errors.value = errors.value.filter(error => error.field !== fieldName)
}

const resetPassword = () => {
  // Clear existing errors first
  errors.value = errors.value.filter(error => error.field !== 'email')
  
  // Check if email field is empty
  if (!form.email || !form.email.trim()) {
    errors.value.push({ field: 'email', message: 'Please enter an email address to reset your password.' })
    return
  }
  
  // Validate email format
  const emailErrors = validateEmail(form.email)
  if (emailErrors.length > 0) {
    emailErrors.forEach(message => {
      errors.value.push({ field: 'email', message })
    })
    return
  }
  
  // Email is valid, show the modal
  showResetModal.value = true
}

const closeResetModal = () => {
  showResetModal.value = false
}

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = []
  
  try {
    // Basic validation
    if (!form.email || !form.password) {
      errors.value = [{ field: 'general', message: 'Please fill in all required fields.' }]
      return
    }
    
    // Check if user already exists with this email
    const existingUser = findRegisteredUser(form.email)
    
    if (existingUser) {
      // User exists - try to sign them in with provided password
      const signInResult = await signIn(form.email, form.password)
      
      if (signInResult.success) {
        // Correct password - sign them in and go to success page
        await navigateTo('/success')
        return
      } else {
        // Wrong password - show error
        errors.value = [{ field: 'general', message: signInResult.error || 'Incorrect password for existing account.' }]
        return
      }
    } else {
      // New user - validate form and register
      const validationErrors = validateForm(form)
      
      if (validationErrors.length > 0) {
        errors.value = validationErrors
        return
      }
      
      // Register new user
      const result = await register({
        email: form.email,
        password: form.password,
        receiveUpdates: form.receiveUpdates
      })
      
      if (!result.success) {
        errors.value = [{ field: 'general', message: result.error || 'Registration failed.' }]
        return
      }
      
      // Navigate to success page
      await navigateTo('/success')
    }
  } catch (error) {
    errors.value = [{ field: 'general', message: 'An error occurred. Please try again.' }]
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--n-space-m);
  background: linear-gradient(135deg, var(--n-color-surface-raised) 0%, var(--n-color-surface) 100%);
}

h1.signup-title {
    text-align: left;
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
  /* align-items: center;
  justify-content: center; */
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
  background: white;
  border: 1px solid var(--n-color-border);
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  border-radius: 0;
  border-top-right-radius: var(--_n-input-border-radius);
  border-bottom-right-radius: var(--_n-input-border-radius);
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

.existing-user-message {
  margin-top: calc(-1 * var(--n-space-s));
}

.existing-user-banner {
  background: var(--n-color-status-warning-background);
  border-color: var(--n-color-status-warning);
}

.existing-user-content {
  display: flex;
  flex-direction: column;
  gap: var(--n-space-s);
}

.existing-user-title {
  display: flex;
  align-items: center;
  gap: var(--n-space-xs);
  font-weight: var(--n-font-weight-active);
  margin: 0;
  color: var(--n-color-status-warning);
  font-size: var(--n-font-size-s);
}

.existing-user-text {
  margin: 0;
  font-size: var(--n-font-size-s);
  color: var(--n-color-text);
  line-height: 1.4;
}

.existing-user-question {
  margin: 0;
  font-size: var(--n-font-size-s);
  color: var(--n-color-text);
  font-weight: var(--n-font-weight-active);
}

.existing-user-actions {
  display: flex;
  gap: var(--n-space-s);
  flex-wrap: wrap;
  align-items: center;
}

.reset-button {
  flex-shrink: 0;
}

.dismiss-button {
  color: var(--n-color-text-weak);
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

/* Reset password link */
.reset-password-link {
  color: var(--n-color-text-link);
  text-decoration: underline;
  cursor: pointer;
  font-size: var(--n-font-size-s);
  transition: color 0.2s ease;
}

.reset-password-link:hover,
.reset-password-link:focus {
  color: var(--n-color-text-link-hover);
  text-decoration: none;
}

.reset-password-link:focus-visible {
  outline: 2px solid var(--n-color-border-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Reset modal styles */
.reset-modal-content {
  padding: var(--n-space-m) 0;
}

.reset-success-banner {
  background: var(--n-color-status-success-background);
  border-color: var(--n-color-status-success);
}

.reset-success-content {
  display: flex;
  gap: var(--n-space-m);
  align-items: flex-start;
}

.reset-success-text {
  flex: 1;
}

.reset-success-title {
  font-weight: var(--n-font-weight-active);
  margin: 0 0 var(--n-space-s) 0;
  color: var(--n-color-text);
  font-size: var(--n-font-size-m);
}

.reset-success-description {
  margin: 0 0 var(--n-space-s) 0;
  color: var(--n-color-text);
  line-height: 1.5;
}

.reset-success-description strong {
  color: var(--n-color-text);
  font-weight: var(--n-font-weight-active);
  background: var(--n-color-surface-raised);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.95em;
}

.reset-success-note {
  margin: 0;
  color: var(--n-color-text-weak);
  font-size: var(--n-font-size-s);
  line-height: 1.4;
}

.reset-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--n-space-s);
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
    text-align: left;
  }
  
  .card-header {
    text-align: left;
  }
  
  .card-title h1 {
    text-align: left;
    justify-content: flex-start;
  }
  
  .card-subtitle p {
    text-align: left;
  }
  
  .requirements-title h2 {
    justify-content: flex-start;
    text-align: left;
  }
  
  .error-title {
    justify-content: flex-start;
    text-align: left;
  }
  
  .email-input,
  .password-input {
    width: 100%;
    max-width: none;
  }
  
  .form-field {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .requirements-list {
    font-size: var(--n-font-size-xs);
  }
  
  .card-subtitle {
    font-size: var(--n-font-size-s);
  }
  
  .reset-success-content {
    flex-direction: column;
    gap: var(--n-space-s);
    align-items: center;
    text-align: center;
  }
  
  .reset-modal-content {
    padding: var(--n-space-s) 0;
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

.requirements-list li .checkmark {
  color: var(--n-color-status-success);
  font-weight: bold;
  transform: scale(1.2);
  transition: all 0.3s ease;
}

.requirements-list li:not(.valid) span {
  color: var(--n-color-text);
}

.requirements-list li .icon-pending {
  color: var(--n-color-text-weak);
  opacity: 0.5;
}

/* Password toggle icon visibility based on input type */
.password-input[type="password"] .password-toggle nord-icon[name="interface-edit-off"],
.password-input[type="text"] .password-toggle nord-icon[name="interface-edit-on"] {
  display: none;
}

/* Make password toggle button completely transparent - only show icon */
/* Todo: The (inner?) button still seems to have an almost invisible box-shadow, get rid of that. */
.password-toggle {
  --n-button-border-color: transparent !important;
  --n-button-border-width: 0 !important;
  --n-button-background-color: transparent !important;
  border: none !important;
  border-left: 1px solid var(--n-color-border) !important;
  background: transparent !important;
  /* padding: var(--n-space-xs) !important; */
  /* margin: var(--n-space-xs) !important; */
  height: 20px !important;
  width: 24px !important;
  /* min-height: unset !important;
  min-width: unset !important;
  box-shadow: none !important;
  outline: none !important; */
}

</style>