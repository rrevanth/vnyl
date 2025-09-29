/**
 * Catalog entity for organizing and managing collections of media items
 * Clean implementation focused on provider registry architecture
 */

import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { CatalogContext } from '@/src/domain/entities/context/catalog-context.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Catalog entity
 * Represents a collection of media items with essential metadata and organization
 */
export interface Catalog {
  /** Unique catalog identifier (UUID) */
  readonly id: string

  /** Display name for users */
  readonly name: string

  /** Primary media type for this catalog */
  readonly mediaType: MediaType

  /** Media items in this catalog */
  readonly items: CatalogItem[]

  /** Pagination information */
  readonly pagination: PaginationInfo

  /** Provider context for complete traceability */
  readonly catalogContext: CatalogContext

  /** Catalog metadata */
  readonly metadata: CatalogMetadata

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date
}

/**
 * Simple pagination information for catalog results
 */
export interface PaginationInfo {
  /** Current page number (1-based) */
  readonly page: number

  /** Total number of pages */
  readonly totalPages?: number

  /** Total number of items across all pages */
  readonly totalItems?: number

  /** Whether there are more pages available */
  readonly hasMore: boolean
}

/**
 * Simple catalog metadata
 */
export interface CatalogMetadata {
  /** Data fetch time in milliseconds */
  readonly fetchTime: number

  /** Cache hit/miss indicator */
  readonly cacheHit: boolean

  /** Number of items in this page */
  readonly itemCount: number

  /** Data quality score (0-1) */
  readonly quality?: number
}

/**
 * Catalog utilities
 */
export class CatalogUtils {
  /**
   * Creates a unique catalog ID
   * @param catalogType - Type of catalog
   * @param providerId - Provider identifier
   * @param additionalParams - Additional parameters for uniqueness
   * @returns Unique catalog ID
   */
  static createCatalogId(
    catalogType: string,
    providerId: string,
    additionalParams?: Record<string, string | number>
  ): string {
    const timestamp = Date.now()
    const params = additionalParams ? Object.entries(additionalParams).map(([k, v]) => `${k}:${v}`).join('_') : ''
    const suffix = params ? `_${params}` : ''
    
    return `catalog_${catalogType}_${providerId}_${timestamp}${suffix}`
  }

  /**
   * Calculates pagination info
   * @param totalItems - Total number of items
   * @param currentPage - Current page number (1-based)
   * @param itemsPerPage - Items per page
   * @returns Pagination information
   */
  static calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const hasMore = currentPage < totalPages

    return {
      page: currentPage,
      totalPages,
      totalItems,
      hasMore
    }
  }

  /**
   * Checks if catalog data is fresh
   * @param catalog - Catalog to check
   * @param maxAgeSeconds - Maximum age in seconds
   * @returns Whether catalog is fresh
   */
  static isCatalogFresh(catalog: Catalog, maxAgeSeconds: number): boolean {
    const now = new Date()
    const ageSeconds = (now.getTime() - catalog.updatedAt.getTime()) / 1000
    return ageSeconds <= maxAgeSeconds
  }
}