import { useCallback } from 'react'
import { container } from './setup'
import { TOKENS, ServiceToken } from './tokens'
import { ILoggingService, IStorageService, IApiClient, IConfigClient } from '@/src/domain/services'
import { IUserRepository } from '@/src/domain/repositories'
import { GetOrCreateUserUseCase, UpdateUserPreferencesUseCase, ResetUserPreferencesUseCase } from '@/src/domain/usecases'

export const useDI = () => {
  const resolve = useCallback(<T>(token: ServiceToken): T => {
    return container.resolve<T>(token)
  }, [])

  return { resolve }
}

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