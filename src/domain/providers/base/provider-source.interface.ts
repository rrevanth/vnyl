import { IProvider } from './provider.interface'
import { IProviderRegistry } from './provider-registry.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'

/**
 * Provider source interface
 * Manages a collection of related providers from a single external service
 * Examples: TMDB Source, Stremio Source, Trakt Source
 */
export interface IProviderSource {
  /** Source identifier (e.g., 'tmdb', 'stremio', 'trakt') */
  readonly id: string

  /** Source name (e.g., 'The Movie Database', 'Stremio', 'Trakt') */
  readonly name: string

  /** Source type */
  readonly type: ProviderSourceType

  /** Configuration for this source */
  readonly config: ProviderSourceConfig

  /** Available provider capabilities from this source */
  readonly availableCapabilities: ProviderCapability[]

  /**
   * Initialize the provider source (authentication, configuration, etc.)
   */
  initialize(): Promise<void>

  /**
   * Register all providers from this source with the registry
   */
  registerProviders(registry: IProviderRegistry): Promise<void>

  /**
   * Get all providers from this source
   */
  getProviders(): Promise<IProvider[]>

  /**
   * Get providers by capability from this source
   */
  getProvidersByCapability(capability: ProviderCapability): Promise<IProvider[]>
}

export enum ProviderSourceType {
  API = 'api',           // TMDB, Trakt - API-based services
  ADDON_NETWORK = 'addon_network',  // Stremio - addon ecosystem
  LOCAL = 'local',       // Local file sources
  HYBRID = 'hybrid'      // Mixed sources
}

export interface ProviderSourceConfig {
  /** Base URL for API sources */
  readonly baseUrl?: string

  /** API key or authentication token */
  readonly apiKey?: string

  /** Request timeout in milliseconds */
  readonly timeout?: number

  /** Source-specific settings */
  readonly settings?: Record<string, unknown>
}