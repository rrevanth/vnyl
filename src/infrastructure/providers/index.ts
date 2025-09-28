/**
 * Infrastructure Providers Index
 * 
 * Centralized exports for all provider implementations
 */

// Provider Registry System
export { ProviderRegistry } from './provider-registry.impl'
export { TMDBProviderSource } from './tmdb-provider-source'

// TMDB Providers
export { TMDBCatalogProvider } from './tmdb/tmdb-catalog.provider'
export { TMDBMetadataProvider } from './tmdb/tmdb-metadata.provider'
export { TMDBImagesProvider } from './tmdb/tmdb-images.provider'