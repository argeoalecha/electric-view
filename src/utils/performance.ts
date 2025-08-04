// Performance monitoring and optimization utilities
import { useState } from 'react'

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure component render time
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    const duration = end - start
    
    this.recordMetric(`render_${componentName}`, duration)
    
    if (duration > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`)
    }
  }

  // Measure API call performance
  async measureAPICall<T>(apiName: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await apiCall()
      const end = performance.now()
      this.recordMetric(`api_${apiName}`, end - start)
      return result
    } catch (error) {
      const end = performance.now()
      this.recordMetric(`api_${apiName}_error`, end - start)
      throw error
    }
  }

  // Record custom metrics
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  // Get performance statistics
  getStats(metricName: string) {
    const values = this.metrics.get(metricName)
    if (!values || values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const median = sorted[Math.floor(sorted.length / 2)]
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const min = sorted[0]
    const max = sorted[sorted.length - 1]

    return { avg, median, p95, min, max, count: values.length }
  }

  // Get all metrics summary
  getAllStats() {
    const summary: Record<string, any> = {}
    for (const [name] of this.metrics) {
      summary[name] = this.getStats(name)
    }
    return summary
  }

  // Monitor Core Web Vitals
  initCoreWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      this.recordMetric('core_web_vitals_lcp', lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('lcp', lcpObserver)

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.recordMetric('core_web_vitals_fid', entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.set('fid', fidObserver)

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          this.recordMetric('core_web_vitals_cls', clsValue)
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('cls', clsObserver)
  }

  // Clean up observers
  cleanup() {
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()
  }

  // Log performance report
  logReport() {
    console.group('📊 Performance Report')
    const stats = this.getAllStats()
    
    Object.entries(stats).forEach(([name, data]) => {
      if (data) {
        console.log(`${name}:`, {
          avg: `${data.avg.toFixed(2)}ms`,
          p95: `${data.p95.toFixed(2)}ms`,
          count: data.count
        })
      }
    })
    
    console.groupEnd()
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()

  const measureRender = (renderFn: () => void) => {
    monitor.measureRender(componentName, renderFn)
  }

  const measureAsync = async <T>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
    return monitor.measureAPICall(`${componentName}_${name}`, asyncFn)
  }

  return { measureRender, measureAsync, monitor }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Virtual scrolling utility for large lists
export function useVirtualScrolling(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  const totalHeight = items.length * itemHeight
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    setScrollTop
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance()
  monitor.initCoreWebVitals()
  
  // Log performance report every 30 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      monitor.logReport()
    }, 30000)
  }
}