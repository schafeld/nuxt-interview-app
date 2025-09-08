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
})