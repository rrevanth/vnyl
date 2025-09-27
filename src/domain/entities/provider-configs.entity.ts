/**
 * TMDB Provider Settings
 * Configuration for The Movie Database API integration
 */
export interface TMDBSettings {
  /** TMDB API Key for authentication */
  apiKey?: string
  /** Bearer token for enhanced authentication (preferred) */
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

/**
 * Default TMDB settings with sensible defaults
 */
export const DEFAULT_TMDB_SETTINGS: TMDBSettings = {
  language: 'en',
  country: 'US',
  region: 'US',
  includeAdult: false,
  imageQuality: 'high'
}

/**
 * Available language options for TMDB
 * Common languages supported by TMDB API
 */
export const TMDB_LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ru', name: 'Русский' }
] as const

/**
 * Available country/region options for TMDB
 * Common regions supported by TMDB API
 */
export const TMDB_COUNTRY_OPTIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'RU', name: 'Russia' }
] as const

/**
 * Image quality options for TMDB images
 */
export const TMDB_IMAGE_QUALITY_OPTIONS = [
  { value: 'low', name: 'Low (Fastest)' },
  { value: 'medium', name: 'Medium (Balanced)' },
  { value: 'high', name: 'High (Recommended)' },
  { value: 'original', name: 'Original (Largest)' }
] as const