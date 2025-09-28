import { IProvider } from './provider.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'

/**
 * Provider registry interface
 * Central registry for managing all providers and provider discovery
 */
export interface IProviderRegistry {
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
}