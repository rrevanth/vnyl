/**
 * Provider System - Registration-Based Provider Architecture
 * 
 * Export point for the complete registration-based provider system that
 * replaces the over-engineered boolean flag system with clean interface
 * segregation and constructor registry patterns.
 * 
 * Key Principles:
 * - Registration = Capability (no boolean flags)
 * - Interface Segregation (specific provider types)  
 * - Factory Pattern (constructor registration)
 * - Live Instance Management (registry with health monitoring)
 * - Clean Configuration (no capability flags)
 * 
 * @author Claude Code
 * @version 2.0.0
 */

// ============================================================================
// CORE INTERFACES AND TYPES
// ============================================================================

export type {
  // Base provider interfaces
  IBaseProvider,
  BaseProviderConfig,
  ProviderHealthResult,
  ProviderValidationResult,
  PaginationResponse,
  
  // Capability interfaces
  IMetadataProvider,
  ICatalogProvider,
  ISearchProvider,
  IStreamProvider,
  IRecommendationProvider,
  ICollectionProvider,
  IWatchlistProvider,
  IProgressProvider,
  IRatingProvider,
  IImageProvider,
  IVideoProvider,
  ISubtitleProvider,
  
  // Supporting types
  VideoData,
  VideoItem,
  ProviderConstructor,
  ProviderCapabilityMap,
  ProviderInstance,
  ProviderRegistrationInfo
} from './provider-interfaces'

// Re-export capability entities for convenience
export type {
  CatalogItem,
  Catalog,
  CatalogFilters,
  MediaMetadata,
  Person,
  PersonCredit,
  SearchResult,
  SearchFilters,
  RecommendationRequest,
  RecommendationResult,
  RatingsData,
  RatingSource,
  Comment,
  CommentsData,
  WatchProgress,
  WatchlistItem,
  TrackingData,
  AddonCatalogItem,
  AddonCatalog,
  MediaImage,
  ImagesData,
  StreamSource,
  StreamsData,
  SubtitleFile,
  SubtitlesData
} from './provider-interfaces'

// Export capability enum
export { ProviderCapability } from './provider-interfaces'

// ============================================================================
// BASE PROVIDER AND ERROR HANDLING
// ============================================================================

export { BaseProvider, ProviderError } from './base-provider'

// ============================================================================
// FACTORY AND REGISTRY
// ============================================================================

export { ProviderFactory } from './provider-factory'
export type { FactoryStatistics } from './provider-factory'

export { ProviderRegistry } from './provider-registry'
export type {
  ProviderRegistryConfig,
  CapabilityResolutionOptions,
  CapabilityResolutionResult,
  RegistryStatistics,
  HealthMonitoringConfig
} from './provider-registry'

// ============================================================================
// CLEAN CONFIGURATION SYSTEM
// ============================================================================

export {
  ProviderType,
  ProviderConfigurationUtils,
  DEFAULT_PROVIDER_TEMPLATES,
  DEFAULT_PROVIDER_SETTINGS
} from './provider-configuration'

export type {
  CleanProviderConfig,
  ProviderMetadata,
  ProviderTemplate,
  ProviderSettingSchema,
  ProviderValidationRules,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ProviderRegistryEntry,
  ProviderStatistics
} from './provider-configuration'

// ============================================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================================

// TMDB Provider Implementation
export {
  TMDBMetadataProvider,
  TMDBCatalogProvider,
  TMDBSearchProvider,
  TMDBMapper,
  registerTMDBProviders,
  unregisterTMDBProviders,
  getTMDBProviderCapabilities,
  checkTMDBProviderHealth,
  createTMDBBaseConfig,
  TMDBProviderFactoryHelper,
  isTMDBMovie,
  isTMDBTVShow,
  isTMDBMovieDetails,
  isTMDBTVShowDetails
} from './tmdb'

export type {
  TMDBProviderConfig,
  TMDBImageConfig,
  TMDBBaseMedia,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBGenre,
  TMDBCastMember,
  TMDBCrewMember,
  TMDBSeason,
  TMDBEpisode,
  TMDBCollection,
  TMDBNetwork,
  TMDBProductionCompany,
  TMDBVideo,
  TMDBImages,
  TMDBExternalIds,
  TMDBSearchResponse,
  TMDBDiscoverResponse,
  TMDBMultiSearchResult,
  TMDBConfiguration,
  TMDBMediaResult,
  TMDBDetailedMedia
} from './tmdb'

// ============================================================================
// END OF EXPORTS
// ============================================================================