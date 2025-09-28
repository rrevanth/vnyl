/**
 * TMDB Account Endpoints Implementation
 * 
 * Implementation of account endpoints for user account management
 */

import type { PaginatedResponse, LanguageCode } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { MovieSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TVShowSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'
import type { 
  TMDBAccountEndpoints,
  AccountDetails,
  CreatedList,
  ModifyResponse
} from '@/src/infrastructure/api/tmdb/endpoints/types/account.endpoints'

/**
 * Create account endpoints implementation
 */
export const createAccountEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBAccountEndpoints => ({
  /**
   * Get account details
   */
  async getDetails(sessionId: string): Promise<AccountDetails> {
    return request<AccountDetails>('GET', '/account', { session_id: sessionId })
  },

  /**
   * Get created lists
   */
  async getCreatedLists(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    page?: number
  }): Promise<PaginatedResponse<CreatedList>> {
    return request<PaginatedResponse<CreatedList>>('GET', `/account/${accountId}/lists`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Get favorite movies
   */
  async getFavoriteMovies(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', `/account/${accountId}/favorite/movies`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Get favorite TV shows
   */
  async getFavoriteTV(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', `/account/${accountId}/favorite/tv`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Get movie watchlist
   */
  async getMovieWatchlist(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', `/account/${accountId}/watchlist/movies`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Get TV watchlist
   */
  async getTVWatchlist(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', `/account/${accountId}/watchlist/tv`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Get rated movies
   */
  async getRatedMovies(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', `/account/${accountId}/rated/movies`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Get rated TV shows
   */
  async getRatedTV(accountId: number, sessionId: string, params?: {
    language?: LanguageCode
    sort_by?: 'created_at.asc' | 'created_at.desc'
    page?: number
  }): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', `/account/${accountId}/rated/tv`, {
      session_id: sessionId,
      ...params
    })
  },

  /**
   * Mark as favorite
   */
  async markAsFavorite(accountId: number, sessionId: string, data: {
    media_type: 'movie' | 'tv'
    media_id: number
    favorite: boolean
  }): Promise<ModifyResponse> {
    return request<ModifyResponse>('POST', `/account/${accountId}/favorite`, {
      session_id: sessionId
    }, data)
  },

  /**
   * Add to watchlist
   */
  async addToWatchlist(accountId: number, sessionId: string, data: {
    media_type: 'movie' | 'tv'
    media_id: number
    watchlist: boolean
  }): Promise<ModifyResponse> {
    return request<ModifyResponse>('POST', `/account/${accountId}/watchlist`, {
      session_id: sessionId
    }, data)
  }
})