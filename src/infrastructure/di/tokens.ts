export const TOKENS = {
  // Infrastructure Services
  LOGGING_SERVICE: Symbol('ILoggingService'),
  STORAGE_SERVICE: Symbol('IStorageService'),
  API_CLIENT: Symbol('IApiClient'),
  CONFIG_CLIENT: Symbol('IConfigClient'),
  USER_PREFERENCE_SERVICE: Symbol('IUserPreferenceService'),
  ENVIRONMENT_SERVICE: Symbol('IEnvironmentService'),
  IMAGE_CACHE_SERVICE: Symbol('ImageCacheService'),

  // API Configuration
  API_CONFIG: Symbol('ApiConfig'),

  // TMDB Services
  TMDB_SERVICE: Symbol('ITMDBService'),
  TMDB_CONFIG_SERVICE: Symbol('ITMDBConfigService'),
  TMDB_API_CLIENT: Symbol('ITMDBApiClient'),

  // User Services
  USER_REPOSITORY: Symbol('IUserRepository'),
  GET_OR_CREATE_USER_USE_CASE: Symbol('GetOrCreateUserUseCase'),
  UPDATE_USER_PREFERENCES_USE_CASE: Symbol('UpdateUserPreferencesUseCase'),
  RESET_USER_PREFERENCES_USE_CASE: Symbol('ResetUserPreferencesUseCase'),
  UPDATE_USER_THEME_USE_CASE: Symbol('UpdateUserThemeUseCase'),
  UPDATE_USER_LOCALE_USE_CASE: Symbol('UpdateUserLocaleUseCase'),

  // Provider Registry System
  PROVIDER_REGISTRY: Symbol('IProviderRegistry'),
  TMDB_PROVIDER_SOURCE: Symbol('TMDBProviderSource'),
  
  // Catalog Use Cases
  GET_ALL_CATALOGS_USE_CASE: Symbol('GetAllCatalogsUseCase'),
  LOAD_MORE_CATALOG_ITEMS_USE_CASE: Symbol('LoadMoreCatalogItemsUseCase'),

  // State Management Services (Domain Layer Interfaces)
  CATALOG_STATE_MANAGEMENT_SERVICE: Symbol('ICatalogStateManagementService'),

} as const

export type ServiceToken = typeof TOKENS[keyof typeof TOKENS]