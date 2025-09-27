# Provider Interfaces

## Overview

This document defines the core provider interfaces that establish the foundation for the provider source registry system. These interfaces ensure consistency, type safety, and maintainability across all provider implementations.

## Core Provider Interfaces

### IProvider (Base Provider Interface)

```typescript
/**
 * Base provider interface
 * All provider implementations must implement this interface
 */
export interface IProvider {
  /** Unique provider identifier */
  readonly id: string

  /** Human-readable provider name */
  readonly name: string

  /** Provider source identifier */
  readonly sourceId: string

  /** Provider type */
  readonly type: ProviderType

  /** Provider manifest */
  readonly manifest: IProviderManifest

  /** Capabilities this provider supports */
  readonly capabilities: ProviderCapability[]

  /** Provider configuration */
  readonly config: ProviderConfig

  /** Provider status */
  readonly status: ProviderStatus

  /**
   * Initialize the provider
   */
  initialize(): Promise<void>

  /**
   * Perform health check
   */
  healthCheck(): Promise<HealthCheckResult>

  /**
   * Clean up resources
   */
  dispose(): Promise<void>

  /**
   * Get provider information
   */
  getProviderInfo(): ProviderInfo
}
```

### IProviderManifest

```typescript
/**
 * Provider manifest interface
 * Describes provider capabilities and supported content types
 */
export interface IProviderManifest {
  /** Provider ID */
  readonly id: string

  /** Provider version */
  readonly version: string

  /** Provider name */
  readonly name: string

  /** Provider description */
  readonly description: string

  /** Supported media types */
  readonly mediaTypes: MediaType[]

  /** Supported external ID sources */
  readonly idPrefixes: ExternalIdSource[]

  /** Available resources/capabilities */
  readonly resources: ManifestResource[]

  /** Available catalogs */
  readonly catalogs?: ManifestCatalog[]

  /** Supported languages */
  readonly languages?: LanguageCode[]

  /** Supported regions */
  readonly regions?: CountryCode[]

  /** Behavior hints */
  readonly behaviorHints?: BehaviorHints

  /** Provider metadata */
  readonly metadata?: Record<string, unknown>
}

export interface ManifestResource {
  /** Resource type (capability) */
  readonly type: ProviderCapability

  /** Supported media types for this resource */
  readonly mediaTypes: MediaType[]

  /** Supported ID prefixes */
  readonly idPrefixes: ExternalIdSource[]

  /** Additional parameters */
  readonly params?: string[]
}

export interface ManifestCatalog {
  /** Catalog type */
  readonly type: MediaType

  /** Catalog ID */
  readonly id: string

  /** Catalog name */
  readonly name: string

  /** Supported genres */
  readonly genres?: string[]

  /** Extra parameters */
  readonly extra?: CatalogExtra[]
}

export interface CatalogExtra {
  /** Parameter name */
  readonly name: string

  /** Whether parameter is required */
  readonly isRequired?: boolean

  /** Parameter options */
  readonly options?: string[]

  /** Parameter description */
  readonly description?: string
}

export interface BehaviorHints {
  /** Adult content availability */
  readonly adult?: boolean

  /** P2P content */
  readonly p2p?: boolean

  /** Configuration required */
  readonly configurable?: boolean

  /** Configuration required for basic functionality */
  readonly configurationRequired?: boolean
}
```

### IProviderSource

```typescript
/**
 * Provider source interface
 * Manages a collection of related providers from a single source
 */
export interface IProviderSource {
  /** Source identifier */
  readonly id: string

  /** Source name */
  readonly name: string

  /** Source type */
  readonly type: ProviderSourceType

  /** Source configuration */
  readonly config: ProviderSourceConfig

  /** Authentication handler */
  readonly auth?: IProviderAuth

  /** Available provider types */
  readonly availableProviders: ProviderType[]

  /**
   * Initialize the provider source
   */
  initialize(): Promise<void>

  /**
   * Register providers with the registry
   */
  registerProviders(registry: IProviderRegistry): Promise<void>

  /**
   * Setup/configure a specific provider
   */
  setupProvider(providerType: ProviderType, config?: ProviderConfig): Promise<IProvider | null>

  /**
   * Get all providers from this source
   */
  getProviders(): Promise<IProvider[]>

  /**
   * Get provider by type
   */
  getProvider(type: ProviderType): Promise<IProvider | null>

  /**
   * Health check for all providers
   */
  healthCheck(): Promise<SourceHealthResult>

  /**
   * Clean up resources
   */
  dispose(): Promise<void>
}

export enum ProviderSourceType {
  API = 'api',
  ADDON = 'addon',
  LOCAL = 'local',
  HYBRID = 'hybrid'
}

export interface ProviderSourceConfig {
  /** Base URL for API sources */
  readonly baseUrl?: string

  /** API key or token */
  readonly apiKey?: string

  /** Request timeout */
  readonly timeout?: number

  /** Rate limiting */
  readonly rateLimit?: RateLimitConfig

  /** Cache settings */
  readonly cache?: CacheConfig

  /** Source-specific settings */
  readonly settings?: Record<string, unknown>
}

export interface RateLimitConfig {
  /** Requests per second */
  readonly requestsPerSecond: number

  /** Burst limit */
  readonly burstLimit?: number

  /** Cool down period */
  readonly coolDownMs?: number
}

export interface CacheConfig {
  /** Default TTL in seconds */
  readonly defaultTtl: number

  /** TTL by capability */
  readonly ttlByCapability?: Record<ProviderCapability, number>

  /** Cache size limit */
  readonly maxSize?: number
}
```

### IProviderRegistry

```typescript
/**
 * Provider registry interface
 * Central registry for managing all providers and provider sources
 */
export interface IProviderRegistry {
  /**
   * Register a provider source
   */
  registerSource(source: IProviderSource): Promise<void>

  /**
   * Register an individual provider
   */
  registerProvider(provider: IProvider): Promise<void>

  /**
   * Get providers by capability
   */
  getProvidersByCapability<T extends IProvider>(
    capability: ProviderCapability,
    options?: ProviderQueryOptions
  ): Promise<T[]>

  /**
   * Get provider by ID
   */
  getProvider<T extends IProvider>(providerId: string): Promise<T | null>

  /**
   * Get all providers from a source
   */
  getProvidersBySource(sourceId: string): Promise<IProvider[]>

  /**
   * Get sources by type
   */
  getSourcesByType(type: ProviderSourceType): Promise<IProviderSource[]>

  /**
   * Query providers with filters
   */
  queryProviders(query: ProviderQuery): Promise<IProvider[]>

  /**
   * Get provider priority for user
   */
  getProviderPriority(userId?: string): Promise<ProviderPriority>

  /**
   * Set provider priority for user
   */
  setProviderPriority(priority: ProviderPriority, userId?: string): Promise<void>

  /**
   * Health check for all providers
   */
  healthCheck(): Promise<RegistryHealthResult>

  /**
   * Get registry statistics
   */
  getStatistics(): Promise<RegistryStatistics>

  /**
   * Dispose all providers and sources
   */
  dispose(): Promise<void>
}

export interface ProviderQueryOptions {
  /** User ID for priority ordering */
  readonly userId?: string

  /** Include disabled providers */
  readonly includeDisabled?: boolean

  /** Maximum number of providers */
  readonly limit?: number

  /** Filter by media types */
  readonly mediaTypes?: MediaType[]

  /** Filter by external ID support */
  readonly externalIdSources?: ExternalIdSource[]

  /** Filter by region */
  readonly region?: CountryCode

  /** Filter by language */
  readonly language?: LanguageCode
}

export interface ProviderQuery {
  /** Capabilities required */
  readonly capabilities: ProviderCapability[]

  /** Media types */
  readonly mediaTypes?: MediaType[]

  /** Provider sources to include */
  readonly sources?: string[]

  /** Provider status filter */
  readonly status?: ProviderStatus[]

  /** Search query */
  readonly query?: string

  /** Additional filters */
  readonly filters?: Record<string, unknown>
}

export interface ProviderPriority {
  /** User ID */
  readonly userId?: string

  /** Priority by capability */
  readonly byCapability: Record<ProviderCapability, string[]>

  /** Global provider order */
  readonly globalOrder?: string[]

  /** Disabled providers */
  readonly disabled?: string[]

  /** Last updated */
  readonly updatedAt: Date
}
```

### IProviderAuth

```typescript
/**
 * Provider authentication interface
 * Handles authentication for provider sources
 */
export interface IProviderAuth {
  /** Authentication type */
  readonly type: AuthType

  /** Whether authentication is required */
  readonly required: boolean

  /**
   * Check if authenticated
   */
  isAuthenticated(): Promise<boolean>

  /**
   * Authenticate with provider
   */
  authenticate(credentials: AuthCredentials): Promise<AuthResult>

  /**
   * Refresh authentication if needed
   */
  refresh(): Promise<AuthResult>

  /**
   * Sign out/revoke authentication
   */
  signOut(): Promise<void>

  /**
   * Get current authentication status
   */
  getStatus(): Promise<AuthStatus>
}

export enum AuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  BEARER_TOKEN = 'bearer_token',
  BASIC = 'basic'
}

export interface AuthCredentials {
  readonly type: AuthType
  readonly data: Record<string, string>
}

export interface AuthResult {
  readonly success: boolean
  readonly token?: string
  readonly expiresAt?: Date
  readonly error?: string
  readonly userData?: Record<string, unknown>
}

export interface AuthStatus {
  readonly authenticated: boolean
  readonly expiresAt?: Date
  readonly scopes?: string[]
  readonly userId?: string
  readonly error?: string
}
```

## Supporting Types

### Provider Status and Health

```typescript
export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  INITIALIZING = 'initializing',
  DISABLED = 'disabled'
}

export interface HealthCheckResult {
  readonly healthy: boolean
  readonly status: ProviderStatus
  readonly responseTime: number
  readonly error?: string
  readonly details?: Record<string, unknown>
  readonly checkedAt: Date
}

export interface SourceHealthResult {
  readonly sourceId: string
  readonly healthy: boolean
  readonly providerResults: Record<string, HealthCheckResult>
  readonly checkedAt: Date
}

export interface RegistryHealthResult {
  readonly healthy: boolean
  readonly totalProviders: number
  readonly healthyProviders: number
  readonly sourceResults: Record<string, SourceHealthResult>
  readonly checkedAt: Date
}

export interface RegistryStatistics {
  readonly totalSources: number
  readonly totalProviders: number
  readonly providersByCapability: Record<ProviderCapability, number>
  readonly providersByStatus: Record<ProviderStatus, number>
  readonly averageResponseTime: number
  readonly uptime: number
  readonly lastHealthCheck: Date
}
```

### Provider Configuration

```typescript
export interface ProviderConfig {
  /** Provider enabled/disabled */
  readonly enabled: boolean

  /** Provider priority */
  readonly priority: number

  /** Request timeout */
  readonly timeout?: number

  /** Rate limiting */
  readonly rateLimit?: RateLimitConfig

  /** Cache settings */
  readonly cache?: CacheConfig

  /** Provider-specific settings */
  readonly settings?: Record<string, unknown>

  /** Region/language preferences */
  readonly locale?: {
    readonly region?: CountryCode
    readonly language?: LanguageCode
  }
}
```

### Request/Response Types

```typescript
/**
 * Base request interface for all provider operations
 */
export interface ProviderRequest {
  /** Request ID for tracing */
  readonly requestId: string

  /** User ID for personalization */
  readonly userId?: string

  /** Region for content */
  readonly region?: CountryCode

  /** Language preference */
  readonly language?: LanguageCode

  /** Request timestamp */
  readonly timestamp: Date

  /** Additional context */
  readonly context?: Record<string, unknown>
}

/**
 * Base response interface for all provider operations
 */
export interface ProviderResponse<T = unknown> {
  /** Response data */
  readonly data: T

  /** Provider information */
  readonly provider: ProviderInfo

  /** Request metadata */
  readonly metadata: ResponseMetadata

  /** Success flag */
  readonly success: boolean

  /** Error information if failed */
  readonly error?: ProviderError
}

export interface ResponseMetadata {
  /** Request ID */
  readonly requestId: string

  /** Response time in milliseconds */
  readonly responseTime: number

  /** Cache hit/miss */
  readonly cacheHit: boolean

  /** Data timestamp */
  readonly dataTimestamp: Date

  /** Provider API version */
  readonly apiVersion?: string

  /** Rate limit information */
  readonly rateLimit?: {
    readonly remaining: number
    readonly resetAt: Date
  }
}

export interface ProviderError {
  /** Error code */
  readonly code: string

  /** Error message */
  readonly message: string

  /** HTTP status code if applicable */
  readonly statusCode?: number

  /** Error details */
  readonly details?: Record<string, unknown>

  /** Whether error is retryable */
  readonly retryable: boolean

  /** Retry after seconds */
  readonly retryAfter?: number
}
```

## Abstract Base Classes

### BaseProvider

```typescript
/**
 * Abstract base provider class
 * Provides common functionality for all provider implementations
 */
export abstract class BaseProvider implements IProvider {
  protected logger: ILoggingService
  protected cache?: ICacheService
  protected httpClient?: IHttpClient

  constructor(
    protected readonly _config: ProviderConfig,
    protected readonly _manifest: IProviderManifest,
    logger: ILoggingService
  ) {
    this.logger = logger
  }

  // Abstract methods to be implemented by subclasses
  abstract get id(): string
  abstract get name(): string
  abstract get sourceId(): string
  abstract get type(): ProviderType
  abstract get capabilities(): ProviderCapability[]

  // Common implementations
  get manifest(): IProviderManifest {
    return this._manifest
  }

  get config(): ProviderConfig {
    return this._config
  }

  get status(): ProviderStatus {
    return this._status
  }

  async initialize(): Promise<void> {
    this.logger.info(`Initializing provider: ${this.id}`)
    this._status = ProviderStatus.INITIALIZING
    
    try {
      await this.onInitialize()
      this._status = ProviderStatus.ACTIVE
      this.logger.info(`Provider initialized: ${this.id}`)
    } catch (error) {
      this._status = ProviderStatus.ERROR
      this.logger.error(`Provider initialization failed: ${this.id}`, error)
      throw error
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    
    try {
      await this.onHealthCheck()
      
      return {
        healthy: true,
        status: this._status,
        responseTime: Date.now() - startTime,
        checkedAt: new Date()
      }
    } catch (error) {
      return {
        healthy: false,
        status: ProviderStatus.ERROR,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date()
      }
    }
  }

  getProviderInfo(): ProviderInfo {
    return {
      id: this.id,
      sourceId: this.sourceId,
      name: this.name,
      type: this.type,
      capabilities: this.capabilities,
      priority: this.config.priority,
      dataTimestamp: new Date(),
      apiVersion: this.manifest.version
    }
  }

  // Protected hooks for subclasses
  protected abstract onInitialize(): Promise<void>
  protected abstract onHealthCheck(): Promise<void>
  protected abstract onDispose(): Promise<void>

  // Common utility methods
  protected createRequest(data: Partial<ProviderRequest>): ProviderRequest {
    return {
      requestId: generateUUID(),
      timestamp: new Date(),
      ...data
    }
  }

  protected createResponse<T>(
    data: T,
    request: ProviderRequest,
    metadata: Partial<ResponseMetadata> = {}
  ): ProviderResponse<T> {
    return {
      data,
      provider: this.getProviderInfo(),
      metadata: {
        requestId: request.requestId,
        responseTime: Date.now() - request.timestamp.getTime(),
        cacheHit: false,
        dataTimestamp: new Date(),
        ...metadata
      },
      success: true
    }
  }

  protected createErrorResponse<T>(
    error: ProviderError,
    request: ProviderRequest
  ): ProviderResponse<T> {
    return {
      data: null as T,
      provider: this.getProviderInfo(),
      metadata: {
        requestId: request.requestId,
        responseTime: Date.now() - request.timestamp.getTime(),
        cacheHit: false,
        dataTimestamp: new Date()
      },
      success: false,
      error
    }
  }

  private _status: ProviderStatus = ProviderStatus.INACTIVE
}
```

### BaseProviderSource

```typescript
/**
 * Abstract base provider source class
 * Provides common functionality for provider source implementations
 */
export abstract class BaseProviderSource implements IProviderSource {
  protected logger: ILoggingService
  protected registry?: IProviderRegistry
  protected providers: Map<ProviderType, IProvider> = new Map()

  constructor(
    protected readonly _config: ProviderSourceConfig,
    logger: ILoggingService
  ) {
    this.logger = logger
  }

  // Abstract methods
  abstract get id(): string
  abstract get name(): string
  abstract get type(): ProviderSourceType
  abstract get availableProviders(): ProviderType[]

  // Common implementations
  get config(): ProviderSourceConfig {
    return this._config
  }

  async initialize(): Promise<void> {
    this.logger.info(`Initializing provider source: ${this.id}`)
    await this.onInitialize()
    this.logger.info(`Provider source initialized: ${this.id}`)
  }

  async registerProviders(registry: IProviderRegistry): Promise<void> {
    this.registry = registry
    
    for (const providerType of this.availableProviders) {
      try {
        const provider = await this.setupProvider(providerType)
        if (provider) {
          await registry.registerProvider(provider)
          this.providers.set(providerType, provider)
          this.logger.info(`Registered provider: ${provider.id}`)
        }
      } catch (error) {
        this.logger.error(`Failed to register provider: ${providerType}`, error)
      }
    }
  }

  async getProviders(): Promise<IProvider[]> {
    return Array.from(this.providers.values())
  }

  async getProvider(type: ProviderType): Promise<IProvider | null> {
    return this.providers.get(type) || null
  }

  async healthCheck(): Promise<SourceHealthResult> {
    const providerResults: Record<string, HealthCheckResult> = {}
    let healthyCount = 0

    for (const [type, provider] of this.providers) {
      try {
        const result = await provider.healthCheck()
        providerResults[provider.id] = result
        if (result.healthy) healthyCount++
      } catch (error) {
        providerResults[`${this.id}_${type}`] = {
          healthy: false,
          status: ProviderStatus.ERROR,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          checkedAt: new Date()
        }
      }
    }

    return {
      sourceId: this.id,
      healthy: healthyCount === this.providers.size,
      providerResults,
      checkedAt: new Date()
    }
  }

  async dispose(): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        await provider.dispose()
      } catch (error) {
        this.logger.error(`Failed to dispose provider: ${provider.id}`, error)
      }
    }
    
    this.providers.clear()
    await this.onDispose()
  }

  // Protected hooks for subclasses
  protected abstract onInitialize(): Promise<void>
  protected abstract onDispose(): Promise<void>
  protected abstract createProvider(type: ProviderType, config?: ProviderConfig): Promise<IProvider | null>

  // Common utility methods
  protected async setupProvider(providerType: ProviderType, config?: ProviderConfig): Promise<IProvider | null> {
    try {
      const provider = await this.createProvider(providerType, config)
      if (provider) {
        await provider.initialize()
        return provider
      }
      return null
    } catch (error) {
      this.logger.error(`Failed to setup provider: ${providerType}`, error)
      return null
    }
  }
}
```

## Implementation Guidelines

### Provider Implementation Checklist

1. **Extend BaseProvider**: All providers should extend the BaseProvider class
2. **Implement Required Methods**: Implement all abstract methods and capability interfaces
3. **Handle Errors Gracefully**: Use proper error handling and logging
4. **Support Configuration**: Respect provider configuration settings
5. **Implement Health Checks**: Provide meaningful health check implementations
6. **Cache Responses**: Implement appropriate caching strategies
7. **Rate Limiting**: Respect API rate limits and implement backoff strategies
8. **Type Safety**: Ensure full TypeScript type coverage
9. **Documentation**: Provide comprehensive JSDoc comments
10. **Testing**: Include unit and integration tests

### Provider Source Implementation Checklist

1. **Extend BaseProviderSource**: All sources should extend the BaseProviderSource class
2. **Authentication**: Implement authentication if required
3. **Provider Factory**: Implement provider creation logic
4. **Configuration**: Support flexible configuration options
5. **Health Monitoring**: Monitor all child providers
6. **Resource Management**: Proper cleanup and disposal
7. **Error Recovery**: Handle failures gracefully
8. **Logging**: Comprehensive logging throughout
9. **Documentation**: Clear setup and usage instructions
10. **Testing**: Cover all provider creation scenarios

This interface design provides a solid foundation for building a maintainable, extensible, and type-safe provider system that can grow with the application's needs.