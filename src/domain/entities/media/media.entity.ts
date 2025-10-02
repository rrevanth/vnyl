/**
 * Core Media entity representing movies, TV series, and other content
 * Based on TMDB and Stremio API specifications
 */

export type MediaType = 'movie' | 'series' | 'tv' | 'channel' | 'other'

export type MediaStatus = 'released' | 'in_production' | 'post_production' | 'planned' | 'cancelled'

export interface ExternalIds {
  imdb?: string
  tmdb?: number
  tvdb?: number
  kinopoisk?: string
  anidb?: number
  anilist?: number
  mal?: number
}

export interface MediaImage {
  url: string
  type: 'poster' | 'backdrop' | 'logo' | 'still' | 'profile'
  width?: number
  height?: number
  language?: string
}

export interface MediaGenre {
  id: number
  name: string
}

export interface MediaCountry {
  iso_3166_1: string
  name: string
}

export interface MediaLanguage {
  iso_639_1: string
  name: string
  english_name: string
}

export interface MediaCompany {
  id: number
  name: string
  logo_path?: string
  origin_country: string
}

export interface MediaVideo {
  id: string
  key: string
  name: string
  site: string
  type: 'trailer' | 'teaser' | 'clip' | 'featurette' | 'behind_the_scenes' | 'bloopers'
  size: 360 | 480 | 720 | 1080
  official: boolean
  published_at: string
}

export interface MediaCollection {
  id: number
  name: string
  poster_path?: string
  backdrop_path?: string
  parts?: MediaEntity[]
}

export interface MediaSeason {
  id: number
  name: string
  overview: string
  poster_path?: string
  season_number: number
  episode_count: number
  air_date?: string
}

export interface MediaEpisode {
  id: number
  name: string
  overview: string
  still_path?: string
  episode_number: number
  season_number: number
  air_date?: string
  runtime?: number
  vote_average: number
  vote_count: number
}

export interface MediaRating {
  source: 'tmdb' | 'imdb' | 'rotten_tomatoes' | 'metacritic' | 'anidb' | 'mal'
  value: number
  max_value: number
  count?: number
}

export interface MediaEntity {
  // Core identification
  id: string
  external_ids: ExternalIds
  type: MediaType
  
  // Basic information
  title: string
  original_title?: string
  overview?: string
  tagline?: string
  
  // Metadata
  release_date?: string
  runtime?: number
  status?: MediaStatus
  genres: MediaGenre[]
  countries: MediaCountry[]
  languages: MediaLanguage[]
  original_language?: string
  
  // Media assets
  poster_path?: string
  backdrop_path?: string
  images: MediaImage[]
  videos: MediaVideo[]
  
  // Ratings and popularity
  ratings: MediaRating[]
  popularity: number
  vote_average: number
  vote_count: number
  
  // Production information
  budget?: number
  revenue?: number
  production_companies: MediaCompany[]
  
  // TV Series specific
  seasons?: MediaSeason[]
  number_of_seasons?: number
  number_of_episodes?: number
  episode_run_time?: number[]
  first_air_date?: string
  last_air_date?: string
  in_production?: boolean
  
  // Collection information
  belongs_to_collection?: MediaCollection
  
  // Additional flags
  adult: boolean
  homepage?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Lightweight media reference for lists and relationships
 */
export interface MediaReference {
  id: string
  type: MediaType
  title: string
  poster_path?: string
  release_date?: string
  vote_average: number
}

/**
 * Search result with additional metadata
 */
export interface MediaSearchResult extends MediaReference {
  overview?: string
  backdrop_path?: string
  popularity: number
  external_ids: ExternalIds
}

/**
 * Media with streaming information
 */
export interface MediaWithStreams extends MediaEntity {
  streams?: {
    url: string
    quality: string
    title: string
    addon: string
  }[]
}