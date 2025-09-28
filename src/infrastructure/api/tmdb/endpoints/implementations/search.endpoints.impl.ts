/**
 * TMDB Search Endpoints Implementation
 * 
 * Implementation of search endpoints with comprehensive functionality
 */

import type { PaginatedResponse } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { 
  TMDBSearchEndpoints,
  MovieSearchParams,
  TVSearchParams,
  PersonSearchParams,
  MultiSearchParams,
  CollectionSearchParams,
  CompanySearchParams,
  KeywordSearchParams,
  MultiSearchResult,
  CollectionSearchResult,
  CompanySearchResult,
  KeywordSearchResult
} from '@/src/infrastructure/api/tmdb/endpoints/types/search.endpoints'
import type { MovieSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TVShowSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'
import type { PersonSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/person.endpoints'

/**
 * Create search endpoints implementation
 */
export const createSearchEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBSearchEndpoints => ({
  /**
   * Search for movies by their original, translated and alternative titles
   */
  async searchMovies(query: string, params?: MovieSearchParams): Promise<PaginatedResponse<MovieSummary>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<MovieSummary>>('GET', '/search/movie', searchParams)
  },

  /**
   * Search for TV shows by their original, translated and alternative names
   */
  async searchTV(query: string, params?: TVSearchParams): Promise<PaginatedResponse<TVShowSummary>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<TVShowSummary>>('GET', '/search/tv', searchParams)
  },

  /**
   * Search for people by their name and also known as names
   */
  async searchPeople(query: string, params?: PersonSearchParams): Promise<PaginatedResponse<PersonSummary>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<PersonSummary>>('GET', '/search/person', searchParams)
  },

  /**
   * Search multiple models in a single request (movies, TV shows, and people)
   */
  async multiSearch(query: string, params?: MultiSearchParams): Promise<PaginatedResponse<MultiSearchResult>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<MultiSearchResult>>('GET', '/search/multi', searchParams)
  },

  /**
   * Search for collections by their name
   */
  async searchCollections(query: string, params?: CollectionSearchParams): Promise<PaginatedResponse<CollectionSearchResult>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<CollectionSearchResult>>('GET', '/search/collection', searchParams)
  },

  /**
   * Search for companies by their name
   */
  async searchCompanies(query: string, params?: CompanySearchParams): Promise<PaginatedResponse<CompanySearchResult>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<CompanySearchResult>>('GET', '/search/company', searchParams)
  },

  /**
   * Search for keywords by their name
   */
  async searchKeywords(query: string, params?: KeywordSearchParams): Promise<PaginatedResponse<KeywordSearchResult>> {
    const searchParams = { query, ...params }
    return request<PaginatedResponse<KeywordSearchResult>>('GET', '/search/keyword', searchParams)
  }
})