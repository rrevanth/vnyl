/**
 * TMDB List Endpoints
 * 
 * Get user-created list information
 */

import type { LanguageCode } from './base.types'
import type { MovieSummary } from './movie.endpoints'

/**
 * List details
 */
export interface ListDetails {
  /** List ID */
  id: number
  /** List name */
  name: string
  /** List description */
  description: string
  /** Created by user */
  created_by: string
  /** Favorite count */
  favorite_count: number
  /** Item count */
  item_count: number
  /** ISO 639-1 language code */
  iso_639_1: string
  /** List items */
  items: MovieSummary[]
  /** Poster path */
  poster_path: string | null
}

/**
 * Check item status response
 */
export interface ListItemStatusResponse {
  /** List ID */
  id: number
  /** Item present status */
  item_present: boolean
}

/**
 * List endpoints interface
 */
export interface TMDBListEndpoints {
  /**
   * Get list details
   */
  getDetails(listId: number, params?: { language?: LanguageCode }): Promise<ListDetails>

  /**
   * Check if item exists in list
   */
  checkItemStatus(listId: number, params?: { movie_id?: number }): Promise<ListItemStatusResponse>
}