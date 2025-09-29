/**
 * TMDB Genre Endpoints
 * 
 * Get genre information for movies and TV shows
 */

import type { Genre, LanguageCode } from './base.types'

/**
 * Genre list response
 */
export interface GenreListResponse {
  /** Array of genres */
  genres: Genre[]
}

/**
 * Genre endpoints interface
 */
export interface TMDBGenreEndpoints {
  /**
   * Get the list of official genres for movies
   */
  getMovieGenres(params?: { language?: LanguageCode }): Promise<GenreListResponse>
  
  /**
   * Get the list of official genres for TV shows
   */
  getTVGenres(params?: { language?: LanguageCode }): Promise<GenreListResponse>
}