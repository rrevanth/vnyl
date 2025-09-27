/**
 * TMDB Movie Endpoints
 * 
 * All movie-related endpoints and their response types
 */

import type { 
  PaginatedResponse, 
  PaginationParams, 
  DateRangeParams,
  Genre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
  Video,
  Image,
  ExternalIds,
  Translation,
  AlternativeTitle,
  ReleaseDate,
  CastMember,
  CrewMember,
  Keyword,
  RegionWatchProviders,
  DateString,
  CountryCode,
  LanguageCode
} from './base.types'

/**
 * Movie object (detailed)
 */
export interface MovieDetails {
  /** Is adult content */
  adult: boolean
  /** Backdrop image path */
  backdrop_path: string | null
  /** Associated collection */
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string | null
    backdrop_path: string | null
  } | null
  /** Budget in USD */
  budget: number
  /** Array of genres */
  genres: Genre[]
  /** Homepage URL */
  homepage: string | null
  /** Movie ID */
  id: number
  /** IMDb ID */
  imdb_id: string | null
  /** Original language */
  original_language: string
  /** Original title */
  original_title: string
  /** Plot overview */
  overview: string | null
  /** Popularity score */
  popularity: number
  /** Poster image path */
  poster_path: string | null
  /** Production companies */
  production_companies: ProductionCompany[]
  /** Production countries */
  production_countries: ProductionCountry[]
  /** Release date */
  release_date: string
  /** Revenue in USD */
  revenue: number
  /** Runtime in minutes */
  runtime: number | null
  /** Spoken languages */
  spoken_languages: SpokenLanguage[]
  /** Status */
  status: 'Rumored' | 'Planned' | 'In Production' | 'Post Production' | 'Released' | 'Canceled'
  /** Tagline */
  tagline: string | null
  /** Movie title */
  title: string
  /** Is video available */
  video: boolean
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
}

/**
 * Movie object (summary for lists)
 */
export interface MovieSummary {
  /** Is adult content */
  adult: boolean
  /** Backdrop image path */
  backdrop_path: string | null
  /** Array of genre IDs */
  genre_ids: number[]
  /** Movie ID */
  id: number
  /** Original language */
  original_language: string
  /** Original title */
  original_title: string
  /** Plot overview */
  overview: string
  /** Popularity score */
  popularity: number
  /** Poster image path */
  poster_path: string | null
  /** Release date */
  release_date: string
  /** Movie title */
  title: string
  /** Is video available */
  video: boolean
  /** Vote average */
  vote_average: number
  /** Vote count */
  vote_count: number
}

/**
 * Movie credits response
 */
export interface MovieCreditsResponse {
  /** Movie ID */
  id: number
  /** Cast members */
  cast: CastMember[]
  /** Crew members */
  crew: CrewMember[]
}

/**
 * Movie images response
 */
export interface MovieImagesResponse {
  /** Movie ID */
  id: number
  /** Backdrop images */
  backdrops: Image[]
  /** Logo images */
  logos: Image[]
  /** Poster images */
  posters: Image[]
}

/**
 * Movie videos response
 */
export interface MovieVideosResponse {
  /** Movie ID */
  id: number
  /** Array of videos */
  results: Video[]
}

/**
 * Movie external IDs response
 */
export interface MovieExternalIdsResponse extends ExternalIds {
  /** Movie ID */
  id: number
}

/**
 * Movie translations response
 */
export interface MovieTranslationsResponse {
  /** Movie ID */
  id: number
  /** Array of translations */
  translations: Translation[]
}

/**
 * Movie alternative titles response
 */
export interface MovieAlternativeTitlesResponse {
  /** Movie ID */
  id: number
  /** Array of alternative titles */
  titles: AlternativeTitle[]
}

/**
 * Movie release dates response
 */
export interface MovieReleaseDatesResponse {
  /** Movie ID */
  id: number
  /** Release dates by country */
  results: {
    /** ISO 3166-1 country code */
    iso_3166_1: string
    /** Release dates */
    release_dates: ReleaseDate[]
  }[]
}

/**
 * Movie keywords response
 */
export interface MovieKeywordsResponse {
  /** Movie ID */
  id: number
  /** Array of keywords */
  keywords: Keyword[]
}

/**
 * Movie watch providers response
 */
export interface MovieWatchProvidersResponse {
  /** Movie ID */
  id: number
  /** Watch providers by region */
  results: Record<string, RegionWatchProviders>
}

/**
 * Movie recommendations response
 */
export type MovieRecommendationsResponse = PaginatedResponse<MovieSummary>

/**
 * Movie similar response
 */
export type MovieSimilarResponse = PaginatedResponse<MovieSummary>

/**
 * Movie reviews response
 */
export interface MovieReviewsResponse extends PaginatedResponse<{
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
}> {}

/**
 * Movie lists response  
 */
export interface MovieListsResponse extends PaginatedResponse<{
  /** List ID */
  id: number
  /** List name */
  name: string
  /** List description */
  description: string
  /** Favorite count */
  favorite_count: number
  /** Item count */
  item_count: number
  /** ISO 639-1 language code */
  iso_639_1: string
  /** List type */
  list_type: string
  /** Poster path */
  poster_path: string | null
}> {}

/**
 * Movie account states response (requires authentication)
 */
export interface MovieAccountStatesResponse {
  /** Movie ID */
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
 * Popular movies parameters
 */
export interface PopularMoviesParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Top rated movies parameters
 */
export interface TopRatedMoviesParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Upcoming movies parameters
 */
export interface UpcomingMoviesParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Now playing movies parameters
 */
export interface NowPlayingMoviesParams extends PaginationParams {
  /** ISO 639-1 language code */
  language?: LanguageCode
  /** ISO 3166-1 country code */
  region?: CountryCode
}

/**
 * Movie endpoints interface
 */
export interface TMDBMovieEndpoints {
  /**
   * Get the primary information about a movie
   */
  getDetails(movieId: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<MovieDetails>

  /**
   * Get the alternative titles for a movie
   */
  getAlternativeTitles(movieId: number, params?: { country?: CountryCode }): Promise<MovieAlternativeTitlesResponse>

  /**
   * Get the cast and crew for a movie
   */
  getCredits(movieId: number, params?: { language?: LanguageCode }): Promise<MovieCreditsResponse>

  /**
   * Get the external ids for a movie
   */
  getExternalIds(movieId: number): Promise<MovieExternalIdsResponse>

  /**
   * Get the images that belong to a movie
   */
  getImages(movieId: number, params?: { language?: LanguageCode; include_image_language?: string }): Promise<MovieImagesResponse>

  /**
   * Get the keywords that have been added to a movie
   */
  getKeywords(movieId: number): Promise<MovieKeywordsResponse>

  /**
   * Get a list of lists that this movie belongs to
   */
  getLists(movieId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<MovieListsResponse>

  /**
   * Get a list of recommended movies for a movie
   */
  getRecommendations(movieId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<MovieRecommendationsResponse>

  /**
   * Get the release date along with the certification for a movie
   */
  getReleaseDates(movieId: number): Promise<MovieReleaseDatesResponse>

  /**
   * Get the user reviews for a movie
   */
  getReviews(movieId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<MovieReviewsResponse>

  /**
   * Get a list of similar movies
   */
  getSimilar(movieId: number, params?: PaginationParams & { language?: LanguageCode }): Promise<MovieSimilarResponse>

  /**
   * Get a list of translations that have been created for a movie
   */
  getTranslations(movieId: number): Promise<MovieTranslationsResponse>

  /**
   * Get the videos that have been added to a movie
   */
  getVideos(movieId: number, params?: { language?: LanguageCode }): Promise<MovieVideosResponse>

  /**
   * Get a list of the watch provider (OTT/streaming) data we have available for a movie
   */
  getWatchProviders(movieId: number): Promise<MovieWatchProvidersResponse>

  /**
   * Get the most popular movies on TMDB
   */
  getPopular(params?: PopularMoviesParams): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get the top rated movies on TMDB
   */
  getTopRated(params?: TopRatedMoviesParams): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get a list of upcoming movies in theatres
   */
  getUpcoming(params?: UpcomingMoviesParams): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get a list of movies in theatres
   */
  getNowPlaying(params?: NowPlayingMoviesParams): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Grab the following account states for a session (requires authentication)
   */
  getAccountStates(movieId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<MovieAccountStatesResponse>

  /**
   * Rate a movie (requires authentication)
   */
  addRating(movieId: number, rating: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }>

  /**
   * Remove your rating for a movie (requires authentication)
   */
  deleteRating(movieId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }>

  /**
   * Get the latest movie id
   */
  getLatest(params?: { language?: LanguageCode }): Promise<MovieDetails>
}