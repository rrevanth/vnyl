import { useCallback } from 'react'
import { container } from './setup'
import { TOKENS, ServiceToken } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient, IUserPreferenceService } from '@/src/domain/services'
import { IUserRepository } from '@/src/domain/repositories'
import {
  GetOrCreateUserUseCase,
  UpdateUserPreferencesUseCase,
  ResetUserPreferencesUseCase,
  UpdateUserThemeUseCase,
  UpdateUserLocaleUseCase
} from '@/src/domain/usecases'

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

// User Service Hooks
export const useUserRepository = (): IUserRepository => {
  const { resolve } = useDI()
  return resolve<IUserRepository>(TOKENS.USER_REPOSITORY)
}

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
    getHomeScreenLayout: () => userPreferenceService.getHomeScreenLayout(),
    refreshCache: () => userPreferenceService.refreshCache(),
    isReady: () => userPreferenceService.isReady()
  }
}