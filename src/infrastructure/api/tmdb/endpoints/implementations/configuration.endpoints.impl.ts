/**
 * TMDB Configuration Endpoints Implementation
 * 
 * Implementation of configuration endpoints for getting API configuration
 */

import type { 
  TMDBConfigurationEndpoints,
  ApiConfigurationResponse,
  CountriesConfigurationResponse,
  JobsConfigurationResponse,
  LanguagesConfigurationResponse,
  PrimaryTranslationsResponse,
  TimezonesConfigurationResponse
} from '@/src/infrastructure/api/tmdb/endpoints/types/configuration.endpoints'

/**
 * Create configuration endpoints implementation
 */
export const createConfigurationEndpoints = (
  request: <T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, params?: Record<string, any>, data?: any) => Promise<T>
): TMDBConfigurationEndpoints => ({
  /**
   * Get the system wide configuration information
   */
  async getApiConfiguration(): Promise<ApiConfigurationResponse> {
    return request<ApiConfigurationResponse>('GET', '/configuration')
  },

  /**
   * Get the list of countries used throughout TMDB
   */
  async getCountries(): Promise<CountriesConfigurationResponse[]> {
    return request<CountriesConfigurationResponse[]>('GET', '/configuration/countries')
  },

  /**
   * Get a list of the jobs and departments we use on TMDB
   */
  async getJobs(): Promise<JobsConfigurationResponse[]> {
    return request<JobsConfigurationResponse[]>('GET', '/configuration/jobs')
  },

  /**
   * Get the list of languages supported by TMDB
   */
  async getLanguages(): Promise<LanguagesConfigurationResponse[]> {
    return request<LanguagesConfigurationResponse[]>('GET', '/configuration/languages')
  },

  /**
   * Get a list of the officially supported translations on TMDB
   */
  async getPrimaryTranslations(): Promise<PrimaryTranslationsResponse> {
    return request<PrimaryTranslationsResponse>('GET', '/configuration/primary_translations')
  },

  /**
   * Get the list of timezones used throughout TMDB
   */
  async getTimezones(): Promise<TimezonesConfigurationResponse[]> {
    return request<TimezonesConfigurationResponse[]>('GET', '/configuration/timezones')
  }
})