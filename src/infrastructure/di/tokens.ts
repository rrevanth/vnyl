export const TOKENS = {
  // Infrastructure Services
  LOGGING_SERVICE: Symbol('ILoggingService'),
  STORAGE_SERVICE: Symbol('IStorageService'),
  API_CLIENT: Symbol('IApiClient'),
  CONFIG_CLIENT: Symbol('IConfigClient'),
  USER_PREFERENCE_SERVICE: Symbol('IUserPreferenceService'),
  ENVIRONMENT_SERVICE: Symbol('IEnvironmentService'),

  // TMDB Services
  TMDB_CONFIG_SERVICE: Symbol('ITMDBConfigService'),
  TMDB_API_CLIENT: Symbol('ITMDBApiClient'),

  // API Configuration
  API_CONFIG: Symbol('ApiConfig'),

  // User Services
  USER_REPOSITORY: Symbol('IUserRepository'),
  GET_OR_CREATE_USER_USE_CASE: Symbol('GetOrCreateUserUseCase'),
  UPDATE_USER_PREFERENCES_USE_CASE: Symbol('UpdateUserPreferencesUseCase'),
  RESET_USER_PREFERENCES_USE_CASE: Symbol('ResetUserPreferencesUseCase'),
  UPDATE_USER_THEME_USE_CASE: Symbol('UpdateUserThemeUseCase'),
  UPDATE_USER_LOCALE_USE_CASE: Symbol('UpdateUserLocaleUseCase')
} as const

export type ServiceToken = typeof TOKENS[keyof typeof TOKENS]