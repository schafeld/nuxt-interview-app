// tests/e2e/utils/page-helpers.ts
import type { Page } from '@playwright/test'

/**
 * Wait for NordHealth web components to be registered and visible
 * This is necessary because web components need time to register in the browser
 */
export async function waitForNordComponents(page: Page, timeout = 20000) {
  // Wait for the page to be fully loaded first
  await page.waitForLoadState('networkidle', { timeout })
  
  // Wait for any visible nord-card element (simpler approach)
  await page.waitForSelector('nord-card', { 
    state: 'visible', 
    timeout 
  })
  
  // Give extra time for components to fully initialize
  await page.waitForTimeout(1000)
}

/**
 * Navigate to a page and wait for NordHealth components to be ready
 */
export async function navigateAndWaitForComponents(page: Page, url: string) {
  await page.goto(url)
  await waitForNordComponents(page)
}

/**
 * Get a NordHealth input by its label text and return the actual input element
 */
export function getNordInputByLabel(page: Page, labelText: string) {
  return page.locator('nord-input').filter({ hasText: labelText }).locator('input')
}

/**
 * Get a NordHealth button by its text content
 */
export function getNordButton(page: Page, text: string) {
  return page.locator('nord-button').filter({ hasText: text })
}

/**
 * Wait for a nord-input to be interactive (not just visible)
 */
export async function waitForNordInputReady(page: Page, labelText: string) {
  // First wait for the components to be ready
  await waitForNordComponents(page)
  
  // Find the input by label text
  const input = getNordInputByLabel(page, labelText)
  
  // Wait for the input to be visible and enabled
  await input.waitFor({ state: 'visible', timeout: 10000 })
  
  // Additional wait to ensure it's interactive
  await page.waitForTimeout(500)
  
  return input
}

/**
 * Wait for user to be authenticated and profile dropdown to appear
 */
export async function waitForAuthentication(page: Page, timeout = 10000) {
  await page.waitForSelector('nord-dropdown', { 
    state: 'visible', 
    timeout 
  })
}

/**
 * Complete signup flow and wait for authentication
 */
export async function completeSignupFlow(page: Page, email: string, password: string = 'StrongPassword123!@') {
  await navigateAndWaitForComponents(page, '/')
  
  const emailInput = await waitForNordInputReady(page, 'Email Address')
  await emailInput.fill(email)
  
  const passwordInput = await waitForNordInputReady(page, 'Password')
  await passwordInput.fill(password)
  
  await page.waitForSelector('nord-checkbox', { state: 'visible' })
  const checkbox = page.locator('nord-checkbox')
  await checkbox.click()
  
  await page.waitForTimeout(1000)
  
  // Submit form programmatically
  const form = page.locator('form.signup-form')
  await form.evaluate(form => {
    const event = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(event)
  })
  
  // Wait for navigation to success page
  await page.waitForURL('/success', { timeout: 10000 })
}