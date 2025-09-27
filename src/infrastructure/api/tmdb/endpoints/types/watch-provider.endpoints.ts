/**
 * TMDB Watch Provider Endpoints
 * 
 * Get streaming/watch provider information
 */

import type { LanguageCode, RegionWatchProviders } from './base.types'

/**
 * Watch provider regions response
 */
export interface WatchProviderRegionsResponse {
  /** Available regions */
  results: {
    /** ISO 3166-1 alpha-2 code */
    iso_3166_1: string
    /** English name */
    english_name: string
    /** Native name */
    native_name: string
  }[]
}

/**
 * Global movie watch providers response
 */
export interface GlobalMovieWatchProvidersResponse {
  /** Providers by region */
  results: Record<string, RegionWatchProviders>
}

/**
 * Global TV watch providers response
 */
export interface GlobalTVWatchProvidersResponse {
  /** Providers by region */
  results: Record<string, RegionWatchProviders>
}

/**
 * Watch provider endpoints interface
 */
export interface TMDBWatchProviderEndpoints {
  /**
   * Get the list of streaming/watch provider regions
   */
  getAvailableRegions(params?: { language?: LanguageCode }): Promise<WatchProviderRegionsResponse>

  /**
   * Get movie watch providers
   */
  getMovieProviders(params?: { language?: LanguageCode }): Promise<GlobalMovieWatchProvidersResponse>

  /**
   * Get TV watch providers
   */
  getTVProviders(params?: { language?: LanguageCode }): Promise<GlobalTVWatchProvidersResponse>
}