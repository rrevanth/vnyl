/**
 * TMDB List Endpoints Implementation
 * 
 * Implementation of list endpoints for user list data
 */

import type { LanguageCode } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { 
  TMDBListEndpoints,
  ListDetails,
  ListItemStatusResponse
} from '@/src/infrastructure/api/tmdb/endpoints/types/list.endpoints'

/**
 * Create list endpoints implementation
 */
export const createListEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBListEndpoints => ({
  /**
   * Get list details
   */
  async getDetails(listId: number, params?: { language?: LanguageCode }): Promise<ListDetails> {
    return request<ListDetails>('GET', `/list/${listId}`, params)
  },

  /**
   * Check if item exists in list
   */
  async checkItemStatus(listId: number, params?: { movie_id?: number }): Promise<ListItemStatusResponse> {
    return request<ListItemStatusResponse>('GET', `/list/${listId}/item_status`, params)
  }
})