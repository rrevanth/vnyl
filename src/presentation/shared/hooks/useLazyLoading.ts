/**
 * Lazy Loading Utilities
 * 
 * Custom hooks for implementing viewport detection and progressive rendering
 * Optimizes performance by only rendering visible items and managing intersection
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions } from 'react-native'


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
      renderCountRef.current += 1
      
      // Track render performance in development only
      
      // Reset for next measurement
      renderStartRef.current = undefined
    }
  }, [])

  return {
    startRender,
    endRender
  }
}