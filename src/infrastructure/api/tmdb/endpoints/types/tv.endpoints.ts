/**
 * TMDB TV Endpoints
 * 
 * All TV show related endpoints and their response types
 */

import type { 
  PaginatedResponse, 
  PaginationParams, 
  Genre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
  Video,
  Image,
  ExternalIds,
  Translation,
  CastMember,
  CrewMember,
  Keyword,
  RegionWatchProviders,
  CountryCode,
  LanguageCode
} from './base.types'

/**
 * TMDB TV show object (detailed) - Provider-specific type with optional appended data
 */
export interface TMDBTVShowDetails {
  /** Is adult content */
  adult: boolean
  /** Backdrop image path */
  backdrop_path: string | null
  /** Created by */
  created_by: {
    id: number
    credit_id: string
    name: string
    gender: number
    profile_path: string | null
  }[]
  /** Episode run time */
  episode_run_time: number[]
  /** First air date */
  first_air_date: string
  /** Array of genres */
  genres: Genre[]
  /** Homepage URL */
  homepage: string | null
  /** TV show ID */
  id: number
  /** Is in production */
  in_production: boolean
  /** Languages */
  languages: string[]
  /** Last air date */
  last_air_date: string | null
  /** Last episode to air */
  last_episode_to_air: {
    id: number
    name: string
    overview: string
    vote_average: number
    vote_count: number
    air_date: string
    episode_number: number
    production_code: string
    runtime: number | null
    season_number: number
    show_id: number
    still_path: string | null
  } | null
  /** TV show name */
  name: string
  /** Next episode to air */
  next_episode_to_air: {
    id: number
    name: string
    overview: string
    vote_average: number
    vote_count: number
    air_date: string
    episode_number: number
    production_code: string
    runtime: number | null
    season_number: number
    show_id: number
    still_path: string | null
  } | null
  /** Networks */
  networks: {
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }[]
  /** Number of episodes */
  number_of_episodes: number
  /** Number of seasons */
  number_of_seasons: number
  /** Origin country */
  origin_country: string[]
  /** Original language */
  original_language: string
  /** Original name */
  original_name: string
  /** Plot overview */
  overview: string
  /** Popularity score */
  popularity: number
  /** Poster image path */
  poster_path: string | null
  /** Production companies */
  production_companies: ProductionCompany[]
  /** Production countries */
  production_countries: ProductionCountry[]
  /** Seasons */
  seasons: {
    air_date: string | null
    episode_count: number
    id: number
    name: string
    overview: string
    poster_path: string | null
    season_number: number
  }[]
  /** Spoken languages */
  spoken_languages: SpokenLanguage[]
  /** Status */
  status: 'Returning Series' | 'Planned' | 'In Production' | 'Ended' | 'Cancelled' | 'Pilot'
  /** Tagline */
  tagline: string
  /** Type */
  type: string
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number

  // Optional appended data (previously in TVShowDetailsWithAppends)
  /** Credits data when append_to_response includes 'credits' */
  credits?: {
    cast: CastMember[]
    crew: CrewMember[]
  }
  /** Recommendations when append_to_response includes 'recommendations' */
  recommendations?: {
    page: number
    results: TVShowSummary[]
    total_pages: number
    total_results: number
  }
  /** Similar shows when append_to_response includes 'similar' */
  similar?: {
    page: number
    results: TVShowSummary[]
    total_pages: number
    total_results: number
  }
  /** Videos when append_to_response includes 'videos' */
  videos?: {
    results: Video[]
  }
  /** Images when append_to_response includes 'images' */
  images?: {
    backdrops: Image[]
    logos: Image[]
    posters: Image[]
  }
  /** External IDs when append_to_response includes 'external_ids' */
  external_ids?: TVExternalIdsResponse
}

/**
 * TV show object (summary for lists)
 */
export interface TVShowSummary {
  /** Is adult content */
  adult: boolean
  /** Backdrop image path */
  backdrop_path: string | null
  /** Array of genre IDs */
  genre_ids: number[]
  /** TV show ID */
  id: number
  /** Origin country */
  origin_country: string[]
  /** Original language */
  original_language: string
  /** Original name */
  original_name: string
  /** Plot overview */
  overview: string
  /** Popularity score */
  popularity: number
  /** Poster image path */
  poster_path: string | null
  /** First air date */
  first_air_date: string
  /** TV show name */
  name: string
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
}

/**
 * TMDB TV season details with optional appended data
 */
export interface TMDBTVSeasonDetails {
  /** Season air date */
  air_date: string | null
  /** Episodes */
  episodes: {
    air_date: string | null
    episode_number: number
    id: number
    name: string
    overview: string
    production_code: string
    runtime: number | null
    season_number: number
    show_id: number
    still_path: string | null
    vote_average: number
    vote_count: number
    crew: CrewMember[]
    guest_stars: CastMember[]
  }[]
  /** Season name */
  name: string
  /** Season overview */
  overview: string
  /** Season ID */
  id: number
  /** Poster path */
  poster_path: string | null
  /** Season number */
  season_number: number

  // Optional appended data (previously in TVSeasonDetailsWithAppends)
  /** Vote average for the season */
  vote_average?: number
  /** Credits data when append_to_response includes 'credits' */
  credits?: {
    cast: CastMember[]
    crew: CrewMember[]
  }
  /** Videos when append_to_response includes 'videos' */
  videos?: {
    results: Video[]
  }
  /** Images when append_to_response includes 'images' */
  images?: {
    posters: Image[]
  }
  /** External IDs when append_to_response includes 'external_ids' */
  external_ids?: TVSeasonExternalIdsResponse
}

/**
 * TV episode details
 */
export interface TVEpisodeDetails {
  /** Air date */
  air_date: string | null
  /** Crew members */
  crew: CrewMember[]
  /** Episode number */
  episode_number: number
  /** Guest stars */
  guest_stars: CastMember[]
  /** Episode name */
  name: string
  /** Episode overview */
  overview: string
  /** Episode ID */
  id: number
  /** Production code */
  production_code: string
  /** Runtime in minutes */
  runtime: number | null
  /** Season number */
  season_number: number
  /** Still image path */
  still_path: string | null
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
  /** Show ID */
  show_id: number
}

/**
 * TV credits response
 */
export interface TVCreditsResponse {
  /** TV show ID */
  id: number
  /** Cast members */
  cast: CastMember[]
  /** Crew members */
  crew: CrewMember[]
}

/**
 * TV images response
 */
export interface TVImagesResponse {
  /** TV show ID */
  id: number
  /** Backdrop images */
  backdrops: Image[]
  /** Logo images */
  logos: Image[]
  /** Poster images */
  posters: Image[]
}

/**
 * TV videos response
 */
export interface TVVideosResponse {
  /** TV show ID */
  id: number
  /** Array of videos */
  results: Video[]
}

/**
 * TV external IDs response
 */
export interface TVExternalIdsResponse extends ExternalIds {
  /** TV show ID */
  id: number
  /** TVRage ID */
  tvrage_id: number | null
  /** TVDB ID */
  tvdb_id: number | null
}

/**
 * TV translations response
 */
export interface TVTranslationsResponse {
  /** TV show ID */
  id: number
  /** Array of translations */
  translations: Translation[]
}

/**
 * TV alternative titles response
 */
export interface TVAlternativeTitlesResponse {
  /** TV show ID */
  id: number
  /** Array of alternative titles */
  results: {
    iso_3166_1: string
    title: string
    type: string
  }[]
}

/**
 * TV content ratings response
 */
export interface TVContentRatingsResponse {
  /** TV show ID */
  id: number
  /** Content ratings by country */
  results: {
    descriptors: string[]
    iso_3166_1: string
    rating: string
  }[]
}

/**
 * TV keywords response
 */
export interface TVKeywordsResponse {
  /** TV show ID */
  id: number
  /** Array of keywords */
  results: Keyword[]
}

/**
 * TV watch providers response
 */
export interface TVWatchProvidersResponse {
  /** TV show ID */
  id: number
  /** Watch providers by region */
  results: Record<string, RegionWatchProviders>
}

/**
 * TV recommendations response
 */
export type TVRecommendationsResponse = PaginatedResponse<TVShowSummary>

/**
 * TV similar response
 */
export type TVSimilarResponse = PaginatedResponse<TVShowSummary>

/**
 * TV reviews response
 */
export type TVReviewsResponse = PaginatedResponse<{
  /** Review ID */
  id: string
  /** Author username */
  author: string
  /** Author details */
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  /** Review content */
  content: string
  /** Created date */
  created_at: string
  /** Updated date */
  updated_at: string
  /** Review URL */
  url: string
}>

/**
 * TV account states response (requires authentication)
 */
export interface TVAccountStatesResponse {
  /** TV show ID */
  id: number
  /** Is favorite */
  favorite: boolean
  /** User rating */
  rated: {
    value: number
  } | false
  /** Is in watchlist */
  watchlist: boolean
}

/**
 * TV episode account states response (requires authentication)
 */
export interface TVEpisodeAccountStatesResponse {
  /** Episode ID */
  id: number
  /** User rating */
  rated: {
    value: number
  } | false
}

/**
 * Popular TV shows parameters
 */
export interface PopularTVParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Top rated TV shows parameters
 */
export interface TopRatedTVParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Airing today TV shows parameters
 */
export interface AiringTodayTVParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
  /** Timezone */
  timezone?: string
}

/**
 * On the Air TV shows parameters  
 */
export interface OnTheAirTVParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
  /** Timezone */
  timezone?: string
}

/**
 * TV episode group details
 */
export interface TVEpisodeGroupDetails {
  /** Description */
  description: string
  /** Episode count */
  episode_count: number
  /** Group count */
  group_count: number
  /** Groups */
  groups: {
    id: string
    name: string
    order: number
    episodes: {
      air_date: string | null
      episode_number: number
      id: number
      name: string
      overview: string
      production_code: string | null
      runtime: number | null
      season_number: number
      show_id: number
      still_path: string | null
      vote_average: number
      vote_count: number
      order: number
    }[]
    locked: boolean
  }[]
  /** Episode group ID */
  id: string
  /** Name */
  name: string
  /** Network */
  network: {
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  } | null
  /** Type */
  type: number
}

/**
 * TV season images response
 */
export interface TVSeasonImagesResponse {
  /** Season ID */
  id: number
  /** Poster images */
  posters: Image[]
}

/**
 * TV season videos response
 */
export interface TVSeasonVideosResponse {
  /** Season ID */
  id: number
  /** Array of videos */
  results: Video[]
}

/**
 * TV season external IDs response
 */
export interface TVSeasonExternalIdsResponse {
  /** Season ID */
  id: number
  /** TVDB ID */
  tvdb_id: number | null
  /** TVRage ID */
  tvrage_id: number | null
}

/**
 * TV episode images response
 */
export interface TVEpisodeImagesResponse {
  /** Episode ID */
  id: number
  /** Still images */
  stills: Image[]
}

/**
 * TV episode videos response
 */
export interface TVEpisodeVideosResponse {
  /** Episode ID */
  id: number
  /** Array of videos */
  results: Video[]
}

/**
 * TV episode external IDs response
 */
export interface TVEpisodeExternalIdsResponse {
  /** Episode ID */
  id: number
  /** IMDb ID */
  imdb_id: string | null
  /** TVDB ID */
  tvdb_id: number | null
  /** TVRage ID */
  tvrage_id: number | null
}

/**
 * TV episode credits response
 */
export interface TVEpisodeCreditsResponse {
  /** Episode ID */
  id: number
  /** Cast members */
  cast: CastMember[]
  /** Crew members */
  crew: CrewMember[]
  /** Guest stars */
  guest_stars: CastMember[]
}

/**
 * TV episode translations response
 */
export interface TVEpisodeTranslationsResponse {
  /** Episode ID */
  id: number
  /** Array of translations */
  translations: Translation[]
}

/**
 * TV season credits response
 */
export interface TVSeasonCreditsResponse {
  /** Season ID */
  id: number
  /** Cast members */
  cast: CastMember[]
  /** Crew members */
  crew: CrewMember[]
}

/**
 * TV season translations response
 */
export interface TVSeasonTranslationsResponse {
  /** Season ID */
  id: number
  /** Array of translations */
  translations: Translation[]
}

/**
 * TV endpoints interface
 */
export interface TMDBTVEndpoints {
  /**
   * Get the primary TV show details by id
   */
  getDetails(tvId: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<TMDBTVShowDetails>

  /**
   * Get the alternative titles for a TV show
   */
  getAlternativeTitles(tvId: number): Promise<TVAlternativeTitlesResponse>

  /**
   * Get the credits (cast and crew) that have been added to a TV show
   */
  getCredits(tvId: number, params?: { language?: LanguageCode }): Promise<TVCreditsResponse>

  /**
   * Get the external ids for a TV show
   */
  getExternalIds(tvId: number): Promise<TVExternalIdsResponse>

  /**
   * Get the images that belong to a TV show
   */
  getImages(tvId: number, params?: { language?: LanguageCode; include_image_language?: string }): Promise<TVImagesResponse>

  /**
   * Get the keywords that have been added to a TV show
   */
  getKeywords(tvId: number): Promise<TVKeywordsResponse>

  /**
   * Get a list of recommended TV shows for a show
   */
  getRecommendations(tvId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<TVRecommendationsResponse>

  /**
   * Get the user reviews for a TV show
   */
  getReviews(tvId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<TVReviewsResponse>

  /**
   * Get a list of similar TV shows
   */
  getSimilar(tvId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<TVSimilarResponse>

  /**
   * Get a list of the translations that exist for a TV show
   */
  getTranslations(tvId: number): Promise<TVTranslationsResponse>

  /**
   * Get the videos that have been added to a TV show
   */
  getVideos(tvId: number, params?: { language?: LanguageCode }): Promise<TVVideosResponse>

  /**
   * Get a list of the watch provider (OTT/streaming) data we have available for a TV series
   */
  getWatchProviders(tvId: number): Promise<TVWatchProvidersResponse>

  /**
   * Get the content ratings for a TV show
   */
  getContentRatings(tvId: number): Promise<TVContentRatingsResponse>

  /**
   * Get a list of TV shows that are airing today
   */
  getAiringToday(params?: AiringTodayTVParams): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get a list of shows that are currently on the air
   */
  getOnTheAir(params?: OnTheAirTVParams): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get a list of the current popular TV shows on TMDB
   */
  getPopular(params?: PopularTVParams): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get a list of the top rated TV shows on TMDB
   */
  getTopRated(params?: TopRatedTVParams): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get the details of a TV season
   */
  getSeasonDetails(tvId: number, seasonNumber: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<TMDBTVSeasonDetails>

  /**
   * Get the credits for TV season
   */
  getSeasonCredits(tvId: number, seasonNumber: number, params?: { language?: LanguageCode }): Promise<TVSeasonCreditsResponse>

  /**
   * Get the external ids for a TV season
   */
  getSeasonExternalIds(tvId: number, seasonNumber: number): Promise<TVSeasonExternalIdsResponse>

  /**
   * Get the images that belong to a TV season
   */
  getSeasonImages(tvId: number, seasonNumber: number, params?: { language?: LanguageCode; include_image_language?: string }): Promise<TVSeasonImagesResponse>

  /**
   * Get the translations for a TV season
   */
  getSeasonTranslations(tvId: number, seasonNumber: number): Promise<TVSeasonTranslationsResponse>

  /**
   * Get the videos that have been added to a TV season
   */
  getSeasonVideos(tvId: number, seasonNumber: number, params?: { language?: LanguageCode }): Promise<TVSeasonVideosResponse>

  /**
   * Get the TV episode details by id
   */
  getEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<TVEpisodeDetails>

  /**
   * Get the credits (cast, crew and guest stars) for a TV episode
   */
  getEpisodeCredits(tvId: number, seasonNumber: number, episodeNumber: number, params?: { language?: LanguageCode }): Promise<TVEpisodeCreditsResponse>

  /**
   * Get the external ids for a TV episode
   */
  getEpisodeExternalIds(tvId: number, seasonNumber: number, episodeNumber: number): Promise<TVEpisodeExternalIdsResponse>

  /**
   * Get the images that belong to a TV episode
   */
  getEpisodeImages(tvId: number, seasonNumber: number, episodeNumber: number): Promise<TVEpisodeImagesResponse>

  /**
   * Get the translations for a TV episode
   */
  getEpisodeTranslations(tvId: number, seasonNumber: number, episodeNumber: number): Promise<TVEpisodeTranslationsResponse>

  /**
   * Get the videos that have been added to a TV episode
   */
  getEpisodeVideos(tvId: number, seasonNumber: number, episodeNumber: number, params?: { language?: LanguageCode }): Promise<TVEpisodeVideosResponse>

  /**
   * Get the episode group details by id
   */
  getEpisodeGroupDetails(episodeGroupId: string): Promise<TVEpisodeGroupDetails>

  /**
   * Grab the following account states for a session (requires authentication)
   */
  getAccountStates(tvId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<TVAccountStatesResponse>

  /**
   * Rate a TV show (requires authentication)
   */
  addRating(tvId: number, rating: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }>

  /**
   * Remove your rating for a TV show (requires authentication)
   */
  deleteRating(tvId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }>

  /**
   * Get the account states for a TV episode (requires authentication)
   */
  getEpisodeAccountStates(tvId: number, seasonNumber: number, episodeNumber: number, params?: { session_id?: string; guest_session_id?: string }): Promise<TVEpisodeAccountStatesResponse>

  /**
   * Rate a TV episode (requires authentication)
   */
  addEpisodeRating(tvId: number, seasonNumber: number, episodeNumber: number, rating: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }>

  /**
   * Remove your rating for a TV episode (requires authentication)
   */
  deleteEpisodeRating(tvId: number, seasonNumber: number, episodeNumber: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }>

  /**
   * Get the most newly created TV show
   */
  getLatest(params?: { language?: LanguageCode }): Promise<TMDBTVShowDetails>
}