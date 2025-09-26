/**
 * Provider Entity - Core Provider System Types
 * 
 * Defines the fundamental types and interfaces for the provider system,
 * supporting dynamic provider registration with flexible capabilities.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

export type ContentType = 'movie' | 'tv' | 'person' | 'collection' | 'network' | 'company'

/**
 * Provider capabilities enum - defines all possible provider capabilities
 */
export type ProviderCapability = 
  | 'catalog'           // List of media catalogs/collections
  | 'metadata'          // Detailed media information
  | 'search'            // Search for media content
  | 'person'            // Person/cast/crew information  
  | 'recommendations'   // Related content recommendations
  | 'external_ids'      // External service identifiers
  | 'ratings'           // Media ratings from various sources
  | 'comments'          // User comments and reviews
  | 'tracking'          // Watch progress and scrobbling
  | 'addon_catalog'     // Stremio addon catalogs
  | 'images'            // Media images (posters, backdrops, etc.)
  | 'streams'           // Media streaming links
  | 'subtitles'         // Subtitle files and data

/**
 * Provider capabilities configuration
 */
export interface ProviderCapabilities {
  catalog?: boolean
  metadata?: boolean
  search?: boolean
  person?: boolean
  recommendations?: boolean
  external_ids?: boolean
  ratings?: boolean
  comments?: boolean
  tracking?: boolean
  addon_catalog?: boolean
  images?: boolean
  streams?: boolean
  subtitles?: boolean
}

/**
 * Provider configuration stored in user preferences
 */
export interface ProviderConfig {
  id: string
  name: string
  type: ProviderType
  enabled: boolean
  priority: number
  capabilities: ProviderCapabilities
  settings: ProviderSettings
  metadata: ProviderMetadata
}

/**
 * Provider type classification
 */
export type ProviderType = 
  | 'official'      // Official services (TMDB, Trakt, etc.)
  | 'addon'         // Stremio addons
  | 'custom'        // User-defined providers
  | 'local'         // Local/offline providers

/**
 * Provider-specific settings
 */
export interface ProviderSettings {
  // Authentication
  apiKey?: string
  bearerToken?: string
  username?: string
  password?: string
  accessToken?: string
  refreshToken?: string
  
  // Configuration
  baseUrl?: string
  language?: string
  region?: string
  includeAdult?: boolean
  timeout?: number
  rateLimit?: number
  
  // Stremio-specific
  addonUrl?: string
  manifest?: StremioAddonManifest
  
  // Custom settings (provider-specific)
  customSettings?: Record<string, unknown>
}

/**
 * Provider metadata for display and management
 */
export interface ProviderMetadata {
  displayName: string
  description?: string
  version?: string
  author?: string
  website?: string
  iconUrl?: string
  screenshots?: string[]
  categories?: string[]
  tags?: string[]
  lastUpdated?: string
  installDate?: string
  isOfficial?: boolean
}

/**
 * Stremio addon manifest structure
 */
export interface StremioAddonManifest {
  id: string
  name: string
  version: string
  description: string
  logo?: string
  background?: string
  types: string[]
  catalogs: StremioAddonCatalog[]
  resources: string[]
  idPrefixes?: string[]
  behaviorHints?: Record<string, unknown>
}

/**
 * Stremio addon catalog definition
 */
export interface StremioAddonCatalog {
  type: string
  id: string
  name: string
  extra?: StremioAddonExtra[]
}

/**
 * Stremio addon extra parameters
 */
export interface StremioAddonExtra {
  name: string
  isRequired?: boolean
  options?: string[]
  optionsLimit?: number
}

/**
 * Provider health status
 */
export interface ProviderHealthStatus {
  isHealthy: boolean
  lastCheck: Date
  responseTime?: number
  errorMessage?: string
  errorCount: number
  lastError?: Date
}

/**
 * Provider statistics
 */
export interface ProviderStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastRequestTime?: Date
  cachehits: number
  cacheMisses: number
}

/**
 * Provider error information
 */
export interface ProviderError extends Error {
  code: string
  provider: string
  capability?: ProviderCapability
  retryable: boolean
  context?: Record<string, unknown>
  timestamp: Date
}

/**
 * Pagination response wrapper for provider results
 */
export interface PaginationResponse<T> {
  results: T[]
  page: number
  totalPages?: number
  totalResults?: number
  hasMore: boolean
}

/**
 * Media context for provider operations
 */
export interface MediaContext {
  // Primary identification
  id: string
  type: ContentType
  
  // External IDs for cross-provider lookups
  externalIds?: Record<string, string | number>
  
  // Basic metadata for optimization
  title?: string
  originalTitle?: string
  year?: number
  releaseDate?: string
  
  // TV-specific context
  season?: number
  episode?: number
  
  // Additional context
  language?: string
  region?: string
  
  // Provider context
  providerInfo?: {
    sourceProvider: string
    sourceId: string | number
    sourceType?: string
    catalogId?: string
    lastUpdated?: Date
  }
}

/**
 * Provider registration information
 */
export interface ProviderRegistration {
  config: ProviderConfig
  healthStatus: ProviderHealthStatus
  stats: ProviderStats
  registrationDate: Date
  lastAccessDate?: Date
}

/**
 * Provider registry status
 */
export interface ProviderRegistryStatus {
  totalProviders: number
  enabledProviders: number
  healthyProviders: number
  capabilities: Record<ProviderCapability, number>
  lastHealthCheck: Date
}

/**
 * Default provider configurations
 */
export const DEFAULT_PROVIDER_SETTINGS: ProviderSettings = {
  timeout: 10000,
  rateLimit: 40, // requests per 10 seconds
  language: 'en-US',
  region: 'US',
  includeAdult: false
}

export const DEFAULT_PROVIDER_METADATA: Partial<ProviderMetadata> = {
  version: '1.0.0',
  isOfficial: false,
  installDate: new Date().toISOString()
}

/**
 * Provider capability requirements for content types
 */
export const CONTENT_TYPE_CAPABILITIES: Record<ContentType, ProviderCapability[]> = {
  movie: ['catalog', 'metadata', 'search', 'recommendations', 'external_ids', 'ratings', 'images', 'streams'],
  tv: ['catalog', 'metadata', 'search', 'recommendations', 'external_ids', 'ratings', 'images', 'streams'],
  person: ['person', 'search', 'external_ids', 'images'],
  collection: ['catalog', 'metadata', 'search'],
  network: ['catalog', 'metadata', 'search'],
  company: ['catalog', 'metadata', 'search']
}

/**
 * Provider priority levels
 */
export enum ProviderPriority {
  HIGHEST = 1,
  HIGH = 10,
  MEDIUM = 50,
  LOW = 100,
  LOWEST = 999
}