/**
 * TMDB Genre Endpoints
 */
import type { Genre } from './base.types'

/**
 * Genre list response
 */
export interface GenreListResponse {
  genres: Genre[]
}

export interface TMDBGenreEndpoints {
  /**
   * Get the list of official genres for movies
   */
  getMovieGenres(params?: { language?: string }): Promise<GenreListResponse>
  
  /**
   * Get the list of official genres for TV shows
   */
  getTVGenres(params?: { language?: string }): Promise<GenreListResponse>
}