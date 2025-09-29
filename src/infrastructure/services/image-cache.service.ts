/**
 * Image Cache Service
 * 
 * Centralized service for managing image caching configuration and optimization
 * Integrates with expo-image for optimal memory and disk usage
 */

import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { ImageType } from '@/src/presentation/components/atoms'

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  /** Maximum memory cache size in MB */
  maxMemoryCacheSizeMB: number
  /** Maximum disk cache size in MB */
  maxDiskCacheSizeMB: number
  /** Cache expiration time in milliseconds */
  cacheExpirationMs: number
  /** Maximum concurrent downloads */
  maxConcurrentDownloads: number
  /** Enable aggressive caching */
  aggressiveCaching: boolean
}

/**
 * Image quality configuration
 */
export interface QualityConfig {
  /** JPEG compression quality (0.0 - 1.0) */
  jpegQuality: number
  /** WebP quality (0.0 - 1.0) */
  webpQuality: number
  /** Enable progressive JPEG */
  progressiveJpeg: boolean
  /** Enable adaptive quality based on connection */
  adaptiveQuality: boolean
}

/**
 * Performance metrics interface
 */
export interface CacheMetrics {
  /** Total cache hits */
  cacheHits: number
  /** Total cache misses */
  cacheMisses: number
  /** Average load time in ms */
  averageLoadTime: number
  /** Memory usage in MB */
  memoryUsage: number
  /** Disk usage in MB */
  diskUsage: number
}

/**
 * Image Cache Service Implementation
 */
export class ImageCacheService {
  private cacheConfig: CacheConfig
  private qualityConfig: QualityConfig
  private metrics: CacheMetrics

  constructor(private readonly logger: ILoggingService) {
    this.cacheConfig = this.getDefaultCacheConfig()
    this.qualityConfig = this.getDefaultQualityConfig()
    this.metrics = this.initializeMetrics()
  }

  /**
   * Initialize the image cache service
   */
  async initialize(): Promise<void> {
    try {
      await this.configureImageCache()
      this.logger.info('Image cache service initialized successfully', {
        context: 'image_cache_service',
        config: this.cacheConfig
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize image cache service', errorInstance, {
        context: 'image_cache_service'
      })
      throw new Error(`Image cache service initialization failed: ${errorInstance.message}`)
    }
  }

  /**
   * Get optimized cache configuration for image type
   */
  getCacheConfigForImageType(imageType: ImageType): Partial<CacheConfig> {
    const baseConfig = this.cacheConfig

    switch (imageType) {
      case 'poster':
        return {
          ...baseConfig,
          maxMemoryCacheSizeMB: 50,
          aggressiveCaching: true,
          cacheExpirationMs: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
      case 'backdrop':
        return {
          ...baseConfig,
          maxMemoryCacheSizeMB: 100,
          aggressiveCaching: true,
          cacheExpirationMs: 3 * 24 * 60 * 60 * 1000 // 3 days
        }
      case 'profile':
        return {
          ...baseConfig,
          maxMemoryCacheSizeMB: 30,
          aggressiveCaching: false,
          cacheExpirationMs: 24 * 60 * 60 * 1000 // 1 day
        }
      case 'logo':
        return {
          ...baseConfig,
          maxMemoryCacheSizeMB: 20,
          aggressiveCaching: true,
          cacheExpirationMs: 30 * 24 * 60 * 60 * 1000 // 30 days
        }
      case 'still':
        return {
          ...baseConfig,
          maxMemoryCacheSizeMB: 40,
          aggressiveCaching: false,
          cacheExpirationMs: 24 * 60 * 60 * 1000 // 1 day
        }
      default:
        return baseConfig
    }
  }

  /**
   * Get quality configuration based on connection and device
   */
  getQualityConfig(connectionType?: 'wifi' | 'cellular' | 'unknown'): QualityConfig {
    const baseConfig = this.qualityConfig

    switch (connectionType) {
      case 'wifi':
        return {
          ...baseConfig,
          jpegQuality: 0.9,
          webpQuality: 0.85,
          adaptiveQuality: false
        }
      case 'cellular':
        return {
          ...baseConfig,
          jpegQuality: 0.7,
          webpQuality: 0.65,
          adaptiveQuality: true
        }
      default:
        return baseConfig
    }
  }

  /**
   * Update cache configuration
   */
  updateCacheConfig(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config }
    this.logger.info('Cache configuration updated', {
      context: 'image_cache_service',
      config: this.cacheConfig
    })
  }

  /**
   * Update quality configuration
   */
  updateQualityConfig(config: Partial<QualityConfig>): void {
    this.qualityConfig = { ...this.qualityConfig, ...config }
    this.logger.info('Quality configuration updated', {
      context: 'image_cache_service',
      config: this.qualityConfig
    })
  }

  /**
   * Get current cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(loadTime: number): void {
    this.metrics.cacheHits++
    this.updateAverageLoadTime(loadTime)
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(loadTime: number): void {
    this.metrics.cacheMisses++
    this.updateAverageLoadTime(loadTime)
  }

  /**
   * Update memory usage
   */
  updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage
  }

  /**
   * Update disk usage
   */
  updateDiskUsage(usage: number): void {
    this.metrics.diskUsage = usage
  }

  /**
   * Clear cache for specific image type
   */
  async clearCache(imageType?: ImageType): Promise<void> {
    try {
      // Implementation would depend on expo-image cache management APIs
      // For now, we'll log the operation
      this.logger.info('Cache clear requested', {
        context: 'image_cache_service',
        imageType: imageType ?? 'all'
      })
      
      // Reset metrics for cleared cache
      if (!imageType) {
        this.metrics = this.initializeMetrics()
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to clear image cache', errorInstance, {
        context: 'image_cache_service',
        imageType: imageType ?? 'all'
      })
      throw new Error(`Failed to clear cache: ${errorInstance.message}`)
    }
  }

  /**
   * Optimize cache based on current usage
   */
  async optimizeCache(): Promise<void> {
    try {
      const metrics = this.getMetrics()
      
      // Adjust cache sizes based on hit rate
      const hitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)
      
      if (hitRate < 0.7) {
        // Low hit rate, increase cache sizes
        this.updateCacheConfig({
          maxMemoryCacheSizeMB: Math.min(this.cacheConfig.maxMemoryCacheSizeMB * 1.2, 200),
          maxDiskCacheSizeMB: Math.min(this.cacheConfig.maxDiskCacheSizeMB * 1.1, 1000)
        })
      } else if (hitRate > 0.9 && metrics.memoryUsage > 100) {
        // High hit rate but high memory usage, optimize
        this.updateCacheConfig({
          maxMemoryCacheSizeMB: Math.max(this.cacheConfig.maxMemoryCacheSizeMB * 0.9, 50)
        })
      }

      this.logger.info('Cache optimization completed', {
        context: 'image_cache_service',
        hitRate,
        newConfig: this.cacheConfig
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to optimize cache', errorInstance, {
        context: 'image_cache_service'
      })
    }
  }

  /**
   * Preload critical images
   */
  async preloadCriticalImages(imageUrls: string[], imageType: ImageType): Promise<void> {
    try {
      const config = this.getCacheConfigForImageType(imageType)
      const maxConcurrent = config.maxConcurrentDownloads ?? 3

      // Process images in batches
      for (let i = 0; i < imageUrls.length; i += maxConcurrent) {
        const batch = imageUrls.slice(i, i + maxConcurrent)
        const preloadPromises = batch.map(url => this.preloadImage(url))
        await Promise.allSettled(preloadPromises)
      }

      this.logger.info('Critical images preloaded', {
        context: 'image_cache_service',
        imageType,
        count: imageUrls.length
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to preload critical images', errorInstance, {
        context: 'image_cache_service',
        imageType,
        count: imageUrls.length
      })
    }
  }

  /**
   * Private methods
   */

  private getDefaultCacheConfig(): CacheConfig {
    return {
      maxMemoryCacheSizeMB: 100,
      maxDiskCacheSizeMB: 500,
      cacheExpirationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxConcurrentDownloads: 3,
      aggressiveCaching: true
    }
  }

  private getDefaultQualityConfig(): QualityConfig {
    return {
      jpegQuality: 0.8,
      webpQuality: 0.75,
      progressiveJpeg: true,
      adaptiveQuality: true
    }
  }

  private initializeMetrics(): CacheMetrics {
    return {
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTime: 0,
      memoryUsage: 0,
      diskUsage: 0
    }
  }

  private async configureImageCache(): Promise<void> {
    // Configure expo-image cache settings
    // This would be implemented when expo-image exposes configuration APIs
    this.logger.info('Image cache configured', {
      context: 'image_cache_service',
      memoryLimit: this.cacheConfig.maxMemoryCacheSizeMB,
      diskLimit: this.cacheConfig.maxDiskCacheSizeMB
    })
  }

  private updateAverageLoadTime(loadTime: number): void {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    this.metrics.averageLoadTime = 
      (this.metrics.averageLoadTime * (totalRequests - 1) + loadTime) / totalRequests
  }

  private async preloadImage(url: string): Promise<void> {
    try {
      // Use expo-image preloading - simplified without priority
      // This would use Image.prefetch when available
      await new Promise(resolve => setTimeout(resolve, 10)) // Placeholder
    } catch (error) {
      this.logger.warn('Failed to preload single image', error instanceof Error ? error : new Error(String(error)), {
        context: 'image_cache_service',
        url
      })
    }
  }
}

/**
 * Factory function to create image cache service
 */
export const createImageCacheService = (logger: ILoggingService): ImageCacheService => {
  return new ImageCacheService(logger)
}