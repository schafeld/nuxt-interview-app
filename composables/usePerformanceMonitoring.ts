// composables/usePerformanceMonitoring.ts
// Performance monitoring and Web Vitals tracking

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
}

interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  delta: number
  entries: PerformanceEntry[]
  id: string
}

export const usePerformanceMonitoring = () => {
  const metrics = ref<PerformanceMetric[]>([])
  const isMonitoring = ref(false)

  // Performance observer for monitoring various metrics
  let performanceObserver: PerformanceObserver | null = null

  // Measure function execution time
  const measurePerformance = <T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T => {
    return ((...args: any[]) => {
      const start = performance.now()
      
      try {
        const result = fn.apply(this, args)
        
        // Handle both sync and async functions
        if (result instanceof Promise) {
          return result.then((value) => {
            recordMetric(name, performance.now() - start)
            return value
          }).catch((error) => {
            recordMetric(`${name}_error`, performance.now() - start)
            throw error
          })
        } else {
          recordMetric(name, performance.now() - start)
          return result
        }
      } catch (error) {
        recordMetric(`${name}_error`, performance.now() - start)
        throw error
      }
    }) as T
  }

  // Record a performance metric
  const recordMetric = (name: string, value: number, url?: string) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: url || (process.client ? window.location.pathname : undefined)
    }
    
    metrics.value.push(metric)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value.toFixed(2)}ms`)
    }
    
    // Send to analytics in production (placeholder)
    if (process.env.NODE_ENV === 'production') {
      // In a real app, send to your analytics service
      // Analytics.track('performance', metric)
    }
  }

  // Initialize core web vitals monitoring (manual implementation)
  const initWebVitals = () => {
    if (!process.client) return

    try {
      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      let clsEntries: PerformanceEntry[] = []

      if ('PerformanceObserver' in window) {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Only count layout shifts without recent user input
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              clsEntries.push(entry)
            }
          }
          recordMetric('CLS', clsValue)
        })

        try {
          clsObserver.observe({ type: 'layout-shift', buffered: true })
        } catch {
          // Layout-shift not supported
        }

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          recordMetric('LCP', lastEntry.startTime)
        })

        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        } catch {
          // LCP not supported
        }

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            recordMetric('FID', (entry as any).processingStart - entry.startTime)
          }
        })

        try {
          fidObserver.observe({ type: 'first-input', buffered: true })
        } catch {
          // FID not supported
        }
      }

      // First Contentful Paint (FCP)
      const paintEntries = performance.getEntriesByType('paint')
      for (const entry of paintEntries) {
        if (entry.name === 'first-contentful-paint') {
          recordMetric('FCP', entry.startTime)
        }
      }

      console.log('Core Web Vitals monitoring initialized')
    } catch (error) {
      console.warn('Web Vitals monitoring failed:', error)
    }
  }

  // Start performance monitoring
  const startMonitoring = () => {
    if (!process.client || isMonitoring.value) return

    isMonitoring.value = true

    // Monitor navigation timing
    const navigationTiming = () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (nav) {
        recordMetric('dns_lookup', nav.domainLookupEnd - nav.domainLookupStart)
        recordMetric('tcp_connect', nav.connectEnd - nav.connectStart)
        recordMetric('ttfb', nav.responseStart - nav.requestStart)
        recordMetric('dom_parse', nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart)
        recordMetric('load_complete', nav.loadEventEnd - nav.fetchStart)
        recordMetric('dom_interactive', nav.domInteractive - nav.fetchStart)
      }
    }

    // Monitor resource timing
    if ('PerformanceObserver' in window) {
      performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming
            
            // Only monitor important resources
            if (resource.name.includes('.js') || resource.name.includes('.css')) {
              recordMetric(
                `resource_${resource.name.split('/').pop()}`,
                resource.responseEnd - resource.startTime
              )
            }
          } else if (entry.entryType === 'measure') {
            recordMetric(entry.name, entry.duration)
          }
        }
      })

      performanceObserver.observe({ 
        entryTypes: ['resource', 'measure', 'navigation'] 
      })
    }

    // Initialize Web Vitals
    initWebVitals()

    // Record initial navigation timing after page load
    if (document.readyState === 'complete') {
      navigationTiming()
    } else {
      window.addEventListener('load', navigationTiming)
    }
  }

  // Stop performance monitoring
  const stopMonitoring = () => {
    isMonitoring.value = false
    
    if (performanceObserver) {
      performanceObserver.disconnect()
      performanceObserver = null
    }
  }

  // Get performance summary
  const getPerformanceSummary = () => {
    const summary: Record<string, { avg: number, min: number, max: number, count: number }> = {}
    
    for (const metric of metrics.value) {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Infinity, max: 0, count: 0 }
      }
      
      const s = summary[metric.name]
      s.count++
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count
    }
    
    return summary
  }

  // Clear metrics
  const clearMetrics = () => {
    metrics.value = []
  }

  // Check if performance is acceptable
  const getPerformanceStatus = () => {
    const summary = getPerformanceSummary()
    const issues = []

    // Check for performance issues
    if (summary.load_complete?.avg > 3000) {
      issues.push('Slow page load time')
    }
    
    if (summary.LCP?.avg > 2500) {
      issues.push('Poor Largest Contentful Paint')
    }
    
    if (summary.CLS?.avg > 0.1) {
      issues.push('Layout shift issues')
    }
    
    if (summary.FID?.avg > 100) {
      issues.push('Poor First Input Delay')
    }

    return {
      status: issues.length === 0 ? 'good' : issues.length <= 2 ? 'needs-improvement' : 'poor',
      issues,
      summary
    }
  }

  // Performance budget checker
  const checkPerformanceBudget = () => {
    const budgets = {
      js_bundle: 250, // KB
      css_bundle: 50,  // KB
      images: 500,     // KB
      fonts: 100,      // KB
      total: 1000      // KB
    }

    const usage = {
      js_bundle: 0,
      css_bundle: 0,
      images: 0,
      fonts: 0,
      total: 0
    }

    // This would be implemented with actual resource size monitoring
    // For now, return placeholder data
    return {
      budgets,
      usage,
      withinBudget: true,
      violations: []
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    metrics: readonly(metrics),
    isMonitoring: readonly(isMonitoring),

    // Methods
    measurePerformance,
    recordMetric,
    startMonitoring,
    stopMonitoring,
    getPerformanceSummary,
    getPerformanceStatus,
    checkPerformanceBudget,
    clearMetrics,
    initWebVitals
  }
}