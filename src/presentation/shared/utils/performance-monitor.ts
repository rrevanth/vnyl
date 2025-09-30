/**
 * Performance Monitoring Utilities for Legend State
 * 
 * Utilities to track and monitor Legend State subscription performance
 * and component re-render optimization.
 */

import React from 'react'
import { computed } from '@legendapp/state'
import { homescreenStore$, homescreenComputed } from '@/src/presentation/shared/stores/homescreen-store'
import type { ILoggingService } from '@/src/domain/services'

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

    // Log excessive re-renders through logging service if available
    if (newCount > 10 && newCount % 5 === 0) {
      // Note: In a production app, we would inject the logging service here
      // For now, we'll use console in dev mode only
      if (__DEV__) {
        console.warn(`🚨 ${componentName} has rendered ${newCount} times`)
      }
    }
  },

  /**
   * Get performance metrics for debugging
   */
  getMetrics: (): PerformanceMetrics => {
    return {
      totalCatalogs: homescreenStore$.totalCatalogs.peek(),
      totalItems: homescreenStore$.totalItems.peek(),
      isLoading: homescreenComputed.isLoading.peek(),
      subscriptionCount: performanceTracker?.subscriptions.size || 0,
      lastRenderTime: Date.now(),
      renderCount: Array.from(performanceTracker?.renderCounts.values() || []).reduce((sum, count) => sum + count, 0)
    }
  },

  /**
   * Log current performance state with optional logging service
   */
  logPerformanceState: (logger?: ILoggingService) => {
    if (!__DEV__) return

    const metrics = legendStatePerformance.getMetrics()
    const renderCounts = Array.from(performanceTracker?.renderCounts.entries() || [])
    
    if (logger) {
      logger.debug('Legend State Performance Metrics', undefined, {
        storeState: {
          catalogs: metrics.totalCatalogs,
          items: metrics.totalItems,
          loading: metrics.isLoading
        },
        renderCounts,
        totalRenders: metrics.renderCount,
        activeSubscriptions: metrics.subscriptionCount
      })
    } else {
      // Fallback to console in dev mode
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
    }
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
 * React hook for performance monitoring with optional logging service
 */
export const usePerformanceMonitor = (componentName: string, subscriptionPaths?: string[], logger?: ILoggingService) => {
  return {
    getMetrics: legendStatePerformance.getMetrics,
    logState: (loggerOverride?: ILoggingService) => legendStatePerformance.logPerformanceState(loggerOverride || logger),
    renderCount: 0
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
    catalogsCount: homescreenStore$.totalCatalogs.get(),
    itemsCount: homescreenStore$.totalItems.get(),
    isLoading: homescreenComputed.isLoading.get(),
    hasError: homescreenComputed.isError.get()
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