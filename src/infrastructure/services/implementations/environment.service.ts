import type { IEnvironmentService, ILoggingService } from '@/src/domain/services'
import { EnvironmentError } from '@/src/domain/errors'

/**
 * Environment configuration service implementation
 * Provides centralized, type-safe access to environment variables
 */
export class EnvironmentService implements IEnvironmentService {
  constructor(private readonly logger: ILoggingService) {
    this.logger.debug('Environment service initialized', undefined, {
      environment: this.getEnvironment()
    })
  }


  getApiBaseUrl(): string | undefined {
    return this.get('EXPO_PUBLIC_API_BASE_URL')
  }

  getTmdbApiKey(): string | undefined {
    const apiKey = this.get('EXPO_PUBLIC_TMDB_API_KEY')
    this.logger.debug('Environment service: TMDB API key lookup', undefined, {
      hasApiKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    })
    return apiKey
  }

  getTmdbBaseUrl(): string {
    return this.get('EXPO_PUBLIC_TMDB_BASE_URL', 'https://api.themoviedb.org/3')!
  }

  getEnvironment(): string {
    return this.get('NODE_ENV', 'development')!
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === 'development'
  }

  isProduction(): boolean {
    return this.getEnvironment() === 'production'
  }

  private readonly environmentVariables: Record<string, string | undefined> = {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_TMDB_API_KEY: process.env.EXPO_PUBLIC_TMDB_API_KEY,
    EXPO_PUBLIC_TMDB_BASE_URL: process.env.EXPO_PUBLIC_TMDB_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
  }

  get(key: string, fallback?: string): string | undefined {
    try {
      const value = this.environmentVariables[key]

      if (value !== undefined) {
        return value
      }

      if (!(key in this.environmentVariables)) {
        this.logger.warn(`Unknown environment variable key: ${key}`, undefined, {
          key,
          knownKeys: Object.keys(this.environmentVariables)
        })
      }

      if (fallback !== undefined) {
        this.logger.debug(`Environment variable ${key} not found, using fallback`, undefined, {
          key,
          hasFallback: true
        })
        return fallback
      }

      this.logger.warn(`Environment variable ${key} not found and no fallback provided`, undefined, {
        key
      })
      return undefined
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new EnvironmentError(
        `Failed to read environment variable: ${key}`,
        { key },
        error instanceof Error ? error : undefined
      )
      this.logger.error(`Failed to read environment variable: ${key}`, errorInstance)
      return fallback
    }
  }
}

