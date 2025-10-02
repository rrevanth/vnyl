/**
 * Dependency injection tokens for type-safe service registration
 * Provides unique symbols for service identification
 */

// Service tokens
export const TOKENS = {
  // Core services
  ApiService: Symbol('ApiService'),
  StorageService: Symbol('StorageService'),
  LoggingService: Symbol('LoggingService'),
  I18nService: Symbol('I18nService'),
  ThemeService: Symbol('ThemeService'),

  // API clients
  TMDBApiClient: Symbol('TMDBApiClient'),
  StremioApiClient: Symbol('StremioApiClient'),

  // Configuration
  ApiConfig: Symbol('ApiConfig'),
  TMDBConfig: Symbol('TMDBConfig'),
  StremioConfig: Symbol('StremioConfig'),
  SentryConfig: Symbol('SentryConfig'),
  I18nConfig: Symbol('I18nConfig'),
  ThemeConfig: Symbol('ThemeConfig'),

  // Environment configuration
  Environment: Symbol('Environment'),
  ApiKeys: Symbol('ApiKeys'),
  AppConfig: Symbol('AppConfig'),

  // Repository interfaces (from domain)
  MediaRepository: Symbol('MediaRepository'),
  PersonRepository: Symbol('PersonRepository'),
  PlaylistRepository: Symbol('PlaylistRepository'),
  StreamRepository: Symbol('StreamRepository'),
  UserRepository: Symbol('UserRepository'),

  // Use cases (from domain)
  GetMediaDetailsUseCase: Symbol('GetMediaDetailsUseCase'),
  SearchMediaUseCase: Symbol('SearchMediaUseCase'),
  GetPersonDetailsUseCase: Symbol('GetPersonDetailsUseCase'),
  GetStreamSourcesUseCase: Symbol('GetStreamSourcesUseCase'),
  ManagePlaylistUseCase: Symbol('ManagePlaylistUseCase'),
  UserPreferencesUseCase: Symbol('UserPreferencesUseCase'),

  // Presentation services
  NavigationService: Symbol('NavigationService'),
  StateManagementService: Symbol('StateManagementService'),
  AnalyticsService: Symbol('AnalyticsService'),
  NotificationService: Symbol('NotificationService'),

  // External services
  ImageCacheService: Symbol('ImageCacheService'),
  DownloadService: Symbol('DownloadService'),
  PlayerService: Symbol('PlayerService'),

  // Factory tokens
  ApiClientFactory: Symbol('ApiClientFactory'),
  RepositoryFactory: Symbol('RepositoryFactory'),
  UseCaseFactory: Symbol('UseCaseFactory'),
} as const

/**
 * Type definitions for service tokens
 */
export type ServiceToken = typeof TOKENS[keyof typeof TOKENS]

/**
 * Token categories for organizational purposes
 */
export const TOKEN_CATEGORIES = {
  CORE_SERVICES: [
    TOKENS.ApiService,
    TOKENS.StorageService,
    TOKENS.LoggingService,
    TOKENS.I18nService,
    TOKENS.ThemeService,
  ] as ServiceToken[],
  
  API_CLIENTS: [
    TOKENS.TMDBApiClient,
    TOKENS.StremioApiClient,
  ] as ServiceToken[],
  
  CONFIGURATION: [
    TOKENS.ApiConfig,
    TOKENS.TMDBConfig,
    TOKENS.StremioConfig,
    TOKENS.SentryConfig,
    TOKENS.I18nConfig,
    TOKENS.ThemeConfig,
    TOKENS.Environment,
    TOKENS.ApiKeys,
    TOKENS.AppConfig,
  ] as ServiceToken[],
  
  REPOSITORIES: [
    TOKENS.MediaRepository,
    TOKENS.PersonRepository,
    TOKENS.PlaylistRepository,
    TOKENS.StreamRepository,
    TOKENS.UserRepository,
  ] as ServiceToken[],
  
  USE_CASES: [
    TOKENS.GetMediaDetailsUseCase,
    TOKENS.SearchMediaUseCase,
    TOKENS.GetPersonDetailsUseCase,
    TOKENS.GetStreamSourcesUseCase,
    TOKENS.ManagePlaylistUseCase,
    TOKENS.UserPreferencesUseCase,
  ] as ServiceToken[],
  
  PRESENTATION: [
    TOKENS.NavigationService,
    TOKENS.StateManagementService,
    TOKENS.AnalyticsService,
    TOKENS.NotificationService,
  ] as ServiceToken[],
  
  EXTERNAL: [
    TOKENS.ImageCacheService,
    TOKENS.DownloadService,
    TOKENS.PlayerService,
  ] as ServiceToken[],
  
  FACTORIES: [
    TOKENS.ApiClientFactory,
    TOKENS.RepositoryFactory,
    TOKENS.UseCaseFactory,
  ] as ServiceToken[],
} as const

/**
 * Helper function to get all tokens in a category
 */
export const getTokensInCategory = (category: keyof typeof TOKEN_CATEGORIES): ServiceToken[] => {
  return TOKEN_CATEGORIES[category]
}

/**
 * Helper function to check if a token belongs to a category
 */
export const isTokenInCategory = (token: ServiceToken, category: keyof typeof TOKEN_CATEGORIES): boolean => {
  return TOKEN_CATEGORIES[category].includes(token)
}

/**
 * Get token name for debugging purposes
 */
export const getTokenName = (token: ServiceToken): string => {
  const entry = Object.entries(TOKENS).find(([_, value]) => value === token)
  return entry ? entry[0] : token.toString()
}