/**
 * Catalog Context Entity
 * 
 * Complete context information for catalog sources, including provider details,
 * pagination state, and metadata for full traceability.
 */

export interface CatalogContext {
  /** Provider identification */
  readonly providerId: string
  readonly providerName: string
  
  /** Catalog identification */
  readonly catalogId: string
  readonly catalogName: string
  /** Provider-specific catalog type (e.g., 'movie', 'tv', 'trending_movies') */
  readonly catalogType: string
  
  /** Complete pagination information */
  readonly pageInfo: PageInfo
  
  /** Optional filters applied to this catalog */
  readonly filters?: Record<string, unknown>
  
  /** Tracking information */
  readonly lastFetchAt: Date
  readonly requestId: string
  
  /** Provider-specific metadata */
  readonly metadata?: Record<string, unknown>
}

export interface PageInfo {
  /** Current page number (1-based) */
  readonly currentPage: number
  
  /** Total pages available (if known) */
  readonly totalPages?: number
  
  /** Total items available (if known) */
  readonly totalItems?: number
  
  /** Whether more pages are available */
  readonly hasMorePages: boolean
  
  /** Items per page */
  readonly pageSize: number
}

/**
 * Utility functions for working with CatalogContext
 */
export class CatalogContextUtils {
  /**
   * Creates a unique identifier for a catalog context
   */
  static createId(context: CatalogContext): string {
    return `${context.providerId}-${context.catalogId}-${context.pageInfo.currentPage}`
  }
  
  /**
   * Checks if pagination information indicates more pages are available
   */
  static hasMorePages(context: CatalogContext): boolean {
    return context.pageInfo.hasMorePages
  }
  
  /**
   * Creates context for the next page
   */
  static createNextPageContext(context: CatalogContext): CatalogContext {
    return {
      ...context,
      pageInfo: {
        ...context.pageInfo,
        currentPage: context.pageInfo.currentPage + 1,
        hasMorePages: context.pageInfo.totalPages 
          ? (context.pageInfo.currentPage + 1) < context.pageInfo.totalPages 
          : true // Assume more pages if totalPages unknown
      },
      lastFetchAt: new Date(),
      requestId: `${context.providerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }
  
  /**
   * Updates pagination info in context
   */
  static updatePageInfo(context: CatalogContext, pageInfo: Partial<PageInfo>): CatalogContext {
    return {
      ...context,
      pageInfo: {
        ...context.pageInfo,
        ...pageInfo
      },
      lastFetchAt: new Date()
    }
  }
}