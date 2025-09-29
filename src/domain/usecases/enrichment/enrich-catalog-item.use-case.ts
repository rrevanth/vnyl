/**
 * EnrichCatalogItemUseCase
 * 
 * Second critical step in the media detail workflow that enriches a catalog item
 * with comprehensive data from multiple providers. Runs after external IDs are resolved
 * to provide METADATA, PEOPLE, RECOMMENDATIONS, and SEASONS_EPISODES enrichments.
 * 
 * Each provider receives the full item context (all IDs, existing data) and uses
 * EnrichedDataUtils to add enrichments to the item's enrichedData property.
 */

import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { IMetadataProvider } from '@/src/domain/providers/metadata/metadata-provider.interface'
import { IPeopleProvider } from '@/src/domain/providers/people/people-provider.interface'
import { IRecommendationsProvider } from '@/src/domain/providers/recommendations/recommendations-provider.interface'
import { ISeasonsEpisodesProvider } from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { ProviderCapability, EnrichedData, EnrichmentResult, EnrichedDataUtils } from '@/src/domain/entities/context/content-context.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ILoggingService } from '@/src/domain/services'

/**
 * Input parameters for EnrichCatalogItemUseCase
 */
export interface EnrichCatalogItemRequest {
  /** The catalog item to enrich (should have complete external IDs) */
  readonly catalogItem: CatalogItem
  
  /** Specific capabilities to enrich (defaults to all supported) */
  readonly requestedCapabilities?: ProviderCapability[]
  
  /** Whether to use cached enrichment results if available */
  readonly allowCache?: boolean
  
  /** Maximum time to wait for each provider capability (in milliseconds) */
  readonly timeoutMs?: number
  
  /** Whether to continue if some providers fail */
  readonly toleratePartialFailure?: boolean
  
  /** Whether to preserve existing enriched data */
  readonly preserveExistingEnrichments?: boolean
}

/**
 * Result type for EnrichCatalogItemUseCase
 */
export interface EnrichCatalogItemResult {
  /** The fully enriched catalog item with all available data */
  readonly enrichedItem: CatalogItem
  
  /** Enrichment metrics by capability */
  readonly metrics: EnrichmentMetrics
  
  /** Request context for traceability */
  readonly requestId: string
  
  /** Whether all requested capabilities were successfully enriched */
  readonly fullyEnriched: boolean
  
  /** Capabilities that were successfully enriched */
  readonly succeededCapabilities: ProviderCapability[]
  
  /** Capabilities that failed enrichment */
  readonly failedCapabilities: ProviderCapability[]
  
  /** Any provider errors that occurred */
  readonly providerErrors: EnrichmentProviderError[]
}

/**
 * Performance metrics for enrichment operation
 */
export interface EnrichmentMetrics {
  /** Total execution time in milliseconds */
  readonly executionTime: number
  
  /** Provider discovery time by capability */
  readonly providerDiscoveryTime: Partial<Record<ProviderCapability, number>>
  
  /** Total time spent in provider calls by capability */
  readonly providerCallTime: Partial<Record<ProviderCapability, number>>
  
  /** Number of providers found by capability */
  readonly providersFound: Partial<Record<ProviderCapability, number>>
  
  /** Number of providers that succeeded by capability */
  readonly providersSucceeded: Partial<Record<ProviderCapability, number>>
  
  /** Number of providers that failed by capability */
  readonly providersFailed: Partial<Record<ProviderCapability, number>>
  
  /** Whether any results came from cache */
  readonly usedCache: boolean
  
  /** Total enrichments added */
  readonly enrichmentsAdded: number
}

/**
 * Provider error information for enrichment
 */
export interface EnrichmentProviderError {
  readonly providerId: string
  readonly providerName: string
  readonly capability: ProviderCapability
  readonly error: string
  readonly executionTime: number
}

export class EnrichCatalogItemUseCase {
  constructor(
    private readonly providerRegistry: IProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to enrich catalog item with comprehensive data
   * This is the second critical step in media detail workflow
   */
  async execute(request: EnrichCatalogItemRequest): Promise<EnrichCatalogItemResult> {
    const requestId = `enrich-catalog-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    const timeoutMs = request.timeoutMs ?? 10000
    const toleratePartialFailure = request.toleratePartialFailure ?? true
    const preserveExisting = request.preserveExistingEnrichments ?? true

    try {
      this.logger.info('Starting EnrichCatalogItemUseCase execution', {
        context: 'enrich_catalog_item_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        mediaType: request.catalogItem.mediaType,
        providerId: request.catalogItem.contentContext.providerId,
        requestedCapabilities: request.requestedCapabilities,
        allowCache: request.allowCache ?? true,
        timeoutMs,
        toleratePartialFailure,
        preserveExisting
      })

      // Validate request parameters
      this.validateRequest(request, requestId)

      // Determine capabilities to enrich
      const capabilitiesToEnrich = this.determineCapabilitiesToEnrich(
        request.catalogItem,
        request.requestedCapabilities,
        requestId
      )

      if (capabilitiesToEnrich.length === 0) {
        this.logger.warn('No capabilities to enrich for catalog item', undefined, {
          context: 'enrich_catalog_item_usecase',
          requestId,
          catalogItemId: request.catalogItem.id,
          mediaType: request.catalogItem.mediaType
        })

        return this.createResultWithNoCapabilities(
          request.catalogItem,
          requestId,
          performance.now() - startTime
        )
      }

      // Initialize enriched data if needed
      let currentEnrichedData = request.catalogItem.enrichedData
      if (!currentEnrichedData) {
        currentEnrichedData = EnrichedDataUtils.createEnrichedData(request.catalogItem)
      }

      // Execute enrichment for each capability in parallel
      const enrichmentResults = await this.executeEnrichmentForCapabilities(
        capabilitiesToEnrich,
        request.catalogItem,
        timeoutMs,
        requestId
      )

      // Apply successful enrichments to the item
      const { updatedEnrichedData, enrichmentsAdded } = this.applyEnrichments(
        currentEnrichedData,
        enrichmentResults.successfulResults,
        preserveExisting,
        requestId
      )

      // Create enriched catalog item
      const enrichedItem: CatalogItem = {
        ...request.catalogItem,
        enrichedData: updatedEnrichedData,
        hasDetailedInfo: true,
        updatedAt: new Date()
      }

      const executionTime = performance.now() - startTime
      const succeededCapabilities = Array.from(new Set(enrichmentResults.successfulResults.map(r => r.capability)))
      const failedCapabilities = Array.from(new Set(enrichmentResults.errors.map(e => e.capability)))
      const fullyEnriched = failedCapabilities.length === 0

      // Handle partial failures if tolerance is disabled
      if (!toleratePartialFailure && !fullyEnriched) {
        throw new Error(`Enrichment failed for capabilities: ${failedCapabilities.join(', ')}`)
      }

      const metrics = this.calculateMetrics(
        enrichmentResults,
        enrichmentsAdded,
        executionTime,
        capabilitiesToEnrich
      )

      this.logger.info('EnrichCatalogItemUseCase execution completed', {
        context: 'enrich_catalog_item_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        fullyEnriched,
        succeededCapabilities,
        failedCapabilities,
        enrichmentsAdded,
        executionTime: Math.round(executionTime)
      })

      return {
        enrichedItem,
        metrics,
        requestId,
        fullyEnriched,
        succeededCapabilities,
        failedCapabilities,
        providerErrors: enrichmentResults.errors
      }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const executionTime = performance.now() - startTime

      this.logger.error('EnrichCatalogItemUseCase execution failed', errorInstance, {
        context: 'enrich_catalog_item_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to enrich catalog item: ${errorInstance.message}`)
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: EnrichCatalogItemRequest, requestId: string): void {
    if (!request.catalogItem) {
      throw new Error('Catalog item is required')
    }

    if (!request.catalogItem.id?.trim()) {
      throw new Error('Catalog item must have a valid ID')
    }

    if (!request.catalogItem.contentContext) {
      throw new Error('Catalog item must have content context')
    }

    if (!request.catalogItem.externalIds || Object.keys(request.catalogItem.externalIds).length === 0) {
      this.logger.warn('Catalog item has no external IDs - enrichment may be limited', undefined, {
        context: 'enrich_catalog_item_usecase',
        requestId,
        catalogItemId: request.catalogItem.id
      })
    }

    if (request.timeoutMs !== undefined && (request.timeoutMs < 2000 || request.timeoutMs > 60000)) {
      throw new Error('Timeout must be between 2000ms and 60000ms')
    }

    this.logger.debug('Request validation passed', undefined, {
      context: 'enrich_catalog_item_usecase',
      requestId,
      catalogItemId: request.catalogItem.id,
      mediaType: request.catalogItem.mediaType,
      externalIdCount: Object.keys(request.catalogItem.externalIds).length
    })
  }

  /**
   * Determines which capabilities should be enriched for this catalog item
   */
  private determineCapabilitiesToEnrich(
    catalogItem: CatalogItem,
    requestedCapabilities: ProviderCapability[] | undefined,
    requestId: string
  ): ProviderCapability[] {
    // Default enrichment capabilities for media detail workflow
    const defaultCapabilities: ProviderCapability[] = [
      ProviderCapability.METADATA,
      ProviderCapability.PEOPLE,
      ProviderCapability.RECOMMENDATIONS
    ]

    // Add SEASONS_EPISODES for TV series
    if (catalogItem.mediaType === MediaType.TV_SERIES) {
      defaultCapabilities.push(ProviderCapability.SEASONS_EPISODES)
    }

    const capabilitiesToEnrich = requestedCapabilities || defaultCapabilities

    this.logger.debug('Determined capabilities to enrich', undefined, {
      context: 'enrich_catalog_item_usecase',
      requestId,
      catalogItemId: catalogItem.id,
      mediaType: catalogItem.mediaType,
      capabilities: capabilitiesToEnrich,
      wasRequested: !!requestedCapabilities
    })

    return capabilitiesToEnrich
  }

  /**
   * Executes enrichment for all requested capabilities in parallel
   */
  private async executeEnrichmentForCapabilities(
    capabilities: ProviderCapability[],
    catalogItem: CatalogItem,
    timeoutMs: number,
    requestId: string
  ): Promise<{
    successfulResults: { capability: ProviderCapability; providerId: string; result: any }[]
    errors: EnrichmentProviderError[]
  }> {
    const capabilityPromises = capabilities.map(async (capability) => {
      return this.enrichForCapability(capability, catalogItem, timeoutMs, requestId)
    })

    // Wait for all capabilities to complete
    const results = await Promise.allSettled(capabilityPromises)
    
    const successfulResults: { capability: ProviderCapability; providerId: string; result: any }[] = []
    const errors: EnrichmentProviderError[] = []

    results.forEach((result, index) => {
      const capability = capabilities[index]
      
      if (result.status === 'fulfilled') {
        successfulResults.push(...result.value.successful)
        errors.push(...result.value.errors)
      } else {
        // Promise rejection
        errors.push({
          providerId: 'unknown',
          providerName: 'unknown',
          capability,
          error: result.reason?.message || 'Unknown capability enrichment failure',
          executionTime: 0
        })
      }
    })

    this.logger.info('Enrichment for all capabilities completed', {
      context: 'enrich_catalog_item_usecase',
      requestId,
      catalogItemId: catalogItem.id,
      totalCapabilities: capabilities.length,
      successfulEnrichments: successfulResults.length,
      failedEnrichments: errors.length
    })

    return { successfulResults, errors }
  }

  /**
   * Enriches catalog item for a specific capability
   */
  private async enrichForCapability(
    capability: ProviderCapability,
    catalogItem: CatalogItem,
    timeoutMs: number,
    requestId: string
  ): Promise<{
    successful: { capability: ProviderCapability; providerId: string; result: any }[]
    errors: EnrichmentProviderError[]
  }> {
    const capabilityStartTime = performance.now()
    
    try {
      this.logger.debug('Starting enrichment for capability', undefined, {
        context: 'enrich_catalog_item_usecase',
        requestId,
        capability,
        catalogItemId: catalogItem.id
      })

      // Get providers for this capability
      const providers = await this.getProvidersForCapability(capability, requestId)
      
      if (providers.length === 0) {
        this.logger.debug('No providers found for capability', undefined, {
          context: 'enrich_catalog_item_usecase',
          requestId,
          capability,
          catalogItemId: catalogItem.id
        })
        return { successful: [], errors: [] }
      }

      // Execute enrichment with each provider in parallel
      const providerPromises = providers.map(async (provider) => {
        const providerStartTime = performance.now()
        
        try {
          await provider.initialize()
          
          // Create timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Provider timeout after ${timeoutMs}ms`)), timeoutMs)
          })

          // Execute capability-specific enrichment
          const result = await Promise.race([
            this.executeCapabilityEnrichment(capability, provider, catalogItem, requestId),
            timeoutPromise
          ])

          const providerTime = performance.now() - providerStartTime

          this.logger.debug('Capability enrichment completed for provider', undefined, {
            context: 'enrich_catalog_item_usecase',
            requestId,
            capability,
            providerId: provider.id,
            executionTime: Math.round(providerTime)
          })

          return {
            type: 'success',
            capability,
            providerId: provider.id,
            result,
            executionTime: providerTime
          }

        } catch (error) {
          const errorInstance = error instanceof Error ? error : new Error(String(error))
          const providerTime = performance.now() - providerStartTime

          this.logger.warn('Capability enrichment failed for provider', errorInstance, {
            context: 'enrich_catalog_item_usecase',
            requestId,
            capability,
            providerId: provider.id,
            executionTime: Math.round(providerTime)
          })

          return {
            type: 'error',
            capability,
            providerId: provider.id,
            providerName: provider.name || 'Unknown Provider',
            error: errorInstance.message,
            executionTime: providerTime
          }
        }
      })

      const results = await Promise.allSettled(providerPromises)
      
      const successful: { capability: ProviderCapability; providerId: string; result: any }[] = []
      const errors: EnrichmentProviderError[] = []

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const value = result.value
          if (value.type === 'success') {
            successful.push({
              capability: value.capability,
              providerId: value.providerId,
              result: value.result
            })
          } else {
            errors.push({
              providerId: value.providerId,
              providerName: value.providerName || 'Unknown Provider',
              capability: value.capability,
              error: value.error || 'Unknown error',
              executionTime: value.executionTime || 0
            })
          }
        }
      })

      const capabilityTime = performance.now() - capabilityStartTime

      this.logger.debug('Capability enrichment completed', undefined, {
        context: 'enrich_catalog_item_usecase',
        requestId,
        capability,
        providersFound: providers.length,
        successfulProviders: successful.length,
        failedProviders: errors.length,
        executionTime: Math.round(capabilityTime)
      })

      return { successful, errors }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const capabilityTime = performance.now() - capabilityStartTime

      this.logger.error('Capability enrichment failed', errorInstance, {
        context: 'enrich_catalog_item_usecase',
        requestId,
        capability,
        executionTime: Math.round(capabilityTime)
      })

      return {
        successful: [],
        errors: [{
          providerId: 'unknown',
          providerName: 'unknown',
          capability,
          error: errorInstance.message,
          executionTime: capabilityTime
        }]
      }
    }
  }

  /**
   * Gets providers for a specific capability
   */
  private async getProvidersForCapability(
    capability: ProviderCapability,
    requestId: string
  ): Promise<any[]> {
    try {
      switch (capability) {
        case ProviderCapability.METADATA:
          return await this.providerRegistry.getProvidersByCapability<IMetadataProvider>(capability)
        case ProviderCapability.PEOPLE:
          return await this.providerRegistry.getProvidersByCapability<IPeopleProvider>(capability)
        case ProviderCapability.RECOMMENDATIONS:
          return await this.providerRegistry.getProvidersByCapability<IRecommendationsProvider>(capability)
        case ProviderCapability.SEASONS_EPISODES:
          return await this.providerRegistry.getProvidersByCapability<ISeasonsEpisodesProvider>(capability)
        default:
          this.logger.warn('Unsupported capability for enrichment', undefined, {
            context: 'enrich_catalog_item_usecase',
            requestId,
            capability
          })
          return []
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get providers for capability', errorInstance, {
        context: 'enrich_catalog_item_usecase',
        requestId,
        capability
      })
      return []
    }
  }

  /**
   * Executes capability-specific enrichment with a provider
   */
  private async executeCapabilityEnrichment(
    capability: ProviderCapability,
    provider: any,
    catalogItem: CatalogItem,
    requestId: string
  ): Promise<any> {
    switch (capability) {
      case ProviderCapability.METADATA:
        const metadataProvider = provider as IMetadataProvider
        return await metadataProvider.getEnhancedMetadata(
          catalogItem.contentContext.originalMediaId.toString(),
          catalogItem.mediaType as MediaType
        )

      case ProviderCapability.PEOPLE:
        const peopleProvider = provider as IPeopleProvider
        return await peopleProvider.getPeopleForMedia(catalogItem)

      case ProviderCapability.RECOMMENDATIONS:
        const recommendationsProvider = provider as IRecommendationsProvider
        return await recommendationsProvider.getRecommendations(catalogItem)

      case ProviderCapability.SEASONS_EPISODES:
        const seasonsProvider = provider as ISeasonsEpisodesProvider
        if (catalogItem.mediaType !== MediaType.TV_SERIES) {
          throw new Error('Seasons/episodes only available for TV series')
        }
        return await seasonsProvider.getAllSeasons(catalogItem as any)

      default:
        throw new Error(`Unsupported capability: ${capability}`)
    }
  }

  /**
   * Applies successful enrichments to the enriched data
   */
  private applyEnrichments(
    currentEnrichedData: EnrichedData<CatalogItem>,
    successfulResults: { capability: ProviderCapability; providerId: string; result: any }[],
    preserveExisting: boolean,
    requestId: string
  ): { updatedEnrichedData: EnrichedData<CatalogItem>; enrichmentsAdded: number } {
    let updatedData = currentEnrichedData
    let enrichmentsAdded = 0

    this.logger.debug('Applying enrichments to catalog item', undefined, {
      context: 'enrich_catalog_item_usecase',
      requestId,
      successfulResults: successfulResults.length,
      preserveExisting,
      existingEnrichments: currentEnrichedData.enrichments.size
    })

    for (const { capability, providerId, result } of successfulResults) {
      try {
        // Check if enrichment already exists and should be preserved
        if (preserveExisting && EnrichedDataUtils.hasEnrichment(updatedData, capability)) {
          this.logger.debug('Skipping enrichment - already exists and preserve enabled', undefined, {
            context: 'enrich_catalog_item_usecase',
            requestId,
            capability,
            providerId
          })
          continue
        }

        // Create enrichment result
        const enrichmentResult: EnrichmentResult = {
          capability,
          providerId,
          data: result,
          enrichedAt: new Date(),
          metadata: {
            fromProvider: providerId,
            enrichmentType: capability
          }
        }

        // Add enrichment to data
        updatedData = EnrichedDataUtils.addEnrichment(updatedData, enrichmentResult)
        enrichmentsAdded++

        this.logger.debug('Applied enrichment to catalog item', undefined, {
          context: 'enrich_catalog_item_usecase',
          requestId,
          capability,
          providerId,
          totalEnrichments: updatedData.enrichments.size
        })

      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        this.logger.warn('Failed to apply enrichment', errorInstance, {
          context: 'enrich_catalog_item_usecase',
          requestId,
          capability,
          providerId
        })
      }
    }

    this.logger.info('Enrichment application completed', {
      context: 'enrich_catalog_item_usecase',
      requestId,
      enrichmentsAdded,
      totalEnrichments: updatedData.enrichments.size,
      enrichmentSources: updatedData.enrichmentSources.length
    })

    return { updatedEnrichedData: updatedData, enrichmentsAdded }
  }

  /**
   * Calculates enrichment metrics
   */
  private calculateMetrics(
    enrichmentResults: any,
    enrichmentsAdded: number,
    executionTime: number,
    capabilities: ProviderCapability[]
  ): EnrichmentMetrics {
    const providerDiscoveryTime: Partial<Record<ProviderCapability, number>> = {}
    const providerCallTime: Partial<Record<ProviderCapability, number>> = {}
    const providersFound: Partial<Record<ProviderCapability, number>> = {}
    const providersSucceeded: Partial<Record<ProviderCapability, number>> = {}
    const providersFailed: Partial<Record<ProviderCapability, number>> = {}

    // Initialize metrics for all capabilities
    capabilities.forEach(capability => {
      providerDiscoveryTime[capability] = 0
      providerCallTime[capability] = 0
      providersFound[capability] = 0
      providersSucceeded[capability] = 0
      providersFailed[capability] = 0
    })

    // Calculate metrics from results
    enrichmentResults.successfulResults.forEach((result: any) => {
      const capability = result.capability as ProviderCapability
      providersSucceeded[capability] = (providersSucceeded[capability] || 0) + 1
    })

    enrichmentResults.errors.forEach((error: any) => {
      const capability = error.capability as ProviderCapability
      providersFailed[capability] = (providersFailed[capability] || 0) + 1
    })

    return {
      executionTime,
      providerDiscoveryTime,
      providerCallTime,
      providersFound,
      providersSucceeded,
      providersFailed,
      usedCache: false, // TODO: Implement cache detection
      enrichmentsAdded
    }
  }

  /**
   * Creates a result when no capabilities are available for enrichment
   */
  private createResultWithNoCapabilities(
    catalogItem: CatalogItem,
    requestId: string,
    executionTime: number
  ): EnrichCatalogItemResult {
    const metrics: EnrichmentMetrics = {
      executionTime,
      providerDiscoveryTime: {},
      providerCallTime: {},
      providersFound: {},
      providersSucceeded: {},
      providersFailed: {},
      usedCache: false,
      enrichmentsAdded: 0
    }

    return {
      enrichedItem: catalogItem,
      metrics,
      requestId,
      fullyEnriched: true, // No capabilities means no failures
      succeededCapabilities: [],
      failedCapabilities: [],
      providerErrors: []
    }
  }
}