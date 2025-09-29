/**
 * TMDB Settings Entity
 * Simple configuration for TMDB provider functionality
 */

export interface TMDBSettings {
  /** TMDB API Key for authentication (TMDB v3 uses query parameter authentication only) */
  apiKey?: string
  /** 
   * Bearer token for enhanced authentication
   * @deprecated TMDB v3 API does not support Bearer token authentication
   * This field is kept for backward compatibility but is not used
   */
  bearerToken?: string
  /** Language preference (ISO 639-1 format, e.g., 'en', 'es', 'fr') */
  language: string
  /** Country/Region preference (ISO 3166-1 format, e.g., 'US', 'GB', 'CA') */
  country: string
  /** Region preference for content filtering (ISO 3166-1 format) */
  region: string
  /** Include adult content in search results and recommendations */
  includeAdult: boolean
  /** Image quality preference for posters, backdrops, and other media */
  imageQuality: 'low' | 'medium' | 'high' | 'original'
}

export const DEFAULT_TMDB_SETTINGS: TMDBSettings = {
  language: 'en',
  country: 'US',
  region: 'US',
  includeAdult: false,
  imageQuality: 'high'
}

export const TMDB_LANGUAGE_OPTIONS = [
  { name: 'English', code: 'en' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Chinese', code: 'zh' }
]

export const TMDB_COUNTRY_OPTIONS = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' }
]

export const TMDB_IMAGE_QUALITY_OPTIONS = [
  { name: 'Low Quality', value: 'low' },
  { name: 'Medium Quality', value: 'medium' },
  { name: 'High Quality', value: 'high' },
  { name: 'Original Quality', value: 'original' }
]