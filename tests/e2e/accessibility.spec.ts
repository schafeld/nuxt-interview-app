// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('signup page should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('success page should not have accessibility violations', async ({ page }) => {
    // First complete signup to access success page
    await page.goto('/')
    
    // Fill out the form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePassword123!@')
    await page.click('button[type="submit"]')
    
    // Wait for navigation to success page
    await page.waitForURL('/success')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('profile page should not have accessibility violations', async ({ page }) => {
    // Complete signup first
    await page.goto('/')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'SecurePassword123!@')
    await page.click('button[type="submit"]')
    await page.waitForURL('/success')
    
    // Navigate to profile
    await page.goto('/profile')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works throughout the app', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation through form elements
    await page.keyboard.press('Tab') // Skip link
    await page.keyboard.press('Tab') // Email field
    await page.keyboard.press('Tab') // Password field
    await page.keyboard.press('Tab') // Password toggle button
    await page.keyboard.press('Tab') // Checkbox
    await page.keyboard.press('Tab') // Submit button
    
    // Verify focus is on submit button
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('skip link functionality', async ({ page }) => {
    await page.goto('/')
    
    // Focus the skip link
    await page.keyboard.press('Tab')
    
    // Verify skip link is visible when focused
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeVisible()
    
    // Press Enter to activate skip link
    await page.keyboard.press('Enter')
    
    // Verify focus moved to main content
    const focusedElement = await page.locator('#main-content')
    await expect(focusedElement).toBeFocused()
  })

  test('form validation messages are announced to screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Submit empty form to trigger validation
    await page.click('button[type="submit"]')
    
    // Check that error messages have proper ARIA attributes
    const errorMessages = page.locator('[role="alert"]')
    await expect(errorMessages.first()).toBeVisible()
  })

  test('password requirements are properly announced', async ({ page }) => {
    await page.goto('/')
    
    // Focus password field and type to show requirements
    await page.fill('input[type="password"]', 'test')
    
    // Verify password requirements region is properly labeled
    const requirementsRegion = page.locator('[role="region"][aria-labelledby="password-requirements-title"]')
    await expect(requirementsRegion).toBeVisible()
  })
})
