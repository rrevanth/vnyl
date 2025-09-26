/**
 * TMDB API Response Types
 * 
 * Type definitions for TMDB API responses that will be mapped to our
 * enhanced catalog item structure with progressive enhancement support.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0
 */

// ============================================================================
// CORE TMDB RESPONSE TYPES
// ============================================================================

/**
 * Base TMDB media object with common fields
 */
export interface TMDBBaseMedia {
  id: number
  name?: string // TV shows
  title?: string // Movies
  original_name?: string // TV shows
  original_title?: string // Movies
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genre_ids?: number[]
  popularity?: number
  vote_average?: number
  vote_count?: number
  adult?: boolean
  original_language?: string
  origin_country?: string[]
  first_air_date?: string // TV shows
  release_date?: string // Movies
}

/**
 * TMDB Movie response
 */
export interface TMDBMovie extends TMDBBaseMedia {
  title: string
  original_title: string
  release_date?: string
  video?: boolean
}

/**
 * TMDB TV Show response
 */
export interface TMDBTVShow extends TMDBBaseMedia {
  name: string
  original_name: string
  first_air_date?: string
  origin_country: string[]
}

/**
 * TMDB Genre
 */
export interface TMDBGenre {
  id: number
  name: string
}

/**
 * TMDB Production Company
 */
export interface TMDBProductionCompany {
  id: number
  logo_path?: string | null
  name: string
  origin_country: string
}

/**
 * TMDB Production Country
 */
export interface TMDBProductionCountry {
  iso_3166_1: string
  name: string
}

/**
 * TMDB Spoken Language
 */
export interface TMDBSpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

/**
 * TMDB Network (for TV shows)
 */
export interface TMDBNetwork {
  id: number
  logo_path?: string | null
  name: string
  origin_country: string
}

/**
 * TMDB Collection
 */
export interface TMDBCollection {
  id: number
  name: string
  overview: string
  poster_path?: string | null
  backdrop_path?: string | null
  parts: {
    id: number
    title: string
    release_date?: string
    poster_path?: string | null
  }[]
}

// ============================================================================
// DETAILED MOVIE RESPONSE
// ============================================================================

/**
 * TMDB Movie Details response
 */
export interface TMDBMovieDetails extends TMDBMovie {
  belongs_to_collection?: TMDBCollection | null
  budget?: number
  genres: TMDBGenre[]
  homepage?: string | null
  imdb_id?: string | null
  production_companies: TMDBProductionCompany[]
  production_countries: TMDBProductionCountry[]
  revenue?: number
  runtime?: number | null
  spoken_languages: TMDBSpokenLanguage[]
  status: string
  tagline?: string | null
}

// ============================================================================
// DETAILED TV SHOW RESPONSE
// ============================================================================

/**
 * TMDB Season
 */
export interface TMDBSeason {
  air_date?: string | null
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path?: string | null
  season_number: number
}

/**
 * TMDB Episode
 */
export interface TMDBEpisode {
  id: number
  name: string
  overview: string
  vote_average: number
  vote_count: number
  air_date?: string | null
  episode_number: number
  production_code?: string | null
  runtime?: number | null
  season_number: number
  show_id: number
  still_path?: string | null
}

/**
 * TMDB Created By (for TV shows)
 */
export interface TMDBCreatedBy {
  id: number
  credit_id: string
  name: string
  gender?: number | null
  profile_path?: string | null
}

/**
 * TMDB Last Episode To Air
 */
export interface TMDBLastEpisode {
  id: number
  name: string
  overview: string
  vote_average: number
  vote_count: number
  air_date?: string | null
  episode_number: number
  production_code?: string | null
  runtime?: number | null
  season_number: number
  show_id: number
  still_path?: string | null
}

/**
 * TMDB TV Show Details response
 */
export interface TMDBTVShowDetails extends TMDBTVShow {
  created_by: TMDBCreatedBy[]
  episode_run_time: number[]
  genres: TMDBGenre[]
  homepage?: string | null
  in_production: boolean
  languages: string[]
  last_air_date?: string | null
  last_episode_to_air?: TMDBLastEpisode | null
  next_episode_to_air?: TMDBLastEpisode | null
  networks: TMDBNetwork[]
  number_of_episodes: number
  number_of_seasons: number
  production_companies: TMDBProductionCompany[]
  production_countries: TMDBProductionCountry[]
  seasons: TMDBSeason[]
  spoken_languages: TMDBSpokenLanguage[]
  status: string
  tagline?: string | null
  type: string
}

// ============================================================================
// CREDITS AND CAST
// ============================================================================

/**
 * TMDB Cast Member
 */
export interface TMDBCastMember {
  adult?: boolean
  gender?: number | null
  id: number
  known_for_department?: string
  name: string
  original_name: string
  popularity?: number
  profile_path?: string | null
  cast_id?: number
  character?: string
  credit_id: string
  order?: number
}

/**
 * TMDB Crew Member
 */
export interface TMDBCrewMember {
  adult?: boolean
  gender?: number | null
  id: number
  known_for_department?: string
  name: string
  original_name: string
  popularity?: number
  profile_path?: string | null
  credit_id: string
  department: string
  job: string
}

/**
 * TMDB Credits response
 */
export interface TMDBCredits {
  id: number
  cast: TMDBCastMember[]
  crew: TMDBCrewMember[]
}

// ============================================================================
// IMAGES
// ============================================================================

/**
 * TMDB Image
 */
export interface TMDBImage {
  aspect_ratio: number
  file_path: string
  height: number
  iso_639_1?: string | null
  vote_average: number
  vote_count: number
  width: number
}

/**
 * TMDB Images response
 */
export interface TMDBImages {
  id: number
  backdrops: TMDBImage[]
  logos: TMDBImage[]
  posters: TMDBImage[]
}

// ============================================================================
// VIDEOS
// ============================================================================

/**
 * TMDB Video
 */
export interface TMDBVideo {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string
  name: string
  official: boolean
  published_at?: string
  site: string
  size: number
  type: string
}

/**
 * TMDB Videos response
 */
export interface TMDBVideos {
  id: number
  results: TMDBVideo[]
}

// ============================================================================
// EXTERNAL IDS
// ============================================================================

/**
 * TMDB External IDs response
 */
export interface TMDBExternalIds {
  id: number
  imdb_id?: string | null
  freebase_mid?: string | null
  freebase_id?: string | null
  tvdb_id?: number | null
  tvrage_id?: number | null
  wikidata_id?: string | null
  facebook_id?: string | null
  instagram_id?: string | null
  twitter_id?: string | null
}

// ============================================================================
// SEARCH AND DISCOVERY
// ============================================================================

/**
 * TMDB Search response wrapper
 */
export interface TMDBSearchResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

/**
 * TMDB Multi-search result
 */
export interface TMDBMultiSearchResult extends TMDBBaseMedia {
  media_type: 'movie' | 'tv' | 'person'
  known_for?: TMDBBaseMedia[] // For person results
}

/**
 * TMDB Popular/Trending response
 */
export interface TMDBDiscoverResponse<T> extends TMDBSearchResponse<T> {
  dates?: {
    maximum: string
    minimum: string
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * TMDB Configuration response
 */
export interface TMDBConfiguration {
  images: {
    base_url: string
    secure_base_url: string
    backdrop_sizes: string[]
    logo_sizes: string[]
    poster_sizes: string[]
    profile_sizes: string[]
    still_sizes: string[]
  }
  change_keys: string[]
}

/**
 * TMDB Genre List response
 */
export interface TMDBGenreResponse {
  genres: TMDBGenre[]
}

// ============================================================================
// EXTENDED RESPONSE TYPES WITH APPEND_TO_RESPONSE
// ============================================================================

/**
 * TMDB Extended Movie Details with append_to_response data
 */
export interface TMDBExtendedMovieDetails extends TMDBMovieDetails {
  credits?: TMDBCredits
  images?: TMDBImages
  videos?: TMDBVideos
  external_ids?: TMDBExternalIds
  recommendations?: TMDBSearchResponse<TMDBMovie>
  similar?: TMDBSearchResponse<TMDBMovie>
  keywords?: { id: number; keywords: { id: number; name: string }[] }
  reviews?: TMDBSearchResponse<TMDBReview>
  watch_providers?: TMDBWatchProviders
  release_dates?: TMDBReleaseDates
}

/**
 * TMDB Extended TV Show Details with append_to_response data
 */
export interface TMDBExtendedTVShowDetails extends TMDBTVShowDetails {
  credits?: TMDBCredits
  images?: TMDBImages
  videos?: TMDBVideos
  external_ids?: TMDBExternalIds
  recommendations?: TMDBSearchResponse<TMDBTVShow>
  similar?: TMDBSearchResponse<TMDBTVShow>
  keywords?: { id: number; results: { id: number; name: string }[] }
  reviews?: TMDBSearchResponse<TMDBReview>
  watch_providers?: TMDBWatchProviders
  content_ratings?: TMDBContentRatings
}

/**
 * TMDB Season Details with episodes
 */
export interface TMDBSeasonDetails extends TMDBSeason {
  episodes: TMDBEpisode[]
  credits?: TMDBCredits
  images?: TMDBImages
  videos?: TMDBVideos
  external_ids?: TMDBExternalIds
}

/**
 * TMDB Episode Details
 */
export interface TMDBEpisodeDetails extends TMDBEpisode {
  credits?: TMDBCredits
  images?: TMDBImages
  videos?: TMDBVideos
  external_ids?: TMDBExternalIds
}

// ============================================================================
// ADDITIONAL CONTENT TYPES FOR EXTENDED RESPONSES
// ============================================================================

/**
 * TMDB Review
 */
export interface TMDBReview {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path?: string | null
    rating?: number | null
  }
  content: string
  created_at: string
  updated_at: string
  url: string
}

/**
 * TMDB Watch Providers
 */
export interface TMDBWatchProviders {
  id: number
  results: Record<string, {
    link?: string
    flatrate?: TMDBProvider[]
    rent?: TMDBProvider[]
    buy?: TMDBProvider[]
    ads?: TMDBProvider[]
  }>
}

/**
 * TMDB Provider
 */
export interface TMDBProvider {
  display_priority: number
  logo_path: string
  provider_id: number
  provider_name: string
}

/**
 * TMDB Release Dates (for movies)
 */
export interface TMDBReleaseDates {
  id: number
  results: {
    iso_3166_1: string
    release_dates: {
      certification: string
      descriptors: string[]
      iso_639_1: string
      note: string
      release_date: string
      type: number
    }[]
  }[]
}

/**
 * TMDB Content Ratings (for TV shows)
 */
export interface TMDBContentRatings {
  id: number
  results: {
    descriptors: string[]
    iso_3166_1: string
    rating: string
  }[]
}

// ============================================================================
// ADVANCED FILTERING AND DISCOVERY
// ============================================================================

/**
 * TMDB Advanced Filters for Discovery
 */
export interface TMDBAdvancedFilters extends Record<string, unknown> {
  // Common filters
  page?: number
  language?: string
  region?: string
  sort_by?: string
  include_adult?: boolean
  include_video?: boolean
  
  // Year filters
  primary_release_year?: number
  first_air_date_year?: number
  primary_release_date_gte?: string
  primary_release_date_lte?: string
  release_date_gte?: string
  release_date_lte?: string
  first_air_date_gte?: string
  first_air_date_lte?: string
  air_date_gte?: string
  air_date_lte?: string
  
  // Rating filters
  vote_average_gte?: number
  vote_average_lte?: number
  vote_count_gte?: number
  vote_count_lte?: number
  
  // Content filters
  with_genres?: string
  without_genres?: string
  with_companies?: string
  with_keywords?: string
  without_keywords?: string
  with_people?: string
  with_cast?: string
  with_crew?: string
  
  // Runtime filters (movies)
  with_runtime_gte?: number
  with_runtime_lte?: number
  
  // TV-specific filters
  with_networks?: string
  with_status?: number
  with_type?: number
  screened_theatrically?: boolean
  timezone?: string
}

/**
 * TMDB Discover Options (simplified interface)
 */
export interface TMDBDiscoverOptions extends Record<string, unknown> {
  page?: number
  language?: string
  region?: string
  sortBy?: 'popularity.desc' | 'popularity.asc' | 'vote_average.desc' | 'vote_average.asc' | 
          'primary_release_date.desc' | 'primary_release_date.asc' | 'first_air_date.desc' | 'first_air_date.asc'
  year?: number
  genres?: number[]
  minRating?: number
  maxRating?: number
  minVotes?: number
  includeAdult?: boolean
}

// ============================================================================
// UNION TYPES FOR PROCESSING
// ============================================================================

/**
 * Union type for any TMDB media result
 */
export type TMDBMediaResult = TMDBMovie | TMDBTVShow

/**
 * Union type for detailed TMDB media
 */
export type TMDBDetailedMedia = TMDBMovieDetails | TMDBTVShowDetails

/**
 * Union type for extended TMDB media
 */
export type TMDBExtendedMedia = TMDBExtendedMovieDetails | TMDBExtendedTVShowDetails

// ============================================================================
// TYPE ALIASES FOR TMDB CLIENT
// ============================================================================

/**
 * TMDB catalog response (for popular, trending, etc.)
 */
export type TMDBCatalogResponse = TMDBSearchResponse<TMDBMovie | TMDBTVShow>

/**
 * Type guard for TMDB Movie
 */
export function isTMDBMovie(media: TMDBMediaResult): media is TMDBMovie {
  return 'title' in media && 'release_date' in media
}

/**
 * Type guard for TMDB TV Show
 */
export function isTMDBTVShow(media: TMDBMediaResult): media is TMDBTVShow {
  return 'name' in media && 'first_air_date' in media
}

/**
 * Type guard for TMDB Movie Details
 */
export function isTMDBMovieDetails(media: TMDBDetailedMedia): media is TMDBMovieDetails {
  return 'title' in media && 'budget' in media
}

/**
 * Type guard for TMDB TV Show Details
 */
export function isTMDBTVShowDetails(media: TMDBDetailedMedia): media is TMDBTVShowDetails {
  return 'name' in media && 'number_of_episodes' in media
}

/**
 * Type guard for TMDB Extended Movie Details
 */
export function isTMDBExtendedMovieDetails(media: TMDBExtendedMedia): media is TMDBExtendedMovieDetails {
  return 'title' in media && 'budget' in media
}

/**
 * Type guard for TMDB Extended TV Show Details
 */
export function isTMDBExtendedTVShowDetails(media: TMDBExtendedMedia): media is TMDBExtendedTVShowDetails {
  return 'name' in media && 'number_of_episodes' in media
}

/**
 * Type guard for TMDB Multi-search Movie Result
 */
export function isTMDBMultiSearchMovie(result: TMDBMultiSearchResult): result is TMDBMultiSearchResult & TMDBMovie {
  return result.media_type === 'movie' && 'title' in result
}

/**
 * Type guard for TMDB Multi-search TV Result
 */
export function isTMDBMultiSearchTV(result: TMDBMultiSearchResult): result is TMDBMultiSearchResult & TMDBTVShow {
  return result.media_type === 'tv' && 'name' in result
}