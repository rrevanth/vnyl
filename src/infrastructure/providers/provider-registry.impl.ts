import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ILoggingService } from '@/src/domain/services'

/**
 * Provider registry implementation
 * Central registry for managing all providers and provider discovery
 */
export class ProviderRegistry implements IProviderRegistry {
  private providers: Map<string, IProvider> = new Map()

  constructor(private readonly logger: ILoggingService) {
    this.logger.info('ProviderRegistry: Initialized', {
      registryId: 'main',
      initialProviders: 0
    })
  }

  /**
   * Register a provider with the registry
   */
  registerProvider(provider: IProvider): void {
    const startTime = Date.now()

    this.logger.info('ProviderRegistry: Registering provider', {
      providerId: provider.id,
      providerName: provider.name,
      capabilities: provider.capabilities,
      priority: provider.priority
    })

    try {
      // Check if provider already exists
      if (this.providers.has(provider.id)) {
        this.logger.warn('ProviderRegistry: Provider already registered, updating', undefined, {
          providerId: provider.id,
          existingProvider: this.providers.get(provider.id)?.name
        })
      }

      // Register the provider
      this.providers.set(provider.id, provider)

      const registrationTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Provider registered successfully', {
        providerId: provider.id,
        providerName: provider.name,
        totalProviders: this.providers.size,
        registrationTime
      })

    } catch (error) {
      const registrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to register provider', error instanceof Error ? error : new Error(String(error)), {
        providerId: provider.id,
        providerName: provider.name,
        registrationTime,
        errorMessage
      })

      throw new Error(`Failed to register provider ${provider.id}: ${errorMessage}`)
    }
  }

  /**
   * Get providers that support a specific capability
   */
  async getProvidersByCapability<T extends IProvider>(
    capability: ProviderCapability
  ): Promise<T[]> {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Getting providers by capability', undefined, {
      capability,
      totalProviders: this.providers.size
    })

    try {
      const matchingProviders: T[] = []

      for (const provider of this.providers.values()) {
        if (provider.capabilities.includes(capability)) {
          matchingProviders.push(provider as T)
        }
      }

      // Sort by priority (lower number = higher priority)
      matchingProviders.sort((a, b) => a.priority - b.priority)

      const lookupTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Providers found by capability', {
        capability,
        matchingProviders: matchingProviders.length,
        providers: matchingProviders.map(p => ({ id: p.id, name: p.name, priority: p.priority })),
        lookupTime
      })

      return matchingProviders

    } catch (error) {
      const lookupTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to get providers by capability', error instanceof Error ? error : new Error(String(error)), {
        capability,
        lookupTime,
        errorMessage
      })

      throw new Error(`Failed to get providers by capability ${capability}: ${errorMessage}`)
    }
  }

  /**
   * Get a specific provider by ID
   */
  async getProvider<T extends IProvider>(providerId: string): Promise<T | null> {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Getting provider by ID', undefined, {
      providerId
    })

    try {
      const provider = this.providers.get(providerId) as T | undefined

      const lookupTime = Date.now() - startTime

      if (provider) {
        this.logger.debug('ProviderRegistry: Provider found', undefined, {
          providerId,
          providerName: provider.name,
          capabilities: provider.capabilities,
          lookupTime
        })
      } else {
        this.logger.warn('ProviderRegistry: Provider not found', undefined, {
          providerId,
          availableProviders: Array.from(this.providers.keys()),
          lookupTime
        })
      }

      return provider || null

    } catch (error) {
      const lookupTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to get provider by ID', error instanceof Error ? error : new Error(String(error)), {
        providerId,
        lookupTime,
        errorMessage
      })

      throw new Error(`Failed to get provider ${providerId}: ${errorMessage}`)
    }
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): IProvider[] {
    this.logger.debug('ProviderRegistry: Getting all providers', undefined, {
      totalProviders: this.providers.size
    })

    const providers = Array.from(this.providers.values())

    // Sort by priority (lower number = higher priority)
    providers.sort((a, b) => a.priority - b.priority)

    this.logger.debug('ProviderRegistry: All providers retrieved', undefined, {
      totalProviders: providers.length,
      providers: providers.map(p => ({ id: p.id, name: p.name, capabilities: p.capabilities, priority: p.priority }))
    })

    return providers
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalProviders: number
    providersByCapability: Record<string, number>
    providers: { id: string; name: string; capabilities: ProviderCapability[]; priority: number }[]
  } {
    const providers = Array.from(this.providers.values())
    
    const providersByCapability: Record<string, number> = {}
    
    // Count providers by capability
    for (const provider of providers) {
      for (const capability of provider.capabilities) {
        providersByCapability[capability] = (providersByCapability[capability] || 0) + 1
      }
    }

    const stats = {
      totalProviders: providers.length,
      providersByCapability,
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        capabilities: p.capabilities,
        priority: p.priority
      }))
    }

    this.logger.debug('ProviderRegistry: Registry statistics', undefined, stats)

    return stats
  }
}