/**
 * Main dependency injection container
 * Provides centralized service management and registration
 */

import { ServiceRegistry, ServiceRegistrationOptions } from './service-registry'
import { ServiceToken, TOKENS } from './tokens'
import { IApiService } from '@/src/domain/services/api.service.interface'
import { IStorageService } from '@/src/domain/services/storage.service.interface'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { II18nService } from '@/src/domain/services/i18n.service.interface'
import { IThemeService } from '@/src/domain/services/theme.service.interface'

// Infrastructure implementations
import { AxiosApiService, AxiosClientConfig } from '@/src/infrastructure/api/axios'
import { TMDBApiClient, TMDBConfig } from '@/src/infrastructure/api/clients/tmdb-api.client'
import { StremioApiClient, StremioConfig } from '@/src/infrastructure/api/clients/stremio-api.client'
import { AsyncStorageService } from '@/src/infrastructure/storage'
import { LoggerFactory, LoggerFactoryConfig } from '@/src/infrastructure/logging'
import { I18nService } from '@/src/infrastructure/i18n'
import { ThemeService } from '@/src/infrastructure/theme'

export interface ContainerConfig {
  enableLogging?: boolean
  validateOnBuild?: boolean
  initializeSingletons?: boolean
  environment?: 'development' | 'staging' | 'production'
}

export interface AppConfiguration {
  tmdb: TMDBConfig
  stremio?: StremioConfig
  sentry?: {
    dsn: string
    environment: string
  }
  logger?: LoggerFactoryConfig
  i18n?: {
    defaultLanguage: string
    fallbackLanguage: string
  }
  theme?: {
    initialMode: 'light' | 'dark' | 'system'
    customization?: any
  }
}

export class DIContainer {
  private registry: ServiceRegistry
  private config: Required<ContainerConfig>
  private isBuilt = false

  constructor(config: ContainerConfig = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? __DEV__,
      validateOnBuild: config.validateOnBuild ?? true,
      initializeSingletons: config.initializeSingletons ?? true,
      environment: config.environment ?? (__DEV__ ? 'development' : 'production'),
    }

    this.registry = new ServiceRegistry(this.config.enableLogging)
  }

  /**
   * Register core services with default configurations
   */
  registerCoreServices(appConfig: AppConfiguration): void {
    this.log('Registering core services...')

    // Configuration services
    this.registerInstance(TOKENS.AppConfig, appConfig)
    this.registerInstance(TOKENS.Environment, this.config.environment)

    // API configuration
    if (appConfig.tmdb) {
      this.registerInstance(TOKENS.TMDBConfig, appConfig.tmdb)
    }

    if (appConfig.stremio) {
      this.registerInstance(TOKENS.StremioConfig, appConfig.stremio)
    }

    if (appConfig.sentry) {
      this.registerInstance(TOKENS.SentryConfig, appConfig.sentry)
    }

    // Core services
    this.registerLoggingService(appConfig.logger)
    this.registerStorageService()
    this.registerI18nService(appConfig.i18n)
    this.registerThemeService(appConfig.theme)
    this.registerApiService()

    // API clients
    this.registerApiClients()

    this.log('Core services registered')
  }

  /**
   * Register a service with the container
   */
  register<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    options?: ServiceRegistrationOptions
  ): void {
    if (this.isBuilt) {
      throw new Error('Cannot register services after container is built')
    }

    this.registry.register(token, factory, options)
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    dependencies?: ServiceToken[]
  ): void {
    this.register(token, factory, { lifetime: 'singleton', dependencies })
  }

  /**
   * Register a scoped service
   */
  registerScoped<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    dependencies?: ServiceToken[]
  ): void {
    this.register(token, factory, { lifetime: 'scoped', dependencies })
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    dependencies?: ServiceToken[]
  ): void {
    this.register(token, factory, { lifetime: 'transient', dependencies })
  }

  /**
   * Register an instance directly
   */
  registerInstance<T>(token: ServiceToken, instance: T): void {
    if (this.isBuilt) {
      throw new Error('Cannot register services after container is built')
    }

    this.registry.registerInstance(token, instance)
  }

  /**
   * Resolve a service
   */
  resolve<T>(token: ServiceToken): T {
    if (!this.isBuilt) {
      throw new Error('Container must be built before resolving services')
    }

    return this.registry.resolve<T>(token)
  }

  /**
   * Try to resolve a service
   */
  tryResolve<T>(token: ServiceToken): T | null {
    if (!this.isBuilt) {
      return null
    }

    return this.registry.tryResolve<T>(token)
  }

  /**
   * Check if a service is registered
   */
  isRegistered(token: ServiceToken): boolean {
    return this.registry.isRegistered(token)
  }

  /**
   * Build the container (finalize registrations and validate)
   */
  build(): void {
    if (this.isBuilt) {
      throw new Error('Container is already built')
    }

    this.log('Building container...')

    if (this.config.validateOnBuild) {
      const validation = this.registry.validate()
      if (!validation.valid) {
        throw new Error(`Container validation failed:\n${validation.errors.join('\n')}`)
      }
    }

    if (this.config.initializeSingletons) {
      this.registry.initializeAll()
    }

    this.isBuilt = true
    this.log('Container built successfully')
  }

  /**
   * Get container statistics
   */
  getStats(): ReturnType<ServiceRegistry['getStats']> {
    return this.registry.getStats()
  }

  /**
   * Validate container configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    return this.registry.validate()
  }

  /**
   * Dispose the container and clean up resources
   */
  dispose(): void {
    this.log('Disposing container...')
    this.registry.clear()
    this.isBuilt = false
    this.log('Container disposed')
  }

  // Private service registration methods
  private registerLoggingService(loggerConfig?: LoggerFactoryConfig): void {
    this.registerSingleton(
      TOKENS.LoggingService,
      (sentryConfig?: any, environment?: string) => {
        const config: LoggerFactoryConfig = loggerConfig || {
          type: environment === 'development' ? 'console' : 'hybrid',
          sentry: sentryConfig,
        }

        return LoggerFactory.createLogger(config)
      },
      [TOKENS.SentryConfig, TOKENS.Environment]
    )
  }

  private registerStorageService(): void {
    this.registerSingleton(
      TOKENS.StorageService,
      () => {
        return new AsyncStorageService({
          enableLogging: this.config.enableLogging,
        })
      }
    )
  }

  private registerI18nService(i18nConfig?: any): void {
    this.registerSingleton(
      TOKENS.I18nService,
      () => {
        return new I18nService({
          defaultLanguage: i18nConfig?.defaultLanguage || 'en',
          fallbackLanguage: i18nConfig?.fallbackLanguage || 'en',
          enableDebugMode: this.config.enableLogging,
          autoDetectLanguage: true,
        })
      }
    )
  }

  private registerThemeService(themeConfig?: any): void {
    this.registerSingleton(
      TOKENS.ThemeService,
      () => {
        return new ThemeService(
          themeConfig?.initialMode || 'system',
          themeConfig?.customization
        )
      }
    )
  }

  private registerApiService(): void {
    this.registerSingleton(
      TOKENS.ApiService,
      () => {
        const config: AxiosClientConfig = {
          baseURL: 'https://api.example.com', // This should be configured per use case
          timeout: 10000,
          retries: 3,
          retryDelay: 1000,
          enableLogging: this.config.enableLogging,
        }

        return new AxiosApiService(config)
      }
    )
  }

  private registerApiClients(): void {
    // TMDB API Client
    this.registerSingleton(
      TOKENS.TMDBApiClient,
      (tmdbConfig: TMDBConfig) => {
        return new TMDBApiClient(tmdbConfig)
      },
      [TOKENS.TMDBConfig]
    )

    // Stremio API Client
    this.registerSingleton(
      TOKENS.StremioApiClient,
      (stremioConfig?: StremioConfig) => {
        return new StremioApiClient(stremioConfig || {})
      },
      [TOKENS.StremioConfig]
    )
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[DIContainer] ${message}`)
    }
  }
}

/**
 * Global container instance
 */
let globalContainer: DIContainer | null = null

/**
 * Create and configure the global container
 */
export const createContainer = (
  appConfig: AppConfiguration,
  containerConfig?: ContainerConfig
): DIContainer => {
  if (globalContainer) {
    globalContainer.dispose()
  }

  globalContainer = new DIContainer(containerConfig)
  globalContainer.registerCoreServices(appConfig)
  
  return globalContainer
}

/**
 * Get the global container instance
 */
export const getContainer = (): DIContainer => {
  if (!globalContainer) {
    throw new Error('Container not initialized. Call createContainer() first.')
  }
  return globalContainer
}

/**
 * Build the global container
 */
export const buildContainer = (): void => {
  const container = getContainer()
  container.build()
}

/**
 * Resolve a service from the global container
 */
export const resolve = <T>(token: ServiceToken): T => {
  return getContainer().resolve<T>(token)
}

/**
 * Try to resolve a service from the global container
 */
export const tryResolve = <T>(token: ServiceToken): T | null => {
  return getContainer().tryResolve<T>(token)
}

/**
 * Utility functions for common service resolutions
 */
export const getApiService = (): IApiService => resolve<IApiService>(TOKENS.ApiService)
export const getStorageService = (): IStorageService => resolve<IStorageService>(TOKENS.StorageService)
export const getLoggingService = (): ILoggingService => resolve<ILoggingService>(TOKENS.LoggingService)
export const getI18nService = (): II18nService => resolve<II18nService>(TOKENS.I18nService)
export const getThemeService = (): IThemeService => resolve<IThemeService>(TOKENS.ThemeService)

/**
 * Hook for React components to access services
 */
export const useService = <T>(token: ServiceToken): T => {
  return resolve<T>(token)
}

/**
 * Hook for React components to access multiple services
 */
export const useServices = <T extends Record<string, ServiceToken>>(
  tokens: T
): { [K in keyof T]: any } => {
  const result = {} as any
  
  Object.entries(tokens).forEach(([key, token]) => {
    result[key] = resolve(token)
  })
  
  return result
}

/**
 * Dispose the global container
 */
export const disposeContainer = (): void => {
  if (globalContainer) {
    globalContainer.dispose()
    globalContainer = null
  }
}