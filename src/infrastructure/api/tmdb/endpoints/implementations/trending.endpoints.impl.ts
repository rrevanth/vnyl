/**
 * TMDB Trending Endpoints Implementation
 * 
 * Implementation of trending endpoints
 */

import type { PaginatedResponse, TimeWindow, LanguageCode } from '../types/base.types'
import type { 
  TMDBTrendingEndpoints,
  TrendingAllResult
} from '../types/trending.endpoints'
import type { MovieSummary } from '../types/movie.endpoints'
import type { TVShowSummary } from '../types/tv.endpoints'
import type { PersonSummary } from '../types/person.endpoints'

/**
 * Create trending endpoints implementation
 */
export const createTrendingEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBTrendingEndpoints => ({
  /**
   * Get the daily or weekly trending items (movies, TV shows and people)
   */
  async getTrendingAll(timeWindow: TimeWindow, params?: { language?: LanguageCode }): Promise<PaginatedResponse<TrendingAllResult>> {
    return request<PaginatedResponse<TrendingAllResult>>('GET', `/trending/all/${timeWindow}`, params)
  },

  /**
   * Get the daily or weekly trending movies
   */
  async getTrendingMovies(timeWindow: TimeWindow, params?: { language?: LanguageCode }): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', `/trending/movie/${timeWindow}`, params)
  },

  /**
   * Get the daily or weekly trending TV shows
   */
  async getTrendingTV(timeWindow: TimeWindow, params?: { language?: LanguageCode }): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', `/trending/tv/${timeWindow}`, params)
  },

  /**
   * Get the daily or weekly trending people
   */
  async getTrendingPeople(timeWindow: TimeWindow, params?: { language?: LanguageCode }): Promise<PaginatedResponse<PersonSummary>> {
    return request<PaginatedResponse<PersonSummary>>('GET', `/trending/person/${timeWindow}`, params)
  }
})