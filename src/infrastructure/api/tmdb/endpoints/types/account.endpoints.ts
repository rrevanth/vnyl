/**
 * TMDB Account Endpoints
 * 
 * Manage user account data, favorites, watchlist, and ratings
 */

import type { PaginatedResponse, LanguageCode } from './base.types'
import type { MovieSummary } from './movie.endpoints'
import type { TVShowSummary } from './tv.endpoints'

/**
 * Account details
 */
export interface AccountDetails {
  /** Account ID */
  id: number
  /** ISO 639-1 language code */
  iso_639_1: string
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Account name */
  name: string
  /** Include adult content */
  include_adult: boolean
  /** Username */
  username: string
}

/**
 * Created list
 */
export interface CreatedList {
  /** List ID */
  id: number
  /** List name */
  name: string
  /** List description */
  description: string
  /** Favorite count */
  favorite_count: number
  /** Item count */
  item_count: number
  /** ISO 639-1 language code */
  iso_639_1: string
  /** List type */
  list_type: string
  /** Poster path */
  poster_path: string | null
}

/**
 * Account state for media
 */
export interface AccountStates {
  /** Media ID */
  id: number
  /** Favorite status */
  favorite: boolean
  /** User rating */
  rated: boolean | { value: number }
  /** Watchlist status */
  watchlist: boolean
}

/**
 * Modify response
 */
export interface ModifyResponse {
  /** Success status */
  success: boolean
  /** Status code */
  status_code: number
  /** Status message */
  status_message: string
}

/**
 * Account endpoints interface
 */
export interface TMDBAccountEndpoints {
  /**
   * Get account details
   */
  getDetails(sessionId: string): Promise<AccountDetails>

  /**
   * Get created lists
   */
  getCreatedLists(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    page?: number
  }): Promise<PaginatedResponse<CreatedList>>

  /**
   * Get favorite movies
   */
  getFavoriteMovies(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get favorite TV shows
   */
  getFavoriteTV(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get movie watchlist
   */
  getMovieWatchlist(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get TV watchlist
   */
  getTVWatchlist(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get rated movies
   */
  getRatedMovies(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get rated TV shows
   */
  getRatedTV(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Mark as favorite
   */
  markAsFavorite(accountId: number, sessionId: string, data: {
    media_type: 'movie' | 'tv'
    media_id: number
    favorite: boolean
  }): Promise<ModifyResponse>

  /**
   * Add to watchlist
   */
  addToWatchlist(accountId: number, sessionId: string, data: {
    media_type: 'movie' | 'tv'
    media_id: number
    watchlist: boolean
  }): Promise<ModifyResponse>
}