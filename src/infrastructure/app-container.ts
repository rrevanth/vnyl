import { initializeDI } from '@/src/infrastructure/di'
import { ApiConfig, ILoggingService, IUserPreferenceService } from '@/src/domain/services'
import { container } from '@/src/infrastructure/di/setup'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { GetOrCreateUserUseCase } from '@/src/domain/usecases'

// Export container getter for DI hooks
export const getContainer = () => container

export const initializeApp = async (): Promise<void> => {
  const apiConfig: ApiConfig = {
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Initialize DI Container with proper logger injection
  initializeDI(apiConfig)

  const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)

  // Initialize UserPreferenceService first (before any other services that might use it)
  try {
    logger.debug('Initializing UserPreferenceService')
    const userPreferenceService = container.resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
    await userPreferenceService.initialize()
    logger.debug('UserPreferenceService initialized successfully')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to initialize UserPreferenceService', error instanceof Error ? error : new Error(errorMessage))
    // Don't throw - service will use defaults
  }

  // Create default user at app startup if not exists
  try {
    logger.debug('Initializing default user')
    const getOrCreateUserUseCase = container.resolve<GetOrCreateUserUseCase>(TOKENS.GET_OR_CREATE_USER_USE_CASE)
    await getOrCreateUserUseCase.execute()

    logger.info('App initialization completed successfully', {
      userInitialized: true,
      preferencesInitialized: true,
      diContainerReady: true
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to initialize default user during app startup', error instanceof Error ? error : new Error(errorMessage), {
      context: 'app-initialization'
    })
    // Don't throw - allow app to continue even if user creation fails
  }
}