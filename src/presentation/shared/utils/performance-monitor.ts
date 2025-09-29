/**
 * Performance Monitoring Utilities for Legend State
 * 
 * Utilities to track and monitor Legend State subscription performance
 * and component re-render optimization.
 */

import React from 'react'
import { computed } from '@legendapp/state'
import { catalogStore$, catalogComputed } from '@/src/presentation/shared/stores/catalog-store'

interface PerformanceMetrics {
  totalCatalogs: number
  totalItems: number
  isLoading: boolean
  subscriptionCount: number
  lastRenderTime: number
  renderCount: number
}

interface SubscriptionInfo {
  componentName: string
  subscriptionPaths: string[]
  renderCount: number
  lastRender: number
}

// Global performance tracking (dev only)
const performanceTracker = __DEV__ ? {
  renderCounts: new Map<string, number>(),
  subscriptions: new Map<string, SubscriptionInfo>(),
  startTime: Date.now()
} : null

/**
 * Performance monitoring for Legend State components
 */
export const legendStatePerformance = {
  /**
   * Track component render for performance analysis
   */
  trackRender: (componentName: string, subscriptionPaths?: string[]) => {
    if (!__DEV__ || !performanceTracker) return

    const currentCount = performanceTracker.renderCounts.get(componentName) || 0
    const newCount = currentCount + 1
    
    performanceTracker.renderCounts.set(componentName, newCount)
    
    if (subscriptionPaths) {
      performanceTracker.subscriptions.set(componentName, {
        componentName,
        subscriptionPaths,
        renderCount: newCount,
        lastRender: Date.now()
      })
    }

    // Log excessive re-renders
    if (newCount > 10 && newCount % 5 === 0) {
      console.warn(`🚨 ${componentName} has rendered ${newCount} times`)
    }
  },

  /**
   * Get performance metrics for debugging
   */
  getMetrics: (): PerformanceMetrics => {
    return {
      totalCatalogs: catalogStore$.totalCatalogs.peek(),
      totalItems: catalogStore$.totalItems.peek(),
      isLoading: catalogComputed.isLoading.peek(),
      subscriptionCount: performanceTracker?.subscriptions.size || 0,
      lastRenderTime: Date.now(),
      renderCount: Array.from(performanceTracker?.renderCounts.values() || []).reduce((sum, count) => sum + count, 0)
    }
  },

  /**
   * Log current performance state
   */
  logPerformanceState: () => {
    if (!__DEV__) return

    const metrics = legendStatePerformance.getMetrics()
    const renderCounts = Array.from(performanceTracker?.renderCounts.entries() || [])
    
    console.group('📊 Legend State Performance Metrics')
    console.log('Store State:', {
      catalogs: metrics.totalCatalogs,
      items: metrics.totalItems,
      loading: metrics.isLoading
    })
    console.log('Render Counts:', renderCounts)
    console.log('Total Renders:', metrics.renderCount)
    console.log('Active Subscriptions:', metrics.subscriptionCount)
    console.groupEnd()
  },

  /**
   * Reset performance tracking
   */
  reset: () => {
    if (!__DEV__ || !performanceTracker) return
    
    performanceTracker.renderCounts.clear()
    performanceTracker.subscriptions.clear()
    performanceTracker.startTime = Date.now()
  },

  /**
   * Get subscription analysis
   */
  getSubscriptionAnalysis: () => {
    if (!__DEV__ || !performanceTracker) return {}

    const analysis: Record<string, any> = {}
    
    for (const [componentName, info] of performanceTracker.subscriptions) {
      analysis[componentName] = {
        renderCount: info.renderCount,
        subscriptionPaths: info.subscriptionPaths,
        lastRender: info.lastRender,
        renderFrequency: info.renderCount / ((Date.now() - performanceTracker.startTime) / 1000)
      }
    }

    return analysis
  }
}

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitor = (componentName: string, subscriptionPaths?: string[]) => {
  // Disable performance tracking to prevent excessive logging and re-renders
  // TODO: Re-enable with proper throttling and batching
  
  return {
    getMetrics: legendStatePerformance.getMetrics,
    logState: legendStatePerformance.logPerformanceState,
    renderCount: 0 // Always return 0 to disable logging
  }
}

/**
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> => {
  const TrackedComponent: React.FC<P> = (props: P) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown'
    usePerformanceMonitor(name)
    
    return React.createElement(WrappedComponent, props)
  }

  TrackedComponent.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`
  
  return TrackedComponent
}

/**
 * Computed performance selector for real-time monitoring
 */
export const performanceSelector = computed(() => ({
  storeState: {
    catalogsCount: catalogStore$.totalCatalogs.get(),
    itemsCount: catalogStore$.totalItems.get(),
    isLoading: catalogComputed.isLoading.get(),
    hasError: catalogComputed.isError.get()
  },
  performance: legendStatePerformance.getMetrics(),
  timestamp: Date.now()
}))

/**
 * Development performance logger (automatically logs performance data)
 */
if (__DEV__) {
  // Log performance metrics every 30 seconds
  setInterval(() => {
    if (performanceTracker && performanceTracker.renderCounts.size > 0) {
      legendStatePerformance.logPerformanceState()
    }
  }, 30000)
}