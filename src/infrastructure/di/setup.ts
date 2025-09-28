import { DIContainer } from './container'
import { TOKENS } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient, ApiConfig, IUserPreferenceService, IEnvironmentService } from '@/src/domain/services'
import { IUserRepository } from '@/src/domain/repositories'
import {
  GetOrCreateUserUseCase,
  UpdateUserPreferencesUseCase,
  ResetUserPreferencesUseCase,
  UpdateUserThemeUseCase,
  UpdateUserLocaleUseCase,
  GetAllCatalogsUseCase,
  LoadMoreCatalogItemsUseCase
} from '@/src/domain/usecases'
import { ConsoleLoggingService } from '@/src/infrastructure/logging'
import { AsyncStorageService } from '@/src/infrastructure/storage'
import { AxiosApiClient, ConfigClient } from '@/src/infrastructure/api'
import { UserPreferenceService, EnvironmentService } from '@/src/infrastructure/services'
import { UserRepository } from '@/src/data/repositories/implementations/user.repository'
import { createTMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import type { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { createTMDBCatalogProvider } from '@/src/infrastructure/providers/tmdb-catalog.provider'
import type { ITMDBCatalogProvider } from '@/src/infrastructure/providers/tmdb-catalog.provider'
import { ICatalogCapability } from '@/src/domain/providers/catalog/catalog-capability.interface'

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

  // Register TMDB Service (depends on environment, logging, and user preferences)
  container.registerSingleton<ITMDBService>(
    TOKENS.TMDB_SERVICE,
    () => {
      const environmentService = container.resolve<IEnvironmentService>(TOKENS.ENVIRONMENT_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const userPreferenceService = container.resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
      return createTMDBService(environmentService, logger, userPreferenceService)
    }
  )

  // Register TMDB Catalog Provider (depends on TMDB service and logging)
  container.registerSingleton<ITMDBCatalogProvider>(
    TOKENS.TMDB_CATALOG_PROVIDER,
    () => {
      const tmdbService = container.resolve<ITMDBService>(TOKENS.TMDB_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return createTMDBCatalogProvider(tmdbService, logger)
    }
  )

  // Register Catalog Use Cases (depend on catalog providers and logging)
  container.registerSingleton<GetAllCatalogsUseCase>(
    TOKENS.GET_ALL_CATALOGS_USE_CASE,
    () => {
      const tmdbCatalogProvider = container.resolve<ITMDBCatalogProvider>(TOKENS.TMDB_CATALOG_PROVIDER)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      
      // Create array of all catalog providers
      const catalogProviders: ICatalogCapability[] = [tmdbCatalogProvider]
      
      return new GetAllCatalogsUseCase(catalogProviders, logger)
    }
  )

  container.registerSingleton<LoadMoreCatalogItemsUseCase>(
    TOKENS.LOAD_MORE_CATALOG_ITEMS_USE_CASE,
    () => {
      const tmdbCatalogProvider = container.resolve<ITMDBCatalogProvider>(TOKENS.TMDB_CATALOG_PROVIDER)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      
      // Create array of all catalog providers
      const catalogProviders: ICatalogCapability[] = [tmdbCatalogProvider]
      
      return new LoadMoreCatalogItemsUseCase(catalogProviders, logger)
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
      'ConfigClient',
      'ApiClient',
      'TMDBService',
      'TMDBCatalogProvider',
      'GetOrCreateUserUseCase',
      'UpdateUserPreferencesUseCase',
      'ResetUserPreferencesUseCase',
      'UpdateUserThemeUseCase',
      'UpdateUserLocaleUseCase',
      'GetAllCatalogsUseCase',
      'LoadMoreCatalogItemsUseCase'
    ]
  })
}

export { container }