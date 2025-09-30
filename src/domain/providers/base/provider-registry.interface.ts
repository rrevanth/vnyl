import { IProvider } from './provider.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'

/**
 * Enhanced provider registry interface
 * Central registry for managing all providers with support for both generic capability-based
 * discovery and typed provider interfaces
 */
export interface IProviderRegistry {
  // Core provider management methods (existing)

  /**
   * Register a provider with the registry
   */
  registerProvider(provider: IProvider): void

  /**
   * Get providers that support a specific capability
   */
  getProvidersByCapability<T extends IProvider>(
    capability: ProviderCapability
  ): Promise<T[]>

  /**
   * Get a specific provider by ID
   */
  getProvider<T extends IProvider>(providerId: string): Promise<T | null>

  /**
   * Get all registered providers
   */
  getAllProviders(): IProvider[]

  /**
   * Get all providers from a specific source
   */
  getProvidersBySource(sourceId: string): IProvider[]

  /**
   * Get capabilities available from a specific source
   */
  getCapabilitiesBySource(sourceId: string): ProviderCapability[]

  /**
   * Unregister all providers from a specific source
   */
  unregisterProvidersBySource(sourceId: string): void

  /**
   * Get all source IDs that have registered providers
   */
  getAllSources(): string[]

  /**
   * Get registry statistics
   */
  getStats(): {
    totalProviders: number
    totalSources: number
    providersByCapability: Record<string, number>
    providersBySource: Record<string, number>
    capabilitiesBySource: Record<string, ProviderCapability[]>
    providers: { id: string; name: string; sourceId: string; capabilities: ProviderCapability[]; priority: number }[]
  }

  // Enhanced provider management methods (new)

  /**
   * Register multiple providers from a service at once
   */
  registerServiceProviders(serviceId: string, providers: IProvider[]): void

  /**
   * Get providers filtered by priority and user preferences
   */
  getProvidersByCapabilityWithPriority<T extends IProvider>(
    capability: ProviderCapability,
    userPriorityOrder?: string[]
  ): Promise<T[]>

  /**
   * Remove a specific provider by ID (more granular than unregisterProvidersBySource)
   */
  unregisterProvider(providerId: string): void

  /**
   * Get providers that support multiple capabilities (intersection)
   */
  getProvidersByMultipleCapabilities<T extends IProvider>(
    capabilities: ProviderCapability[]
  ): Promise<T[]>

  /**
   * Check if a provider is registered
   */
  hasProvider(providerId: string): boolean

  /**
   * Check if a source has any providers registered
   */
  hasSource(sourceId: string): boolean

  /**
   * Get enhanced statistics with capability intersection analysis
   */
  getEnhancedStats(): {
    totalProviders: number
    totalSources: number
    providersByCapability: Record<string, number>
    providersBySource: Record<string, number>
    capabilitiesBySource: Record<string, ProviderCapability[]>
    providers: { id: string; name: string; sourceId: string; capabilities: ProviderCapability[]; priority: number }[]
    capabilityIntersections: Record<string, string[]> // capability combinations → provider IDs
    sourceCapabilityMatrix: Record<string, Record<string, boolean>> // sourceId → capability → hasCapability
  }

  /**
   * Validate provider registration (check for duplicates, capability conflicts, etc.)
   */
  validateProvider(provider: IProvider): {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }

  /**
   * Get provider health status if supported
   */
  getProviderHealth(providerId: string): Promise<{
    providerId: string
    isHealthy: boolean
    lastChecked: Date
    errors?: string[]
  } | null>
}