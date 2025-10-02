/**
 * Person entity representing actors, directors, writers, and other crew members
 * Based on TMDB People API specifications
 */

export type PersonGender = 'not_specified' | 'female' | 'male' | 'non_binary'

export type PersonKnownForDepartment = 
  | 'acting' 
  | 'directing' 
  | 'writing' 
  | 'production' 
  | 'camera' 
  | 'editing' 
  | 'sound' 
  | 'art' 
  | 'costume_makeup' 
  | 'visual_effects' 
  | 'crew'

export interface PersonExternalIds {
  imdb_id?: string
  facebook_id?: string
  freebase_mid?: string
  freebase_id?: string
  tvrage_id?: number
  twitter_id?: string
  instagram_id?: string
  tiktok_id?: string
  youtube_id?: string
  homepage?: string
}

export interface PersonImage {
  file_path: string
  aspect_ratio: number
  height: number
  width: number
  vote_average: number
  vote_count: number
}

export interface PersonCredit {
  id: string
  media_id: string
  media_type: 'movie' | 'tv'
  title: string
  original_title: string
  character?: string
  job?: string
  department?: string
  credit_id: string
  order?: number
  poster_path?: string
  release_date?: string
  vote_average: number
  popularity: number
}

export interface PersonCastCredit extends PersonCredit {
  character: string
  order: number
}

export interface PersonCrewCredit extends PersonCredit {
  job: string
  department: string
}

export interface PersonFilmography {
  cast: PersonCastCredit[]
  crew: PersonCrewCredit[]
}

export interface PersonTranslation {
  iso_3166_1: string
  iso_639_1: string
  name: string
  data: {
    biography: string
  }
}

export interface PersonEntity {
  // Core identification
  id: string
  external_ids: PersonExternalIds
  
  // Basic information
  name: string
  also_known_as: string[]
  biography?: string
  
  // Personal details
  birthday?: string
  deathday?: string
  place_of_birth?: string
  gender: PersonGender
  
  // Career information
  known_for_department: PersonKnownForDepartment
  adult: boolean
  
  // Media assets
  profile_path?: string
  images: PersonImage[]
  
  // Popularity and ratings
  popularity: number
  
  // Homepage and social
  homepage?: string
  
  // Filmography (loaded separately)
  filmography?: PersonFilmography
  
  // Localization
  translations?: PersonTranslation[]
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Lightweight person reference for credits and relationships
 */
export interface PersonReference {
  id: string
  name: string
  profile_path?: string
  known_for_department: PersonKnownForDepartment
  popularity: number
}

/**
 * Person search result with known works
 */
export interface PersonSearchResult extends PersonReference {
  gender: PersonGender
  adult: boolean
  known_for: {
    id: string
    title: string
    media_type: 'movie' | 'tv'
    poster_path?: string
    release_date?: string
  }[]
}

/**
 * Combined cast and crew member for media credits
 */
export interface PersonCreditSummary {
  person: PersonReference
  roles: {
    type: 'cast' | 'crew'
    character?: string
    job?: string
    department?: string
    order?: number
  }[]
}