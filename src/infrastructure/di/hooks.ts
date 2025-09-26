import { useCallback } from 'react'
import { container } from './setup'
import { TOKENS, ServiceToken } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient, IUserPreferenceService, ITMDBConfigService } from '@/src/domain/services'
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
import { MediaDetailUseCase } from '@/src/domain/use-cases/media-detail.use-case'
import { TMDBApiClient } from '@/src/infrastructure/api/implementations/tmdb-api-client.service'

export const useDI = () => {
  const resolve = useCallback(<T>(token: ServiceToken): T => {
    if (!container.isRegistered(token)) {
      throw new Error(`Service not available: ${token.toString()}. DI container may not be initialized yet.`)
    }
    return container.resolve<T>(token)
  }, [])

  const isServiceAvailable = useCallback((token: ServiceToken): boolean => {
    return container.isRegistered(token)
  }, [])

  return { resolve, isServiceAvailable }
}

// Infrastructure Service Hooks
export const useLogging = (): ILoggingService => {
  const { resolve } = useDI()
  return resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
}

export const useStorage = (): IStorageService => {
  const { resolve } = useDI()
  return resolve<IStorageService>(TOKENS.STORAGE_SERVICE)
}

export const useApiClient = (): IApiClient => {
  const { resolve } = useDI()
  return resolve<IApiClient>(TOKENS.API_CLIENT)
}

export const useConfigClient = (): IConfigClient => {
  const { resolve } = useDI()
  return resolve<IConfigClient>(TOKENS.CONFIG_CLIENT)
}

export const useUserPreferenceService = (): IUserPreferenceService => {
  const { resolve } = useDI()
  return resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
}

// TMDB Service Hooks
export const useTMDBConfigService = (): ITMDBConfigService => {
  const { resolve } = useDI()
  return resolve<ITMDBConfigService>(TOKENS.TMDB_CONFIG_SERVICE)
}

export const useTMDBApiClient = (): TMDBApiClient => {
  const { resolve } = useDI()
  return resolve<TMDBApiClient>(TOKENS.TMDB_API_CLIENT)
}

// User Service Hooks
export const useUserRepository = (): IUserRepository => {
  const { resolve } = useDI()
  return resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
}

// Media Service Hooks
export const useMediaRepository = (): IMediaRepository => {
  const { resolve } = useDI()
  return resolve<IMediaRepository>(TOKENS.MEDIA_REPOSITORY)
}

export const useGetBasicCatalogItemsUseCase = (): GetBasicCatalogItemsUseCase => {
  const { resolve } = useDI()
  return resolve<GetBasicCatalogItemsUseCase>(TOKENS.GET_BASIC_CATALOG_ITEMS_USE_CASE)
}

export const useMediaDetailUseCase = (): MediaDetailUseCase => {
  const { resolve } = useDI()
  return resolve<MediaDetailUseCase>(TOKENS.MEDIA_DETAIL_USE_CASE)
}

// User Use Case Hooks
export const useGetOrCreateUserUseCase = (): GetOrCreateUserUseCase => {
  const { resolve } = useDI()
  return resolve<GetOrCreateUserUseCase>(TOKENS.GET_OR_CREATE_USER_USE_CASE)
}

export const useUpdateUserPreferencesUseCase = (): UpdateUserPreferencesUseCase => {
  const { resolve } = useDI()
  return resolve<UpdateUserPreferencesUseCase>(TOKENS.UPDATE_USER_PREFERENCES_USE_CASE)
}

export const useResetUserPreferencesUseCase = (): ResetUserPreferencesUseCase => {
  const { resolve } = useDI()
  return resolve<ResetUserPreferencesUseCase>(TOKENS.RESET_USER_PREFERENCES_USE_CASE)
}

export const useUpdateUserThemeUseCase = (): UpdateUserThemeUseCase => {
  const { resolve } = useDI()
  return resolve<UpdateUserThemeUseCase>(TOKENS.UPDATE_USER_THEME_USE_CASE)
}

export const useUpdateUserLocaleUseCase = (): UpdateUserLocaleUseCase => {
  const { resolve } = useDI()
  return resolve<UpdateUserLocaleUseCase>(TOKENS.UPDATE_USER_LOCALE_USE_CASE)
}

// Convenience Preference Hooks
export const useStreamingPreferences = () => {
  const userPreferenceService = useUserPreferenceService()
  return {
    getStreamPreferences: () => userPreferenceService.getStreamPreferences(),
    getRegionSettings: () => userPreferenceService.getRegionSettings()
  }
}

export const useUserPreferences = () => {
  const userPreferenceService = useUserPreferenceService()
  return {
    getPreferences: () => userPreferenceService.getPreferences(),
    getTheme: () => userPreferenceService.getTheme(),
    getLocale: () => userPreferenceService.getLocale(),
    getDisplaySettings: () => userPreferenceService.getDisplaySettings(),
    getHomeScreenLayout: () => userPreferenceService.getHomeScreenLayout(),
    refreshCache: () => userPreferenceService.refreshCache(),
    isReady: () => userPreferenceService.isReady()
  }
}

// TMDB Convenience Hooks
export const useTMDBServices = () => {
  const configService = useTMDBConfigService()
  const apiClient = useTMDBApiClient()

  return {
    // Configuration methods
    hasValidCredentials: () => configService.hasValidCredentials(),
    getAuthenticationMethod: () => configService.getAuthenticationMethod(),
    getEffectiveLanguage: () => configService.getEffectiveLanguage(),
    shouldIncludeAdult: () => configService.shouldIncludeAdult(),
    refreshConfiguration: () => {
      configService.refreshConfiguration()
      apiClient.refreshConfiguration()
    },

    // API client methods
    apiClient,
    get: <T = unknown>(url: string, config?: any) => apiClient.get<T>(url, config),
    post: <T = unknown>(url: string, data?: unknown, config?: any) => apiClient.post<T>(url, data, config),
    put: <T = unknown>(url: string, data?: unknown, config?: any) => apiClient.put<T>(url, data, config),
    patch: <T = unknown>(url: string, data?: unknown, config?: any) => apiClient.patch<T>(url, data, config),
    delete: <T = unknown>(url: string, config?: any) => apiClient.delete<T>(url, config),

    // Helper methods
    isConfigured: () => configService.hasValidCredentials(),
    getConfig: () => configService.getEffectiveTMDBConfig()
  }
}