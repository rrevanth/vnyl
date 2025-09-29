/**
 * ResolveExternalIdsUseCase
 * 
 * Critical first step in the media detail workflow that resolves external IDs
 * from all providers with EXTERNAL_IDS capability. This creates a comprehensive
 * set of external identifiers that enables subsequent enrichment operations.
 * 
 * Called when a media card is clicked to begin the detail loading process.
 */

import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'
import { IExternalIdsProvider } from '@/src/domain/providers/external-ids/external-ids-provider.interface'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ILoggingService } from '@/src/domain/services'

/**
 * Input parameters for ResolveExternalIdsUseCase
 */
export interface ResolveExternalIdsRequest {
  /** The catalog item to resolve external IDs for */
  readonly catalogItem: CatalogItem
  
  /** Whether to use cached results if available */
  readonly allowCache?: boolean
  
  /** Maximum time to wait for each provider (in milliseconds) */
  readonly timeoutMs?: number
  
  /** Whether to continue if some providers fail */
  readonly toleratePartialFailure?: boolean
}

/**
 * Result type for ResolveExternalIdsUseCase
 */
export interface ResolveExternalIdsResult {
  /** The enriched catalog item with comprehensive external IDs */
  readonly enrichedItem: CatalogItem
  
  /** Combined external IDs from all providers */
  readonly externalIds: ExternalIds & { readonly [providerId: string]: string | number }
  
  /** Provider resolution metrics */
  readonly metrics: ExternalIdsResolutionMetrics
  
  /** Request context for traceability */
  readonly requestId: string
  
  /** Whether all providers succeeded */
  readonly fullyResolved: boolean
  
  /** Any provider errors that occurred */
  readonly providerErrors: ExternalIdsProviderError[]
}

/**
 * Performance metrics for external ID resolution
 */
export interface ExternalIdsResolutionMetrics {
  /** Total execution time in milliseconds */
  readonly executionTime: number
  
  /** Provider discovery time in milliseconds */
  readonly providerDiscoveryTime: number
  
  /** Total time spent in provider calls */
  readonly providerCallTime: number
  
  /** Number of providers found with EXTERNAL_IDS capability */
  readonly providersFound: number
  
  /** Number of providers that succeeded */
  readonly providersSucceeded: number
  
  /** Number of providers that failed */
  readonly providersFailed: number
  
  /** Number of new external IDs discovered */
  readonly newExternalIds: number
  
  /** Whether any results came from cache */
  readonly usedCache: boolean
}

/**
 * Provider error information for external ID resolution
 */
export interface ExternalIdsProviderError {
  readonly providerId: string
  readonly providerName: string
  readonly error: string
  readonly capability: ProviderCapability.EXTERNAL_IDS
  readonly executionTime: number
}

export class ResolveExternalIdsUseCase {
  constructor(
    private readonly providerRegistry: IProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to resolve external IDs from all capable providers
   * This is the critical first step in media detail workflow
   */
  async execute(request: ResolveExternalIdsRequest): Promise<ResolveExternalIdsResult> {
    const requestId = `resolve-external-ids-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    const timeoutMs = request.timeoutMs ?? 5000
    const toleratePartialFailure = request.toleratePartialFailure ?? true

    try {
      this.logger.info('Starting ResolveExternalIdsUseCase execution', {
        context: 'resolve_external_ids_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        mediaType: request.catalogItem.mediaType,
        providerId: request.catalogItem.contentContext.providerId,
        allowCache: request.allowCache ?? true,
        timeoutMs,
        toleratePartialFailure
      })

      // Validate request parameters
      this.validateRequest(request, requestId)

      // Discover providers with EXTERNAL_IDS capability
      const providerDiscoveryStart = performance.now()
      const externalIdsProviders = await this.discoverExternalIdsProviders(requestId)
      const providerDiscoveryTime = performance.now() - providerDiscoveryStart

      if (externalIdsProviders.length === 0) {
        this.logger.warn('No providers found with EXTERNAL_IDS capability', undefined, {
          context: 'resolve_external_ids_usecase',
          requestId,
          catalogItemId: request.catalogItem.id
        })

        return this.createResultWithNoProviders(
          request.catalogItem,
          requestId,
          providerDiscoveryTime,
          performance.now() - startTime
        )
      }

      this.logger.debug('External IDs providers discovered', undefined, {
        context: 'resolve_external_ids_usecase',
        requestId,
        providerCount: externalIdsProviders.length,
        providers: externalIdsProviders.map(p => ({
          id: p.id,
          name: p.name,
          sourceId: p.sourceId,
          priority: p.priority
        })),
        discoveryTime: Math.round(providerDiscoveryTime)
      })

      // Resolve external IDs from all providers in parallel
      const providerCallStart = performance.now()
      const resolutionResults = await this.resolveFromAllProviders(
        externalIdsProviders,
        request.catalogItem,
        timeoutMs,
        requestId
      )
      const providerCallTime = performance.now() - providerCallStart

      // Merge external IDs from all successful providers
      const mergedExternalIds = this.mergeExternalIds(
        request.catalogItem.externalIds,
        resolutionResults.successfulResults,
        requestId
      )

      // Create enriched catalog item with comprehensive external IDs
      const enrichedItem: CatalogItem = {
        ...request.catalogItem,
        externalIds: mergedExternalIds,
        updatedAt: new Date()
      }

      const executionTime = performance.now() - startTime
      const fullyResolved = resolutionResults.errors.length === 0

      // Handle partial failures if tolerance is disabled
      if (!toleratePartialFailure && !fullyResolved) {
        throw new Error(`External ID resolution failed for ${resolutionResults.errors.length} providers`)
      }

      const metrics: ExternalIdsResolutionMetrics = {
        executionTime,
        providerDiscoveryTime,
        providerCallTime,
        providersFound: externalIdsProviders.length,
        providersSucceeded: resolutionResults.successfulResults.length,
        providersFailed: resolutionResults.errors.length,
        newExternalIds: this.countNewExternalIds(
          request.catalogItem.externalIds,
          mergedExternalIds
        ),
        usedCache: resolutionResults.successfulResults.some(result => 
          result.result && typeof result.result === 'object' && 'fromCache' in result.result
        )
      }

      this.logger.info('ResolveExternalIdsUseCase execution completed', {
        context: 'resolve_external_ids_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        fullyResolved,
        providersSucceeded: metrics.providersSucceeded,
        providersFailed: metrics.providersFailed,
        newExternalIds: metrics.newExternalIds,
        executionTime: Math.round(executionTime)
      })

      return {
        enrichedItem,
        externalIds: mergedExternalIds,
        metrics,
        requestId,
        fullyResolved,
        providerErrors: resolutionResults.errors
      }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const executionTime = performance.now() - startTime

      this.logger.error('ResolveExternalIdsUseCase execution failed', errorInstance, {
        context: 'resolve_external_ids_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to resolve external IDs: ${errorInstance.message}`)
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: ResolveExternalIdsRequest, requestId: string): void {
    if (!request.catalogItem) {
      throw new Error('Catalog item is required')
    }

    if (!request.catalogItem.id?.trim()) {
      throw new Error('Catalog item must have a valid ID')
    }

    if (!request.catalogItem.contentContext) {
      throw new Error('Catalog item must have content context')
    }

    if (request.timeoutMs !== undefined && (request.timeoutMs < 1000 || request.timeoutMs > 30000)) {
      throw new Error('Timeout must be between 1000ms and 30000ms')
    }

    this.logger.debug('Request validation passed', undefined, {
      context: 'resolve_external_ids_usecase',
      requestId,
      catalogItemId: request.catalogItem.id,
      mediaType: request.catalogItem.mediaType,
      providerId: request.catalogItem.contentContext.providerId
    })
  }

  /**
   * Discovers all providers with EXTERNAL_IDS capability
   */
  private async discoverExternalIdsProviders(requestId: string): Promise<IExternalIdsProvider[]> {
    try {
      const providers = await this.providerRegistry.getProvidersByCapability<IExternalIdsProvider>(
        ProviderCapability.EXTERNAL_IDS
      )

      this.logger.debug('Provider discovery completed', undefined, {
        context: 'resolve_external_ids_usecase',
        requestId,
        capability: ProviderCapability.EXTERNAL_IDS,
        providersFound: providers.length
      })

      return providers
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to discover external IDs providers', errorInstance, {
        context: 'resolve_external_ids_usecase',
        requestId,
        capability: ProviderCapability.EXTERNAL_IDS
      })
      throw new Error(`Provider discovery failed: ${errorInstance.message}`)
    }
  }

  /**
   * Resolves external IDs from all providers in parallel
   */
  private async resolveFromAllProviders(
    providers: IExternalIdsProvider[],
    catalogItem: CatalogItem,
    timeoutMs: number,
    requestId: string
  ): Promise<{
    successfulResults: { providerId: string; result: any }[]
    errors: ExternalIdsProviderError[]
  }> {
    const resolutionPromises = providers.map(async (provider) => {
      const providerStartTime = performance.now()
      
      try {
        this.logger.debug('Starting external ID resolution from provider', undefined, {
          context: 'resolve_external_ids_usecase',
          requestId,
          providerId: provider.id,
          providerName: provider.name
        })

        // Initialize provider if needed
        await provider.initialize()

        // Check if provider can fetch external IDs for this item
        if (!provider.canFetchExternalIds(catalogItem)) {
          this.logger.debug('Provider cannot fetch external IDs for this item', undefined, {
            context: 'resolve_external_ids_usecase',
            requestId,
            providerId: provider.id,
            catalogItemId: catalogItem.id,
            mediaType: catalogItem.mediaType
          })
          return { type: 'skip', providerId: provider.id }
        }

        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Provider timeout after ${timeoutMs}ms`)), timeoutMs)
        })

        // Race between provider call and timeout
        const result = await Promise.race([
          provider.getExternalIds(catalogItem),
          timeoutPromise
        ])

        const providerTime = performance.now() - providerStartTime

        this.logger.debug('External ID resolution completed for provider', undefined, {
          context: 'resolve_external_ids_usecase',
          requestId,
          providerId: provider.id,
          executionTime: Math.round(providerTime),
          qualityScore: (result as any).qualityScore,
          fromCache: (result as any).fromCache
        })

        return {
          type: 'success',
          providerId: provider.id,
          result,
          executionTime: providerTime
        }

      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        const providerTime = performance.now() - providerStartTime

        this.logger.warn('External ID resolution failed for provider', errorInstance, {
          context: 'resolve_external_ids_usecase',
          requestId,
          providerId: provider.id,
          providerName: provider.name,
          executionTime: Math.round(providerTime)
        })

        return {
          type: 'error',
          providerId: provider.id,
          providerName: provider.name || 'Unknown Provider',
          error: errorInstance.message,
          executionTime: providerTime
        }
      }
    })

    // Wait for all providers to complete or fail
    const results = await Promise.allSettled(resolutionPromises)
    
    const successfulResults: { providerId: string; result: any }[] = []
    const errors: ExternalIdsProviderError[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const value = result.value
        if (value.type === 'success') {
          successfulResults.push({
            providerId: value.providerId,
            result: value.result
          })
        } else if (value.type === 'error') {
          errors.push({
            providerId: value.providerId,
            providerName: value.providerName || 'Unknown Provider',
            error: value.error || 'Unknown error',
            capability: ProviderCapability.EXTERNAL_IDS,
            executionTime: value.executionTime || 0
          })
        }
        // Skip type is ignored (provider cannot fetch for this item)
      } else {
        // Promise rejection
        const provider = providers[index]
        errors.push({
          providerId: provider.id,
          providerName: provider.name || 'Unknown Provider',
          error: result.reason?.message || 'Unknown provider failure',
          capability: ProviderCapability.EXTERNAL_IDS,
          executionTime: 0
        })
      }
    })

    this.logger.info('External ID resolution from all providers completed', {
      context: 'resolve_external_ids_usecase',
      requestId,
      totalProviders: providers.length,
      successfulProviders: successfulResults.length,
      failedProviders: errors.length,
      skippedProviders: providers.length - successfulResults.length - errors.length
    })

    return { successfulResults, errors }
  }

  /**
   * Merges external IDs from all successful provider results
   */
  private mergeExternalIds(
    originalExternalIds: ExternalIds & { readonly [providerId: string]: string | number },
    successfulResults: { providerId: string; result: any }[],
    requestId: string
  ): ExternalIds & { readonly [providerId: string]: string | number } {
    let mergedIds = { ...originalExternalIds }

    this.logger.debug('Starting external ID merge', undefined, {
      context: 'resolve_external_ids_usecase',
      requestId,
      originalIdCount: Object.keys(originalExternalIds).length,
      successfulProviders: successfulResults.length
    })

    for (const { providerId, result } of successfulResults) {
      try {
        const providerExternalIds = result.externalIds

        // Merge all external IDs, with provider results taking precedence
        for (const [key, value] of Object.entries(providerExternalIds)) {
          if (value !== null && value !== undefined && value !== '' && 
              (typeof value === 'string' || typeof value === 'number')) {
            mergedIds = { ...mergedIds, [key]: value }
          }
        }

        this.logger.debug('Merged external IDs from provider', undefined, {
          context: 'resolve_external_ids_usecase',
          requestId,
          providerId,
          providerIdCount: Object.keys(providerExternalIds).length,
          totalIdCount: Object.keys(mergedIds).length
        })

      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        this.logger.warn('Failed to merge external IDs from provider result', errorInstance, {
          context: 'resolve_external_ids_usecase',
          requestId,
          providerId
        })
      }
    }

    this.logger.info('External ID merge completed', {
      context: 'resolve_external_ids_usecase',
      requestId,
      originalIdCount: Object.keys(originalExternalIds).length,
      finalIdCount: Object.keys(mergedIds).length,
      newIds: Object.keys(mergedIds).length - Object.keys(originalExternalIds).length
    })

    return mergedIds
  }

  /**
   * Counts the number of new external IDs discovered
   */
  private countNewExternalIds(
    originalIds: ExternalIds & { readonly [providerId: string]: string | number },
    mergedIds: ExternalIds & { readonly [providerId: string]: string | number }
  ): number {
    const originalKeys = new Set(Object.keys(originalIds))
    const mergedKeys = Object.keys(mergedIds)
    
    return mergedKeys.filter(key => !originalKeys.has(key)).length
  }

  /**
   * Creates a result when no providers are available
   */
  private createResultWithNoProviders(
    catalogItem: CatalogItem,
    requestId: string,
    providerDiscoveryTime: number,
    executionTime: number
  ): ResolveExternalIdsResult {
    const metrics: ExternalIdsResolutionMetrics = {
      executionTime,
      providerDiscoveryTime,
      providerCallTime: 0,
      providersFound: 0,
      providersSucceeded: 0,
      providersFailed: 0,
      newExternalIds: 0,
      usedCache: false
    }

    return {
      enrichedItem: catalogItem,
      externalIds: catalogItem.externalIds,
      metrics,
      requestId,
      fullyResolved: true, // No providers means no failures
      providerErrors: []
    }
  }
}