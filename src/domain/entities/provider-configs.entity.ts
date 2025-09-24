/**
 * TMDB (The Movie Database) API configuration
 */
export interface TMDBConfig {
  /** TMDB API Key (v3) */
  apiKey: string
  /** TMDB Bearer Token (Read Access Token v4) */
  bearerToken: string
  /** Content language in ISO 639-1 format with region (e.g., 'en-US', 'es-ES') */
  language: string
  /** Include adult content in search results and recommendations */
  includeAdult: boolean
  /** ISO 3166-1 country code for regional content filtering */
  region: string
}

/**
 * Default TMDB configuration with safe defaults
 */
export const DEFAULT_TMDB_CONFIG: TMDBConfig = {
  apiKey: '',
  bearerToken: '',
  language: 'en-US',
  includeAdult: false,
  region: 'US'
}

/**
 * Supported TMDB languages with their display names
 */
export const TMDB_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (South Korea)' },
  { code: 'zh-CN', name: 'Chinese (China)' }
] as const

/**
 * Supported TMDB regions with their display names
 */
export const TMDB_REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'BR', name: 'Brazil' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' }
] as const

export type TMDBLanguageCode = typeof TMDB_LANGUAGES[number]['code']
export type TMDBRegionCode = typeof TMDB_REGIONS[number]['code']