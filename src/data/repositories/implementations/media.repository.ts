/**
 * Media Repository Implementation - Data Layer for Media Operations
 * 
 * Implements media data access using the provider system and local caching.
 * Follows CLEAN architecture repository pattern with dependency injection.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type { IMediaRepository } from '@/src/domain/repositories/media.repository.interface'
import type { ILoggingService, IStorageService } from '@/src/domain/services'
import type { GetBasicCatalogItemsUseCase } from '@/src/domain/usecases/get-basic-catalog-items.usecase'
import type { MediaDetailUseCase } from '@/src/domain/use-cases/media-detail.use-case'
import type { BasicCatalogItem, EnhancedCatalogItem } from '@/src/domain/entities/enhanced-catalog-item.entity'

const CACHE_KEYS = {
  CATALOG_ITEMS: 'vnyl_catalog_items',
  MEDIA_DETAIL: 'vnyl_media_detail',
  SEARCH_RESULTS: 'vnyl_search_results'
} as const

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  CATALOG_TTL: 15 * 60 * 1000, // 15 minutes
  DETAIL_TTL: 60 * 60 * 1000, // 1 hour
  SEARCH_TTL: 10 * 60 * 1000, // 10 minutes
  MAX_CACHE_SIZE: 100 // Maximum cached items per type
} as const

/**
 * Cached data structure
 */
interface CacheEntry<T> {
  data: T
  cachedAt: number
  expiresAt: number
  key: string
}

/**
 * Media Repository Implementation
 * 
 * Coordinates between use cases and provides caching layer for performance.
 */
export class MediaRepository implements IMediaRepository {
  constructor(
    private readonly catalogItemsUseCase: GetBasicCatalogItemsUseCase,
    private readonly mediaDetailUseCase: MediaDetailUseCase,
    private readonly storageService: IStorageService,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Get basic catalog items with caching
   */
  async getBasicCatalogItems(request: {
    catalogType: string
    contentType?: string
    page?: number
    limit?: number
    region?: string
    language?: string
    genre?: string
    year?: number
  }): Promise<{
    items: BasicCatalogItem[]
    totalItems: number
    hasMore: boolean
  }> {
    try {
      const cacheKey = this.generateCatalogCacheKey(request)
      
      // Try to get from cache first
      const cachedData = await this.getCachedData<{
        items: BasicCatalogItem[]
        totalItems: number
        hasMore: boolean
      }>(CACHE_KEYS.CATALOG_ITEMS, cacheKey)

      if (cachedData) {
        this.logger.debug('Returning cached catalog items', undefined, { cacheKey })
        return cachedData
      }

      // Load from use case
      this.logger.info('Loading catalog items from providers', request)
      const result = await this.catalogItemsUseCase.execute(request)
      
      const responseData = {
        items: result.items,
        totalItems: result.totalItems,
        hasMore: result.hasMore
      }

      // Cache the result
      await this.setCachedData(
        CACHE_KEYS.CATALOG_ITEMS,
        cacheKey,
        responseData,
        CACHE_CONFIG.CATALOG_TTL
      )

      this.logger.info('Catalog items loaded and cached', {
        itemCount: result.items.length,
        totalItems: result.totalItems,
        hasMore: result.hasMore,
        cacheKey
      })

      return responseData

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Failed to get catalog items', error instanceof Error ? error : new Error(String(error)), { request: JSON.stringify(request) })
      throw new Error(`Failed to get catalog items: ${errorMessage}`)
    }
  }

  /**
   * Get detailed media information with caching
   */
  async getMediaDetail(itemId: string, options?: {
    includeImages?: boolean
    includeVideos?: boolean
    includeRecommendations?: boolean
    forceRefresh?: boolean
  }): Promise<EnhancedCatalogItem> {
    try {
      const cacheKey = `${itemId}-${JSON.stringify(options || {})}`
      
      // Check cache unless force refresh is requested
      if (!options?.forceRefresh) {
        const cachedData = await this.getCachedData<EnhancedCatalogItem>(
          CACHE_KEYS.MEDIA_DETAIL,
          cacheKey
        )

        if (cachedData) {
          this.logger.debug('Returning cached media detail', undefined, { itemId, cacheKey })
          return cachedData
        }
      }

      // Load from use case - we need to convert itemId to BasicCatalogItem
      // For now, create a minimal BasicCatalogItem structure
      const basicItem: BasicCatalogItem = {
        id: itemId,
        mediaType: 'movie', // Default - should be determined from context
        name: '', // Will be filled by provider
        providerInfo: {
          providerId: 'unknown',
          providerMediaId: itemId,
          mediaType: 'movie'
        },
        enhancementLevel: 'basic'
      }

      this.logger.info('Loading media detail from providers', { itemId, options })
      const result = await this.mediaDetailUseCase.execute({
        catalogItem: basicItem,
        includeImages: options?.includeImages,
        includeVideos: options?.includeVideos,
        includeRecommendations: options?.includeRecommendations
      })

      // Cache the enhanced item
      await this.setCachedData(
        CACHE_KEYS.MEDIA_DETAIL,
        cacheKey,
        result.enhancedItem,
        CACHE_CONFIG.DETAIL_TTL
      )

      this.logger.info('Media detail loaded and cached', {
        itemId,
        enhancementLevel: result.enhancedItem.enhancementLevel,
        loadedCapabilities: result.loadedCapabilities,
        errorCount: result.errors.length,
        cacheKey
      })

      return result.enhancedItem

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Failed to get media detail', error instanceof Error ? error : new Error(String(error)), { itemId, options: JSON.stringify(options) })
      throw new Error(`Failed to get media detail: ${errorMessage}`)
    }
  }

  /**
   * Search for media items (basic implementation)
   */
  async searchMedia(query: string, options?: {
    contentType?: string
    page?: number
    limit?: number
    includeAdult?: boolean
  }): Promise<{
    items: BasicCatalogItem[]
    totalResults: number
    hasMore: boolean
  }> {
    try {
      const cacheKey = `${query}-${JSON.stringify(options || {})}`
      
      // Try cache first
      const cachedData = await this.getCachedData<{
        items: BasicCatalogItem[]
        totalResults: number
        hasMore: boolean
      }>(CACHE_KEYS.SEARCH_RESULTS, cacheKey)

      if (cachedData) {
        this.logger.debug('Returning cached search results', undefined, { query, cacheKey })
        return cachedData
      }

      // For now, search using catalog with search-like parameters
      // TODO: Implement dedicated search capability in provider system
      const searchResult = await this.catalogItemsUseCase.execute({
        catalogType: 'search',
        contentType: options?.contentType,
        page: options?.page,
        limit: options?.limit
      })

      const responseData = {
        items: searchResult.items,
        totalResults: searchResult.totalItems,
        hasMore: searchResult.hasMore
      }

      // Cache search results
      await this.setCachedData(
        CACHE_KEYS.SEARCH_RESULTS,
        cacheKey,
        responseData,
        CACHE_CONFIG.SEARCH_TTL
      )

      return responseData

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Failed to search media', error instanceof Error ? error : new Error(String(error)), { query, options: JSON.stringify(options) })
      throw new Error(`Failed to search media: ${errorMessage}`)
    }
  }

  /**
   * Get similar media (placeholder implementation)
   */
  async getSimilarMedia(itemId: string, options?: {
    page?: number
    limit?: number
  }): Promise<BasicCatalogItem[]> {
    try {
      // TODO: Implement similar media capability in provider system
      this.logger.info('Getting similar media (placeholder)', { itemId, options })
      return []
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Failed to get similar media', error instanceof Error ? error : new Error(String(error)), { itemId, options: JSON.stringify(options) })
      throw new Error(`Failed to get similar media: ${errorMessage}`)
    }
  }

  /**
   * Check if media detail is cached and fresh
   */
  async isMediaDetailCached(itemId: string): Promise<boolean> {
    try {
      const cache = await this.getCache(CACHE_KEYS.MEDIA_DETAIL)
      const now = Date.now()
      
      for (const [key, entry] of Object.entries(cache)) {
        if (key.startsWith(itemId) && entry.expiresAt > now) {
          return true
        }
      }
      
      return false
    } catch (error) {
      this.logger.warn('Failed to check media detail cache', undefined, { itemId, error: String(error) })
      return false
    }
  }

  /**
   * Invalidate cache for specific media
   */
  async invalidateMediaCache(itemId: string): Promise<void> {
    try {
      this.logger.info('Invalidating media cache', { itemId })
      
      // Remove from media detail cache
      const detailCache = await this.getCache(CACHE_KEYS.MEDIA_DETAIL)
      const updatedDetailCache: Record<string, any> = {}
      
      for (const [key, entry] of Object.entries(detailCache)) {
        if (!key.startsWith(itemId)) {
          updatedDetailCache[key] = entry
        }
      }
      
      await this.storageService.setItem(
        CACHE_KEYS.MEDIA_DETAIL,
        JSON.stringify(updatedDetailCache)
      )
      
      this.logger.debug('Media cache invalidated', undefined, { itemId })
    } catch (error) {
      this.logger.error('Failed to invalidate media cache', error instanceof Error ? error : new Error(String(error)), { itemId })
    }
  }

  /**
   * Clear all media cache
   */
  async clearAllCache(): Promise<void> {
    try {
      this.logger.info('Clearing all media cache')
      
      await Promise.allSettled([
        this.storageService.removeItem(CACHE_KEYS.CATALOG_ITEMS),
        this.storageService.removeItem(CACHE_KEYS.MEDIA_DETAIL),
        this.storageService.removeItem(CACHE_KEYS.SEARCH_RESULTS)
      ])
      
      this.logger.info('All media cache cleared')
    } catch (error) {
      this.logger.error('Failed to clear media cache', error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Generate cache key for catalog requests
   */
  private generateCatalogCacheKey(request: any): string {
    const keyParts = [
      request.catalogType,
      request.contentType || 'movie',
      request.page || 1,
      request.limit || 20,
      request.region || 'US',
      request.language || 'en',
      request.genre || '',
      request.year || ''
    ]
    
    return keyParts.join('-')
  }

  /**
   * Get cached data with expiration check
   */
  private async getCachedData<T>(
    cacheType: string,
    key: string
  ): Promise<T | null> {
    try {
      const cache = await this.getCache(cacheType)
      const entry = cache[key] as CacheEntry<T>
      
      if (entry && entry.expiresAt > Date.now()) {
        return entry.data
      }
      
      return null
    } catch (error) {
      this.logger.debug('Failed to get cached data', undefined, { cacheType, key, error: String(error) })
      return null
    }
  }

  /**
   * Set cached data with expiration
   */
  private async setCachedData<T>(
    cacheType: string,
    key: string,
    data: T,
    ttl: number
  ): Promise<void> {
    try {
      const cache = await this.getCache(cacheType)
      const now = Date.now()
      
      // Clean expired entries and enforce size limit
      const cleanedCache = this.cleanCache(cache, now)
      
      // Add new entry
      const entry: CacheEntry<T> = {
        data,
        cachedAt: now,
        expiresAt: now + ttl,
        key
      }
      
      cleanedCache[key] = entry
      
      // Enforce cache size limit
      const limitedCache = this.enforceCacheSizeLimit(
        cleanedCache,
        CACHE_CONFIG.MAX_CACHE_SIZE
      )
      
      await this.storageService.setItem(
        cacheType,
        JSON.stringify(limitedCache)
      )
    } catch (error) {
      this.logger.warn('Failed to set cached data', undefined, { cacheType, key, error: String(error) })
    }
  }

  /**
   * Get cache object for a cache type
   */
  private async getCache(cacheType: string): Promise<Record<string, any>> {
    try {
      const cacheData = await this.storageService.getItem(cacheType)
      return cacheData ? JSON.parse(cacheData) : {}
    } catch (error) {
      this.logger.debug('Failed to get cache', undefined, { cacheType, error: String(error) })
      return {}
    }
  }

  /**
   * Clean expired entries from cache
   */
  private cleanCache(cache: Record<string, any>, now: number): Record<string, any> {
    const cleaned: Record<string, any> = {}
    
    for (const [key, entry] of Object.entries(cache)) {
      if (entry.expiresAt > now) {
        cleaned[key] = entry
      }
    }
    
    return cleaned
  }

  /**
   * Enforce cache size limit by removing oldest entries
   */
  private enforceCacheSizeLimit(
    cache: Record<string, any>,
    maxSize: number
  ): Record<string, any> {
    const entries = Object.entries(cache)
    
    if (entries.length <= maxSize) {
      return cache
    }
    
    // Sort by cachedAt timestamp (oldest first)
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt)
    
    // Keep only the most recent entries
    const limitedEntries = entries.slice(-maxSize)
    
    return Object.fromEntries(limitedEntries)
  }
}