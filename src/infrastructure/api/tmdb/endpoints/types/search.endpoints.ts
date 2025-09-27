/**
 * TMDB Search Endpoints
 * 
 * Search functionality across movies, TV shows, people, collections, companies, and keywords
 */

import type { PaginatedResponse, PaginationParams, LanguageCode, CountryCode } from './base.types'
import type { MovieSummary } from './movie.endpoints'
import type { TVShowSummary } from './tv.endpoints'
import type { PersonSummary } from './person.endpoints'

/**
 * Multi-search results - union of movie, TV, and person
 */
export type MultiSearchResult = (MovieSummary | TVShowSummary | PersonSummary) & {
  media_type: 'movie' | 'tv' | 'person'
}

/**
 * Collection search result
 */
export interface CollectionSearchResult {
  /** Is adult content */
  adult: boolean
  /** Backdrop path */
  backdrop_path: string | null
  /** Collection ID */
  id: number
  /** Collection name */
  name: string
  /** Original language */
  original_language: string
  /** Original name */
  original_name: string
  /** Overview */
  overview: string
  /** Poster path */
  poster_path: string | null
}

/**
 * Company search result
 */
export interface CompanySearchResult {
  /** Company ID */
  id: number
  /** Logo path */
  logo_path: string | null
  /** Company name */
  name: string
  /** Origin country */
  origin_country: string
}

/**
 * Keyword search result
 */
export interface KeywordSearchResult {
  /** Keyword ID */
  id: number
  /** Keyword name */
  name: string
}

/**
 * Movie search parameters
 */
export interface MovieSearchParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
  /** Movie release year */
  year?: number
  /** Primary release year */
  primary_release_year?: number
  /** Include adult content */
  include_adult?: boolean
}

/**
 * TV search parameters
 */
export interface TVSearchParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** First air date year */
  first_air_date_year?: number
  /** Include adult content */
  include_adult?: boolean
}

/**
 * Person search parameters
 */
export interface PersonSearchParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** Include adult content */
  include_adult?: boolean
}

/**
 * Multi search parameters
 */
export interface MultiSearchParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
  /** Include adult content */
  include_adult?: boolean
}

/**
 * Collection search parameters
 */
export interface CollectionSearchParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
}

/**
 * Company search parameters
 */
export type CompanySearchParams = PaginationParams

/**
 * Keyword search parameters
 */
export type KeywordSearchParams = PaginationParams

/**
 * Search endpoints interface
 */
export interface TMDBSearchEndpoints {
  /**
   * Search for movies by their original, translated and alternative titles
   */
  searchMovies(query: string, params?: MovieSearchParams): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Search for TV shows by their original, translated and alternative names
   */
  searchTV(query: string, params?: TVSearchParams): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Search for people by their name and also known as names
   */
  searchPeople(query: string, params?: PersonSearchParams): Promise<PaginatedResponse<PersonSummary>>

  /**
   * Search multiple models in a single request (movies, TV shows, and people)
   */
  multiSearch(query: string, params?: MultiSearchParams): Promise<PaginatedResponse<MultiSearchResult>>

  /**
   * Search for collections by their name
   */
  searchCollections(query: string, params?: CollectionSearchParams): Promise<PaginatedResponse<CollectionSearchResult>>

  /**
   * Search for companies by their name
   */
  searchCompanies(query: string, params?: CompanySearchParams): Promise<PaginatedResponse<CompanySearchResult>>

  /**
   * Search for keywords by their name
   */
  searchKeywords(query: string, params?: KeywordSearchParams): Promise<PaginatedResponse<KeywordSearchResult>>
}