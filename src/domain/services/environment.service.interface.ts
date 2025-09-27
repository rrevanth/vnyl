/**
 * Environment configuration service interface
 * Centralizes access to environment variables with type safety
 */
export interface IEnvironmentService {
  /**
   * Get API base URL from environment
   */
  getApiBaseUrl(): string | undefined


  /**
   * Get environment mode (development, production, etc.)
   */
  getEnvironment(): string

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean

  /**
   * Check if running in production mode
   */
  isProduction(): boolean

  /**
   * Get any environment variable by key with optional fallback
   */
  get(key: string, fallback?: string): string | undefined
}