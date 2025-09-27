/**
 * TMDB Person Endpoints Implementation
 * 
 * Implementation of person endpoints with comprehensive functionality
 */

import type { LanguageCode, PaginatedResponse } from '../types/base.types'
import type { 
  TMDBPersonEndpoints,
  PersonDetails,
  PersonSummary,
  PersonMovieCreditsResponse,
  PersonTVCreditsResponse,
  PersonCombinedCreditsResponse,
  PersonExternalIdsResponse,
  PersonImagesResponse,
  PersonTaggedImagesResponse,
  PersonTranslationsResponse,
  PopularPeopleParams
} from '../types/person.endpoints'

/**
 * Create person endpoints implementation
 */
export const createPersonEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBPersonEndpoints => ({
  /**
   * Get the primary person details by id
   */
  async getDetails(personId: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<PersonDetails> {
    const appendToResponse = params?.append_to_response ? [params.append_to_response] : undefined
    return request<PersonDetails>('GET', `/person/${personId}`, params, undefined, { appendToResponse })
  },

  /**
   * Get the movie credits for a person
   */
  async getMovieCredits(personId: number, params?: { language?: LanguageCode }): Promise<PersonMovieCreditsResponse> {
    return request<PersonMovieCreditsResponse>('GET', `/person/${personId}/movie_credits`, params)
  },

  /**
   * Get the TV show credits for a person
   */
  async getTVCredits(personId: number, params?: { language?: LanguageCode }): Promise<PersonTVCreditsResponse> {
    return request<PersonTVCreditsResponse>('GET', `/person/${personId}/tv_credits`, params)
  },

  /**
   * Get the movie and TV credits together in a single response
   */
  async getCombinedCredits(personId: number, params?: { language?: LanguageCode }): Promise<PersonCombinedCreditsResponse> {
    return request<PersonCombinedCreditsResponse>('GET', `/person/${personId}/combined_credits`, params)
  },

  /**
   * Get the external ids for a person
   */
  async getExternalIds(personId: number): Promise<PersonExternalIdsResponse> {
    return request<PersonExternalIdsResponse>('GET', `/person/${personId}/external_ids`)
  },

  /**
   * Get the images for a person
   */
  async getImages(personId: number): Promise<PersonImagesResponse> {
    return request<PersonImagesResponse>('GET', `/person/${personId}/images`)
  },

  /**
   * Get the images that this person has been tagged in
   */
  async getTaggedImages(personId: number, params?: { page?: number; language?: LanguageCode }): Promise<PersonTaggedImagesResponse> {
    return request<PersonTaggedImagesResponse>('GET', `/person/${personId}/tagged_images`, params)
  },

  /**
   * Get a list of translations that have been created for a person
   */
  async getTranslations(personId: number): Promise<PersonTranslationsResponse> {
    return request<PersonTranslationsResponse>('GET', `/person/${personId}/translations`)
  },

  /**
   * Get the list of popular people on TMDB
   */
  async getPopular(params?: PopularPeopleParams): Promise<PaginatedResponse<PersonSummary>> {
    return request<PaginatedResponse<PersonSummary>>('GET', '/person/popular', params)
  },

  /**
   * Get the most newly created person
   */
  async getLatest(): Promise<PersonDetails> {
    return request<PersonDetails>('GET', '/person/latest')
  }
})