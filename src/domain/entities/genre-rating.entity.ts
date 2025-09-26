/**
 * Genre entity with optional ID for provider support
 */
export interface Genre {
  id?: number // Provider-specific genre ID (e.g., TMDB genre ID)
  name: string
  slug?: string
  description?: string
}

/**
 * Rating entity with comprehensive source information
 */
export interface Rating {
  source: string // 'tmdb', 'imdb', 'trakt', 'letterboxd', etc.
  value: number
  maxValue: number
  count?: number
  url?: string
  lastUpdated?: Date
}