/**
 * TMDB Person Endpoints
 * 
 * All person-related endpoints and their response types
 */

import type { 
  PaginatedResponse, 
  PaginationParams,
  ExternalIds,
  Image,
  Translation,
  Gender,
  DateString,
  LanguageCode,
  CountryCode
} from './base.types'

/**
 * Person details response
 */
export interface PersonDetails {
  /** Is adult content */
  adult: boolean
  /** Also known as names */
  also_known_as: string[]
  /** Biography */
  biography: string
  /** Birthday */
  birthday: DateString | null
  /** Death day */
  deathday: DateString | null
  /** Gender */
  gender: Gender
  /** Homepage */
  homepage: string | null
  /** Person ID */
  id: number
  /** IMDb ID */
  imdb_id: string | null
  /** Known for department */
  known_for_department: string | null
  /** Name */
  name: string
  /** Place of birth */
  place_of_birth: string | null
  /** Popularity */
  popularity: number
  /** Profile path */
  profile_path: string | null
}

/**
 * Person summary for lists
 */
export interface PersonSummary {
  /** Is adult content */
  adult: boolean
  /** Gender */
  gender: Gender
  /** Person ID */
  id: number
  /** Known for department */
  known_for_department: string
  /** Known for (movies/TV shows) */
  known_for: {
    adult: boolean
    backdrop_path: string | null
    genre_ids: number[]
    id: number
    media_type: 'movie' | 'tv'
    original_language: string
    original_title?: string // for movies
    original_name?: string // for TV shows
    overview: string
    poster_path: string | null
    release_date?: string // for movies
    first_air_date?: string // for TV shows
    title?: string // for movies
    name?: string // for TV shows
    video?: boolean // for movies
    vote_average: number
    vote_count: number
    origin_country?: string[] // for TV shows
  }[]
  /** Name */
  name: string
  /** Popularity */
  popularity: number
  /** Profile path */
  profile_path: string | null
}

/**
 * Movie credit
 */
export interface MovieCredit {
  /** Is adult content */
  adult: boolean
  /** Backdrop path */
  backdrop_path: string | null
  /** Character (for cast) */
  character?: string
  /** Credit ID */
  credit_id: string
  /** Department (for crew) */
  department?: string
  /** Genre IDs */
  genre_ids: number[]
  /** Movie ID */
  id: number
  /** Job (for crew) */
  job?: string
  /** Order (for cast) */
  order?: number
  /** Original language */
  original_language: string
  /** Original title */
  original_title: string
  /** Overview */
  overview: string
  /** Popularity */
  popularity: number
  /** Poster path */
  poster_path: string | null
  /** Release date */
  release_date: string
  /** Title */
  title: string
  /** Video */
  video: boolean
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
}

/**
 * TV credit
 */
export interface TVCredit {
  /** Is adult content */
  adult: boolean
  /** Backdrop path */
  backdrop_path: string | null
  /** Character (for cast) */
  character?: string
  /** Credit ID */
  credit_id: string
  /** Department (for crew) */
  department?: string
  /** Episode count */
  episode_count: number
  /** First air date */
  first_air_date: string
  /** Genre IDs */
  genre_ids: number[]
  /** TV show ID */
  id: number
  /** Job (for crew) */
  job?: string
  /** Name */
  name: string
  /** Origin country */
  origin_country: string[]
  /** Original language */
  original_language: string
  /** Original name */
  original_name: string
  /** Overview */
  overview: string
  /** Popularity */
  popularity: number
  /** Poster path */
  poster_path: string | null
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
}

/**
 * Person movie credits response
 */
export interface PersonMovieCreditsResponse {
  /** Person ID */
  id: number
  /** Cast credits */
  cast: MovieCredit[]
  /** Crew credits */
  crew: MovieCredit[]
}

/**
 * Person TV credits response
 */
export interface PersonTVCreditsResponse {
  /** Person ID */
  id: number
  /** Cast credits */
  cast: TVCredit[]
  /** Crew credits */
  crew: TVCredit[]
}

/**
 * Combined credit
 */
export interface CombinedCredit {
  /** Is adult content */
  adult: boolean
  /** Backdrop path */
  backdrop_path: string | null
  /** Character (for cast) */
  character?: string
  /** Credit ID */
  credit_id: string
  /** Department (for crew) */
  department?: string
  /** Episode count (for TV) */
  episode_count?: number
  /** Genre IDs */
  genre_ids: number[]
  /** Media ID */
  id: number
  /** Job (for crew) */
  job?: string
  /** Media type */
  media_type: 'movie' | 'tv'
  /** Name (for TV) */
  name?: string
  /** Order (for cast) */
  order?: number
  /** Origin country (for TV) */
  origin_country?: string[]
  /** Original language */
  original_language: string
  /** Original name (for TV) */
  original_name?: string
  /** Original title (for movies) */
  original_title?: string
  /** Overview */
  overview: string
  /** Popularity */
  popularity: number
  /** Poster path */
  poster_path: string | null
  /** Release date (for movies) */
  release_date?: string
  /** First air date (for TV) */
  first_air_date?: string
  /** Title (for movies) */
  title?: string
  /** Video (for movies) */
  video?: boolean
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
}

/**
 * Person combined credits response
 */
export interface PersonCombinedCreditsResponse {
  /** Person ID */
  id: number
  /** Cast credits */
  cast: CombinedCredit[]
  /** Crew credits */
  crew: CombinedCredit[]
}

/**
 * Person external IDs response
 */
export interface PersonExternalIdsResponse extends ExternalIds {
  /** Person ID */
  id: number
  /** TikTok ID */
  tiktok_id: string | null
  /** YouTube ID */
  youtube_id: string | null
}

/**
 * Person images response
 */
export interface PersonImagesResponse {
  /** Person ID */
  id: number
  /** Profile images */
  profiles: Image[]
}

/**
 * Tagged image
 */
export interface TaggedImage {
  /** Aspect ratio */
  aspect_ratio: number
  /** File path */
  file_path: string
  /** Height */
  height: number
  /** ID */
  id: string
  /** ISO 639-1 language code */
  iso_639_1: string | null
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
  /** Width */
  width: number
  /** Image type */
  image_type: 'backdrop' | 'poster'
  /** Media */
  media: {
    adult: boolean
    backdrop_path: string | null
    genre_ids: number[]
    id: number
    media_type: 'movie' | 'tv'
    original_language: string
    original_title?: string // for movies
    original_name?: string // for TV shows
    overview: string
    poster_path: string | null
    release_date?: string // for movies
    first_air_date?: string // for TV shows
    title?: string // for movies
    name?: string // for TV shows
    video?: boolean // for movies
    vote_average: number
    vote_count: number
    origin_country?: string[] // for TV shows
  }
  /** Media type */
  media_type: 'movie' | 'tv'
}

/**
 * Person tagged images response
 */
export interface PersonTaggedImagesResponse extends PaginatedResponse<TaggedImage> {
  /** Person ID */
  id: number
}

/**
 * Person translations response
 */
export interface PersonTranslationsResponse {
  /** Person ID */
  id: number
  /** Array of translations */
  translations: Translation[]
}

/**
 * Popular people parameters
 */
export interface PopularPeopleParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Person endpoints interface
 */
export interface TMDBPersonEndpoints {
  /**
   * Get the primary person details by id
   */
  getDetails(personId: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<PersonDetails>

  /**
   * Get the movie credits for a person
   */
  getMovieCredits(personId: number, params?: { language?: LanguageCode }): Promise<PersonMovieCreditsResponse>

  /**
   * Get the TV show credits for a person
   */
  getTVCredits(personId: number, params?: { language?: LanguageCode }): Promise<PersonTVCreditsResponse>

  /**
   * Get the movie and TV credits together in a single response
   */
  getCombinedCredits(personId: number, params?: { language?: LanguageCode }): Promise<PersonCombinedCreditsResponse>

  /**
   * Get the external ids for a person
   */
  getExternalIds(personId: number): Promise<PersonExternalIdsResponse>

  /**
   * Get the images for a person
   */
  getImages(personId: number): Promise<PersonImagesResponse>

  /**
   * Get the images that this person has been tagged in
   */
  getTaggedImages(personId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<PersonTaggedImagesResponse>

  /**
   * Get a list of translations that have been created for a person
   */
  getTranslations(personId: number): Promise<PersonTranslationsResponse>

  /**
   * Get the list of popular people on TMDB
   */
  getPopular(params?: PopularPeopleParams): Promise<PaginatedResponse<PersonSummary>>

  /**
   * Get the most newly created person
   */
  getLatest(): Promise<PersonDetails>
}