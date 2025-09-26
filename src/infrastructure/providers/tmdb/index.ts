/**
 * TMDB Provider Module - Exports and Integration
 * 
 * Main entry point for the TMDB provider module with complete registration system integration.
 * Provides all TMDB provider implementations and utilities.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0
 */

// Core provider implementations
export { TMDBMetadataProvider } from './tmdb-metadata-provider'
export { TMDBCatalogProvider } from './tmdb-catalog-provider'
export { TMDBSearchProvider } from './tmdb-search-provider'

// Mapping and transformation utilities
export { TMDBMapper } from './tmdb-mapper'
export type { TMDBImageConfig } from './tmdb-mapper'

// Type definitions
export type {
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
} from './tmdb-types'

export {
  isTMDBMovie,
  isTMDBTVShow,
  isTMDBMovieDetails,
  isTMDBTVShowDetails
} from './tmdb-types'

// Registration and factory integration
export {
  registerTMDBProviders,
  unregisterTMDBProviders,
  getTMDBProviderCapabilities,
  checkTMDBProviderHealth,
  createTMDBBaseConfig,
  TMDBProviderFactoryHelper
} from './tmdb-registration'

export type { TMDBProviderConfig } from './tmdb-registration'

// Re-export relevant provider interfaces for convenience
export type {
  IMetadataProvider,
  ICatalogProvider,
  ISearchProvider
} from '../provider-interfaces'