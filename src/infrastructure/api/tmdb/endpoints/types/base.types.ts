/**
 * Base TMDB API Types
 * 
 * Common types used across all TMDB endpoints
 */

/**
 * Base media type union
 */
export type MediaType = 'movie' | 'tv' | 'person'

/**
 * Time window for trending endpoints
 */
export type TimeWindow = 'day' | 'week'

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Image type
 */
export type ImageType = 'backdrop' | 'poster' | 'profile' | 'logo' | 'still'

/**
 * Video types
 */
export type VideoType = 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers'

/**
 * Video sites
 */
export type VideoSite = 'YouTube' | 'Vimeo'

/**
 * Known for department (person)
 */
export type Department = 'Acting' | 'Directing' | 'Writing' | 'Production' | 'Sound' | 'Art' | 'Crew' | 'Camera' | 'Costume & Make-Up' | 'Editing' | 'Visual Effects'

/**
 * Gender codes
 */
export enum Gender {
  NotSet = 0,
  Female = 1,
  Male = 2,
  NonBinary = 3
}

/**
 * ISO language code (e.g., 'en', 'es', 'fr')
 */
export type LanguageCode = string

/**
 * ISO country code (e.g., 'US', 'GB', 'CA')
 */
export type CountryCode = string

/**
 * Date string in YYYY-MM-DD format
 */
export type DateString = string

/**
 * Base pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-1000) */
  page?: number
}

/**
 * Base pagination response
 */
export interface PaginatedResponse<T> {
  /** Current page number */
  page: number
  /** Array of results */
  results: T[]
  /** Total number of results */
  total_results: number
  /** Total number of pages */
  total_pages: number
}

/**
 * Date range parameters
 */
export interface DateRangeParams {
  /** Primary release date greater than or equal to */
  'primary_release_date.gte'?: DateString
  /** Primary release date less than or equal to */
  'primary_release_date.lte'?: DateString
  /** Release date greater than or equal to */
  'release_date.gte'?: DateString
  /** Release date less than or equal to */
  'release_date.lte'?: DateString
}

/**
 * Genre object
 */
export interface Genre {
  /** Genre ID */
  id: number
  /** Genre name */
  name: string
}

/**
 * Production company (canonical version)
 * Used across all domain entities for consistency
 */
export interface ProductionCompany {
  /** Company ID */
  readonly id: number
  /** Company name */
  readonly name: string
  /** Company logo URL */
  readonly logoUrl?: string
  /** Origin country */
  readonly originCountry?: CountryCode
}

/**
 * Production country
 */
export interface ProductionCountry {
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Country name */
  name: string
}

/**
 * Spoken language
 */
export interface SpokenLanguage {
  /** English name */
  english_name: string
  /** ISO 639-1 language code */
  iso_639_1: string
  /** Native name */
  name: string
}

/**
 * Image object
 */
export interface Image {
  /** Aspect ratio */
  aspect_ratio: number
  /** Image height */
  height: number
  /** ISO 639-1 language code */
  iso_639_1: string | null
  /** File path */
  file_path: string
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
  /** Image width */
  width: number
}

/**
 * Video object
 */
export interface Video {
  /** ISO 639-1 language code */
  iso_639_1: string
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Video name */
  name: string
  /** Video key/ID */
  key: string
  /** Video site */
  site: VideoSite
  /** Video size (resolution) */
  size: number
  /** Video type */
  type: VideoType
  /** Is official video */
  official: boolean
  /** Published date */
  published_at: string
  /** Video ID */
  id: string
}

/**
 * External IDs
 */
export interface ExternalIds {
  /** IMDb ID */
  imdb_id: string | null
  /** Facebook ID */
  facebook_id: string | null
  /** Instagram ID */
  instagram_id: string | null
  /** Twitter ID */
  twitter_id: string | null
  /** TVDb ID */
  tvdb_id: number | null
  /** TVRAGE ID */
  tvrage_id: number | null
  /** Wikidata ID */
  wikidata_id: string | null
  /** Freebase MID */
  freebase_mid: string | null
  /** Freebase ID */
  freebase_id: string | null
}

/**
 * Translation data
 */
export interface Translation {
  /** ISO 639-1 language code */
  iso_639_1: string
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Translated name */
  name: string
  /** English name */
  english_name: string
  /** Translation data */
  data: {
    /** Translated title */
    title?: string
    /** Translated overview */
    overview?: string
    /** Translated homepage */
    homepage?: string
    /** Translated tagline */
    tagline?: string
    /** Runtime (for movies) */
    runtime?: number
  }
}

/**
 * Alternative title
 */
export interface AlternativeTitle {
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Alternative title */
  title: string
  /** Title type */
  type: string
}

/**
 * Release date information
 */
export interface ReleaseDate {
  /** Certification */
  certification: string
  /** Release date */
  release_date: string
  /** Release type */
  type: number
  /** Additional note */
  note: string
}

/**
 * Content rating
 */
export interface ContentRating {
  /** Descriptors */
  descriptors: string[]
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Rating */
  rating: string
}

/**
 * Watch provider information
 */
export interface WatchProvider {
  /** Display priority */
  display_priority: number
  /** Logo path */
  logo_path: string
  /** Provider ID */
  provider_id: number
  /** Provider name */
  provider_name: string
}

/**
 * Region watch providers
 */
export interface RegionWatchProviders {
  /** Available for streaming */
  flatrate?: WatchProvider[]
  /** Available for rent */
  rent?: WatchProvider[]
  /** Available for purchase */
  buy?: WatchProvider[]
  /** Available on ads-supported platforms */
  ads?: WatchProvider[]
  /** Watch provider link */
  link?: string
}

/**
 * Credit base type
 */
export interface BaseCredit {
  /** Is adult content */
  adult: boolean
  /** Gender */
  gender: Gender
  /** Person ID */
  id: number
  /** Known for department */
  known_for_department: string
  /** Person name */
  name: string
  /** Original name */
  original_name: string
  /** Popularity score */
  popularity: number
  /** Profile image path */
  profile_path: string | null
  /** Credit ID */
  credit_id: string
}

/**
 * Cast member
 */
export interface CastMember extends BaseCredit {
  /** Cast ID */
  cast_id: number
  /** Character name */
  character: string
  /** Display order */
  order: number
}

/**
 * Crew member
 */
export interface CrewMember extends BaseCredit {
  /** Department */
  department: string
  /** Job title */
  job: string
}

/**
 * Keywords object
 */
export interface Keyword {
  /** Keyword ID */
  id: number
  /** Keyword name */
  name: string
}

/**
 * Network information
 */
export interface Network {
  /** Network ID */
  id: number
  /** Network name */
  name: string
  /** Logo path */
  logo_path: string | null
  /** Origin country */
  origin_country: string
}