/**
 * TMDB Provider Registration - Factory Registration for All TMDB Capabilities
 * 
 * Registers TMDB provider constructors with the provider factory for all supported capabilities.
 * Implements the "registration = capability" principle of the new provider system.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0
 */

import type { ProviderFactory } from '../provider-factory'
import { ProviderCapability } from '../provider-interfaces'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { TMDBClient } from '@/src/infrastructure/api/tmdb-client'

// Import TMDB provider implementations
import { TMDBMetadataProvider } from './tmdb-metadata-provider'
import { TMDBCatalogProvider } from './tmdb-catalog-provider'
import { TMDBSearchProvider } from './tmdb-search-provider'

/**
 * TMDB Provider Configuration
 */
export interface TMDBProviderConfig {
  providerId: string
  enabled: boolean
  priority: number
  tmdbClient: TMDBClient
  settings?: {
    imageConfiguration?: {
      baseUrl?: string
      secureBaseUrl?: string
      posterSizes?: string[]
      backdropSizes?: string[]
    }
    searchConfiguration?: {
      defaultPageSize?: number
      maxPageSize?: number
      minQueryLength?: number
    }
    catalogConfiguration?: {
      supportedGenres?: Record<string, number[]>
      defaultSort?: string
    }
  }
}

/**
 * Default TMDB provider configuration
 */
const DEFAULT_TMDB_CONFIG: Omit<TMDBProviderConfig, 'tmdbClient'> = {
  providerId: 'tmdb',
  enabled: true,
  priority: 10, // Higher priority than most providers
  settings: {
    imageConfiguration: {
      secureBaseUrl: 'https://image.tmdb.org/t/p/',
      posterSizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
      backdropSizes: ['w300', 'w780', 'w1280', 'original']
    },
    searchConfiguration: {
      defaultPageSize: 20,
      maxPageSize: 40,
      minQueryLength: 2
    },
    catalogConfiguration: {
      defaultSort: 'popularity.desc'
    }
  }
}

/**
 * Register all TMDB provider capabilities with the factory
 */
export function registerTMDBProviders(
  factory: ProviderFactory,
  logger: ILoggingService,
  tmdbClient: TMDBClient,
  config?: Partial<TMDBProviderConfig>
): void {
  // Merge with default configuration
  const effectiveConfig: TMDBProviderConfig = {
    ...DEFAULT_TMDB_CONFIG,
    ...config,
    tmdbClient
  }

  logger.info('Starting TMDB provider registration with factory', {
    providerId: effectiveConfig.providerId,
    enabled: effectiveConfig.enabled,
    priority: effectiveConfig.priority,
    hasValidClient: !!tmdbClient,
    clientType: tmdbClient?.constructor?.name || 'unknown',
    capabilitiesToRegister: [
      ProviderCapability.METADATA,
      ProviderCapability.CATALOG,
      ProviderCapability.SEARCH
    ]
  })

  try {
    // Register Metadata Provider
    logger.debug('Registering TMDB Metadata Provider', undefined, {
      providerId: effectiveConfig.providerId,
      capability: ProviderCapability.METADATA
    })
    factory.registerProvider(
      effectiveConfig.providerId,
      ProviderCapability.METADATA,
      TMDBMetadataProvider as any
    )
    logger.debug('TMDB Metadata Provider registered successfully')

    // Register Catalog Provider
    logger.debug('Registering TMDB Catalog Provider', undefined, {
      providerId: effectiveConfig.providerId,
      capability: ProviderCapability.CATALOG
    })
    factory.registerProvider(
      effectiveConfig.providerId,
      ProviderCapability.CATALOG,
      TMDBCatalogProvider as any
    )
    logger.debug('TMDB Catalog Provider registered successfully')

    // Register Search Provider  
    logger.debug('Registering TMDB Search Provider', undefined, {
      providerId: effectiveConfig.providerId,
      capability: ProviderCapability.SEARCH
    })
    factory.registerProvider(
      effectiveConfig.providerId,
      ProviderCapability.SEARCH,
      TMDBSearchProvider as any
    )
    logger.debug('TMDB Search Provider registered successfully')

    // Could register additional capabilities in the future:
    // - Rating Provider (for user ratings via TMDB account)
    // - Image Provider (dedicated image management)
    // - Video Provider (trailers and clips)

    logger.info('Successfully registered TMDB providers', {
      providerId: effectiveConfig.providerId,
      capabilities: [
        ProviderCapability.METADATA,
        ProviderCapability.CATALOG,
        ProviderCapability.SEARCH
      ]
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to register TMDB providers', undefined, {
      providerId: effectiveConfig.providerId,
      error: errorMessage
    })
    throw new Error(`TMDB provider registration failed: ${errorMessage}`)
  }
}

/**
 * Unregister all TMDB provider capabilities from the factory
 */
export function unregisterTMDBProviders(
  factory: ProviderFactory,
  logger: ILoggingService,
  providerId: string = 'tmdb'
): void {
  logger.info('Unregistering TMDB providers from factory', { providerId })

  try {
    const removedCount = factory.unregisterProviderAllCapabilities(providerId)
    
    logger.info('Successfully unregistered TMDB providers', {
      providerId,
      removedCapabilities: removedCount
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to unregister TMDB providers', undefined, {
      providerId,
      error: errorMessage
    })
    throw new Error(`TMDB provider unregistration failed: ${errorMessage}`)
  }
}

/**
 * Get TMDB provider capabilities that are currently registered
 */
export function getTMDBProviderCapabilities(
  factory: ProviderFactory,
  providerId: string = 'tmdb'
): ProviderCapability[] {
  return factory.getProviderCapabilities(providerId)
}

/**
 * Check if TMDB providers are registered and healthy
 */
export async function checkTMDBProviderHealth(
  factory: ProviderFactory,
  logger: ILoggingService,
  providerId: string = 'tmdb'
): Promise<{
  capability: ProviderCapability
  healthy: boolean
  error?: string
  responseTime?: number
}[]> {
  const capabilities = getTMDBProviderCapabilities(factory, providerId)
  const healthResults = []

  for (const capability of capabilities) {
    try {
      const provider = factory.getCachedInstance(providerId, capability)
      if (provider) {
        const healthResult = await provider.healthCheck()
        healthResults.push({
          capability,
          healthy: healthResult.healthy,
          error: healthResult.error,
          responseTime: healthResult.responseTime
        })
      } else {
        healthResults.push({
          capability,
          healthy: false,
          error: 'Provider instance not found'
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      healthResults.push({
        capability,
        healthy: false,
        error: errorMessage
      })
    }
  }

  return healthResults
}

/**
 * Create base provider configuration for TMDB providers
 */
export function createTMDBBaseConfig(
  config: TMDBProviderConfig,
  capability: ProviderCapability
): import('../provider-interfaces').BaseProviderConfig {
  return {
    id: `${config.providerId}-${capability}`,
    name: `TMDB ${capability.charAt(0).toUpperCase() + capability.slice(1)} Provider`,
    type: capability,
    enabled: config.enabled,
    priority: config.priority,
    settings: config.settings || {}
  }
}

/**
 * TMDB Provider Factory Helper - Convenience wrapper for creating TMDB provider instances
 */
export class TMDBProviderFactoryHelper {
  constructor(
    private readonly factory: ProviderFactory,
    private readonly logger: ILoggingService,
    private readonly tmdbClient: TMDBClient
  ) {
    this.logger.debug('TMDB Provider Factory Helper initialized', undefined, {
      hasValidClient: !!tmdbClient
    })
  }

  /**
   * Initialize TMDB providers with full registration
   */
  async initialize(config?: Partial<TMDBProviderConfig>): Promise<void> {
    this.logger.info('Starting TMDB provider system initialization', {
      hasValidClient: !!this.tmdbClient,
      providedConfig: !!config
    })

    try {
      // Register all TMDB providers
      this.logger.debug('Calling registerTMDBProviders')
      registerTMDBProviders(this.factory, this.logger, this.tmdbClient, config)
      this.logger.debug('registerTMDBProviders completed successfully')

      // Validate that providers were registered correctly  
      const registeredCapabilities = this.factory.getProviderCapabilities('tmdb')
      this.logger.info('TMDB providers registered, checking capabilities', {
        registeredCapabilities,
        capabilityCount: registeredCapabilities.length,
        expectedCapabilities: ['metadata', 'catalog', 'search']
      })

      // Validate health of registered providers
      this.logger.debug('Starting TMDB provider health checks')
      const healthResults = await checkTMDBProviderHealth(this.factory, this.logger)
      const unhealthyProviders = healthResults.filter(result => !result.healthy)

      if (unhealthyProviders.length > 0) {
        this.logger.warn('Some TMDB providers failed health check', undefined, {
          unhealthyProviders: unhealthyProviders.map(p => ({
            capability: p.capability,
            error: p.error,
            responseTime: p.responseTime
          })),
          healthyProviders: healthResults.filter(result => result.healthy).length,
          totalProviders: healthResults.length
        })
      } else {
        this.logger.info('All TMDB providers initialized successfully and are healthy', {
          totalProviders: healthResults.length,
          capabilities: healthResults.map(r => r.capability)
        })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Failed to initialize TMDB provider system', error instanceof Error ? error : new Error(errorMessage), {
        error: errorMessage,
        hasValidClient: !!this.tmdbClient,
        clientType: this.tmdbClient?.constructor?.name || 'unknown'
      })
      throw error
    }
  }

  /**
   * Shutdown TMDB providers
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down TMDB provider system')

    try {
      unregisterTMDBProviders(this.factory, this.logger)
      this.logger.info('TMDB provider system shutdown complete')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error('Error during TMDB provider shutdown', undefined, {
        error: errorMessage
      })
      throw error
    }
  }

  /**
   * Get provider instance for specific capability
   */
  getProvider<T extends ProviderCapability>(
    capability: T,
    providerId: string = 'tmdb'
  ): import('../provider-interfaces').ProviderCapabilityMap[T] | null {
    const baseConfig = createTMDBBaseConfig({ 
      providerId, 
      enabled: true, 
      priority: 10, 
      tmdbClient: this.tmdbClient 
    }, capability)

    return this.factory.getOrCreateProvider(providerId, capability, baseConfig)
  }

  /**
   * Get factory statistics for TMDB providers
   */
  getStatistics() {
    return this.factory.getStatistics()
  }
}