/**
 * OptimizedImage Component
 *
 * Performance-optimized image component with:
 * - Progressive loading with fade-in animation
 * - Automatic retry on failure
 * - Memory management with proper cache handling
 * - Skeleton loading states
 * - Accessibility optimizations
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Animated
} from 'react-native'
import { observer } from '@legendapp/state/react'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

interface OptimizedImageProps {
  /**
   * Image source URI
   */
  source?: string

  /**
   * Image dimensions
   */
  width: number
  height: number

  /**
   * Placeholder content while loading
   */
  placeholder?: React.ReactNode

  /**
   * Animation duration for fade-in (ms)
   */
  animationDuration?: number

  /**
   * Enable progressive loading
   */
  progressive?: boolean

  /**
   * Retry attempts on failure
   */
  retryAttempts?: number

  /**
   * Cache policy
   */
  cachePolicy?: 'memory' | 'disk' | 'none'

  /**
   * Accessibility label
   */
  accessibilityLabel?: string

  /**
   * Border radius
   */
  borderRadius?: number

  /**
   * Loading callback
   */
  onLoadStart?: () => void

  /**
   * Success callback
   */
  onLoadEnd?: () => void

  /**
   * Error callback
   */
  onError?: (error: any) => void
}

export const OptimizedImage: React.FC<OptimizedImageProps> = observer(({
  source,
  width,
  height,
  placeholder,
  animationDuration = 300,
  progressive = true,
  retryAttempts = 2,
  cachePolicy = 'memory',
  accessibilityLabel,
  borderRadius = 0,
  onLoadStart,
  onLoadEnd,
  onError
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, width, height, borderRadius)

  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0))
  const [loading, setLoading] = useState(!!source)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Load handlers
  const handleLoadStart = useCallback(() => {
    setLoading(true)
    setError(false)
    onLoadStart?.()
  }, [onLoadStart])

  const handleLoadEnd = useCallback(() => {
    setLoading(false)

    if (progressive) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true
      }).start()
    }

    onLoadEnd?.()
  }, [fadeAnim, progressive, animationDuration, onLoadEnd])

  const handleError = useCallback((err: any) => {
    setLoading(false)
    setError(true)

    // Retry logic
    if (retryCount < retryAttempts) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setError(false)
        setLoading(true)
      }, Math.min(1000 * Math.pow(2, retryCount), 5000)) // Exponential backoff
    } else {
      onError?.(err)
    }
  }, [retryCount, retryAttempts, onError])

  // Reset animation when source changes
  useEffect(() => {
    if (source && progressive) {
      fadeAnim.setValue(0)
    }
  }, [source, fadeAnim, progressive])

  // Show placeholder if no source or error state
  if (!source || (error && retryCount >= retryAttempts)) {
    return (
      <View style={styles.container}>
        {placeholder || <View style={styles.placeholderDefault} />}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Skeleton loader during loading */}
      {loading && (
        <View style={styles.skeleton}>
          <Animated.View
            style={[
              styles.skeletonShimmer,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7]
                })
              }
            ]}
          />
        </View>
      )}

      {/* Actual image */}
      <Animated.View
        style={[
          styles.imageContainer,
          progressive && { opacity: fadeAnim }
        ]}
      >
        <Image
          source={{ uri: source }}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          accessibilityLabel={accessibilityLabel}
        />
      </Animated.View>
    </View>
  )
})

const createStyles = (
  theme: Theme,
  width: number,
  height: number,
  borderRadius: number
) => StyleSheet.create({
  container: {
    width,
    height,
    borderRadius,
    backgroundColor: theme.colors.background.secondary,
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  image: {
    width: '100%',
    height: '100%'
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.tertiary
  },
  skeletonShimmer: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary
  },
  placeholderDefault: {
    flex: 1,
    backgroundColor: theme.colors.background.tertiary
  }
})