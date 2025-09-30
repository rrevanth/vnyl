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

  // Enhanced provider management methods (implementing new interface)

  /**
   * Register multiple providers from a service at once
   */
  registerServiceProviders(serviceId: string, providers: IProvider[]): void {
    const startTime = Date.now()

    this.logger.info('ProviderRegistry: Registering service providers in batch', {
      serviceId,
      providerCount: providers.length,
      providerIds: providers.map(p => p.id)
    })

    try {
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const provider of providers) {
        try {
          // Validate provider belongs to this service
          if (provider.sourceId !== serviceId) {
            this.logger.warn('ProviderRegistry: Provider source ID mismatch during batch registration', undefined, {
              providerId: provider.id,
              expectedSourceId: serviceId,
              actualSourceId: provider.sourceId
            })
          }

          this.registerProvider(provider)
          successCount++
        } catch (error) {
          errorCount++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`${provider.id}: ${errorMessage}`)

          this.logger.error('ProviderRegistry: Failed to register provider in batch', error instanceof Error ? error : new Error(String(error)), {
            providerId: provider.id,
            serviceId,
            errorMessage
          })
        }
      }

      const registrationTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Batch provider registration completed', {
        serviceId,
        totalProviders: providers.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
        registrationTime
      })

      if (errorCount > 0) {
        throw new Error(`Failed to register ${errorCount} providers: ${errors.join(', ')}`)
      }

    } catch (error) {
      const registrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Batch provider registration failed', error instanceof Error ? error : new Error(String(error)), {
        serviceId,
        providerCount: providers.length,
        registrationTime,
        errorMessage
      })

      throw new Error(`Failed to register service providers for ${serviceId}: ${errorMessage}`)
    }
  }

  /**
   * Get providers filtered by priority and user preferences
   */
  async getProvidersByCapabilityWithPriority<T extends IProvider>(
    capability: ProviderCapability,
    userPriorityOrder?: string[]
  ): Promise<T[]> {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Getting providers by capability with priority', undefined, {
      capability,
      userPriorityOrder,
      totalProviders: this.providers.size
    })

    try {
      // Get base providers by capability
      const providers = await this.getProvidersByCapability<T>(capability)

      if (!userPriorityOrder || userPriorityOrder.length === 0) {
        // Already sorted by priority in getProvidersByCapability
        return providers
      }

      // Apply user priority ordering
      const prioritizedProviders: T[] = []
      const remainingProviders: T[] = []

      // Add providers in user priority order
      for (const providerId of userPriorityOrder) {
        const provider = providers.find(p => p.id === providerId)
        if (provider) {
          prioritizedProviders.push(provider)
        }
      }

      // Add remaining providers not in user priority order
      for (const provider of providers) {
        if (!userPriorityOrder.includes(provider.id)) {
          remainingProviders.push(provider)
        }
      }

      // Remaining providers are already sorted by priority
      const result = [...prioritizedProviders, ...remainingProviders]
      const lookupTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Providers found by capability with priority', {
        capability,
        userPriorityOrder,
        totalMatching: result.length,
        prioritized: prioritizedProviders.length,
        remaining: remainingProviders.length,
        providers: result.map(p => ({
          id: p.id,
          name: p.name,
          sourceId: p.sourceId,
          priority: p.priority
        })),
        lookupTime
      })

      return result

    } catch (error) {
      const lookupTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to get providers by capability with priority', error instanceof Error ? error : new Error(String(error)), {
        capability,
        userPriorityOrder,
        lookupTime,
        errorMessage
      })

      throw new Error(`Failed to get providers by capability with priority ${capability}: ${errorMessage}`)
    }
  }

  /**
   * Remove a specific provider by ID (more granular than unregisterProvidersBySource)
   */
  unregisterProvider(providerId: string): void {
    const startTime = Date.now()

    this.logger.info('ProviderRegistry: Unregistering specific provider', {
      providerId,
      totalProviders: this.providers.size
    })

    try {
      const provider = this.providers.get(providerId)
      if (!provider) {
        this.logger.warn('ProviderRegistry: Provider not found for unregistration', undefined, {
          providerId,
          availableProviders: Array.from(this.providers.keys())
        })
        return
      }

      // Remove from main registry
      this.providers.delete(providerId)

      // Remove from source tracking
      this.removeProviderFromSource(provider.sourceId, providerId)

      const unregistrationTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Provider unregistered successfully', {
        providerId,
        providerName: provider.name,
        sourceId: provider.sourceId,
        remainingProviders: this.providers.size,
        remainingSources: this.providersBySource.size,
        unregistrationTime
      })

    } catch (error) {
      const unregistrationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to unregister provider', error instanceof Error ? error : new Error(String(error)), {
        providerId,
        unregistrationTime,
        errorMessage
      })

      throw new Error(`Failed to unregister provider ${providerId}: ${errorMessage}`)
    }
  }

  /**
   * Get providers that support multiple capabilities (intersection)
   */
  async getProvidersByMultipleCapabilities<T extends IProvider>(
    capabilities: ProviderCapability[]
  ): Promise<T[]> {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Getting providers by multiple capabilities', undefined, {
      capabilities,
      capabilityCount: capabilities.length,
      totalProviders: this.providers.size
    })

    try {
      if (capabilities.length === 0) {
        return []
      }

      const matchingProviders: T[] = []

      for (const provider of this.providers.values()) {
        // Check if provider has ALL the required capabilities
        const hasAllCapabilities = capabilities.every(capability =>
          provider.capabilities.includes(capability)
        )

        if (hasAllCapabilities) {
          matchingProviders.push(provider as T)
        }
      }

      // Sort by priority (lower number = higher priority)
      matchingProviders.sort((a, b) => a.priority - b.priority)

      const lookupTime = Date.now() - startTime

      this.logger.info('ProviderRegistry: Providers found by multiple capabilities', {
        capabilities,
        capabilityCount: capabilities.length,
        matchingProviders: matchingProviders.length,
        providers: matchingProviders.map(p => ({
          id: p.id,
          name: p.name,
          sourceId: p.sourceId,
          capabilities: p.capabilities,
          priority: p.priority
        })),
        lookupTime
      })

      return matchingProviders

    } catch (error) {
      const lookupTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to get providers by multiple capabilities', error instanceof Error ? error : new Error(String(error)), {
        capabilities,
        lookupTime,
        errorMessage
      })

      throw new Error(`Failed to get providers by multiple capabilities: ${errorMessage}`)
    }
  }

  /**
   * Check if a provider is registered
   */
  hasProvider(providerId: string): boolean {
    const exists = this.providers.has(providerId)

    this.logger.debug('ProviderRegistry: Checking provider existence', undefined, {
      providerId,
      exists
    })

    return exists
  }

  /**
   * Check if a source has any providers registered
   */
  hasSource(sourceId: string): boolean {
    const exists = this.providersBySource.has(sourceId)

    this.logger.debug('ProviderRegistry: Checking source existence', undefined, {
      sourceId,
      exists
    })

    return exists
  }

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
    capabilityIntersections: Record<string, string[]>
    sourceCapabilityMatrix: Record<string, Record<string, boolean>>
  } {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Computing enhanced statistics', undefined, {
      totalProviders: this.providers.size,
      totalSources: this.providersBySource.size
    })

    try {
      // Get base stats
      const baseStats = this.getStats()

      // Compute capability intersections
      const capabilityIntersections: Record<string, string[]> = {}
      const allCapabilities = Object.values(ProviderCapability)

      // Generate all capability combinations (2-capability intersections for now)
      for (let i = 0; i < allCapabilities.length; i++) {
        for (let j = i + 1; j < allCapabilities.length; j++) {
          const cap1 = allCapabilities[i]
          const cap2 = allCapabilities[j]
          const intersectionKey = `${cap1}+${cap2}`

          const providersWithBoth = Array.from(this.providers.values())
            .filter(p => p.capabilities.includes(cap1) && p.capabilities.includes(cap2))
            .map(p => p.id)

          if (providersWithBoth.length > 0) {
            capabilityIntersections[intersectionKey] = providersWithBoth
          }
        }
      }

      // Compute source capability matrix
      const sourceCapabilityMatrix: Record<string, Record<string, boolean>> = {}

      for (const sourceId of this.getAllSources()) {
        sourceCapabilityMatrix[sourceId] = {}
        const sourceCapabilities = this.getCapabilitiesBySource(sourceId)

        for (const capability of allCapabilities) {
          sourceCapabilityMatrix[sourceId][capability] = sourceCapabilities.includes(capability)
        }
      }

      const computationTime = Date.now() - startTime

      const enhancedStats = {
        ...baseStats,
        capabilityIntersections,
        sourceCapabilityMatrix
      }

      this.logger.info('ProviderRegistry: Enhanced statistics computed', {
        totalProviders: enhancedStats.totalProviders,
        totalSources: enhancedStats.totalSources,
        capabilityIntersections: Object.keys(capabilityIntersections).length,
        sourceCapabilityMatrix: Object.keys(sourceCapabilityMatrix).length,
        computationTime
      })

      return enhancedStats

    } catch (error) {
      const computationTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Failed to compute enhanced statistics', error instanceof Error ? error : new Error(String(error)), {
        computationTime,
        errorMessage
      })

      throw new Error(`Failed to compute enhanced statistics: ${errorMessage}`)
    }
  }

  /**
   * Validate provider registration (check for duplicates, capability conflicts, etc.)
   */
  validateProvider(provider: IProvider): {
    isValid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []

    this.logger.debug('ProviderRegistry: Validating provider', undefined, {
      providerId: provider.id,
      providerName: provider.name,
      sourceId: provider.sourceId,
      capabilities: provider.capabilities,
      priority: provider.priority
    })

    try {
      // Check for required fields
      if (!provider.id) {
        errors.push('Provider ID is required')
      }

      if (!provider.name) {
        errors.push('Provider name is required')
      }

      if (!provider.sourceId) {
        errors.push('Provider source ID is required')
      }

      if (!provider.capabilities || provider.capabilities.length === 0) {
        errors.push('Provider must have at least one capability')
      }

      if (typeof provider.priority !== 'number' || provider.priority < 0) {
        errors.push('Provider priority must be a non-negative number')
      }

      // Check for duplicate ID
      if (this.providers.has(provider.id)) {
        const existingProvider = this.providers.get(provider.id)
        if (existingProvider?.sourceId === provider.sourceId) {
          warnings.push(`Provider ${provider.id} is already registered from the same source`)
        } else {
          errors.push(`Provider ID ${provider.id} conflicts with existing provider from different source: ${existingProvider?.sourceId}`)
        }
      }

      // Check for valid capabilities
      const validCapabilities = Object.values(ProviderCapability)
      for (const capability of provider.capabilities) {
        if (!validCapabilities.includes(capability)) {
          errors.push(`Invalid capability: ${capability}`)
        }
      }

      // Check for capability duplicates
      const uniqueCapabilities = new Set(provider.capabilities)
      if (uniqueCapabilities.size !== provider.capabilities.length) {
        warnings.push('Provider has duplicate capabilities')
      }

      const isValid = errors.length === 0

      this.logger.debug('ProviderRegistry: Provider validation completed', undefined, {
        providerId: provider.id,
        isValid,
        warningCount: warnings.length,
        errorCount: errors.length,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined
      })

      return {
        isValid,
        warnings,
        errors
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Provider validation failed', error instanceof Error ? error : new Error(String(error)), {
        providerId: provider.id,
        errorMessage
      })

      return {
        isValid: false,
        warnings,
        errors: [...errors, `Validation error: ${errorMessage}`]
      }
    }
  }

  /**
   * Get provider health status if supported
   */
  async getProviderHealth(providerId: string): Promise<{
    providerId: string
    isHealthy: boolean
    lastChecked: Date
    errors?: string[]
  } | null> {
    const startTime = Date.now()

    this.logger.debug('ProviderRegistry: Checking provider health', undefined, {
      providerId
    })

    try {
      const provider = this.providers.get(providerId)
      if (!provider) {
        this.logger.warn('ProviderRegistry: Provider not found for health check', undefined, {
          providerId,
          availableProviders: Array.from(this.providers.keys())
        })
        return null
      }

      // Check if provider has a health check method
      const healthCheckMethod = (provider as any).checkHealth
      const lastChecked = new Date()
      let isHealthy = true
      const errors: string[] = []

      if (typeof healthCheckMethod === 'function') {
        try {
          // Call provider's health check method
          const healthResult = await healthCheckMethod.call(provider)

          if (typeof healthResult === 'boolean') {
            isHealthy = healthResult
          } else if (healthResult && typeof healthResult === 'object') {
            isHealthy = healthResult.isHealthy !== false
            if (healthResult.errors) {
              errors.push(...(Array.isArray(healthResult.errors) ? healthResult.errors : [healthResult.errors]))
            }
          }
        } catch (error) {
          isHealthy = false
          const errorMessage = error instanceof Error ? error.message : 'Unknown health check error'
          errors.push(errorMessage)

          this.logger.warn('ProviderRegistry: Provider health check failed', error instanceof Error ? error : new Error(String(error)), {
            providerId,
            providerName: provider.name,
            errorMessage
          })
        }
      } else {
        // Provider doesn't support health checks, assume healthy if it exists
        this.logger.debug('ProviderRegistry: Provider does not support health checks, assuming healthy', undefined, {
          providerId,
          providerName: provider.name
        })
      }

      const checkTime = Date.now() - startTime

      const healthStatus = {
        providerId,
        isHealthy,
        lastChecked,
        ...(errors.length > 0 && { errors })
      }

      this.logger.info('ProviderRegistry: Provider health check completed', {
        providerId,
        providerName: provider.name,
        isHealthy,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        checkTime
      })

      return healthStatus

    } catch (error) {
      const checkTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.logger.error('ProviderRegistry: Provider health check failed', error instanceof Error ? error : new Error(String(error)), {
        providerId,
        checkTime,
        errorMessage
      })

      return {
        providerId,
        isHealthy: false,
        lastChecked: new Date(),
        errors: [errorMessage]
      }
    }
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