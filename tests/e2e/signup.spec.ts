// tests/e2e/signup.spec.ts
import { test, expect } from '@playwright/test'
import { 
  navigateAndWaitForComponents, 
  getNordInputByLabel, 
  getNordButton, 
  waitForNordInputReady,
  waitForAuthentication,
  completeSignupFlow,
  waitForNordComponents
} from './utils/page-helpers'

test.describe('Signup Flow', () => {
  test('should complete signup successfully', async ({ page }) => {
    await navigateAndWaitForComponents(page, '/')
    
    // Fill out form using the helper functions for better reliability
    const emailInput = await waitForNordInputReady(page, 'Email Address')
    await emailInput.fill('test@veterinary.com')
    
    const passwordInput = await waitForNordInputReady(page, 'Password')
    await passwordInput.fill('StrongPassword123!@')
    
    // Wait for checkbox to be interactive and click it
    await page.waitForSelector('nord-checkbox', { state: 'visible' })
    const checkbox = page.locator('nord-checkbox')
    await checkbox.click()
    
    // Wait for form to be valid
    await page.waitForTimeout(1000)
    
    // Submit form - use programmatic submission since nord-button click doesn't work reliably in Playwright
    const form = page.locator('form.signup-form')
    await form.evaluate(form => {
      const event = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(event)
    })
    
    // Wait for navigation to success page
    await page.waitForURL('/success', { timeout: 10000 })
    
    // Verify we're on the success page with the correct content
    await expect(page.locator('h1').filter({ hasText: 'Welcome to Our Veterinary Community!' })).toBeVisible()
  })
  
  test('should show validation errors for empty fields', async ({ page }) => {
    await navigateAndWaitForComponents(page, '/')
    
    // Try to submit without filling fields - click the disabled button to trigger validation
    await page.waitForSelector('nord-button[type="submit"]', { state: 'visible' })
    const submitButton = page.locator('nord-button[type="submit"]')
    await submitButton.click({ force: true })
    
    // Wait for validation
    await page.waitForTimeout(1000)
    
    // Should show validation errors - the button should remain disabled and errors should appear
    await expect(submitButton).toHaveAttribute('disabled', '')
    
    // Fill email to see password validation
    const emailField = await waitForNordInputReady(page, 'Email Address')
    await emailField.fill('test@example.com')
    
    // Now only password should be required
    await page.waitForTimeout(500)
    await expect(submitButton).toHaveAttribute('disabled', '')
  })
  
  test('should toggle password visibility', async ({ page }) => {
    await navigateAndWaitForComponents(page, '/')
    
    const passwordInput = await waitForNordInputReady(page, 'Password')
    const toggleButton = page.locator('.password-toggle')
    
    await passwordInput.fill('testpassword')
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click show button
    await toggleButton.click()
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click again to hide
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should show password requirements', async ({ page }) => {
    await navigateAndWaitForComponents(page, '/')
    
    const passwordInput = await waitForNordInputReady(page, 'Password')
    await passwordInput.fill('weak')
    
    // Should show password requirements
    await expect(page.locator('text=Password Requirements:')).toBeVisible()
    await expect(page.locator('text=At least 12 characters')).toBeVisible()
    await expect(page.locator('text=At least one uppercase letter')).toBeVisible()
  })
})

test.describe('Profile Flow', () => {
  test('should access profile after signup', async ({ page }) => {
    // Complete signup flow
    await completeSignupFlow(page, 'profile@veterinary.com')
    
    // Navigate to profile page directly to check authentication
    await page.goto('/profile')
    await navigateAndWaitForComponents(page, '/profile')
    
    // Should see profile content (proving authentication works)
    await expect(page.locator('h1').filter({ hasText: 'User Profile' })).toBeVisible()
    
    // Should see user dropdown in header now that we're authenticated
    await waitForAuthentication(page)
    
    // Basic check that we're authenticated - just verify we can see account information
    await expect(page.locator('text=Account Information')).toBeVisible()
  })

  test('should update preferences in profile', async ({ page }) => {
    // Complete signup flow to set up authenticated state
    await completeSignupFlow(page, 'update@veterinary.com')
    
    // Navigate to profile page
    await page.goto('/profile')
    await navigateAndWaitForComponents(page, '/profile')
    
    // Check initial localStorage state
    const initialUsers = await page.evaluate(() => {
      const stored = localStorage.getItem('registeredUsers')
      return stored ? JSON.parse(stored) : []
    })
    expect(initialUsers.length).toBeGreaterThan(0)
    const initialUser = initialUsers.find((user: any) => user.email === 'update@veterinary.com')
    expect(initialUser.receiveUpdates).toBe(true) // Should be true from signup
    
    // Update preferences
    const preferencesCheckbox = page.locator('nord-checkbox').filter({ hasText: 'Receive product updates' })
    await preferencesCheckbox.click()
    
    const updateButton = page.locator('nord-button').filter({ hasText: 'Update Preferences' })
    await updateButton.click()
    
    // Should show success message
    await expect(page.locator('nord-banner[variant="success"]')).toBeVisible()
    
    // Verify localStorage was updated
    const updatedUsers = await page.evaluate(() => {
      const stored = localStorage.getItem('registeredUsers')
      return stored ? JSON.parse(stored) : []
    })
    const updatedUser = updatedUsers.find((user: any) => user.email === 'update@veterinary.com')
    expect(updatedUser.receiveUpdates).toBe(false) // Should now be false
  })

  test('should redirect to signup when accessing profile without auth', async ({ page }) => {
    // Start with a fresh page context to ensure no auth state
    await page.goto('/')
    
    // Clear localStorage which contains the JWT token
    await page.evaluate(() => {
      localStorage.removeItem('vet_auth_token')
    })
    
    // Also clear cookies to be thorough
    await page.context().clearCookies()
    
    // Now try to access profile page
    await page.goto('/profile')
    
    // Wait for auth middleware to process and redirect
    await page.waitForURL('/', { timeout: 10000 })
    
    // Should redirect to signup page and show the signup form
    await expect(page).toHaveURL('/')
    
    // Wait for nord components to be ready
    await waitForNordComponents(page)
    
    // Check for signup form presence
    await expect(page.locator('#signup-title')).toBeVisible()
  })

  test('should sign out from profile', async ({ page }) => {
    // Complete a full signup flow to ensure proper authentication state
    await completeSignupFlow(page, 'signout@veterinary.com')
    
    // Navigate to profile page using the "Continue to Profile" button on success page
    await page.locator('nord-button').filter({ hasText: 'Continue to Profile' }).click()
    
    // Should be on profile page
    await page.waitForURL('/profile', { timeout: 10000 })
    
    // Wait for the page to fully load and components to initialize
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Instead of using the dropdown (which has timing issues), 
    // use the sign out button directly on the profile page
    await expect(page.locator('nord-button').filter({ hasText: 'Sign Out' })).toBeVisible({ timeout: 10000 })
    
    // Click the sign out button using DOM interaction (more reliable with web components)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('nord-button'))
      const signOutButton = buttons.find(button => button.textContent?.includes('Sign Out'))
      if (signOutButton) {
        signOutButton.click()
      }
    })
    
    // Wait for navigation back to signup page  
    await page.waitForURL('/', { timeout: 10000 })
    
    // Should redirect to signup page
    await expect(page).toHaveURL('/')
    
    // Verify we're signed out by checking for signup form (be more specific about which h1)
    await expect(page.locator('h1').filter({ hasText: 'Sign Up for Our Veterinary Product' })).toBeVisible()
    
    // The dropdown should not be visible since we're signed out
    await expect(page.locator('nord-dropdown')).not.toBeVisible()
  })
})

test.describe('Navigation and Layout', () => {
  test('should show header with logo and title', async ({ page }) => {
    await navigateAndWaitForComponents(page, '/')
    
    // Should show app title in header - be more specific
    await expect(page.locator('nord-header .app-title')).toContainText('VetSignup')
    
    // Should show footer
    await expect(page.locator('nord-footer')).toContainText('VetSignup - Veterinary Product Registration')
    await expect(page.locator('nord-footer')).toContainText('Built with')
  })

  test('should hide profile button when not signed in', async ({ page }) => {
    await navigateAndWaitForComponents(page, '/')
    
    // Dropdown should not be visible when not signed in
    await expect(page.locator('nord-dropdown')).not.toBeVisible()
  })
})