/**
 * TMDB Collection Endpoints Implementation
 * 
 * Implementation of collection endpoints for movie collection data
 */

import type { LanguageCode } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { 
  TMDBCollectionEndpoints,
  CollectionDetails,
  CollectionImagesResponse,
  CollectionTranslationsResponse
} from '@/src/infrastructure/api/tmdb/endpoints/types/collection.endpoints'

/**
 * Create collection endpoints implementation
 */
export const createCollectionEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBCollectionEndpoints => ({
  /**
   * Get collection details
   */
  async getDetails(collectionId: number, params?: { language?: LanguageCode }): Promise<CollectionDetails> {
    return request<CollectionDetails>('GET', `/collection/${collectionId}`, params)
  },

  /**
   * Get the images for a collection
   */
  async getImages(collectionId: number, params?: { language?: LanguageCode }): Promise<CollectionImagesResponse> {
    return request<CollectionImagesResponse>('GET', `/collection/${collectionId}/images`, params)
  },

  /**
   * Get the translations for a collection
   */
  async getTranslations(collectionId: number): Promise<CollectionTranslationsResponse> {
    return request<CollectionTranslationsResponse>('GET', `/collection/${collectionId}/translations`)
  }
})