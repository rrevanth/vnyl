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
  TMDB_CLIENT: Symbol('TMDBClient'),

  // Provider System
  PROVIDER_FACTORY: Symbol('ProviderFactory'),
  PROVIDER_REGISTRY: Symbol('ProviderRegistry'),
  TMDB_PROVIDER_HELPER: Symbol('TMDBProviderFactoryHelper'),

  // API Configuration
  API_CONFIG: Symbol('ApiConfig'),

  // Enhancement Services
  ENHANCEMENT_SERVICE: Symbol('ISimpleEnhancementService'),

  // Media Services
  MEDIA_REPOSITORY: Symbol('IMediaRepository'),
  GET_BASIC_CATALOG_ITEMS_USE_CASE: Symbol('GetBasicCatalogItemsUseCase'),
  GET_ALL_CATALOGS_USE_CASE: Symbol('GetAllCatalogsUseCase'),
  MEDIA_DETAIL_USE_CASE: Symbol('MediaDetailUseCase'),

  // User Services
  USER_REPOSITORY: Symbol('IUserRepository'),
  GET_OR_CREATE_USER_USE_CASE: Symbol('GetOrCreateUserUseCase'),
  UPDATE_USER_PREFERENCES_USE_CASE: Symbol('UpdateUserPreferencesUseCase'),
  RESET_USER_PREFERENCES_USE_CASE: Symbol('ResetUserPreferencesUseCase'),
  UPDATE_USER_THEME_USE_CASE: Symbol('UpdateUserThemeUseCase'),
  UPDATE_USER_LOCALE_USE_CASE: Symbol('UpdateUserLocaleUseCase')
} as const

export type ServiceToken = typeof TOKENS[keyof typeof TOKENS]