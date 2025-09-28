import { container } from './setup'
import { TOKENS, ServiceToken } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient, IUserPreferenceService } from '@/src/domain/services'
import type { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
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

export const useDI = <T>(token: ServiceToken): T => {
  if (!container.isRegistered(token)) {
    throw new Error(`Service not available: ${token.toString()}. DI container may not be initialized yet.`)
  }
  return container.resolve<T>(token)
}

export const useServiceAvailable = (token: ServiceToken): boolean => {
  return container.isRegistered(token)
}

/**
 * Safe DI hook that returns service only when available
 */
export const useSafeDI = <T>(token: ServiceToken): T | null => {
  if (!container.isRegistered(token)) {
    return null
  }
  try {
    return container.resolve<T>(token)
  } catch {
    return null
  }
}

// Infrastructure Service Hooks - Safe versions
export const useLogging = (): ILoggingService => {
  return useDI<ILoggingService>(TOKENS.LOGGING_SERVICE)
}

export const useSafeLogging = (): ILoggingService | null => {
  return useSafeDI<ILoggingService>(TOKENS.LOGGING_SERVICE)
}

export const useStorage = (): IStorageService => {
  return useDI<IStorageService>(TOKENS.STORAGE_SERVICE)
}

export const useApiClient = (): IApiClient => {
  return useDI<IApiClient>(TOKENS.API_CLIENT)
}

export const useConfigClient = (): IConfigClient => {
  return useDI<IConfigClient>(TOKENS.CONFIG_CLIENT)
}

export const useUserPreferenceService = (): IUserPreferenceService => {
  return useDI<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
}


// User Service Hooks
export const useUserRepository = (): IUserRepository => {
  return useDI<IUserRepository>(TOKENS.USER_REPOSITORY)
}

export const useGetOrCreateUserUseCase = (): GetOrCreateUserUseCase => {
  return useDI<GetOrCreateUserUseCase>(TOKENS.GET_OR_CREATE_USER_USE_CASE)
}

export const useUpdateUserPreferencesUseCase = (): UpdateUserPreferencesUseCase => {
  return useDI<UpdateUserPreferencesUseCase>(TOKENS.UPDATE_USER_PREFERENCES_USE_CASE)
}

export const useResetUserPreferencesUseCase = (): ResetUserPreferencesUseCase => {
  return useDI<ResetUserPreferencesUseCase>(TOKENS.RESET_USER_PREFERENCES_USE_CASE)
}

export const useUpdateUserThemeUseCase = (): UpdateUserThemeUseCase => {
  return useDI<UpdateUserThemeUseCase>(TOKENS.UPDATE_USER_THEME_USE_CASE)
}

export const useUpdateUserLocaleUseCase = (): UpdateUserLocaleUseCase => {
  return useDI<UpdateUserLocaleUseCase>(TOKENS.UPDATE_USER_LOCALE_USE_CASE)
}

// TMDB Service Hooks
export const useTMDBService = (): ITMDBService => {
  return useDI<ITMDBService>(TOKENS.TMDB_SERVICE)
}

export const useTMDBClient = () => {
  const tmdbService = useTMDBService()
  return tmdbService.client
}

export const useTMDBConfig = () => {
  const tmdbService = useTMDBService()
  return tmdbService.config
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

// Catalog Use Case Hooks - Safe versions
export const useGetAllCatalogsUseCase = (): GetAllCatalogsUseCase => {
  return useDI<GetAllCatalogsUseCase>(TOKENS.GET_ALL_CATALOGS_USE_CASE)
}

export const useSafeGetAllCatalogsUseCase = (): GetAllCatalogsUseCase | null => {
  return useSafeDI<GetAllCatalogsUseCase>(TOKENS.GET_ALL_CATALOGS_USE_CASE)
}

export const useLoadMoreCatalogItemsUseCase = (): LoadMoreCatalogItemsUseCase => {
  return useDI<LoadMoreCatalogItemsUseCase>(TOKENS.LOAD_MORE_CATALOG_ITEMS_USE_CASE)
}

export const useSafeLoadMoreCatalogItemsUseCase = (): LoadMoreCatalogItemsUseCase | null => {
  return useSafeDI<LoadMoreCatalogItemsUseCase>(TOKENS.LOAD_MORE_CATALOG_ITEMS_USE_CASE)
}

