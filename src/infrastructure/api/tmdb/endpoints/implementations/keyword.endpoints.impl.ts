/**
 * TMDB Keyword Endpoints Implementation
 * 
 * Implementation of keyword endpoints for keyword data
 */

import type { PaginatedResponse } from '../types/base.types'
import type { MovieSummary } from '../types/movie.endpoints'
import type { 
  TMDBKeywordEndpoints,
  KeywordDetails
} from '../types/keyword.endpoints'

/**
 * Create keyword endpoints implementation
 */
export const createKeywordEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBKeywordEndpoints => ({
  /**
   * Get keyword details
   */
  async getDetails(keywordId: number): Promise<KeywordDetails> {
    return request<KeywordDetails>('GET', `/keyword/${keywordId}`)
  },

  /**
   * Get movies by keyword
   */
  async getMovies(keywordId: number, params?: {
    language?: string
    include_adult?: boolean
  }): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', `/keyword/${keywordId}/movies`, params)
  }
})