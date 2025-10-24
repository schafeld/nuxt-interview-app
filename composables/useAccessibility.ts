// composables/useAccessibility.ts
import { useTimeoutFn } from '@vueuse/core'

/**
 * Accessibility utilities and helpers for the application
 */

export const useAccessibility = () => {
  /**
   * Announces a message to screen readers
   * @param message - The message to announce
   * @param priority - The announcement priority ('polite' or 'assertive')
   */
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (process.client) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', priority)
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'visually-hidden'
      announcement.textContent = message

      document.body.appendChild(announcement)

      // Remove after announcement using VueUse
      useTimeoutFn(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement)
        }
      }, 1000).start()
    }
  }

  /**
   * Manages focus for single-page application navigation
   * @param element - The element to focus, or a selector string
   */
  const manageFocus = (element: HTMLElement | string) => {
    if (process.client) {
      let targetElement: HTMLElement | null = null

      if (typeof element === 'string') {
        targetElement = document.querySelector(element)
      } else {
        targetElement = element
      }

      if (targetElement) {
        // Ensure element is focusable
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1')
        }

        targetElement.focus()

        // Announce page change to screen readers
        const pageTitle = document.title
        announceToScreenReader(`Navigated to ${pageTitle}`)
      }
    }
  }

  /**
   * Generates a unique ID for accessibility attributes
   * @param prefix - Optional prefix for the ID
   */
  const generateId = (prefix: string = 'a11y'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Validates if an element meets basic accessibility requirements
   * @param element - The element to validate
   */
  const validateAccessibility = (element: HTMLElement): string[] => {
    const issues: string[] = []

    // Check for missing alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push('Image missing alt attribute')
    }

    // Check for form labels
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const id = element.getAttribute('id')
      const ariaLabel = element.getAttribute('aria-label')
      const ariaLabelledBy = element.getAttribute('aria-labelledby')

      if (!ariaLabel && !ariaLabelledBy && (!id || !document.querySelector(`label[for="${id}"]`))) {
        issues.push('Form element missing accessible label')
      }
    }

    // Check for sufficient color contrast (basic check)
    const style = window.getComputedStyle(element)
    const bgColor = style.backgroundColor
    const textColor = style.color

    if (bgColor && textColor && bgColor !== 'rgba(0, 0, 0, 0)') {
      // This is a simplified check - in production, use a proper contrast checker
      issues.push('Manual color contrast check recommended')
    }

    return issues
  }

  /**
   * Sets up keyboard navigation for a group of elements
   * @param elements - Array of elements or selector
   * @param options - Navigation options
   */
  const setupKeyboardNavigation = (
    elements: HTMLElement[] | string,
    options: {
      direction?: 'horizontal' | 'vertical' | 'both'
      wrap?: boolean
      homeEnd?: boolean
    } = {}
  ) => {
    if (process.client) {
      let targetElements: HTMLElement[] = []

      if (typeof elements === 'string') {
        targetElements = Array.from(document.querySelectorAll(elements))
      } else {
        targetElements = elements
      }

      const { direction = 'both', wrap = true, homeEnd = true } = options

      targetElements.forEach((element, index) => {
        element.addEventListener('keydown', (event) => {
          let nextIndex = index

          switch (event.key) {
            case 'ArrowRight':
              if (direction === 'horizontal' || direction === 'both') {
                nextIndex = wrap && index === targetElements.length - 1 ? 0 : Math.min(index + 1, targetElements.length - 1)
                event.preventDefault()
              }
              break
            case 'ArrowLeft':
              if (direction === 'horizontal' || direction === 'both') {
                nextIndex = wrap && index === 0 ? targetElements.length - 1 : Math.max(index - 1, 0)
                event.preventDefault()
              }
              break
            case 'ArrowDown':
              if (direction === 'vertical' || direction === 'both') {
                nextIndex = wrap && index === targetElements.length - 1 ? 0 : Math.min(index + 1, targetElements.length - 1)
                event.preventDefault()
              }
              break
            case 'ArrowUp':
              if (direction === 'vertical' || direction === 'both') {
                nextIndex = wrap && index === 0 ? targetElements.length - 1 : Math.max(index - 1, 0)
                event.preventDefault()
              }
              break
            case 'Home':
              if (homeEnd) {
                nextIndex = 0
                event.preventDefault()
              }
              break
            case 'End':
              if (homeEnd) {
                nextIndex = targetElements.length - 1
                event.preventDefault()
              }
              break
          }

          if (nextIndex !== index) {
            targetElements[nextIndex].focus()
          }
        })
      })
    }
  }

  return {
    announceToScreenReader,
    manageFocus,
    generateId,
    validateAccessibility,
    setupKeyboardNavigation
  }
}
