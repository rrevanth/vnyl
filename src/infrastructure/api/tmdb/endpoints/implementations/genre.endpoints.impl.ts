/**
 * TMDB Genre Endpoints Implementation
 * 
 * Implementation of genre endpoints for movie and TV genre lists
 */

import type { LanguageCode } from '../types/base.types'
import type { 
  TMDBGenreEndpoints,
  GenreListResponse
} from '../types/genre.endpoints'

/**
 * Create genre endpoints implementation
 */
export const createGenreEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBGenreEndpoints => ({
  /**
   * Get the list of official genres for movies
   */
  async getMovieGenres(params?: { language?: LanguageCode }): Promise<GenreListResponse> {
    return request<GenreListResponse>('GET', '/genre/movie/list', params)
  },

  /**
   * Get the list of official genres for TV shows
   */
  async getTVGenres(params?: { language?: LanguageCode }): Promise<GenreListResponse> {
    return request<GenreListResponse>('GET', '/genre/tv/list', params)
  }
})