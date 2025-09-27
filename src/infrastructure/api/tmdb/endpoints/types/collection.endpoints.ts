/**
 * TMDB Collection Endpoints
 * 
 * Collection-related endpoints for movie collections
 */

import type { 
  LanguageCode,
  Image,
  Translation
} from './base.types'
import type { MovieSummary } from './movie.endpoints'

/**
 * Collection details response
 */
export interface CollectionDetails {
  /** Collection ID */
  id: number
  /** Collection name */
  name: string
  /** Collection overview */
  overview: string
  /** Poster path */
  poster_path: string | null
  /** Backdrop path */
  backdrop_path: string | null
  /** Parts (movies in collection) */
  parts: MovieSummary[]
}

/**
 * Collection images response
 */
export interface CollectionImagesResponse {
  /** Collection ID */
  id: number
  /** Backdrop images */
  backdrops: Image[]
  /** Poster images */
  posters: Image[]
}

/**
 * Collection translations response
 */
export interface CollectionTranslationsResponse {
  /** Collection ID */
  id: number
  /** Array of translations */
  translations: Translation[]
}

/**
 * Collection endpoints interface
 */
export interface TMDBCollectionEndpoints {
  /**
   * Get collection details
   */
  getDetails(collectionId: number, params?: { language?: LanguageCode }): Promise<CollectionDetails>

  /**
   * Get the images for a collection
   */
  getImages(collectionId: number, params?: { language?: LanguageCode }): Promise<CollectionImagesResponse>

  /**
   * Get the translations for a collection
   */
  getTranslations(collectionId: number): Promise<CollectionTranslationsResponse>
}