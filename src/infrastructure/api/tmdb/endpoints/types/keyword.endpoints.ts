/**
 * TMDB Keyword Endpoints
 * 
 * Get keyword information and movies
 */

import type { PaginatedResponse } from './base.types'
import type { MovieSummary } from './movie.endpoints'

/**
 * Keyword details
 */
export interface KeywordDetails {
  /** Keyword ID */
  id: number
  /** Keyword name */
  name: string
}

/**
 * Keyword endpoints interface
 */
export interface TMDBKeywordEndpoints {
  /**
   * Get keyword details
   */
  getDetails(keywordId: number): Promise<KeywordDetails>

  /**
   * Get movies by keyword
   */
  getMovies(keywordId: number, params?: {
    language?: string
    include_adult?: boolean
  }): Promise<PaginatedResponse<MovieSummary>>
}