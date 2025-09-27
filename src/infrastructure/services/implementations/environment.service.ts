import type { IEnvironmentService, ILoggingService } from '@/src/domain/services'

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

  getEnvironment(): string {
    return this.get('NODE_ENV', 'development')!
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === 'development'
  }

  isProduction(): boolean {
    return this.getEnvironment() === 'production'
  }

  get(key: string, fallback?: string): string | undefined {
    try {
      // Use specific environment variable getters to avoid dynamic access
      let value: string | undefined

      switch (key) {
        case 'EXPO_PUBLIC_API_BASE_URL':
          value = process.env.EXPO_PUBLIC_API_BASE_URL
          break
        case 'NODE_ENV':
          value = process.env.NODE_ENV
          break
        default:
          // For any other keys, we'll need to add them explicitly here
          this.logger.warn(`Unknown environment variable key: ${key}`)
          value = undefined
          break
      }

      if (value !== undefined) {
        return value
      }

      if (fallback !== undefined) {
        this.logger.debug(`Environment variable ${key} not found, using fallback`, undefined, {
          key,
          hasFallback: true
        })
        return fallback
      }

      this.logger.warn(`Environment variable ${key} not found and no fallback provided`)
      return undefined
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Failed to read environment variable: ${key}`, errorInstance)
      return fallback
    }
  }
}