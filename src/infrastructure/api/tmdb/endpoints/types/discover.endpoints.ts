/**
 * TMDB Discover Endpoints
 * 
 * Discover movies and TV shows with advanced filtering and sorting
 */

import type { 
  PaginatedResponse, 
  PaginationParams, 
  DateRangeParams,
  LanguageCode,
  CountryCode,
  DateString
} from './base.types'
import type { MovieSummary } from './movie.endpoints'
import type { TVShowSummary } from './tv.endpoints'

/**
 * Movie sort options for discover
 */
export type MovieSortBy = 
  | 'popularity.asc' | 'popularity.desc'
  | 'release_date.asc' | 'release_date.desc'
  | 'revenue.asc' | 'revenue.desc'
  | 'primary_release_date.asc' | 'primary_release_date.desc'
  | 'original_title.asc' | 'original_title.desc'
  | 'vote_average.asc' | 'vote_average.desc'
  | 'vote_count.asc' | 'vote_count.desc'

/**
 * TV sort options for discover
 */
export type TVSortBy = 
  | 'vote_average.desc' | 'vote_average.asc'
  | 'first_air_date.desc' | 'first_air_date.asc'
  | 'popularity.desc' | 'popularity.asc'

/**
 * Monetization types for discover
 */
export type MonetizationType = 
  | 'flatrate'    // subscription
  | 'free'        // free with ads
  | 'ads'         // free with ads
  | 'rent'        // rental
  | 'buy'         // purchase

/**
 * Movie discover parameters
 */
export interface DiscoverMovieParams extends PaginationParams, DateRangeParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
  /** Sort results by */
  sort_by?: MovieSortBy
  /** Certification country */
  certification_country?: CountryCode
  /** Certification (e.g., 'R', 'PG-13') */
  certification?: string
  /** Certification less than or equal to */
  'certification.lte'?: string
  /** Certification greater than or equal to */
  'certification.gte'?: string
  /** Include adult content */
  include_adult?: boolean
  /** Include video content */
  include_video?: boolean
  /** Primary release year */
  primary_release_year?: number
  /** Primary release date greater than or equal to */
  'primary_release_date.gte'?: DateString
  /** Primary release date less than or equal to */
  'primary_release_date.lte'?: DateString
  /** Release date greater than or equal to */
  'release_date.gte'?: DateString
  /** Release date less than or equal to */
  'release_date.lte'?: DateString
  /** Movie runtime greater than or equal to */
  'with_runtime.gte'?: number
  /** Movie runtime less than or equal to */
  'with_runtime.lte'?: number
  /** Genre IDs (comma separated) */
  with_genres?: string
  /** Exclude genre IDs (comma separated) */
  without_genres?: string
  /** Company IDs (comma separated) */
  with_companies?: string
  /** Cast person IDs (comma separated) */
  with_cast?: string
  /** Crew person IDs (comma separated) */
  with_crew?: string
  /** Person IDs (comma separated) */
  with_people?: string
  /** Keyword IDs (comma separated) */
  with_keywords?: string
  /** Exclude keyword IDs (comma separated) */
  without_keywords?: string
  /** Vote count greater than or equal to */
  'vote_count.gte'?: number
  /** Vote count less than or equal to */
  'vote_count.lte'?: number
  /** Vote average greater than or equal to */
  'vote_average.gte'?: number
  /** Vote average less than or equal to */
  'vote_average.lte'?: number
  /** Original language */
  with_original_language?: LanguageCode
  /** Exclude original language */
  without_companies?: string
  /** Watch region */
  watch_region?: CountryCode
  /** Watch provider IDs (comma separated) */
  with_watch_providers?: string
  /** Monetization type */
  with_watch_monetization_types?: MonetizationType
  /** Year */
  year?: number
}

/**
 * TV discover parameters
 */
export interface DiscoverTVParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** Sort results by */
  sort_by?: TVSortBy
  /** First air date year */
  first_air_date_year?: number
  /** First air date greater than or equal to */
  'first_air_date.gte'?: DateString
  /** First air date less than or equal to */
  'first_air_date.lte'?: DateString
  /** Air date greater than or equal to */
  'air_date.gte'?: DateString
  /** Air date less than or equal to */
  'air_date.lte'?: DateString
  /** Timezone for air date queries */
  timezone?: string
  /** Vote count greater than or equal to */
  'vote_count.gte'?: number
  /** Vote count less than or equal to */
  'vote_count.lte'?: number
  /** Vote average greater than or equal to */
  'vote_average.gte'?: number
  /** Vote average less than or equal to */
  'vote_average.lte'?: number
  /** Episode runtime greater than or equal to */
  'with_runtime.gte'?: number
  /** Episode runtime less than or equal to */
  'with_runtime.lte'?: number
  /** Genre IDs (comma separated) */
  with_genres?: string
  /** Exclude genre IDs (comma separated) */
  without_genres?: string
  /** Network IDs (comma separated) */
  with_networks?: string
  /** Company IDs (comma separated) */
  with_companies?: string
  /** Keyword IDs (comma separated) */
  with_keywords?: string
  /** Exclude keyword IDs (comma separated) */
  without_keywords?: string
  /** Original language */
  with_original_language?: LanguageCode
  /** Screen for TV shows with these statuses */
  with_status?: 0 | 1 | 2 | 3 | 4 | 5 // Returning Series=0, Planned=1, In Production=2, Ended=3, Cancelled=4, Pilot=5
  /** Screen for TV shows with these types */
  with_type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 // Documentary=0, News=1, Miniseries=2, Reality=3, Scripted=4, Talk Show=5, Video=6
  /** Include null first air dates */
  include_null_first_air_dates?: boolean
  /** Watch region */
  watch_region?: CountryCode
  /** Watch provider IDs (comma separated) */
  with_watch_providers?: string
  /** Monetization type */
  with_watch_monetization_types?: MonetizationType
  /** Screened theatrically */
  screened_theatrically?: boolean
}

/**
 * Discover endpoints interface
 */
export interface TMDBDiscoverEndpoints {
  /**
   * Discover movies with advanced filtering and sorting
   */
  discoverMovies(params?: DiscoverMovieParams): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Discover TV shows with advanced filtering and sorting
   */
  discoverTV(params?: DiscoverTVParams): Promise<PaginatedResponse<TVShowSummary>>
}