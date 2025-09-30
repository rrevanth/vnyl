/**
 * LoadMoreFilmographyUseCase
 * 
 * Handles pagination for specific filmography catalogs with complete context preservation.
 * Supports loading additional pages while maintaining catalog state and traceability.
 * 
 * This use case follows the same pattern as LoadMoreRecommendationsUseCase and LoadMorePeopleUseCase
 * but is specifically designed for person filmography pagination.
 */

import { PersonCatalogItem, CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog, PaginationInfo } from '@/src/domain/entities/media/catalog.entity'
import { CatalogContext } from '@/src/domain/entities/context/catalog-context.entity'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { IFilmographyProvider } from '@/src/domain/providers/filmography/filmography-provider.interface'
import { ILoggingService } from '@/src/domain/services'

/**
 * Input parameters for LoadMoreFilmographyUseCase
 */
export interface LoadMoreFilmographyRequest {
  /** The provider ID that owns the catalog */
  readonly providerId: string
  
  /** The catalog ID to load more items for */
  readonly catalogId: string
  
  /** The full catalog object with context (optional - if not provided, will be looked up) */
  readonly catalog?: Catalog
  
  /** The original person the filmography is based on */
  readonly originalPerson: PersonCatalogItem
  
  /** The page number to load (1-based) */
  readonly page: number
  
  /** Number of items per page (default: 20) */
  readonly limit?: number
  
  /** Original catalog context for preservation */
  readonly originalCatalogContext?: CatalogContext
  
  /** Original pagination info for validation */
  readonly originalPagination?: PaginationInfo
}

/**
 * Result type for LoadMoreFilmographyUseCase
 */
export interface LoadMoreFilmographyResult {
  /** New catalog items from the requested page */
  readonly items: CatalogItem[]
  
  /** Updated pagination information */
  readonly pagination: PaginationInfo
  
  /** Preserved catalog context with updated metadata */
  readonly catalogContext: CatalogContext
  
  /** Load performance metrics */
  readonly metrics: LoadMetrics
  
  /** Request context for traceability */
  readonly requestId: string
  
  /** Whether this is the last page */
  readonly isLastPage: boolean
}

/**
 * Performance metrics for load operation
 */
export interface LoadMetrics {
  /** Execution time in milliseconds */
  readonly executionTime: number
  
  /** Provider lookup time in milliseconds */
  readonly providerLookupTime: number
  
  /** Catalog fetch time in milliseconds */
  readonly catalogFetchTime: number
  
  /** Number of items loaded */
  readonly itemsLoaded: number
  
  /** Whether the result was cached */
  readonly wasCached: boolean
}

export class LoadMoreFilmographyUseCase {
  constructor(
    private readonly filmographyProviders: IFilmographyProvider[],
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to load more filmography items
   */
  async execute(request: LoadMoreFilmographyRequest): Promise<LoadMoreFilmographyResult> {
    const requestId = `load-more-filmography-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    const limit = request.limit ?? 20

    try {
      this.logger.info('Starting LoadMoreFilmographyUseCase execution', {
        context: 'load_more_filmography_usecase',
        requestId,
        providerId: request.providerId,
        catalogId: request.catalogId,
        originalPersonId: request.originalPerson.id,
        page: request.page,
        limit
      })

      // Validate request parameters
      this.validateRequest(request, requestId)

      // Find the provider that owns this catalog
      const providerLookupStart = performance.now()
      const provider = this.findProviderById(request.providerId)
      const providerLookupTime = performance.now() - providerLookupStart

      if (!provider) {
        throw new Error(`Provider not found: ${request.providerId}`)
      }

      this.logger.debug('Found filmography provider', undefined, {
        context: 'load_more_filmography_usecase',
        requestId,
        providerId: provider.id,
        providerName: provider.name
      })

      // Ensure provider is initialized
      await this.ensureProviderInitialized(provider, requestId)

      // Load more items from the provider
      const catalogFetchStart = performance.now()
      
      // Use the catalog object for load more operation
      if (!request.catalog) {
        throw new Error('Catalog object is required for load more operation')
      }
      const items = await provider.loadMoreItems(
        request.catalog, 
        request.originalPerson, 
        request.page, 
        limit
      )
      const catalogFetchTime = performance.now() - catalogFetchStart

      this.logger.debug('Successfully loaded filmography items', undefined, {
        context: 'load_more_filmography_usecase',
        requestId,
        providerId: provider.id,
        catalogId: request.catalogId,
        itemCount: items.length,
        fetchTime: Math.round(catalogFetchTime)
      })

      // Get the full filmography to extract updated pagination info
      // This is necessary to get accurate pagination metadata
      const fullFilmography = await provider.getFilmography(
        request.originalPerson, 
        { page: request.page, limit }
      )
      
      // Find the matching catalog from the filmography
      const catalogs = Array.isArray(fullFilmography) ? fullFilmography : fullFilmography.filmography || []
      const fullCatalog = catalogs.find(
        catalog => catalog.id === request.catalogId
      )
      
      if (!fullCatalog) {
        throw new Error(`Catalog not found in filmography: ${request.catalogId}`)
      }

      // Create preserved catalog context
      const catalogContext = this.createPreservedCatalogContext(
        fullCatalog.catalogContext,
        request.originalCatalogContext,
        requestId
      )

      // Validate pagination consistency
      this.validatePaginationConsistency(
        fullCatalog.pagination,
        request.originalPagination,
        request.page,
        requestId
      )

      const executionTime = performance.now() - startTime
      const isLastPage = !fullCatalog.pagination.hasMore

      const metrics: LoadMetrics = {
        executionTime,
        providerLookupTime,
        catalogFetchTime,
        itemsLoaded: items.length,
        wasCached: false // For now, always false - implement caching later
      }

      this.logger.info('LoadMoreFilmographyUseCase execution completed', {
        context: 'load_more_filmography_usecase',
        requestId,
        itemsLoaded: items.length,
        isLastPage,
        executionTime: Math.round(executionTime)
      })

      return {
        items,
        pagination: fullCatalog.pagination,
        catalogContext,
        metrics,
        requestId,
        isLastPage
      }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const executionTime = performance.now() - startTime

      this.logger.error('LoadMoreFilmographyUseCase execution failed', errorInstance, {
        context: 'load_more_filmography_usecase',
        requestId,
        providerId: request.providerId,
        catalogId: request.catalogId,
        originalPersonId: request.originalPerson?.id,
        page: request.page,
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to load more filmography items: ${errorInstance.message}`)
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: LoadMoreFilmographyRequest, requestId: string): void {
    if (!request.providerId?.trim()) {
      throw new Error('Provider ID is required')
    }

    if (!request.catalogId?.trim()) {
      throw new Error('Catalog ID is required')
    }

    if (!request.originalPerson) {
      throw new Error('Original person is required')
    }

    if (!Number.isInteger(request.page) || request.page < 1) {
      throw new Error('Page must be a positive integer')
    }

    if (request.limit !== undefined && (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 100)) {
      throw new Error('Limit must be a positive integer between 1 and 100')
    }

    this.logger.debug('Request validation passed', undefined, {
      context: 'load_more_filmography_usecase',
      requestId,
      providerId: request.providerId,
      catalogId: request.catalogId,
      originalPersonId: request.originalPerson.id,
      page: request.page,
      limit: request.limit ?? 20
    })
  }

  /**
   * Finds a provider by its ID that supports filmography capability
   */
  private findProviderById(providerId: string): IFilmographyProvider | null {
    const provider = this.filmographyProviders.find(provider => provider.id === providerId)
    
    if (!provider) {
      return null
    }

    // Verify the provider supports filmography capability
    if (!provider.capabilities.includes(ProviderCapability.FILMOGRAPHY)) {
      this.logger.warn('Provider does not support filmography capability', undefined, {
        context: 'load_more_filmography_usecase',
        providerId: provider.id,
        capabilities: provider.capabilities
      })
      return null
    }

    return provider
  }

  /**
   * Ensures the provider is properly initialized
   */
  private async ensureProviderInitialized(provider: IFilmographyProvider, requestId: string): Promise<void> {
    try {
      await provider.initialize()
      this.logger.debug('Provider initialization confirmed', undefined, {
        context: 'load_more_filmography_usecase',
        requestId,
        providerId: provider.id
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Provider initialization failed', errorInstance, {
        context: 'load_more_filmography_usecase',
        requestId,
        providerId: provider.id
      })
      throw new Error(`Failed to initialize provider ${provider.id}: ${errorInstance.message}`)
    }
  }

  /**
   * Creates a preserved catalog context with updated metadata
   */
  private createPreservedCatalogContext(
    currentContext: CatalogContext,
    originalContext: CatalogContext | undefined,
    requestId: string
  ): CatalogContext {
    // Use original context as base if provided, otherwise use current
    const baseContext = originalContext || currentContext

    return {
      ...baseContext,
      pageInfo: currentContext.pageInfo, // Always use current page info
      lastFetchAt: new Date(), // Update fetch time
      requestId // Update request ID for traceability
    }
  }

  /**
   * Validates pagination consistency between original and current state
   */
  private validatePaginationConsistency(
    currentPagination: PaginationInfo,
    originalPagination: PaginationInfo | undefined,
    requestedPage: number,
    requestId: string
  ): void {
    // Ensure the current page matches what was requested
    if (currentPagination.page !== requestedPage) {
      this.logger.warn('Pagination page mismatch', undefined, {
        context: 'load_more_filmography_usecase',
        requestId,
        requested: requestedPage,
        received: currentPagination.page
      })
    }

    // If we have original pagination, validate consistency
    if (originalPagination) {
      // Total items and pages can fluctuate in live APIs, only warn for significant decreases
      const itemsDiff = originalPagination.totalItems && currentPagination.totalItems ? 
        originalPagination.totalItems - currentPagination.totalItems : 0
      const pagesDiff = originalPagination.totalPages && currentPagination.totalPages ? 
        originalPagination.totalPages - currentPagination.totalPages : 0

      // Only warn if decrease is significant (>5% or >50 items)
      if (itemsDiff > 50 || (originalPagination.totalItems && itemsDiff > originalPagination.totalItems * 0.05)) {
        this.logger.warn('Significant total items decrease detected', undefined, {
          context: 'load_more_filmography_usecase',
          requestId,
          original: originalPagination.totalItems,
          current: currentPagination.totalItems,
          difference: itemsDiff
        })
      } else if (itemsDiff > 0) {
        this.logger.debug('Minor total items fluctuation (normal for live APIs)', undefined, {
          context: 'load_more_filmography_usecase',
          requestId,
          original: originalPagination.totalItems,
          current: currentPagination.totalItems,
          difference: itemsDiff
        })
      }

      // Only warn for significant page decreases
      if (pagesDiff > 2 || (originalPagination.totalPages && pagesDiff > originalPagination.totalPages * 0.1)) {
        this.logger.warn('Significant total pages decrease detected', undefined, {
          context: 'load_more_filmography_usecase',
          requestId,
          original: originalPagination.totalPages,
          current: currentPagination.totalPages,
          difference: pagesDiff
        })
      }
    }

    this.logger.debug('Pagination consistency validation completed', undefined, {
      context: 'load_more_filmography_usecase',
      requestId,
      currentPage: currentPagination.page,
      hasMore: currentPagination.hasMore,
      totalPages: currentPagination.totalPages
    })
  }
}