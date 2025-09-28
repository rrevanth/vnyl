/**
 * Infrastructure Providers Index
 * 
 * Centralized exports for all provider implementations
 */

export { 
  TMDBCatalogProvider, 
  createTMDBCatalogProvider,
  TMDB_CATALOG_TYPES,
  type ITMDBCatalogProvider,
  type TMDBCatalogType
} from './tmdb-catalog.provider'