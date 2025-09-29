import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'
import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ILoggingService } from '@/src/domain/services'

/**
 * Provider registry implementation
 * Central registry for managing all providers and provider discovery with source-level tracking
 */
export class ProviderRegistry implements IProviderRegistry {
  private providers: Map<string, IProvider> = new Map()
  private providersBySource: Map<string, Set<string>> = new Map()

  constructor(private readonly logger: ILoggingService) {
    this.logger.info('ProviderRegistry: Initialized with source-aware tracking', {
      registryId: 'main',
      initialProviders: 0,
      initialSources: 0
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
      sourceId: provider.sourceId,
      capabilities: provider.capabilities,
      priority: provider.priority
    })

    try {
      // Check if provider already exists
      if (this.providers.has(provider.id)) {
        const existingProvider = this.providers.get(provider.id)
        this.logger.warn('ProviderRegistry: Provider already registered, updating', undefined, {
          providerId: provider.id,
          existingProviderName: existingProvider?.name,
          existingSourceId: existingProvider?.sourceId,
          newSourceId: provider.sourceId
        })

        // Remove from old source tracking if source changed
        if (existingProvider && existingProvider.sourceId !== provider.sourceId) {
          this.removeProviderFromSource(existingProvider.sourceId, provider.id)
        }
      }

      // Register the provider
      this.providers.set(provider.id, provider)

      // Update source tracking
      this.addProviderToSource(provider.sourceId, provider.id)

      const registrationTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Provider registered successfully', {
        providerId: provider.id,
        providerName: provider.name,
        sourceId: provider.sourceId,
        totalProviders: this.providers.size,
        totalSources: this.providersBySource.size,
        registrationTime
      })

    } catch (error) {
      const registrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to register provider', error instanceof Error ? error : new Error(String(error)), {
        providerId: provider.id,
        providerName: provider.name,
        sourceId: provider.sourceId,
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
        providers: matchingProviders.map(p => ({ 
          id: p.id, 
          name: p.name, 
          sourceId: p.sourceId, 
          priority: p.priority 
        })),
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
          sourceId: provider.sourceId,
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
      totalProviders: this.providers.size,
      totalSources: this.providersBySource.size
    })

    const providers = Array.from(this.providers.values())

    // Sort by priority (lower number = higher priority)
    providers.sort((a, b) => a.priority - b.priority)

    this.logger.debug('ProviderRegistry: All providers retrieved', undefined, {
      totalProviders: providers.length,
      providers: providers.map(p => ({ 
        id: p.id, 
        name: p.name, 
        sourceId: p.sourceId, 
        capabilities: p.capabilities, 
        priority: p.priority 
      }))
    })

    return providers
  }

  /**
   * Get all providers from a specific source
   */
  getProvidersBySource(sourceId: string): IProvider[] {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Getting providers by source', undefined, {
      sourceId,
      totalSources: this.providersBySource.size
    })

    try {
      const providerIds = this.providersBySource.get(sourceId)
      if (!providerIds) {
        this.logger.debug('ProviderRegistry: No providers found for source', undefined, {
          sourceId,
          availableSources: Array.from(this.providersBySource.keys())
        })
        return []
      }

      const providers: IProvider[] = []
      for (const providerId of providerIds) {
        const provider = this.providers.get(providerId)
        if (provider) {
          providers.push(provider)
        } else {
          this.logger.warn('ProviderRegistry: Provider ID tracked by source but not found in registry', undefined, {
            sourceId,
            providerId,
            possibleInconsistency: true
          })
        }
      }

      // Sort by priority (lower number = higher priority)
      providers.sort((a, b) => a.priority - b.priority)

      const lookupTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Providers found by source', {
        sourceId,
        providerCount: providers.length,
        providers: providers.map(p => ({ 
          id: p.id, 
          name: p.name, 
          capabilities: p.capabilities, 
          priority: p.priority 
        })),
        lookupTime
      })

      return providers

    } catch (error) {
      const lookupTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to get providers by source', error instanceof Error ? error : new Error(String(error)), {
        sourceId,
        lookupTime,
        errorMessage
      })

      throw new Error(`Failed to get providers by source ${sourceId}: ${errorMessage}`)
    }
  }

  /**
   * Get capabilities available from a specific source
   */
  getCapabilitiesBySource(sourceId: string): ProviderCapability[] {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Getting capabilities by source', undefined, {
      sourceId
    })

    try {
      const providers = this.getProvidersBySource(sourceId)
      const capabilities = new Set<ProviderCapability>()

      for (const provider of providers) {
        for (const capability of provider.capabilities) {
          capabilities.add(capability)
        }
      }

      const capabilityArray = Array.from(capabilities)
      const lookupTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Capabilities found by source', {
        sourceId,
        capabilityCount: capabilityArray.length,
        capabilities: capabilityArray,
        providerCount: providers.length,
        lookupTime
      })

      return capabilityArray

    } catch (error) {
      const lookupTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to get capabilities by source', error instanceof Error ? error : new Error(String(error)), {
        sourceId,
        lookupTime,
        errorMessage
      })

      throw new Error(`Failed to get capabilities by source ${sourceId}: ${errorMessage}`)
    }
  }

  /**
   * Unregister all providers from a specific source
   */
  unregisterProvidersBySource(sourceId: string): void {
    const startTime = Date.now()

    this.logger.info('ProviderRegistry: Unregistering providers by source', {
      sourceId,
      totalProviders: this.providers.size,
      totalSources: this.providersBySource.size
    })

    try {
      const providerIds = this.providersBySource.get(sourceId)
      if (!providerIds) {
        this.logger.debug('ProviderRegistry: No providers found to unregister for source', undefined, {
          sourceId,
          availableSources: Array.from(this.providersBySource.keys())
        })
        return
      }

      const removedProviders: string[] = []
      
      // Remove all providers from this source
      for (const providerId of providerIds) {
        const provider = this.providers.get(providerId)
        if (provider) {
          this.providers.delete(providerId)
          removedProviders.push(providerId)
          
          this.logger.debug('ProviderRegistry: Removed provider from registry', undefined, {
            providerId,
            providerName: provider.name,
            sourceId: provider.sourceId
          })
        }
      }

      // Remove the source tracking
      this.providersBySource.delete(sourceId)

      const unregistrationTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Successfully unregistered providers by source', {
        sourceId,
        removedProviderCount: removedProviders.length,
        removedProviders,
        remainingProviders: this.providers.size,
        remainingSources: this.providersBySource.size,
        unregistrationTime
      })

    } catch (error) {
      const unregistrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to unregister providers by source', error instanceof Error ? error : new Error(String(error)), {
        sourceId,
        unregistrationTime,
        errorMessage
      })

      throw new Error(`Failed to unregister providers by source ${sourceId}: ${errorMessage}`)
    }
  }

  /**
   * Get all source IDs that have registered providers
   */
  getAllSources(): string[] {
    const sources = Array.from(this.providersBySource.keys()).sort()

    this.logger.debug('ProviderRegistry: Getting all sources', undefined, {
      sourceCount: sources.length,
      sources
    })

    return sources
  }

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
  } {
    const providers = Array.from(this.providers.values())
    
    const providersByCapability: Record<string, number> = {}
    const providersBySource: Record<string, number> = {}
    const capabilitiesBySource: Record<string, ProviderCapability[]> = {}
    
    // Count providers by capability
    for (const provider of providers) {
      for (const capability of provider.capabilities) {
        providersByCapability[capability] = (providersByCapability[capability] || 0) + 1
      }
    }

    // Count providers by source and collect capabilities by source
    for (const [sourceId, providerIds] of this.providersBySource.entries()) {
      providersBySource[sourceId] = providerIds.size
      capabilitiesBySource[sourceId] = this.getCapabilitiesBySource(sourceId)
    }

    const stats = {
      totalProviders: providers.length,
      totalSources: this.providersBySource.size,
      providersByCapability,
      providersBySource,
      capabilitiesBySource,
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        sourceId: p.sourceId,
        capabilities: p.capabilities,
        priority: p.priority
      }))
    }

    this.logger.debug('ProviderRegistry: Registry statistics compiled', undefined, {
      totalProviders: stats.totalProviders,
      totalSources: stats.totalSources,
      sourceBreakdown: stats.providersBySource,
      capabilityBreakdown: stats.providersByCapability
    })

    return stats
  }

  /**
   * Add a provider to source tracking
   */
  private addProviderToSource(sourceId: string, providerId: string): void {
    if (!this.providersBySource.has(sourceId)) {
      this.providersBySource.set(sourceId, new Set())
      this.logger.debug('ProviderRegistry: Created new source tracking', undefined, {
        sourceId,
        totalSources: this.providersBySource.size
      })
    }

    const sourceProviders = this.providersBySource.get(sourceId)!
    sourceProviders.add(providerId)

    this.logger.debug('ProviderRegistry: Added provider to source tracking', undefined, {
      sourceId,
      providerId,
      providersInSource: sourceProviders.size
    })
  }

  /**
   * Remove a provider from source tracking
   */
  private removeProviderFromSource(sourceId: string, providerId: string): void {
    const sourceProviders = this.providersBySource.get(sourceId)
    if (sourceProviders) {
      sourceProviders.delete(providerId)
      
      // If no more providers for this source, remove the source
      if (sourceProviders.size === 0) {
        this.providersBySource.delete(sourceId)
        this.logger.debug('ProviderRegistry: Removed empty source tracking', undefined, {
          sourceId,
          remainingSources: this.providersBySource.size
        })
      } else {
        this.logger.debug('ProviderRegistry: Removed provider from source tracking', undefined, {
          sourceId,
          providerId,
          remainingProvidersInSource: sourceProviders.size
        })
      }
    }
  }
}