/**
 * TMDB Configuration Endpoints
 * 
 * Endpoints for getting API configuration and system information
 */

/**
 * API configuration response
 */
export interface ApiConfigurationResponse {
  /** Image configuration */
  images: {
    /** Base URL for images */
    base_url: string
    /** Secure base URL for images */
    secure_base_url: string
    /** Available backdrop sizes */
    backdrop_sizes: string[]
    /** Available logo sizes */
    logo_sizes: string[]
    /** Available poster sizes */
    poster_sizes: string[]
    /** Available profile sizes */
    profile_sizes: string[]
    /** Available still sizes */
    still_sizes: string[]
  }
  /** Array of change keys */
  change_keys: string[]
}

/**
 * Countries configuration response
 */
export interface CountriesConfigurationResponse {
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** English country name */
  english_name: string
  /** Native country name */
  native_name: string
}

/**
 * Jobs configuration response
 */
export interface JobsConfigurationResponse {
  /** Department name */
  department: string
  /** Available jobs in this department */
  jobs: string[]
}

/**
 * Languages configuration response
 */
export interface LanguagesConfigurationResponse {
  /** ISO 639-1 language code */
  iso_639_1: string
  /** English language name */
  english_name: string
  /** Native language name */
  name: string
}

/**
 * Primary translations response
 */
export type PrimaryTranslationsResponse = string[]

/**
 * Timezones configuration response
 */
export interface TimezonesConfigurationResponse {
  /** ISO 3166-1 country code */
  iso_3166_1: string
  /** Available timezones for the country */
  zones: string[]
}

/**
 * Configuration endpoints interface
 */
export interface TMDBConfigurationEndpoints {
  /**
   * Get the system wide configuration information
   * @returns API configuration including image settings
   */
  getApiConfiguration(): Promise<ApiConfigurationResponse>

  /**
   * Get the list of countries used throughout TMDB
   * @returns Array of country configurations
   */
  getCountries(): Promise<CountriesConfigurationResponse[]>

  /**
   * Get a list of the jobs and departments we use on TMDB
   * @returns Array of job configurations by department
   */
  getJobs(): Promise<JobsConfigurationResponse[]>

  /**
   * Get the list of languages supported by TMDB
   * @returns Array of language configurations
   */
  getLanguages(): Promise<LanguagesConfigurationResponse[]>

  /**
   * Get a list of the officially supported translations on TMDB
   * @returns Array of supported translation language codes
   */
  getPrimaryTranslations(): Promise<PrimaryTranslationsResponse>

  /**
   * Get the list of timezones used throughout TMDB
   * @returns Array of timezone configurations by country
   */
  getTimezones(): Promise<TimezonesConfigurationResponse[]>
}