/**
 * TMDB Search Endpoints
 * 
 * Search functionality across movies, TV shows, people, collections, etc.
 */

import type { PaginatedResponse, PaginationParams, LanguageCode, CountryCode } from './base.types'
import type { MovieSummary } from './movie.endpoints'

/**
 * Multi-search results
 */
export interface MultiSearchResult {
  /** Media type */
  media_type: 'movie' | 'tv' | 'person'
  /** Result data (varies by media type) */
  [key: string]: any
}

/**
 * Search endpoints interface
 */
export interface TMDBSearchEndpoints {
  /**
   * Search for movies
   */
  searchMovies(query: string, params?: PaginationParams & {
    language?: LanguageCode
    region?: CountryCode
    year?: number
    primary_release_year?: number
    include_adult?: boolean
  }): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Search multiple models in a single request
   */
  multiSearch(query: string, params?: PaginationParams & {
    language?: LanguageCode
    region?: CountryCode
    include_adult?: boolean
  }): Promise<PaginatedResponse<MultiSearchResult>>

  // Additional search endpoints will be implemented
}