import { DIContainer } from './container'
import { TOKENS } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient, ApiConfig, IUserPreferenceService, IEnvironmentService, ITMDBConfigService } from '@/src/domain/services'
import { IUserRepository } from '@/src/domain/repositories'
import { IMediaRepository } from '@/src/domain/repositories/media.repository.interface'
import {
  GetOrCreateUserUseCase,
  UpdateUserPreferencesUseCase,
  ResetUserPreferencesUseCase,
  UpdateUserThemeUseCase,
  UpdateUserLocaleUseCase
} from '@/src/domain/usecases'
import { GetBasicCatalogItemsUseCase } from '@/src/domain/usecases/get-basic-catalog-items.usecase'
import { GetAllCatalogsUseCase } from '@/src/domain/usecases/get-all-catalogs.usecase'
import { MediaDetailUseCase } from '@/src/domain/use-cases/media-detail.use-case'
import { GetProviderCapabilitiesUseCase } from '@/src/domain/usecases/get-provider-capabilities.usecase'
import { UpdateProviderCapabilitiesUseCase } from '@/src/domain/usecases/update-provider-capabilities.usecase'
import { ConsoleLoggingService } from '@/src/infrastructure/logging'
import { AsyncStorageService } from '@/src/infrastructure/storage'
import { AxiosApiClient, ConfigClient } from '@/src/infrastructure/api'
import { UserPreferenceService, EnvironmentService } from '@/src/infrastructure/services'
import { TMDBConfigService } from '@/src/infrastructure/services/implementations/tmdb-config.service'
import { TMDBApiClient } from '@/src/infrastructure/api/implementations/tmdb-api-client.service'
import { TMDBClient } from '@/src/infrastructure/api/tmdb-client'
import { UserRepository } from '@/src/data/repositories/implementations/user.repository'
import { MediaRepository } from '@/src/data/repositories/implementations/media.repository'

// Provider System Imports
import { 
  ProviderFactory, 
  ProviderRegistry, 
  TMDBProviderFactoryHelper,
  ProviderCapability,
  BaseProviderConfig
} from '@/src/infrastructure/providers'
import { TMDBMetadataProvider } from '@/src/infrastructure/providers/tmdb/tmdb-metadata-provider'
import { TMDBCatalogProvider } from '@/src/infrastructure/providers/tmdb/tmdb-catalog-provider'
import { TMDBSearchProvider } from '@/src/infrastructure/providers/tmdb/tmdb-search-provider'

const container = new DIContainer()

export const initializeDI = (apiConfig: ApiConfig): void => {
  // Register Logging Service First (no dependencies)
  container.registerSingleton<ILoggingService>(
    TOKENS.LOGGING_SERVICE,
    () => new ConsoleLoggingService()
  )

  // Register Environment Service (depends on logging)
  container.registerSingleton<IEnvironmentService>(
    TOKENS.ENVIRONMENT_SERVICE,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new EnvironmentService(logger)
    }
  )

  // Register API Configuration
  container.registerSingleton(TOKENS.API_CONFIG, () => apiConfig)

  // Register Storage Service (depends on logging)
  container.registerSingleton<IStorageService>(
    TOKENS.STORAGE_SERVICE,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new AsyncStorageService(logger)
    }
  )

  // Register User Repository (depends on storage and logging)
  container.registerSingleton<IUserRepository>(
    TOKENS.USER_REPOSITORY,
    () => {
      const storageService = container.resolve<IStorageService>(TOKENS.STORAGE_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new UserRepository(storageService, logger)
    }
  )

  // Register User Preference Service (depends on user repository, logging, and environment)
  container.registerSingleton<IUserPreferenceService>(
    TOKENS.USER_PREFERENCE_SERVICE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const environmentService = container.resolve<IEnvironmentService>(TOKENS.ENVIRONMENT_SERVICE)
      return new UserPreferenceService(userRepository, logger, environmentService)
    }
  )

  // Register TMDB Config Service (depends on environment, user preferences, and logging)
  container.registerSingleton<ITMDBConfigService>(
    TOKENS.TMDB_CONFIG_SERVICE,
    () => {
      const environmentService = container.resolve<IEnvironmentService>(TOKENS.ENVIRONMENT_SERVICE)
      const userPreferenceService = container.resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new TMDBConfigService(environmentService, userPreferenceService, logger)
    }
  )

  // Register TMDB API Client (depends on TMDB config service and logging)
  container.registerSingleton<TMDBApiClient>(
    TOKENS.TMDB_API_CLIENT,
    () => {
      const tmdbConfigService = container.resolve<ITMDBConfigService>(TOKENS.TMDB_CONFIG_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new TMDBApiClient(tmdbConfigService, logger)
    }
  )

  // Register Centralized TMDB Client (depends on TMDB config service, logging, and base API client)
  container.registerSingleton<TMDBClient>(
    TOKENS.TMDB_CLIENT,
    () => {
      const tmdbConfigService = container.resolve<ITMDBConfigService>(TOKENS.TMDB_CONFIG_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const baseApiClient = container.resolve<IApiClient>(TOKENS.API_CLIENT)
      return new TMDBClient(tmdbConfigService, logger, baseApiClient)
    }
  )

  // Register Config Client (depends on logging and user preferences)
  container.registerSingleton<IConfigClient>(
    TOKENS.CONFIG_CLIENT,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const config = container.resolve<ApiConfig>(TOKENS.API_CONFIG)
      const userPreferenceService = container.resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
      return new ConfigClient(config, logger, userPreferenceService)
    }
  )

  // Register API Client (depends on logging, config client, and user preferences)
  container.registerSingleton<IApiClient>(
    TOKENS.API_CLIENT,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const config = container.resolve<ApiConfig>(TOKENS.API_CONFIG)
      return new AxiosApiClient(config, logger)
    }
  )

  // ============================================================================
  // PROVIDER SYSTEM REGISTRATION
  // ============================================================================

  // Register Provider Factory (depends on logging)
  container.registerSingleton<ProviderFactory>(
    TOKENS.PROVIDER_FACTORY,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new ProviderFactory(logger)
    }
  )

  // Register Provider Registry (depends on logging, creates its own factory)
  container.registerSingleton<ProviderRegistry>(
    TOKENS.PROVIDER_REGISTRY,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new ProviderRegistry(logger)
    }
  )

  // Register TMDB Provider Helper (depends on factory, logging, and TMDB client)
  container.registerSingleton<TMDBProviderFactoryHelper>(
    TOKENS.TMDB_PROVIDER_HELPER,
    () => {
      const factory = container.resolve<ProviderFactory>(TOKENS.PROVIDER_FACTORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const tmdbClient = container.resolve<TMDBClient>(TOKENS.TMDB_CLIENT)
      return new TMDBProviderFactoryHelper(factory, logger, tmdbClient)
    }
  )

  // ============================================================================
  // MEDIA SERVICES REGISTRATION
  // ============================================================================

  // Register Media Repository (depends on use cases, storage, and logging)
  container.registerSingleton<IMediaRepository>(
    TOKENS.MEDIA_REPOSITORY,
    () => {
      const catalogItemsUseCase = container.resolve<GetBasicCatalogItemsUseCase>(TOKENS.GET_BASIC_CATALOG_ITEMS_USE_CASE)
      const mediaDetailUseCase = container.resolve<MediaDetailUseCase>(TOKENS.MEDIA_DETAIL_USE_CASE)
      const storageService = container.resolve<IStorageService>(TOKENS.STORAGE_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new MediaRepository(catalogItemsUseCase, mediaDetailUseCase, storageService, logger)
    }
  )

  // Register Get Basic Catalog Items Use Case (depends on provider registry and logging)
  container.registerSingleton<GetBasicCatalogItemsUseCase>(
    TOKENS.GET_BASIC_CATALOG_ITEMS_USE_CASE,
    () => {
      const providerRegistry = container.resolve<ProviderRegistry>(TOKENS.PROVIDER_REGISTRY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new GetBasicCatalogItemsUseCase(providerRegistry, logger)
    }
  )

  // Register Get All Catalogs Use Case (depends on provider registry and logging)
  container.registerSingleton<GetAllCatalogsUseCase>(
    TOKENS.GET_ALL_CATALOGS_USE_CASE,
    () => {
      const providerRegistry = container.resolve<ProviderRegistry>(TOKENS.PROVIDER_REGISTRY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new GetAllCatalogsUseCase(providerRegistry, logger)
    }
  )

  // Register Media Detail Use Case (already exists, just add to tokens)
  container.registerSingleton<MediaDetailUseCase>(
    TOKENS.MEDIA_DETAIL_USE_CASE,
    () => {
      const providerRegistry = container.resolve<ProviderRegistry>(TOKENS.PROVIDER_REGISTRY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new MediaDetailUseCase(providerRegistry, logger)
    }
  )

  // ============================================================================
  // USE CASE REGISTRATION
  // ============================================================================

  container.registerSingleton<GetOrCreateUserUseCase>(
    TOKENS.GET_OR_CREATE_USER_USE_CASE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new GetOrCreateUserUseCase(userRepository, logger)
    }
  )

  container.registerSingleton<UpdateUserPreferencesUseCase>(
    TOKENS.UPDATE_USER_PREFERENCES_USE_CASE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new UpdateUserPreferencesUseCase(userRepository, logger)
    }
  )

  container.registerSingleton<ResetUserPreferencesUseCase>(
    TOKENS.RESET_USER_PREFERENCES_USE_CASE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new ResetUserPreferencesUseCase(userRepository, logger)
    }
  )

  container.registerSingleton<UpdateUserThemeUseCase>(
    TOKENS.UPDATE_USER_THEME_USE_CASE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new UpdateUserThemeUseCase(userRepository, logger)
    }
  )

  container.registerSingleton<UpdateUserLocaleUseCase>(
    TOKENS.UPDATE_USER_LOCALE_USE_CASE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new UpdateUserLocaleUseCase(userRepository, logger)
    }
  )

  // Provider Capabilities Use Cases
  container.registerSingleton<GetProviderCapabilitiesUseCase>(
    TOKENS.GET_PROVIDER_CAPABILITIES_USE_CASE,
    () => {
      const providerRegistry = container.resolve<ProviderRegistry>(TOKENS.PROVIDER_REGISTRY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new GetProviderCapabilitiesUseCase(providerRegistry, logger)
    }
  )

  container.registerSingleton<UpdateProviderCapabilitiesUseCase>(
    TOKENS.UPDATE_PROVIDER_CAPABILITIES_USE_CASE,
    () => {
      const userRepository = container.resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new UpdateProviderCapabilitiesUseCase(userRepository, logger)
    }
  )

  // Log successful initialization
  const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
  logger.info('DI Container initialized successfully', {
    services: [
      'LoggingService',
      'EnvironmentService',
      'StorageService',
      'UserRepository',
      'UserPreferenceService',
      'TMDBConfigService',
      'TMDBApiClient',
      'TMDBClient',
      'ConfigClient',
      'ApiClient',
      'ProviderFactory',
      'ProviderRegistry',
      'TMDBProviderHelper',
      'MediaRepository',
      'GetBasicCatalogItemsUseCase',
      'GetAllCatalogsUseCase',
      'MediaDetailUseCase',
      'GetOrCreateUserUseCase',
      'UpdateUserPreferencesUseCase',
      'ResetUserPreferencesUseCase',
      'UpdateUserThemeUseCase',
      'UpdateUserLocaleUseCase',
      'GetProviderCapabilitiesUseCase',
      'UpdateProviderCapabilitiesUseCase'
    ]
  })
}

/**
 * Initialize TMDB providers after DI container setup
 * Call this after initializeDI to register TMDB provider capabilities
 */
export const initializeTMDBProviders = async (): Promise<void> => {
  const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
  const tmdbProviderHelper = container.resolve<TMDBProviderFactoryHelper>(TOKENS.TMDB_PROVIDER_HELPER)
  const providerRegistry = container.resolve<ProviderRegistry>(TOKENS.PROVIDER_REGISTRY)

  try {
    logger.info('Starting TMDB provider initialization with registry registration')
    
    // Initialize the TMDB provider system (this registers with factory)
    await tmdbProviderHelper.initialize()
    
    // Now register TMDB providers with the registry using the proper pattern
    const tmdbClient = container.resolve<TMDBClient>(TOKENS.TMDB_CLIENT)
    const baseConfig = {
      id: 'tmdb',
      name: 'TMDB Provider',
      type: 'external',
      enabled: true,
      priority: 10,
      settings: {}
    }
    
    // Register TMDB with all its capabilities in the registry
    // Create wrapper factories that handle TMDBClient dependency
    const tmdbCapabilities = {
      [ProviderCapability.METADATA]: class extends TMDBMetadataProvider {
        constructor(config: BaseProviderConfig, logger: ILoggingService) {
          super(config, logger, tmdbClient)
        }
      },
      [ProviderCapability.CATALOG]: class extends TMDBCatalogProvider {
        constructor(config: BaseProviderConfig, logger: ILoggingService) {
          super(config, logger, tmdbClient)
        }
      },
      [ProviderCapability.SEARCH]: class extends TMDBSearchProvider {
        constructor(config: BaseProviderConfig, logger: ILoggingService) {
          super(config, logger, tmdbClient)
        }
      }
    }
    
    logger.debug('Registering TMDB providers with registry', undefined, {
      providerId: 'tmdb',
      capabilities: Object.keys(tmdbCapabilities),
      capabilityCount: Object.keys(tmdbCapabilities).length
    })
    
    providerRegistry.registerProviderWithCapabilities('tmdb', tmdbCapabilities, baseConfig)
    
    // Verify registration was successful
    const registeredCapabilities = providerRegistry.getAvailableCapabilities('tmdb')
    const catalogProviders = providerRegistry.getProvidersForCapability(ProviderCapability.CATALOG)
    
    logger.info('TMDB providers registered with registry successfully', {
      registeredCapabilities,
      capabilitiesCount: registeredCapabilities.length,
      catalogProvidersCount: catalogProviders.length,
      catalogProviders: catalogProviders.map(p => p.providerId)
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to initialize TMDB providers', error instanceof Error ? error : new Error(errorMessage), { 
      error: errorMessage,
      context: 'TMDB-registry-initialization'
    })
    throw error
  }
}

export { container }