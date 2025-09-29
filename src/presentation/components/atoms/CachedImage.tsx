/**
 * CachedImage Component
 * 
 * Optimized image component using expo-image with comprehensive caching strategy
 * Supports progressive loading, error handling, and multiple image variants
 */

import React, { useState, useCallback, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Image, ImageStyle } from 'expo-image'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { useSafeImageCacheService } from '@/src/infrastructure/di/hooks'
import { scale } from 'react-native-size-matters'

/**
 * Image type variants for different use cases
 */
export type ImageType = 'poster' | 'backdrop' | 'profile' | 'logo' | 'still'

/**
 * Cache policy configuration
 */
export type CachePolicy = 'memory' | 'disk' | 'memory-disk' | 'none'

/**
 * Image quality levels
 */
export type ImageQuality = 'low' | 'medium' | 'high'

/**
 * Progressive loading states
 */
type LoadingState = 'loading' | 'loaded' | 'error'

/**
 * CachedImage component props
 */
export interface CachedImageProps {
  /** Image source URI */
  source: string | null | undefined
  /** Image type for optimized sizing and caching */
  imageType?: ImageType
  /** Cache policy for image storage */
  cachePolicy?: CachePolicy
  /** Image quality preference */
  quality?: ImageQuality
  /** Custom width (uses responsive scaling) */
  width?: number
  /** Custom height (uses responsive scaling) */
  height?: number
  /** Aspect ratio for responsive sizing */
  aspectRatio?: number
  /** Blur hash for progressive loading */
  blurHash?: string
  /** Fallback image URI */
  fallbackSource?: string
  /** Show loading indicator */
  showLoadingIndicator?: boolean
  /** Border radius */
  borderRadius?: number
  /** Custom styles */
  style?: ImageStyle
  /** Accessibility label */
  accessibilityLabel?: string
  /** Content fit mode */
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down'
  /** Transition duration in milliseconds */
  transitionDuration?: number
  /** Priority for loading (higher numbers load first) */
  priority?: number
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}

/**
 * Default blur hashes for different image types
 */
const DEFAULT_BLUR_HASHES: Record<ImageType, string> = {
  poster: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.',
  backdrop: 'L6PZfSi_1g4n9FRjgEtP0L%M9Gxu',
  profile: 'L8O|yT?w9FIU?bIUWBWB-;xuIUo{',
  logo: 'L03k~VxaU|M{00R%R5kC00M{aeIU',
  still: 'L6PZfSjb0L%M9FRjmQRP-;t60Koe'
}

/**
 * Default aspect ratios for different image types
 */
// Currently not used but kept for future responsive sizing features
// const DEFAULT_ASPECT_RATIOS: Record<ImageType, number> = {
//   poster: 2/3, // 2:3 ratio for movie posters
//   backdrop: 16/9, // 16:9 ratio for backdrops
//   profile: 2/3, // 2:3 ratio for profile images
//   logo: 1, // 1:1 ratio for logos
//   still: 16/9 // 16:9 ratio for stills
// }

/**
 * Default sizes for different image types
 */
const DEFAULT_SIZES: Record<ImageType, { width: number; height: number }> = {
  poster: { width: scale(140), height: scale(210) },
  backdrop: { width: scale(300), height: scale(169) },
  profile: { width: scale(100), height: scale(150) },
  logo: { width: scale(80), height: scale(80) },
  still: { width: scale(200), height: scale(113) }
}

/**
 * Memory cache configuration based on image type
 * Currently managed by ImageCacheService, but kept for reference
 */
// const MEMORY_CACHE_CONFIG: Record<ImageType, number> = {
//   poster: 50, // 50MB for posters
//   backdrop: 100, // 100MB for backdrops
//   profile: 30, // 30MB for profiles
//   logo: 20, // 20MB for logos
//   still: 40 // 40MB for stills
// }

export const CachedImage: React.FC<CachedImageProps> = observer(({
  source,
  imageType = 'poster',
  cachePolicy = 'memory-disk',
  quality = 'medium',
  width,
  height,
  aspectRatio,
  blurHash,
  fallbackSource,
  showLoadingIndicator = true,
  borderRadius,
  style,
  accessibilityLabel,
  contentFit = 'cover',
  transitionDuration = 300,
  priority = 0,
  onLoad,
  onError
}) => {
  const theme = useTheme()
  const imageCacheService = useSafeImageCacheService()
  const [loadingState, setLoadingState] = useState<LoadingState>('loading')
  const [loadStartTime, setLoadStartTime] = useState<number>(0)
  
  // Calculate dimensions
  const defaultSize = DEFAULT_SIZES[imageType]
  const finalWidth = width ?? defaultSize.width
  const finalHeight = height ?? (aspectRatio ? finalWidth / aspectRatio : defaultSize.height)
  
  // Get blur hash
  const finalBlurHash = blurHash ?? DEFAULT_BLUR_HASHES[imageType]
  
  // Create styles
  const styles = createStyles(theme, finalWidth, finalHeight, borderRadius)
  
  // Track load start time
  useEffect(() => {
    if (source && loadingState === 'loading') {
      setLoadStartTime(performance.now())
    }
  }, [source, loadingState])

  // Handle load success
  const handleLoad = useCallback(() => {
    const loadTime = performance.now() - loadStartTime
    setLoadingState('loaded')
    
    // Record cache hit/miss with load time
    if (imageCacheService && loadTime > 0) {
      // If load time is very fast (< 50ms), likely a cache hit
      if (loadTime < 50) {
        imageCacheService.recordCacheHit(loadTime)
      } else {
        imageCacheService.recordCacheMiss(loadTime)
      }
    }
    
    onLoad?.()
  }, [onLoad, imageCacheService, loadStartTime])
  
  // Handle load error
  const handleError = useCallback(() => {
    const loadTime = performance.now() - loadStartTime
    setLoadingState('error')
    
    // Record cache miss on error
    if (imageCacheService && loadTime > 0) {
      imageCacheService.recordCacheMiss(loadTime)
    }
    
    onError?.()
  }, [onError, imageCacheService, loadStartTime])
  
  // Cache configuration is managed internally by expo-image
  // Future enhancement: integrate with ImageCacheService for advanced caching
  // const cacheKey = source ? `${imageType}-${quality}-${source}` : undefined
  // const serviceConfig = imageCacheService?.getCacheConfigForImageType(imageType)
  
  // Get final image source
  const getImageSource = useCallback(() => {
    if (loadingState === 'error' && fallbackSource) {
      return { uri: fallbackSource }
    }
    if (source) {
      return { uri: source }
    }
    return null
  }, [source, fallbackSource, loadingState])
  
  const imageSource = getImageSource()
  
  // Configure placeholder based on loading state and blur hash
  const getPlaceholder = useCallback(() => {
    if (finalBlurHash && loadingState === 'loading') {
      return { blurhash: finalBlurHash }
    }
    return undefined
  }, [finalBlurHash, loadingState])
  
  return (
    <View style={[styles.container, style]}>
      {imageSource && (
        <Image
          source={imageSource}
          style={styles.image}
          contentFit={contentFit}
          transition={transitionDuration}
          placeholder={getPlaceholder()}
          onLoad={handleLoad}
          onError={handleError}
          accessibilityLabel={accessibilityLabel}
        />
      )}
      
      {/* Loading indicator */}
      {showLoadingIndicator && loadingState === 'loading' && !finalBlurHash && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={theme.colors.interactive.primary}
          />
        </View>
      )}
      
      {/* Error state fallback */}
      {loadingState === 'error' && !fallbackSource && (
        <View style={styles.errorContainer}>
          <View style={styles.errorPlaceholder} />
        </View>
      )}
    </View>
  )
})

const createStyles = (
  theme: Theme,
  width: number,
  height: number,
  borderRadius?: number
) => StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: borderRadius ?? theme.radius.md,
    overflow: 'hidden',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary
  },
  errorPlaceholder: {
    width: scale(40),
    height: scale(40),
    backgroundColor: theme.colors.border.secondary,
    borderRadius: theme.radius.sm,
    opacity: 0.5
  }
})

/**
 * Pre-configured image components for common use cases
 */

export const PosterImage: React.FC<Omit<CachedImageProps, 'imageType'>> = (props) => (
  <CachedImage {...props} imageType="poster" />
)

export const BackdropImage: React.FC<Omit<CachedImageProps, 'imageType'>> = (props) => (
  <CachedImage {...props} imageType="backdrop" />
)

export const ProfileImage: React.FC<Omit<CachedImageProps, 'imageType'>> = (props) => (
  <CachedImage {...props} imageType="profile" />
)

export const LogoImage: React.FC<Omit<CachedImageProps, 'imageType'>> = (props) => (
  <CachedImage {...props} imageType="logo" />
)

export const StillImage: React.FC<Omit<CachedImageProps, 'imageType'>> = (props) => (
  <CachedImage {...props} imageType="still" />
)

/**
 * Image caching utility functions
 */
export class ImageCacheManager {
  /**
   * Clear memory cache for specific image type
   */
  static async clearMemoryCache(_imageType?: ImageType): Promise<void> {
    try {
      // expo-image doesn't expose direct cache clearing APIs
      // This would be implemented when expo-image adds cache management
      console.warn('Image cache clearing not yet implemented')
    } catch (error) {
      console.error('Failed to clear image cache:', error)
    }
  }
  
  /**
   * Get cache size for specific image type
   */
  static async getCacheSize(_imageType?: ImageType): Promise<number> {
    // expo-image doesn't expose cache size APIs yet
    // This would be implemented when expo-image adds cache introspection
    return 0
  }
  
  /**
   * Preload images for better performance
   */
  static async preloadImages(imageUrls: string[]): Promise<void> {
    try {
      // Use expo-image preloading
      const preloadPromises = imageUrls.map(url => 
        Image.prefetch(url)
      )
      await Promise.allSettled(preloadPromises)
    } catch (error) {
      console.error('Failed to preload images:', error)
    }
  }
}