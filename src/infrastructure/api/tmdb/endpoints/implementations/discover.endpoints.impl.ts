/**
 * TMDB Discover Endpoints Implementation
 * 
 * Implementation of discover endpoints with advanced filtering and sorting
 */

import type { PaginatedResponse } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { 
  TMDBDiscoverEndpoints,
  DiscoverMovieParams,
  DiscoverTVParams
} from '@/src/infrastructure/api/tmdb/endpoints/types/discover.endpoints'
import type { MovieSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TVShowSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

/**
 * Create discover endpoints implementation
 */
export const createDiscoverEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBDiscoverEndpoints => ({
  /**
   * Discover movies with advanced filtering and sorting
   */
  async discoverMovies(params?: DiscoverMovieParams): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', '/discover/movie', params)
  },

  /**
   * Discover TV shows with advanced filtering and sorting
   */
  async discoverTV(params?: DiscoverTVParams): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', '/discover/tv', params)
  }
})