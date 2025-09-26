/**
 * Media Repository Interface - Domain Repository for Media Operations
 * 
 * Defines the contract for media data access operations following
 * the repository pattern in CLEAN architecture.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type { BasicCatalogItem, EnhancedCatalogItem } from '@/src/domain/entities/enhanced-catalog-item.entity'

/**
 * Repository interface for media operations
 */
export interface IMediaRepository {
  /**
   * Get basic catalog items for lists/grids
   */
  getBasicCatalogItems(request: {
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
  }>

  /**
   * Get detailed media information for a specific item
   */
  getMediaDetail(itemId: string, options?: {
    includeImages?: boolean
    includeVideos?: boolean
    includeRecommendations?: boolean
    forceRefresh?: boolean
  }): Promise<EnhancedCatalogItem>

  /**
   * Search for media items
   */
  searchMedia(query: string, options?: {
    contentType?: string
    page?: number
    limit?: number
    includeAdult?: boolean
  }): Promise<{
    items: BasicCatalogItem[]
    totalResults: number
    hasMore: boolean
  }>

  /**
   * Get similar or recommended media
   */
  getSimilarMedia(itemId: string, options?: {
    page?: number
    limit?: number
  }): Promise<BasicCatalogItem[]>

  /**
   * Check if media detail is cached and fresh
   */
  isMediaDetailCached(itemId: string): Promise<boolean>

  /**
   * Invalidate cache for specific media
   */
  invalidateMediaCache(itemId: string): Promise<void>

  /**
   * Clear all media cache
   */
  clearAllCache(): Promise<void>
}