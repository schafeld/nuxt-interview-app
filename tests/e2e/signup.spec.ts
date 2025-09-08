// tests/e2e/signup.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test('should complete signup successfully', async ({ page }) => {
    await page.goto('/')
    
    // Fill out form
    await page.fill('[label="Email Address"]', 'test@veterinary.com')
    await page.fill('[label="Password"]', 'StrongPassword123!@')
    await page.check('[label*="receive occasional"]')
    
    // Submit form
    await page.click('text=Sign Up')
    
    // Should navigate to success page
    await expect(page).toHaveURL('/success')
    await expect(page.locator('h1')).toContainText('Welcome to Our Veterinary Community!')
  })
  
  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/')
    
    // Try to submit without filling fields
    await page.click('text=Sign Up')
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
  })
  
  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/')
    
    const passwordInput = page.locator('[label="Password"]')
    const toggleButton = page.locator('text=Show')
    
    await passwordInput.fill('testpassword')
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click show button
    await toggleButton.click()
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await expect(page.locator('text=Hide')).toBeVisible()
  })

  test('should show password requirements', async ({ page }) => {
    await page.goto('/')
    
    const passwordInput = page.locator('[label="Password"]')
    await passwordInput.fill('weak')
    
    // Should show password requirements
    await expect(page.locator('text=Password Requirements:')).toBeVisible()
    await expect(page.locator('text=At least 12 characters')).toBeVisible()
    await expect(page.locator('text=At least one uppercase letter')).toBeVisible()
  })
})

test.describe('Profile Flow', () => {
  test('should access profile after signup', async ({ page }) => {
    // Complete signup first
    await page.goto('/')
    await page.fill('[label="Email Address"]', 'profile@veterinary.com')
    await page.fill('[label="Password"]', 'StrongPassword123!@')
    await page.check('[label*="receive occasional"]')
    await page.click('text=Sign Up')
    
    // Navigate to success page
    await expect(page).toHaveURL('/success')
    
    // Should see profile link in header
    await expect(page.locator('text=Profile')).toBeVisible()
    
    // Click profile button
    await page.click('text=Profile')
    
    // Should navigate to profile page
    await expect(page).toHaveURL('/profile')
    await expect(page.locator('h1')).toContainText('User Profile')
    
    // Should show user data
    await expect(page.locator('text=profile@veterinary.com')).toBeVisible()
  })

  test('should update preferences in profile', async ({ page }) => {
    // Complete signup first
    await page.goto('/')
    await page.fill('[label="Email Address"]', 'update@veterinary.com')
    await page.fill('[label="Password"]', 'StrongPassword123!@')
    await page.click('text=Sign Up')
    
    // Navigate to profile
    await page.click('text=Profile')
    
    // Update preferences
    await page.uncheck('[label*="Receive product updates"]')
    await page.click('text=Update Preferences')
    
    // Should show success message
    await expect(page.locator('text=Preferences updated successfully!')).toBeVisible()
  })

  test('should redirect to signup when accessing profile without auth', async ({ page }) => {
    await page.goto('/profile')
    
    // Should redirect to signup page
    await expect(page).toHaveURL('/')
  })

  test('should sign out from profile', async ({ page }) => {
    // Complete signup first
    await page.goto('/')
    await page.fill('[label="Email Address"]', 'signout@veterinary.com')
    await page.fill('[label="Password"]', 'StrongPassword123!@')
    await page.click('text=Sign Up')
    
    // Navigate to profile
    await page.click('text=Profile')
    
    // Sign out
    await page.click('text=Sign Out')
    
    // Should redirect to signup and profile button should not be visible
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Profile')).not.toBeVisible()
  })
})

test.describe('Navigation and Layout', () => {
  test('should show header with logo and title', async ({ page }) => {
    await page.goto('/')
    
    // Should show app title
    await expect(page.locator('text=VetSignup')).toBeVisible()
    
    // Should show footer
    await expect(page.locator('text=VetSignup - Veterinary Product Registration')).toBeVisible()
    await expect(page.locator('text=Built with NordHealth Design System')).toBeVisible()
  })

  test('should hide profile button when not signed in', async ({ page }) => {
    await page.goto('/')
    
    // Profile button should not be visible
    await expect(page.locator('text=Profile')).not.toBeVisible()
  })
})