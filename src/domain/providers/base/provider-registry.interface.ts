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
}