import { IProviderSource, ProviderSourceType, ProviderSourceConfig } from '@/src/domain/providers/base/provider-source.interface'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { DIContainer } from '@/src/infrastructure/di/container'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { TMDBCatalogProvider } from './tmdb/tmdb-catalog.provider'
import { TMDBMetadataProvider } from './tmdb/tmdb-metadata.provider'
import { TMDBImagesProvider } from './tmdb/tmdb-images.provider'
import { TMDBExternalIdsProvider } from './tmdb/tmdb-external-ids.provider'

/**
 * TMDB Provider Source
 * Manages all TMDB-related providers and handles their registration
 */
export class TMDBProviderSource implements IProviderSource {
  public readonly id = 'tmdb'
  public readonly name = 'The Movie Database'
  public readonly type = ProviderSourceType.API
  public readonly availableCapabilities: ProviderCapability[] = [
    ProviderCapability.CATALOG,
    ProviderCapability.METADATA,
    ProviderCapability.EXTERNAL_IDS
  ]

  public readonly config: ProviderSourceConfig

  private providers: IProvider[] = []
  private isInitialized = false

  constructor(
    private readonly registry: IProviderRegistry,
    private readonly container: DIContainer,
    private readonly logger: ILoggingService
  ) {
    this.config = {
      baseUrl: 'https://api.themoviedb.org/3',
      timeout: 10000,
      settings: {
        useAppendToResponse: true,
        enableImageOptimization: true,
        defaultLanguage: 'en-US'
      }
    }

    this.logger.info('TMDBProviderSource: Initialized', {
      sourceId: this.id,
      sourceName: this.name,
      sourceType: this.type,
      availableCapabilities: this.availableCapabilities,
      config: this.config
    })
  }

  /**
   * Initialize the TMDB provider source
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.debug('TMDBProviderSource: Already initialized, skipping')
      return
    }

    const startTime = Date.now()
    this.logger.info('TMDBProviderSource: Starting initialization')

    try {
      // Get required services from container
      const tmdbService = this.container.resolve<ITMDBService>(TOKENS.TMDB_SERVICE)
      
      this.logger.debug('TMDBProviderSource: Retrieved TMDB service from container', undefined, {
        serviceType: 'ITMDBService'
      })

      // Verify TMDB service is working
      await this.verifyTMDBService(tmdbService)

      this.isInitialized = true
      const initTime = Date.now() - startTime

      this.logger.info('TMDBProviderSource: Initialization completed', {
        sourceId: this.id,
        initializationTime: initTime,
        isInitialized: this.isInitialized
      })

    } catch (error) {
      const initTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('TMDBProviderSource: Initialization failed', error instanceof Error ? error : new Error(String(error)), {
        sourceId: this.id,
        initializationTime: initTime,
        errorMessage
      })

      throw new Error(`TMDBProviderSource initialization failed: ${errorMessage}`)
    }
  }

  /**
   * Register individual TMDB providers with the registry
   */
  async registerProviders(registry: IProviderRegistry): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn('TMDBProviderSource: Not initialized, initializing now')
      await this.initialize()
    }

    const startTime = Date.now()
    this.logger.info('TMDBProviderSource: Starting individual provider registration')

    try {
      // Get required services from container
      const tmdbService = this.container.resolve<ITMDBService>(TOKENS.TMDB_SERVICE)

      // Create and register individual providers
      const catalogProvider = new TMDBCatalogProvider(tmdbService, this.logger, this.id)
      const metadataProvider = new TMDBMetadataProvider(tmdbService, this.logger, this.id)
      const imagesProvider = new TMDBImagesProvider(tmdbService, this.logger, this.id)
      const externalIdsProvider = new TMDBExternalIdsProvider(tmdbService, this.logger, this.id)

      // Register each provider
      await this.registerSingleProvider(registry, catalogProvider, 'catalog')
      await this.registerSingleProvider(registry, metadataProvider, 'metadata')
      await this.registerSingleProvider(registry, imagesProvider, 'images')
      await this.registerSingleProvider(registry, externalIdsProvider, 'external-ids')

      const registrationTime = Date.now() - startTime

      this.logger.info('TMDBProviderSource: Individual providers registered successfully', {
        sourceId: this.id,
        providerCount: this.providers.length,
        providersRegistered: this.providers.map(p => ({ id: p.id, name: p.name, capabilities: p.capabilities })),
        registrationTime
      })

    } catch (error) {
      const registrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('TMDBProviderSource: Provider registration failed', error instanceof Error ? error : new Error(String(error)), {
        sourceId: this.id,
        registrationTime,
        errorMessage,
        providersCreated: this.providers.length
      })

      throw new Error(`TMDBProviderSource provider registration failed: ${errorMessage}`)
    }
  }

  /**
   * Get all providers from this source
   */
  async getProviders(): Promise<IProvider[]> {
    this.logger.debug('TMDBProviderSource: Getting all providers', undefined, {
      sourceId: this.id,
      providerCount: this.providers.length
    })

    return [...this.providers] // Return copy to prevent external modification
  }

  /**
   * Get providers by capability from this source
   */
  async getProvidersByCapability(capability: ProviderCapability): Promise<IProvider[]> {
    const providers = this.providers.filter(provider => 
      provider.capabilities.includes(capability)
    )

    this.logger.debug('TMDBProviderSource: Getting providers by capability', undefined, {
      sourceId: this.id,
      capability,
      matchingProviders: providers.length,
      providers: providers.map(p => ({ id: p.id, name: p.name }))
    })

    return providers
  }


  /**
   * Register a single provider with comprehensive logging
   */
  private async registerSingleProvider(
    registry: IProviderRegistry,
    provider: IProvider,
    providerType: string
  ): Promise<void> {
    const startTime = Date.now()

    try {
      // Initialize the provider
      this.logger.debug(`TMDBProviderSource: Initializing ${providerType} provider`, undefined, {
        providerId: provider.id
      })

      await provider.initialize()

      // Register with registry
      this.logger.debug(`TMDBProviderSource: Registering ${providerType} provider with registry`, undefined, {
        providerId: provider.id
      })

      registry.registerProvider(provider)

      // Add to our internal providers list
      this.providers.push(provider)

      const registrationTime = Date.now() - startTime

      this.logger.info(`TMDBProviderSource: ${providerType} provider registered successfully`, {
        providerId: provider.id,
        providerName: provider.name,
        capabilities: provider.capabilities,
        priority: provider.priority,
        registrationTime
      })

    } catch (error) {
      const registrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error(`TMDBProviderSource: Failed to register ${providerType} provider`, error instanceof Error ? error : new Error(String(error)), {
        providerId: provider.id,
        providerType,
        registrationTime,
        errorMessage
      })

      throw new Error(`Failed to register ${providerType} provider: ${errorMessage}`)
    }
  }

  /**
   * Verify TMDB service is working
   */
  private async verifyTMDBService(tmdbService: ITMDBService): Promise<void> {
    this.logger.debug('TMDBProviderSource: Verifying TMDB service connectivity')

    try {
      // Try to get TMDB configuration as a connectivity test
      const startTime = Date.now()
      
      // Use the actual TMDB service configuration method
      await tmdbService.getConfiguration()
      
      const verificationTime = Date.now() - startTime

      this.logger.info('TMDBProviderSource: TMDB service verification successful', {
        verificationTime
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.warn('TMDBProviderSource: TMDB service verification failed, but continuing initialization', error instanceof Error ? error : new Error(String(error)), {
        errorMessage,
        note: 'This may indicate network issues or API key problems, but providers will still be registered'
      })

      // Don't throw here - just log the warning and continue
      // This allows the app to start even if TMDB is temporarily unavailable
    }
  }
}