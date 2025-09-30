/**
 * GetPersonFilmographyUseCase
 * 
 * Handles fetching filmography catalogs for a person from filmography providers.
 * Returns organized catalogs of the person's work (Movies, TV Shows, As Director, etc.)
 * with complete pagination support and provider discovery.
 * 
 * This use case is the primary entry point for loading a person's filmography
 * in person detail views.
 */

import { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { IFilmographyProvider } from '@/src/domain/providers/filmography/filmography-provider.interface'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'
import { ILoggingService } from '@/src/domain/services'

/**
 * Input parameters for GetPersonFilmographyUseCase
 */
export interface GetPersonFilmographyRequest {
  /** The person to get filmography for */
  readonly person: PersonCatalogItem
  
  /** Optional pagination parameters */
  readonly options?: PaginationOptions
  
  /** Maximum time to wait for provider responses (in milliseconds) */
  readonly timeoutMs?: number
  
  /** Whether to continue if some providers fail */
  readonly toleratePartialFailure?: boolean
  
  /** Specific provider IDs to use (optional - defaults to all capable providers) */
  readonly providerIds?: string[]
}

/**
 * Result type for GetPersonFilmographyUseCase
 */
export interface GetPersonFilmographyResult {
  /** Filmography catalogs organized by type */
  readonly filmographyCatalogs: Catalog[]
  
  /** Metrics about the operation */
  readonly metrics: FilmographyMetrics
  
  /** Request context for traceability */
  readonly requestId: string
  
  /** Whether all providers succeeded */
  readonly allProvidersSucceeded: boolean
  
  /** Provider IDs that successfully returned data */
  readonly succeededProviders: string[]
  
  /** Provider IDs that failed */
  readonly failedProviders: string[]
  
  /** Any provider errors that occurred */
  readonly providerErrors: FilmographyProviderError[]
}

/**
 * Performance metrics for filmography operation
 */
export interface FilmographyMetrics {
  /** Total execution time in milliseconds */
  readonly executionTime: number
  
  /** Provider discovery time in milliseconds */
  readonly providerDiscoveryTime: number
  
  /** Total time spent in provider calls */
  readonly providerCallTime: number
  
  /** Number of providers found */
  readonly providersFound: number
  
  /** Number of providers that succeeded */
  readonly providersSucceeded: number
  
  /** Number of providers that failed */
  readonly providersFailed: number
  
  /** Total catalogs returned */
  readonly catalogsReturned: number
  
  /** Total items across all catalogs */
  readonly totalItems: number
}

/**
 * Provider error information for filmography
 */
export interface FilmographyProviderError {
  readonly providerId: string
  readonly providerName: string
  readonly error: string
  readonly executionTime: number
}

export class GetPersonFilmographyUseCase {
  constructor(
    private readonly providerRegistry: IProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to get person filmography from providers
   */
  async execute(request: GetPersonFilmographyRequest): Promise<GetPersonFilmographyResult> {
    const requestId = `get-person-filmography-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    const timeoutMs = request.timeoutMs ?? 10000
    const toleratePartialFailure = request.toleratePartialFailure ?? true

    try {
      this.logger.info('Starting GetPersonFilmographyUseCase execution', {
        context: 'get_person_filmography_usecase',
        requestId,
        personId: request.person.id,
        personName: request.person.title,
        providerId: request.person.contentContext.providerId,
        options: request.options,
        timeoutMs,
        toleratePartialFailure,
        requestedProviders: request.providerIds
      })

      // Validate request parameters
      this.validateRequest(request, requestId)

      // Get filmography providers
      const providerDiscoveryStart = performance.now()
      const providers = await this.getFilmographyProviders(request.providerIds, requestId)
      const providerDiscoveryTime = performance.now() - providerDiscoveryStart

      if (providers.length === 0) {
        this.logger.warn('No filmography providers found', undefined, {
          context: 'get_person_filmography_usecase',
          requestId,
          personId: request.person.id,
          requestedProviders: request.providerIds
        })

        return this.createResultWithNoProviders(requestId, performance.now() - startTime, providerDiscoveryTime)
      }

      // Execute filmography fetching with all providers in parallel
      const providerCallStart = performance.now()
      const providerResults = await this.executeFilmographyFetching(
        providers,
        request.person,
        request.options,
        timeoutMs,
        requestId
      )
      const providerCallTime = performance.now() - providerCallStart

      // Combine and organize filmography catalogs from all providers
      const { filmographyCatalogs, totalItems } = this.combineFilmographyCatalogs(
        providerResults.successfulResults,
        request.person,
        requestId
      )

      const executionTime = performance.now() - startTime
      const allProvidersSucceeded = providerResults.errors.length === 0

      // Handle partial failures if tolerance is disabled
      if (!toleratePartialFailure && !allProvidersSucceeded) {
        const failedProviderIds = providerResults.errors.map(e => e.providerId)
        throw new Error(`Filmography fetching failed for providers: ${failedProviderIds.join(', ')}`)
      }

      const metrics: FilmographyMetrics = {
        executionTime,
        providerDiscoveryTime,
        providerCallTime,
        providersFound: providers.length,
        providersSucceeded: providerResults.successfulResults.length,
        providersFailed: providerResults.errors.length,
        catalogsReturned: filmographyCatalogs.length,
        totalItems
      }

      this.logger.info('GetPersonFilmographyUseCase execution completed', {
        context: 'get_person_filmography_usecase',
        requestId,
        personId: request.person.id,
        allProvidersSucceeded,
        catalogsReturned: filmographyCatalogs.length,
        totalItems,
        executionTime: Math.round(executionTime)
      })

      return {
        filmographyCatalogs,
        metrics,
        requestId,
        allProvidersSucceeded,
        succeededProviders: providerResults.successfulResults.map(r => r.providerId),
        failedProviders: providerResults.errors.map(e => e.providerId),
        providerErrors: providerResults.errors
      }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const executionTime = performance.now() - startTime

      this.logger.error('GetPersonFilmographyUseCase execution failed', errorInstance, {
        context: 'get_person_filmography_usecase',
        requestId,
        personId: request.person.id,
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to get person filmography: ${errorInstance.message}`)
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: GetPersonFilmographyRequest, requestId: string): void {
    if (!request.person) {
      throw new Error('Person is required')
    }

    if (!request.person.id?.trim()) {
      throw new Error('Person must have a valid ID')
    }

    if (!request.person.contentContext) {
      throw new Error('Person must have content context')
    }

    if (request.timeoutMs !== undefined && (request.timeoutMs < 2000 || request.timeoutMs > 60000)) {
      throw new Error('Timeout must be between 2000ms and 60000ms')
    }

    if (request.options?.page !== undefined && (!Number.isInteger(request.options.page) || request.options.page < 1)) {
      throw new Error('Page must be a positive integer')
    }

    if (request.options?.limit !== undefined && (!Number.isInteger(request.options.limit) || request.options.limit < 1 || request.options.limit > 100)) {
      throw new Error('Limit must be a positive integer between 1 and 100')
    }

    this.logger.debug('Request validation passed', undefined, {
      context: 'get_person_filmography_usecase',
      requestId,
      personId: request.person.id,
      page: request.options?.page,
      limit: request.options?.limit
    })
  }

  /**
   * Gets filmography providers based on the request
   */
  private async getFilmographyProviders(
    requestedProviderIds: string[] | undefined,
    requestId: string
  ): Promise<IFilmographyProvider[]> {
    try {
      // Get all filmography providers
      const allProviders = await this.providerRegistry.getProvidersByCapability<IFilmographyProvider>(
        ProviderCapability.FILMOGRAPHY
      )

      // Filter by requested provider IDs if specified
      const providers = requestedProviderIds 
        ? allProviders.filter(provider => requestedProviderIds.includes(provider.id))
        : allProviders

      this.logger.debug('Found filmography providers', undefined, {
        context: 'get_person_filmography_usecase',
        requestId,
        totalProviders: allProviders.length,
        filteredProviders: providers.length,
        requestedProviders: requestedProviderIds,
        providerIds: providers.map(p => p.id)
      })

      return providers

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get filmography providers', errorInstance, {
        context: 'get_person_filmography_usecase',
        requestId,
        requestedProviders: requestedProviderIds
      })
      return []
    }
  }

  /**
   * Executes filmography fetching with all providers in parallel
   */
  private async executeFilmographyFetching(
    providers: IFilmographyProvider[],
    person: PersonCatalogItem,
    options: PaginationOptions | undefined,
    timeoutMs: number,
    requestId: string
  ): Promise<{
    successfulResults: { providerId: string; catalogs: Catalog[] }[]
    errors: FilmographyProviderError[]
  }> {
    const providerPromises = providers.map(async (provider) => {
      const providerStartTime = performance.now()
      
      try {
        this.logger.debug('Starting filmography fetch for provider', undefined, {
          context: 'get_person_filmography_usecase',
          requestId,
          providerId: provider.id,
          personId: person.id
        })

        // Ensure provider is initialized
        await provider.initialize()
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Provider timeout after ${timeoutMs}ms`)), timeoutMs)
        })

        // Execute filmography fetching
        const result = await Promise.race([
          provider.getFilmography(person, options),
          timeoutPromise
        ]) as { filmography: Catalog[] } | Catalog[]

        const providerTime = performance.now() - providerStartTime

        // Extract catalogs from result
        const catalogs = Array.isArray(result) ? result : result.filmography || []

        this.logger.debug('Filmography fetch completed for provider', undefined, {
          context: 'get_person_filmography_usecase',
          requestId,
          providerId: provider.id,
          catalogCount: catalogs.length,
          executionTime: Math.round(providerTime)
        })

        return {
          type: 'success' as const,
          providerId: provider.id,
          catalogs,
          executionTime: providerTime
        }

      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        const providerTime = performance.now() - providerStartTime

        this.logger.warn('Filmography fetch failed for provider', errorInstance, {
          context: 'get_person_filmography_usecase',
          requestId,
          providerId: provider.id,
          executionTime: Math.round(providerTime)
        })

        return {
          type: 'error' as const,
          providerId: provider.id,
          providerName: provider.name || 'Unknown Provider',
          error: errorInstance.message,
          executionTime: providerTime
        }
      }
    })

    const results = await Promise.allSettled(providerPromises)
    
    const successfulResults: { providerId: string; catalogs: Catalog[] }[] = []
    const errors: FilmographyProviderError[] = []

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const value = result.value
        if (value.type === 'success') {
          successfulResults.push({
            providerId: value.providerId,
            catalogs: value.catalogs
          })
        } else {
          errors.push({
            providerId: value.providerId,
            providerName: value.providerName,
            error: value.error,
            executionTime: value.executionTime
          })
        }
      } else {
        // Promise rejection
        errors.push({
          providerId: 'unknown',
          providerName: 'unknown',
          error: result.reason?.message || 'Unknown provider failure',
          executionTime: 0
        })
      }
    })

    this.logger.info('Filmography fetching completed for all providers', {
      context: 'get_person_filmography_usecase',
      requestId,
      personId: person.id,
      totalProviders: providers.length,
      successfulProviders: successfulResults.length,
      failedProviders: errors.length
    })

    return { successfulResults, errors }
  }

  /**
   * Combines filmography catalogs from multiple providers
   */
  private combineFilmographyCatalogs(
    successfulResults: { providerId: string; catalogs: Catalog[] }[],
    person: PersonCatalogItem,
    requestId: string
  ): { filmographyCatalogs: Catalog[]; totalItems: number } {
    const allCatalogs: Catalog[] = []
    let totalItems = 0

    for (const { providerId, catalogs } of successfulResults) {
      this.logger.debug('Processing filmography catalogs from provider', undefined, {
        context: 'get_person_filmography_usecase',
        requestId,
        providerId,
        catalogCount: catalogs.length,
        personId: person.id
      })

      for (const catalog of catalogs) {
        // Ensure catalog has proper context
        const catalogWithContext: Catalog = {
          ...catalog,
          catalogContext: {
            ...catalog.catalogContext,
            requestId,
            metadata: {
              ...catalog.catalogContext.metadata,
              sourcePersonId: person.id,
              sourcePersonName: person.title
            }
          }
        }

        allCatalogs.push(catalogWithContext)
        totalItems += catalog.items.length
      }
    }

    // Sort catalogs by type and name for consistent ordering
    allCatalogs.sort((a, b) => {
      // Primary sort by catalog type/name
      if (a.name !== b.name) {
        return a.name.localeCompare(b.name)
      }
      // Secondary sort by provider ID for consistent ordering when names match
      return (a.catalogContext.providerId || '').localeCompare(b.catalogContext.providerId || '')
    })

    this.logger.info('Combined filmography catalogs from all providers', {
      context: 'get_person_filmography_usecase',
      requestId,
      personId: person.id,
      totalCatalogs: allCatalogs.length,
      totalItems,
      catalogTypes: Array.from(new Set(allCatalogs.map(c => c.name)))
    })

    return { filmographyCatalogs: allCatalogs, totalItems }
  }

  /**
   * Creates a result when no providers are available
   */
  private createResultWithNoProviders(
    requestId: string,
    executionTime: number,
    providerDiscoveryTime: number
  ): GetPersonFilmographyResult {
    const metrics: FilmographyMetrics = {
      executionTime,
      providerDiscoveryTime,
      providerCallTime: 0,
      providersFound: 0,
      providersSucceeded: 0,
      providersFailed: 0,
      catalogsReturned: 0,
      totalItems: 0
    }

    return {
      filmographyCatalogs: [],
      metrics,
      requestId,
      allProvidersSucceeded: true, // No providers means no failures
      succeededProviders: [],
      failedProviders: [],
      providerErrors: []
    }
  }
}