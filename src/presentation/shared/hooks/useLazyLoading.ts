/**
 * Lazy Loading Utilities
 * 
 * Custom hooks for implementing viewport detection and progressive rendering
 * Optimizes performance by only rendering visible items and managing intersection
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Dimensions } from 'react-native'

export interface LazyLoadingConfig {
  /** Number of items to load initially */
  initialCount: number
  /** Number of items to load per batch */
  batchSize: number
  /** Threshold for triggering next batch (0-1) */
  threshold: number
  /** Delay before loading next batch (ms) */
  loadDelay: number
  /** Maximum items to load (-1 for unlimited) */
  maxItems: number
}

export interface LazyLoadingState {
  /** Current number of items to render */
  itemsToRender: number
  /** Whether currently loading more items */
  isLoading: boolean
  /** Whether all items have been loaded */
  hasMore: boolean
}

const DEFAULT_CONFIG: LazyLoadingConfig = {
  initialCount: 5,
  batchSize: 3,
  threshold: 0.8,
  loadDelay: 100,
  maxItems: -1
}

/**
 * Hook for managing lazy loading of list items
 * Provides progressive rendering with viewport-based loading
 */
export const useLazyLoading = (
  totalItems: number,
  config: Partial<LazyLoadingConfig> = {}
): LazyLoadingState & {
  loadMore: () => void
  reset: () => void
} => {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])
  const [itemsToRender, setItemsToRender] = useState(
    Math.min(finalConfig.initialCount, totalItems)
  )
  const [isLoading, setIsLoading] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const hasMore = itemsToRender < totalItems && 
    (finalConfig.maxItems === -1 || itemsToRender < finalConfig.maxItems)

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return

    setIsLoading(true)
    
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    loadingTimeoutRef.current = setTimeout(() => {
      const nextCount = Math.min(
        itemsToRender + finalConfig.batchSize,
        totalItems,
        finalConfig.maxItems === -1 ? totalItems : finalConfig.maxItems
      )
      setItemsToRender(nextCount)
      setIsLoading(false)
    }, finalConfig.loadDelay) as NodeJS.Timeout
  }, [hasMore, isLoading, itemsToRender, totalItems, finalConfig])

  const reset = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
    setItemsToRender(Math.min(finalConfig.initialCount, totalItems))
    setIsLoading(false)
  }, [finalConfig.initialCount, totalItems])

  // Reset when totalItems changes
  useEffect(() => {
    reset()
  }, [totalItems, reset])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  return {
    itemsToRender,
    isLoading,
    hasMore,
    loadMore,
    reset
  }
}

/**
 * Hook for viewport-based rendering detection
 * Tracks scroll position and calculates visible items
 */
export const useViewportDetection = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'))
  const [scrollPosition, setScrollPosition] = useState(0)
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })

    return () => subscription?.remove()
  }, [])

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize: size } = event.nativeEvent
    setScrollPosition(contentOffset.y)
    setContentSize(size)
  }, [])

  const isItemVisible = useCallback((itemIndex: number, itemHeight: number) => {
    const itemTop = itemIndex * itemHeight
    const itemBottom = itemTop + itemHeight
    const viewportTop = scrollPosition
    const viewportBottom = scrollPosition + dimensions.height

    // Add buffer zone for smooth loading
    const bufferZone = dimensions.height * 0.5
    
    return itemBottom >= (viewportTop - bufferZone) && 
           itemTop <= (viewportBottom + bufferZone)
  }, [scrollPosition, dimensions.height])

  return {
    dimensions,
    scrollPosition,
    contentSize,
    handleScroll,
    isItemVisible
  }
}

/**
 * Hook for progressive image loading with priority
 * Manages image loading priority based on visibility and user interaction
 */
export const useProgressiveImageLoading = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [priorityImages, setPriorityImages] = useState<Set<string>>(new Set())
  const loadingQueueRef = useRef<string[]>([])

  const markImageAsLoaded = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]))
  }, [])

  const setPriority = useCallback((imageId: string, isPriority: boolean) => {
    setPriorityImages(prev => {
      const next = new Set(prev)
      if (isPriority) {
        next.add(imageId)
      } else {
        next.delete(imageId)
      }
      return next
    })
  }, [])

  const shouldLoadImage = useCallback((imageId: string, index: number) => {
    // Always load priority images
    if (priorityImages.has(imageId)) return true
    
    // Load first few images immediately
    if (index < 3) return true
    
    // Load if already loaded
    if (loadedImages.has(imageId)) return true
    
    return false
  }, [priorityImages, loadedImages])

  const queueImageLoad = useCallback((imageId: string) => {
    if (!loadingQueueRef.current.includes(imageId)) {
      loadingQueueRef.current.push(imageId)
    }
  }, [])

  return {
    loadedImages,
    markImageAsLoaded,
    setPriority,
    shouldLoadImage,
    queueImageLoad
  }
}

/**
 * Performance monitoring for lazy loading
 * Tracks render times and optimization metrics
 */
export const useLazyLoadingPerformance = (componentName: string) => {
  const renderStartRef = useRef<number | undefined>(undefined)
  const renderCountRef = useRef<number>(0)

  const startRender = useCallback(() => {
    if (__DEV__) {
      renderStartRef.current = performance.now()
    }
  }, [])

  const endRender = useCallback(() => {
    if (__DEV__ && renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current
      renderCountRef.current += 1
      
      // Only log in development, no state updates to prevent re-renders
      if (renderCountRef.current <= 5) { // Only log first 5 renders to reduce noise
        console.log(`⚡ ${componentName} render: ${renderTime.toFixed(2)}ms`)
      }
      
      // Reset for next measurement
      renderStartRef.current = undefined
    }
  }, [componentName])

  return {
    startRender,
    endRender
  }
}