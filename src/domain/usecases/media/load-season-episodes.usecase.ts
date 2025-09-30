/**
 * LoadSeasonEpisodesUseCase
 * 
 * Loads a specific season with all its episodes for a TV series catalog item.
 * This use case enables progressive loading strategies where season metadata is displayed first,
 * and individual seasons with episodes are loaded on-demand when users expand them.
 * 
 * Features:
 * - Provider auto-selection based on catalog item context
 * - Comprehensive error handling and logging
 * - Performance metrics tracking
 * - Provider timeout management
 * - Request validation and traceability
 */

import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Season, ISeasonsProvider } from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { ILoggingService } from '@/src/domain/services'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Request parameters for LoadSeasonEpisodesUseCase
 */
export interface LoadSeasonEpisodesRequest {
  /** The TV series catalog item to load season episodes for */
  readonly catalogItem: CatalogItem

  /** Season number to load with episodes */
  readonly seasonNumber: number

  /** Optional specific provider ID to use (auto-selected if not provided) */
  readonly providerId?: string

  /** Maximum time to wait for provider response (in milliseconds) */
  readonly timeoutMs?: number

  /** Whether to allow cached results if available */
  readonly allowCache?: boolean
}

/**
 * Result type for LoadSeasonEpisodesUseCase
 */
export interface LoadSeasonEpisodesResponse {
  /** The loaded season with all episodes */
  readonly season: Season

  /** Provider ID that was used to load the season */
  readonly providerId: string

  /** Timestamp when the season was loaded */
  readonly loadedAt: Date

  /** Number of episodes in the loaded season */
  readonly episodeCount: number

  /** Request context for traceability */
  readonly requestId: string

  /** Performance metrics for the operation */
  readonly metrics: LoadSeasonEpisodesMetrics

  /** Whether the result came from cache */
  readonly fromCache: boolean
}

/**
 * Performance and execution metrics for season loading operation
 */
export interface LoadSeasonEpisodesMetrics {
  /** Total execution time in milliseconds */
  readonly executionTime: number

  /** Provider discovery time in milliseconds */
  readonly providerDiscoveryTime: number

  /** Provider initialization time in milliseconds */
  readonly providerInitializationTime: number

  /** Season loading time in milliseconds */
  readonly seasonLoadingTime: number

  /** Number of providers found for capability */
  readonly providersFound: number

  /** Whether auto-selection was used */
  readonly usedAutoSelection: boolean

  /** Provider selection criteria used */
  readonly selectionCriteria: string
}

/**
 * Provider error information for season loading
 */
export interface LoadSeasonEpisodesProviderError {
  readonly providerId: string
  readonly providerName: string
  readonly error: string
  readonly executionTime: number
}

export class LoadSeasonEpisodesUseCase {
  constructor(
    private readonly providerRegistry: IProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to load a specific season with all its episodes
   * Implements provider auto-selection and comprehensive error handling
   */
  async execute(request: LoadSeasonEpisodesRequest): Promise<LoadSeasonEpisodesResponse> {
    const requestId = `load-season-episodes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()
    const timeoutMs = request.timeoutMs ?? 15000
    const allowCache = request.allowCache ?? true

    try {
      this.logger.info('Starting LoadSeasonEpisodesUseCase execution', {
        context: 'load_season_episodes_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        mediaType: request.catalogItem.mediaType,
        seasonNumber: request.seasonNumber,
        providerId: request.providerId || 'auto-select',
        timeoutMs,
        allowCache
      })

      // Validate request parameters
      this.validateRequest(request, requestId)

      // Discover and select provider
      const providerDiscoveryStart = performance.now()
      const selectedProvider = await this.discoverAndSelectProvider(
        request.catalogItem,
        request.providerId,
        requestId
      )
      const providerDiscoveryTime = performance.now() - providerDiscoveryStart

      // Initialize provider
      const initializationStart = performance.now()
      await selectedProvider.initialize()
      const providerInitializationTime = performance.now() - initializationStart

      this.logger.debug('Provider selected and initialized', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        initializationTime: Math.round(providerInitializationTime)
      })

      // Load season with episodes
      const seasonLoadingStart = performance.now()
      const season = await this.loadSeasonWithTimeout(
        selectedProvider,
        request.catalogItem,
        request.seasonNumber,
        timeoutMs,
        requestId
      )
      const seasonLoadingTime = performance.now() - seasonLoadingStart

      const executionTime = performance.now() - startTime
      const loadedAt = new Date()

      // Create metrics
      const metrics: LoadSeasonEpisodesMetrics = {
        executionTime,
        providerDiscoveryTime,
        providerInitializationTime,
        seasonLoadingTime,
        providersFound: 1, // Will be updated with actual count from discovery
        usedAutoSelection: !request.providerId,
        selectionCriteria: request.providerId 
          ? `explicit-provider:${request.providerId}` 
          : `auto-select:${selectedProvider.id}`
      }

      // Validate season data
      this.validateSeasonResponse(season, request.seasonNumber, requestId)

      this.logger.info('LoadSeasonEpisodesUseCase execution completed successfully', {
        context: 'load_season_episodes_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        seasonNumber: request.seasonNumber,
        providerId: selectedProvider.id,
        episodeCount: season.episodes.length,
        executionTime: Math.round(executionTime),
        fromCache: false // TODO: Implement cache detection
      })

      return {
        season,
        providerId: selectedProvider.id,
        loadedAt,
        episodeCount: season.episodes.length,
        requestId,
        metrics,
        fromCache: false // TODO: Implement cache detection
      }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const executionTime = performance.now() - startTime

      this.logger.error('LoadSeasonEpisodesUseCase execution failed', errorInstance, {
        context: 'load_season_episodes_usecase',
        requestId,
        catalogItemId: request.catalogItem.id,
        seasonNumber: request.seasonNumber,
        providerId: request.providerId || 'auto-select',
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to load season episodes: ${errorInstance.message}`)
    }
  }

  /**
   * Validates the request parameters
   */
  private validateRequest(request: LoadSeasonEpisodesRequest, requestId: string): void {
    if (!request.catalogItem) {
      throw new Error('Catalog item is required')
    }

    if (!request.catalogItem.id?.trim()) {
      throw new Error('Catalog item must have a valid ID')
    }

    if (request.catalogItem.mediaType !== MediaType.TV_SERIES) {
      throw new Error('Season episodes can only be loaded for TV series')
    }

    if (!request.catalogItem.contentContext) {
      throw new Error('Catalog item must have content context')
    }

    if (typeof request.seasonNumber !== 'number' || request.seasonNumber < 0) {
      throw new Error('Season number must be a non-negative number')
    }

    if (request.timeoutMs !== undefined && (request.timeoutMs < 2000 || request.timeoutMs > 60000)) {
      throw new Error('Timeout must be between 2000ms and 60000ms')
    }

    this.logger.debug('Request validation passed', undefined, {
      context: 'load_season_episodes_usecase',
      requestId,
      catalogItemId: request.catalogItem.id,
      mediaType: request.catalogItem.mediaType,
      seasonNumber: request.seasonNumber,
      providerId: request.catalogItem.contentContext.providerId
    })
  }

  /**
   * Discovers available providers and selects the appropriate one
   */
  private async discoverAndSelectProvider(
    catalogItem: CatalogItem,
    explicitProviderId: string | undefined,
    requestId: string
  ): Promise<ISeasonsProvider> {
    try {
      // Get all available seasons providers
      const availableProviders = await this.providerRegistry.getProvidersByCapability<ISeasonsProvider>(
        ProviderCapability.SEASONS_EPISODES
      )

      if (availableProviders.length === 0) {
        throw new Error('No seasons providers are available')
      }

      this.logger.debug('Discovered seasons providers', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        providersFound: availableProviders.length,
        providerIds: availableProviders.map(p => p.id)
      })

      // If explicit provider ID is specified, find and use it
      if (explicitProviderId) {
        const explicitProvider = availableProviders.find(provider => provider.id === explicitProviderId)
        if (!explicitProvider) {
          throw new Error(`Specified provider '${explicitProviderId}' not found or does not support seasons`)
        }

        this.logger.debug('Using explicitly specified provider', undefined, {
          context: 'load_season_episodes_usecase',
          requestId,
          providerId: explicitProvider.id,
          providerName: explicitProvider.name
        })

        return explicitProvider
      }

      // Auto-select provider based on catalog item context
      const autoSelectedProvider = this.autoSelectProvider(availableProviders, catalogItem, requestId)

      this.logger.debug('Auto-selected provider based on catalog item context', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        selectedProviderId: autoSelectedProvider.id,
        selectedProviderName: autoSelectedProvider.name,
        catalogItemProviderId: catalogItem.contentContext.providerId,
        selectionReason: 'context-match-or-priority'
      })

      return autoSelectedProvider

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to discover and select seasons provider', errorInstance, {
        context: 'load_season_episodes_usecase',
        requestId,
        catalogItemId: catalogItem.id,
        explicitProviderId
      })
      throw errorInstance
    }
  }

  /**
   * Auto-selects the most appropriate provider based on catalog item context
   */
  private autoSelectProvider(
    availableProviders: ISeasonsProvider[],
    catalogItem: CatalogItem,
    requestId: string
  ): ISeasonsProvider {
    // Priority 1: Provider that matches the catalog item's original provider
    const matchingProvider = availableProviders.find(
      provider => provider.id === catalogItem.contentContext.providerId
    )

    if (matchingProvider) {
      this.logger.debug('Selected provider matching catalog item context', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        providerId: matchingProvider.id,
        selectionCriteria: 'context-match'
      })
      return matchingProvider
    }

    // Priority 2: Provider with highest priority (assuming providers have priority property)
    const prioritizedProvider = availableProviders.reduce((highest, current) => {
      const currentPriority = (current as any).priority ?? 0
      const highestPriority = (highest as any).priority ?? 0
      return currentPriority > highestPriority ? current : highest
    })

    this.logger.debug('Selected provider based on priority', undefined, {
      context: 'load_season_episodes_usecase',
      requestId,
      providerId: prioritizedProvider.id,
      selectionCriteria: 'priority-based',
      availableProviderCount: availableProviders.length
    })

    return prioritizedProvider
  }

  /**
   * Loads season with timeout protection
   */
  private async loadSeasonWithTimeout(
    provider: ISeasonsProvider,
    catalogItem: CatalogItem,
    seasonNumber: number,
    timeoutMs: number,
    requestId: string
  ): Promise<Season> {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Season loading timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    // Race between actual loading and timeout
    const loadingPromise = provider.getSeasonWithEpisodes(catalogItem, seasonNumber)

    try {
      const season = await Promise.race([loadingPromise, timeoutPromise])

      this.logger.debug('Season loaded successfully within timeout', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        providerId: provider.id,
        seasonNumber,
        episodeCount: season.episodes.length,
        timeoutMs
      })

      return season

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      
      this.logger.warn('Season loading failed or timed out', errorInstance, {
        context: 'load_season_episodes_usecase',
        requestId,
        providerId: provider.id,
        seasonNumber,
        timeoutMs,
        errorType: errorInstance.message.includes('timeout') ? 'timeout' : 'provider-error'
      })

      throw errorInstance
    }
  }

  /**
   * Validates the season response from provider
   */
  private validateSeasonResponse(season: Season, expectedSeasonNumber: number, requestId: string): void {
    if (!season) {
      throw new Error('Provider returned null or undefined season')
    }

    if (!season.id) {
      throw new Error('Season must have a valid ID')
    }

    if (season.seasonNumber !== expectedSeasonNumber) {
      this.logger.warn('Season number mismatch in provider response', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        expectedSeasonNumber,
        actualSeasonNumber: season.seasonNumber,
        seasonId: season.id
      })
    }

    if (!Array.isArray(season.episodes)) {
      throw new Error('Season episodes must be an array')
    }

    if (season.episodeCount !== undefined && season.episodes.length !== season.episodeCount) {
      this.logger.warn('Episode count mismatch in season data', undefined, {
        context: 'load_season_episodes_usecase',
        requestId,
        seasonId: season.id,
        declaredEpisodeCount: season.episodeCount,
        actualEpisodeCount: season.episodes.length
      })
    }

    // Validate episode data structure
    season.episodes.forEach((episode, index) => {
      if (!episode.id) {
        this.logger.warn('Episode missing ID in season data', undefined, {
          context: 'load_season_episodes_usecase',
          requestId,
          seasonId: season.id,
          episodeIndex: index,
          episodeNumber: episode.episodeNumber
        })
      }
    })

    this.logger.debug('Season response validation passed', undefined, {
      context: 'load_season_episodes_usecase',
      requestId,
      seasonId: season.id,
      seasonNumber: season.seasonNumber,
      episodeCount: season.episodes.length,
      validEpisodes: season.episodes.filter(ep => ep.id).length
    })
  }
}