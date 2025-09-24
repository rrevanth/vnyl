import { DIContainer } from './container'
import { TOKENS } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient, ApiConfig } from '@/src/domain/services'
import { IUserRepository } from '@/src/domain/repositories'
import { GetOrCreateUserUseCase, UpdateUserPreferencesUseCase, ResetUserPreferencesUseCase } from '@/src/domain/usecases'
import { ConsoleLoggingService } from '@/src/infrastructure/logging'
import { AsyncStorageService } from '@/src/infrastructure/storage'
import { AxiosApiClient, ConfigClient } from '@/src/infrastructure/api'
import { UserRepository } from '@/src/data/repositories'

const container = new DIContainer()

export const initializeDI = (apiConfig: ApiConfig): void => {
  // Register Logging Service First (no dependencies)
  container.registerSingleton<ILoggingService>(
    TOKENS.LOGGING_SERVICE,
    () => new ConsoleLoggingService()
  )

  // Register API Configuration
  container.registerSingleton(TOKENS.API_CONFIG, () => apiConfig)

  // Register Infrastructure Services with Logger Injection
  container.registerSingleton<IStorageService>(
    TOKENS.STORAGE_SERVICE,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new AsyncStorageService(logger)
    }
  )

  container.registerSingleton<IConfigClient>(
    TOKENS.CONFIG_CLIENT,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const config = container.resolve<ApiConfig>(TOKENS.API_CONFIG)
      return new ConfigClient(config, logger)
    }
  )

  container.registerSingleton<IApiClient>(
    TOKENS.API_CLIENT,
    () => {
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      const configClient = container.resolve<IConfigClient>(TOKENS.CONFIG_CLIENT)
      const config = configClient.getApiConfig()
      return new AxiosApiClient(config, logger)
    }
  )

  // Register User Services
  container.registerSingleton<IUserRepository>(
    TOKENS.USER_REPOSITORY,
    () => {
      const storageService = container.resolve<IStorageService>(TOKENS.STORAGE_SERVICE)
      const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
      return new UserRepository(storageService, logger)
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

  // Log successful initialization
  const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
  logger.info('DI Container initialized successfully', {
    services: [
      'LoggingService',
      'StorageService',
      'ConfigClient',
      'ApiClient',
      'UserRepository',
      'GetOrCreateUserUseCase',
      'UpdateUserPreferencesUseCase',
      'ResetUserPreferencesUseCase'
    ]
  })
}

export { container }