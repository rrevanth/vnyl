/**
 * EnrichPersonUseCase
 * 
 * Handles enrichment of person entities with detailed information from multiple providers.
 * Focuses on person-specific enrichment capabilities including detailed person data,
 * filmography, and any other person-related enrichments available from providers.
 * 
 * This use case is specifically designed for person detail views where comprehensive
 * person information is required beyond basic catalog item data.
 */

import { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { IPeopleProvider } from '@/src/domain/providers/people/people-provider.interface'
import { IFilmographyProvider } from '@/src/domain/providers/filmography/filmography-provider.interface'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { ProviderCapability, EnrichedData, EnrichmentResult, EnrichedDataUtils } from '@/src/domain/entities/context/content-context.entity'
import { ILoggingService } from '@/src/domain/services'

/**
 * Input parameters for EnrichPersonUseCase
 */
export interface EnrichPersonRequest {
  /** The person catalog item to enrich */
  readonly person: PersonCatalogItem
  
  /** Specific capabilities to enrich (defaults to person-specific capabilities) */
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
 * Result type for EnrichPersonUseCase
 */
export interface EnrichPersonResult {
  /** The fully enriched person with all available data */
  readonly enrichedPerson: PersonCatalogItem
  
  /** Enrichment metrics by capability */
  readonly metrics: PersonEnrichmentMetrics
  
  /** Request context for traceability */
  readonly requestId: string
  
  /** Whether all requested capabilities were successfully enriched */
  readonly fullyEnriched: boolean
  
  /** Capabilities that were successfully enriched */
  readonly succeededCapabilities: ProviderCapability[]
  
  /** Capabilities that failed enrichment */
  readonly failedCapabilities: ProviderCapability[]
  
  /** Any provider errors that occurred */
  readonly providerErrors: PersonEnrichmentProviderError[]
}

/**
 * Performance metrics for person enrichment operation
 */
export interface PersonEnrichmentMetrics {
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
 * Provider error information for person enrichment
 */
export interface PersonEnrichmentProviderError {
  readonly providerId: string
  readonly providerName: string
  readonly capability: ProviderCapability
  readonly error: string
  readonly executionTime: number
}

export class EnrichPersonUseCase {
  constructor(
    private readonly providerRegistry: IProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to enrich person entity with comprehensive data
   */
  async execute(request: EnrichPersonRequest): Promise<EnrichPersonResult> {
    const requestId = `enrich-person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    const timeoutMs = request.timeoutMs ?? 10000
    const toleratePartialFailure = request.toleratePartialFailure ?? true
    const preserveExisting = request.preserveExistingEnrichments ?? true

    try {
      this.logger.info('Starting EnrichPersonUseCase execution', {
        context: 'enrich_person_usecase',
        requestId,
        personId: request.person.id,
        providerId: request.person.contentContext.providerId,
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
        request.person,
        request.requestedCapabilities,
        requestId
      )

      if (capabilitiesToEnrich.length === 0) {
        this.logger.warn('No capabilities to enrich for person', undefined, {
          context: 'enrich_person_usecase',
          requestId,
          personId: request.person.id
        })

        return this.createResultWithNoCapabilities(
          request.person,
          requestId,
          performance.now() - startTime
        )
      }

      // Initialize enriched data if needed
      let currentEnrichedData = request.person.enrichedData
      if (!currentEnrichedData) {
        currentEnrichedData = EnrichedDataUtils.createEnrichedData(request.person) as EnrichedData<PersonCatalogItem>
      }

      // Execute enrichment for each capability in parallel
      const enrichmentResults = await this.executeEnrichmentForCapabilities(
        capabilitiesToEnrich,
        request.person,
        timeoutMs,
        requestId
      )

      // Apply successful enrichments to the person
      const { updatedEnrichedData, enrichmentsAdded } = this.applyEnrichments(
        currentEnrichedData as EnrichedData<PersonCatalogItem>,
        enrichmentResults.successfulResults,
        preserveExisting,
        requestId
      )

      // Create enriched person
      const enrichedPerson: PersonCatalogItem = {
        ...request.person,
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
        throw new Error(`Person enrichment failed for capabilities: ${failedCapabilities.join(', ')}`)
      }

      const metrics = this.calculateMetrics(
        enrichmentResults,
        enrichmentsAdded,
        executionTime,
        capabilitiesToEnrich
      )

      this.logger.info('EnrichPersonUseCase execution completed', {
        context: 'enrich_person_usecase',
        requestId,
        personId: request.person.id,
        fullyEnriched,
        succeededCapabilities,
        failedCapabilities,
        enrichmentsAdded,
        executionTime: Math.round(executionTime)
      })

      return {
        enrichedPerson,
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

      this.logger.error('EnrichPersonUseCase execution failed', errorInstance, {
        context: 'enrich_person_usecase',
        requestId,
        personId: request.person.id,
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to enrich person: ${errorInstance.message}`)
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: EnrichPersonRequest, requestId: string): void {
    if (!request.person) {
      throw new Error('Person is required')
    }

    if (!request.person.id?.trim()) {
      throw new Error('Person must have a valid ID')
    }

    if (!request.person.contentContext) {
      throw new Error('Person must have content context')
    }

    if (!request.person.externalIds || Object.keys(request.person.externalIds).length === 0) {
      this.logger.warn('Person has no external IDs - enrichment may be limited', undefined, {
        context: 'enrich_person_usecase',
        requestId,
        personId: request.person.id
      })
    }

    if (request.timeoutMs !== undefined && (request.timeoutMs < 2000 || request.timeoutMs > 60000)) {
      throw new Error('Timeout must be between 2000ms and 60000ms')
    }

    this.logger.debug('Request validation passed', undefined, {
      context: 'enrich_person_usecase',
      requestId,
      personId: request.person.id,
      externalIdCount: Object.keys(request.person.externalIds).length
    })
  }

  /**
   * Determines which capabilities should be enriched for this person
   */
  private determineCapabilitiesToEnrich(
    person: PersonCatalogItem,
    requestedCapabilities: ProviderCapability[] | undefined,
    requestId: string
  ): ProviderCapability[] {
    // Default enrichment capabilities for person detail workflow
    const defaultCapabilities: ProviderCapability[] = [
      ProviderCapability.METADATA, // Enhanced person metadata
      ProviderCapability.FILMOGRAPHY // Person's filmography
    ]

    const capabilitiesToEnrich = requestedCapabilities || defaultCapabilities

    this.logger.debug('Determined capabilities to enrich for person', undefined, {
      context: 'enrich_person_usecase',
      requestId,
      personId: person.id,
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
    person: PersonCatalogItem,
    timeoutMs: number,
    requestId: string
  ): Promise<{
    successfulResults: { capability: ProviderCapability; providerId: string; result: any }[]
    errors: PersonEnrichmentProviderError[]
  }> {
    const capabilityPromises = capabilities.map(async (capability) => {
      return this.enrichForCapability(capability, person, timeoutMs, requestId)
    })

    // Wait for all capabilities to complete
    const results = await Promise.allSettled(capabilityPromises)
    
    const successfulResults: { capability: ProviderCapability; providerId: string; result: any }[] = []
    const errors: PersonEnrichmentProviderError[] = []

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

    this.logger.info('Person enrichment for all capabilities completed', {
      context: 'enrich_person_usecase',
      requestId,
      personId: person.id,
      totalCapabilities: capabilities.length,
      successfulEnrichments: successfulResults.length,
      failedEnrichments: errors.length
    })

    return { successfulResults, errors }
  }

  /**
   * Enriches person for a specific capability
   */
  private async enrichForCapability(
    capability: ProviderCapability,
    person: PersonCatalogItem,
    timeoutMs: number,
    requestId: string
  ): Promise<{
    successful: { capability: ProviderCapability; providerId: string; result: any }[]
    errors: PersonEnrichmentProviderError[]
  }> {
    const capabilityStartTime = performance.now()
    
    try {
      this.logger.debug('Starting person enrichment for capability', undefined, {
        context: 'enrich_person_usecase',
        requestId,
        capability,
        personId: person.id
      })

      // Get providers for this capability
      const providers = await this.getProvidersForCapability(capability, requestId)
      
      if (providers.length === 0) {
        this.logger.debug('No providers found for person capability', undefined, {
          context: 'enrich_person_usecase',
          requestId,
          capability,
          personId: person.id
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
            this.executeCapabilityEnrichment(capability, provider, person, requestId),
            timeoutPromise
          ])

          const providerTime = performance.now() - providerStartTime

          this.logger.debug('Person capability enrichment completed for provider', undefined, {
            context: 'enrich_person_usecase',
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

          this.logger.warn('Person capability enrichment failed for provider', errorInstance, {
            context: 'enrich_person_usecase',
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
      const errors: PersonEnrichmentProviderError[] = []

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

      this.logger.debug('Person capability enrichment completed', undefined, {
        context: 'enrich_person_usecase',
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

      this.logger.error('Person capability enrichment failed', errorInstance, {
        context: 'enrich_person_usecase',
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
          // For person metadata, we'll use people providers that support getPersonDetails
          return await this.providerRegistry.getProvidersByCapability<IPeopleProvider>(ProviderCapability.PEOPLE)
        case ProviderCapability.FILMOGRAPHY:
          return await this.providerRegistry.getProvidersByCapability<IFilmographyProvider>(capability)
        default:
          this.logger.warn('Unsupported capability for person enrichment', undefined, {
            context: 'enrich_person_usecase',
            requestId,
            capability
          })
          return []
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get providers for person capability', errorInstance, {
        context: 'enrich_person_usecase',
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
    person: PersonCatalogItem,
    requestId: string
  ): Promise<any> {
    switch (capability) {
      case ProviderCapability.METADATA:
        const peopleProvider = provider as IPeopleProvider
        // Use getPersonDetails for enhanced person metadata
        return await peopleProvider.getPersonDetails(person.contentContext.originalMediaId.toString())

      case ProviderCapability.FILMOGRAPHY:
        const filmographyProvider = provider as IFilmographyProvider
        const filmographyResult = await filmographyProvider.getFilmography(person)
        
        // Handle both direct Catalog[] return and wrapped { filmography: Catalog[] } return
        if (Array.isArray(filmographyResult)) {
          return filmographyResult
        } else if (filmographyResult && typeof filmographyResult === 'object' && 'filmography' in filmographyResult) {
          return (filmographyResult as { filmography: any[] }).filmography
        } else {
          this.logger.warn('Unexpected filmography provider return structure', undefined, {
            context: 'enrich_person_usecase',
            requestId,
            capability,
            providerId: provider.id,
            resultType: typeof filmographyResult
          })
          return Array.isArray(filmographyResult) ? filmographyResult : []
        }

      default:
        throw new Error(`Unsupported person capability: ${capability}`)
    }
  }

  /**
   * Applies successful enrichments to the enriched data
   */
  private applyEnrichments(
    currentEnrichedData: EnrichedData<PersonCatalogItem>,
    successfulResults: { capability: ProviderCapability; providerId: string; result: any }[],
    preserveExisting: boolean,
    requestId: string
  ): { updatedEnrichedData: EnrichedData<PersonCatalogItem>; enrichmentsAdded: number } {
    let updatedData = currentEnrichedData
    let enrichmentsAdded = 0

    this.logger.debug('Applying enrichments to person', undefined, {
      context: 'enrich_person_usecase',
      requestId,
      successfulResults: successfulResults.length,
      preserveExisting,
      existingEnrichments: currentEnrichedData.enrichments.size
    })

    for (const { capability, providerId, result } of successfulResults) {
      try {
        // Check if enrichment already exists and should be preserved
        if (preserveExisting && EnrichedDataUtils.hasEnrichment(updatedData, capability)) {
          this.logger.debug('Skipping person enrichment - already exists and preserve enabled', undefined, {
            context: 'enrich_person_usecase',
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

        this.logger.debug('Applied enrichment to person', undefined, {
          context: 'enrich_person_usecase',
          requestId,
          capability,
          providerId,
          totalEnrichments: updatedData.enrichments.size
        })

      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        this.logger.warn('Failed to apply person enrichment', errorInstance, {
          context: 'enrich_person_usecase',
          requestId,
          capability,
          providerId
        })
      }
    }

    this.logger.info('Person enrichment application completed', {
      context: 'enrich_person_usecase',
      requestId,
      enrichmentsAdded,
      totalEnrichments: updatedData.enrichments.size,
      enrichmentSources: updatedData.enrichmentSources.length
    })

    return { updatedEnrichedData: updatedData, enrichmentsAdded }
  }

  /**
   * Calculates person enrichment metrics
   */
  private calculateMetrics(
    enrichmentResults: any,
    enrichmentsAdded: number,
    executionTime: number,
    capabilities: ProviderCapability[]
  ): PersonEnrichmentMetrics {
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
    person: PersonCatalogItem,
    requestId: string,
    executionTime: number
  ): EnrichPersonResult {
    const metrics: PersonEnrichmentMetrics = {
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
      enrichedPerson: person,
      metrics,
      requestId,
      fullyEnriched: true, // No capabilities means no failures
      succeededCapabilities: [],
      failedCapabilities: [],
      providerErrors: []
    }
  }
}