import type { ApiConfig, IConfigClient } from './api.service.interface'

/**
 * TMDB-specific configuration service interface
 * Manages TMDB API configuration with user preferences and environment fallbacks
 */
export interface ITMDBConfigService extends IConfigClient {
  /**
   * Get the effective TMDB API configuration
   * Merges user preferences, environment variables, and defaults
   */
  getEffectiveTMDBConfig(): ApiConfig

  /**
   * Check if valid TMDB credentials are available
   */
  hasValidCredentials(): boolean

  /**
   * Get the authentication method being used
   */
  getAuthenticationMethod(): 'bearer' | 'apikey' | 'none'

  /**
   * Get the effective language setting for TMDB API
   */
  getEffectiveLanguage(): string

  /**
   * Check if adult content should be included
   */
  shouldIncludeAdult(): boolean

  /**
   * Update API configuration and refresh client settings
   */
  refreshConfiguration(): void
}