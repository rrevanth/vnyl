export const TOKENS = {
  // Infrastructure Services
  LOGGING_SERVICE: Symbol('ILoggingService'),
  STORAGE_SERVICE: Symbol('IStorageService'),
  API_CLIENT: Symbol('IApiClient'),
  CONFIG_CLIENT: Symbol('IConfigClient'),

  // API Configuration
  API_CONFIG: Symbol('ApiConfig'),

  // User Services
  USER_REPOSITORY: Symbol('IUserRepository'),
  GET_OR_CREATE_USER_USE_CASE: Symbol('GetOrCreateUserUseCase'),
  UPDATE_USER_PREFERENCES_USE_CASE: Symbol('UpdateUserPreferencesUseCase'),
  RESET_USER_PREFERENCES_USE_CASE: Symbol('ResetUserPreferencesUseCase')
} as const

export type ServiceToken = typeof TOKENS[keyof typeof TOKENS]