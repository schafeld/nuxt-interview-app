// tests/composables/usePerformanceMonitoring.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePerformanceMonitoring } from '../../composables/usePerformanceMonitoring'

// Mock performance APIs
const mockPerformance = {
  now: vi.fn(() => 1000),
  getEntriesByType: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn()
}

global.performance = mockPerformance as any

// Mock PerformanceObserver
class MockPerformanceObserver {
  callback: (list: any) => void
  
  constructor(callback: (list: any) => void) {
    this.callback = callback
  }
  
  observe() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
}

global.PerformanceObserver = MockPerformanceObserver as any

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPerformance.now.mockReturnValue(1000)
  })

  it('should measure function performance', async () => {
    const { measurePerformance, metrics } = usePerformanceMonitoring()
    
    // Mock time progression
    let time = 1000
    mockPerformance.now.mockImplementation(() => time)
    
    const testFunction = vi.fn().mockImplementation(() => {
      time += 100 // Simulate 100ms execution
      return 'result'
    })
    
    const measuredFunction = measurePerformance('test-function', testFunction)
    const result = measuredFunction()
    
    expect(result).toBe('result')
    expect(testFunction).toHaveBeenCalled()
    
    // Should record the metric
    expect(metrics.value).toHaveLength(1)
    expect(metrics.value[0].name).toBe('test-function')
    expect(metrics.value[0].value).toBe(100)
  })

  it('should measure async function performance', async () => {
    const { measurePerformance, metrics } = usePerformanceMonitoring()
    
    let time = 1000
    mockPerformance.now.mockImplementation(() => time)
    
    const asyncFunction = vi.fn().mockImplementation(async () => {
      time += 200 // Simulate 200ms execution
      return 'async-result'
    })
    
    const measuredFunction = measurePerformance('async-function', asyncFunction)
    const result = await measuredFunction()
    
    expect(result).toBe('async-result')
    expect(metrics.value).toHaveLength(1)
    expect(metrics.value[0].name).toBe('async-function')
    expect(metrics.value[0].value).toBe(200)
  })

  it('should handle function errors and measure time', async () => {
    const { measurePerformance, metrics } = usePerformanceMonitoring()
    
    let time = 1000
    mockPerformance.now.mockImplementation(() => time)
    
    const errorFunction = vi.fn().mockImplementation(() => {
      time += 50
      throw new Error('Test error')
    })
    
    const measuredFunction = measurePerformance('error-function', errorFunction)
    
    expect(() => measuredFunction()).toThrow('Test error')
    
    // Should still record the metric with error suffix
    expect(metrics.value).toHaveLength(1)
    expect(metrics.value[0].name).toBe('error-function_error')
    expect(metrics.value[0].value).toBe(50)
  })

  it('should record custom metrics', () => {
    const { recordMetric, metrics } = usePerformanceMonitoring()
    
    recordMetric('custom-metric', 123.45, '/test-url')
    
    expect(metrics.value).toHaveLength(1)
    expect(metrics.value[0]).toEqual({
      name: 'custom-metric',
      value: 123.45,
      url: '/test-url',
      timestamp: expect.any(Number)
    })
  })

  it('should generate performance summary', () => {
    const { recordMetric, getPerformanceSummary } = usePerformanceMonitoring()
    
    // Record multiple metrics
    recordMetric('test-metric', 100)
    recordMetric('test-metric', 200)
    recordMetric('test-metric', 150)
    recordMetric('other-metric', 50)
    
    const summary = getPerformanceSummary()
    
    expect(summary['test-metric']).toEqual({
      avg: 150,
      min: 100,
      max: 200,
      count: 3
    })
    
    expect(summary['other-metric']).toEqual({
      avg: 50,
      min: 50,
      max: 50,
      count: 1
    })
  })

  it('should assess performance status', () => {
    const { recordMetric, getPerformanceStatus } = usePerformanceMonitoring()
    
    // Record good performance metrics
    recordMetric('load_complete', 2000)
    recordMetric('LCP', 2000)
    recordMetric('CLS', 0.05)
    recordMetric('FID', 50)
    
    const status = getPerformanceStatus()
    
    expect(status.status).toBe('good')
    expect(status.issues).toHaveLength(0)
  })

  it('should detect performance issues', () => {
    const { recordMetric, getPerformanceStatus } = usePerformanceMonitoring()
    
    // Record poor performance metrics
    recordMetric('load_complete', 5000) // Slow load
    recordMetric('LCP', 4000) // Poor LCP
    recordMetric('CLS', 0.3) // Layout shift issues
    recordMetric('FID', 200) // Poor FID
    
    const status = getPerformanceStatus()
    
    expect(status.status).toBe('poor')
    expect(status.issues).toContain('Slow page load time')
    expect(status.issues).toContain('Poor Largest Contentful Paint')
    expect(status.issues).toContain('Layout shift issues')
    expect(status.issues).toContain('Poor First Input Delay')
  })

  it('should clear metrics', () => {
    const { recordMetric, clearMetrics, metrics } = usePerformanceMonitoring()
    
    recordMetric('test', 100)
    expect(metrics.value).toHaveLength(1)
    
    clearMetrics()
    expect(metrics.value).toHaveLength(0)
  })

  it('should start and stop monitoring', () => {
    const { startMonitoring, stopMonitoring, isMonitoring } = usePerformanceMonitoring()
    
    expect(isMonitoring.value).toBe(false)
    
    startMonitoring()
    expect(isMonitoring.value).toBe(true)
    
    stopMonitoring()
    expect(isMonitoring.value).toBe(false)
  })

  it('should check performance budget', () => {
    const { checkPerformanceBudget } = usePerformanceMonitoring()
    
    const budget = checkPerformanceBudget()
    
    expect(budget).toHaveProperty('budgets')
    expect(budget).toHaveProperty('usage')
    expect(budget).toHaveProperty('withinBudget')
    expect(budget).toHaveProperty('violations')
    
    // Should have defined budgets
    expect(budget.budgets.js_bundle).toBeGreaterThan(0)
    expect(budget.budgets.css_bundle).toBeGreaterThan(0)
  })

  it('should handle navigation timing', () => {
    const { startMonitoring, recordMetric } = usePerformanceMonitoring()
    
    // Mock navigation timing entry
    const mockNavigationEntry = {
      entryType: 'navigation',
      domainLookupStart: 100,
      domainLookupEnd: 150,
      connectStart: 150,
      connectEnd: 200,
      requestStart: 200,
      responseStart: 300,
      domContentLoadedEventStart: 400,
      domContentLoadedEventEnd: 450,
      loadEventEnd: 500,
      fetchStart: 100,
      domInteractive: 350
    }
    
    mockPerformance.getEntriesByType.mockReturnValue([mockNavigationEntry])
    
    // Mock document ready state
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      configurable: true
    })
    
    startMonitoring()
    
    // Should call getEntriesByType for navigation
    expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('navigation')
  })
})