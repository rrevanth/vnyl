/**
 * Provider Factory - Registration-Based Provider Instantiation
 * 
 * Factory for dynamic provider creation using constructor registration.
 * Implements the "registration = capability" principle where providers
 * register constructors for each specific capability they support.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type {
  IBaseProvider,
  BaseProviderConfig,
  ProviderConstructor,
  ProviderCapabilityMap,
  ProviderInstance,
  ProviderRegistrationInfo
} from './provider-interfaces'
import { ProviderCapability } from './provider-interfaces'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

/**
 * Constructor registration map for each capability
 */
type CapabilityConstructorMap = {
  [K in ProviderCapability]: Map<string, ProviderConstructor<ProviderCapabilityMap[K]>>
}

/**
 * Instance cache map for each capability
 */
type CapabilityInstanceMap = {
  [K in ProviderCapability]: Map<string, ProviderInstance<ProviderCapabilityMap[K]>>
}

/**
 * Factory statistics for monitoring
 */
export interface FactoryStatistics {
  totalRegistrations: number
  totalInstances: number
  registrationsByCapability: Record<ProviderCapability, number>
  instancesByCapability: Record<ProviderCapability, number>
  instancesByProvider: Record<string, number>
  lastRegistration?: Date
  lastInstantiation?: Date
}

/**
 * Registration-based provider factory
 */
export class ProviderFactory {
  private readonly constructors: CapabilityConstructorMap
  private readonly instances: CapabilityInstanceMap
  private readonly registrations: ProviderRegistrationInfo[] = []
  private readonly logger: ILoggingService

  constructor(logger: ILoggingService) {
    this.logger = logger
    
    // Initialize constructor maps for each capability
    this.constructors = Object.values(ProviderCapability).reduce(
      (acc, capability) => {
        acc[capability] = new Map()
        return acc
      },
      {} as CapabilityConstructorMap
    )
    
    // Initialize instance maps for each capability
    this.instances = Object.values(ProviderCapability).reduce(
      (acc, capability) => {
        acc[capability] = new Map()
        return acc
      },
      {} as CapabilityInstanceMap
    )
  }

  // ============================================================================
  // CONSTRUCTOR REGISTRATION - Core registration system
  // ============================================================================

  /**
   * Register a provider constructor for a specific capability
   * This is the core of the "registration = capability" principle
   */
  registerProvider<K extends ProviderCapability>(
    providerId: string,
    capability: K,
    constructor: ProviderConstructor<ProviderCapabilityMap[K]>
  ): void {
    const constructorMap = this.constructors[capability]
    
    if (constructorMap.has(providerId)) {
      this.logger.warn(`Overriding existing constructor for provider '${providerId}' capability '${capability}'`)
    }
    
    constructorMap.set(providerId, constructor as any)
    
    // Track registration info
    this.registrations.push({
      providerId,
      capability,
      constructor: constructor as ProviderConstructor<IBaseProvider>,
      registrationDate: new Date()
    })
    
    this.logger.info(`Registered ${capability} provider constructor: ${providerId}`)
  }

  /**
   * Register multiple capabilities for a provider
   */
  registerProviderCapabilities(
    providerId: string,
    capabilities: Partial<Record<ProviderCapability, ProviderConstructor<any>>>
  ): void {
    for (const [capability, constructor] of Object.entries(capabilities)) {
      if (constructor) {
        this.registerProvider(providerId, capability as ProviderCapability, constructor)
      }
    }
  }

  /**
   * Unregister a provider constructor for a specific capability
   */
  unregisterProvider(providerId: string, capability: ProviderCapability): boolean {
    const constructorMap = this.constructors[capability]
    const removed = constructorMap.delete(providerId)
    
    if (removed) {
      // Also remove any cached instance
      this.removeInstance(providerId, capability)
      
      // Remove from registrations tracking
      const registrationIndex = this.registrations.findIndex(
        r => r.providerId === providerId && r.capability === capability
      )
      if (registrationIndex >= 0) {
        this.registrations.splice(registrationIndex, 1)
      }
      
      this.logger.info(`Unregistered ${capability} provider constructor: ${providerId}`)
    }
    
    return removed
  }

  /**
   * Unregister all capabilities for a provider
   */
  unregisterProviderAllCapabilities(providerId: string): number {
    let removedCount = 0
    
    for (const capability of Object.values(ProviderCapability)) {
      if (this.unregisterProvider(providerId, capability)) {
        removedCount++
      }
    }
    
    return removedCount
  }

  // ============================================================================
  // PROVIDER INSTANTIATION - Dynamic provider creation
  // ============================================================================

  /**
   * Create a provider instance for a specific capability
   */
  createProvider<K extends ProviderCapability>(
    providerId: string,
    capability: K,
    config: BaseProviderConfig
  ): ProviderCapabilityMap[K] | null {
    const constructorMap = this.constructors[capability]
    const ProviderConstructor = constructorMap.get(providerId)
    
    if (!ProviderConstructor) {
      this.logger.warn(`No constructor registered for provider '${providerId}' capability '${capability}'`)
      return null
    }
    
    try {
      const provider = new ProviderConstructor(config, this.logger)
      
      this.logger.info(`Created ${capability} provider instance: ${providerId}`, {
        providerId,
        capability,
        providerName: provider.name
      })
      
      return provider as ProviderCapabilityMap[K]
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Failed to create ${capability} provider '${providerId}'`, undefined, {
        providerId,
        capability,
        error: errorMessage
      })
      return null
    }
  }

  /**
   * Get or create a cached provider instance
   */
  getOrCreateProvider<K extends ProviderCapability>(
    providerId: string,
    capability: K,
    config: BaseProviderConfig
  ): ProviderCapabilityMap[K] | null {
    const instanceMap = this.instances[capability]
    const existing = instanceMap.get(providerId)
    
    if (existing) {
      // Update access tracking
      existing.lastAccessed = new Date()
      existing.accessCount++
      
      return existing.provider as ProviderCapabilityMap[K]
    }
    
    // Create new instance
    const provider = this.createProvider(providerId, capability, config)
    if (provider) {
      // Cache the instance
      const instance: ProviderInstance<ProviderCapabilityMap[K]> = {
        provider,
        capability,
        config,
        lastAccessed: new Date(),
        accessCount: 1,
        errorCount: 0
      }
      
      instanceMap.set(providerId, instance as any)
    }
    
    return provider
  }

  /**
   * Create all provider instances for a provider based on registered capabilities
   */
  createAllProvidersForService(
    providerId: string,
    config: BaseProviderConfig
  ): Partial<Record<ProviderCapability, IBaseProvider>> {
    const providers: Partial<Record<ProviderCapability, IBaseProvider>> = {}
    
    // Find all capabilities this provider is registered for
    for (const capability of Object.values(ProviderCapability)) {
      if (this.hasProviderCapability(providerId, capability)) {
        const provider = this.createProvider(providerId, capability, config)
        if (provider) {
          providers[capability] = provider
        }
      }
    }
    
    return providers
  }

  // ============================================================================
  // INSTANCE MANAGEMENT - Cache management and cleanup
  // ============================================================================

  /**
   * Remove a cached provider instance
   */
  removeInstance(providerId: string, capability: ProviderCapability): boolean {
    const instanceMap = this.instances[capability]
    const removed = instanceMap.delete(providerId)
    
    if (removed) {
      this.logger.debug(`Removed cached ${capability} provider instance: ${providerId}`)
    }
    
    return removed
  }

  /**
   * Remove all cached instances for a provider
   */
  removeProviderInstances(providerId: string): number {
    let removedCount = 0
    
    for (const capability of Object.values(ProviderCapability)) {
      if (this.removeInstance(providerId, capability)) {
        removedCount++
      }
    }
    
    return removedCount
  }

  /**
   * Clear all cached instances
   */
  clearAllInstances(): void {
    for (const instanceMap of Object.values(this.instances)) {
      instanceMap.clear()
    }
    this.logger.info('Cleared all cached provider instances')
  }

  /**
   * Clean up stale instances (not accessed recently)
   */
  cleanupStaleInstances(maxAgeMs: number = 30 * 60 * 1000): number { // 30 minutes default
    let cleanedCount = 0
    const cutoffTime = new Date(Date.now() - maxAgeMs)
    
    for (const [capability, instanceMap] of Object.entries(this.instances)) {
      for (const [providerId, instance] of instanceMap.entries()) {
        if (instance.lastAccessed < cutoffTime) {
          instanceMap.delete(providerId)
          cleanedCount++
          this.logger.debug(`Cleaned up stale ${capability} instance: ${providerId}`)
        }
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} stale provider instances`)
    }
    
    return cleanedCount
  }

  // ============================================================================
  // QUERY AND DISCOVERY - Provider capability discovery
  // ============================================================================

  /**
   * Check if a provider has a specific capability registered
   */
  hasProviderCapability(providerId: string, capability: ProviderCapability): boolean {
    return this.constructors[capability].has(providerId)
  }

  /**
   * Get all capabilities registered for a provider
   */
  getProviderCapabilities(providerId: string): ProviderCapability[] {
    const capabilities: ProviderCapability[] = []
    
    for (const capability of Object.values(ProviderCapability)) {
      if (this.hasProviderCapability(providerId, capability)) {
        capabilities.push(capability)
      }
    }
    
    return capabilities
  }

  /**
   * Get all providers registered for a specific capability
   */
  getProvidersForCapability(capability: ProviderCapability): string[] {
    return Array.from(this.constructors[capability].keys())
  }

  /**
   * Get all registered providers across all capabilities
   */
  getAllRegisteredProviders(): string[] {
    const providers = new Set<string>()
    
    for (const constructorMap of Object.values(this.constructors)) {
      for (const providerId of constructorMap.keys()) {
        providers.add(providerId)
      }
    }
    
    return Array.from(providers)
  }

  /**
   * Get provider instances currently cached for a capability
   */
  getCachedProvidersForCapability(capability: ProviderCapability): string[] {
    return Array.from(this.instances[capability].keys())
  }

  /**
   * Get a cached instance (without creating new one)
   */
  getCachedInstance<K extends ProviderCapability>(
    providerId: string,
    capability: K
  ): ProviderCapabilityMap[K] | null {
    const instance = this.instances[capability].get(providerId)
    
    if (instance) {
      // Update access tracking
      instance.lastAccessed = new Date()
      instance.accessCount++
      return instance.provider as ProviderCapabilityMap[K]
    }
    
    return null
  }

  // ============================================================================
  // STATISTICS AND MONITORING
  // ============================================================================

  /**
   * Get factory statistics for monitoring
   */
  getStatistics(): FactoryStatistics {
    const registrationsByCapability = Object.values(ProviderCapability).reduce(
      (acc, capability) => {
        acc[capability] = this.constructors[capability].size
        return acc
      },
      {} as Record<ProviderCapability, number>
    )
    
    const instancesByCapability = Object.values(ProviderCapability).reduce(
      (acc, capability) => {
        acc[capability] = this.instances[capability].size
        return acc
      },
      {} as Record<ProviderCapability, number>
    )
    
    const instancesByProvider: Record<string, number> = {}
    for (const instanceMap of Object.values(this.instances)) {
      for (const providerId of instanceMap.keys()) {
        instancesByProvider[providerId] = (instancesByProvider[providerId] || 0) + 1
      }
    }
    
    const lastRegistration = this.registrations.length > 0 
      ? new Date(Math.max(...this.registrations.map(r => r.registrationDate.getTime())))
      : undefined
    
    return {
      totalRegistrations: this.registrations.length,
      totalInstances: Object.values(this.instances).reduce((sum, map) => sum + map.size, 0),
      registrationsByCapability,
      instancesByCapability,
      instancesByProvider,
      lastRegistration
    }
  }

  /**
   * Get detailed instance information
   */
  getInstanceInfo(providerId: string, capability: ProviderCapability): ProviderInstance | null {
    return this.instances[capability].get(providerId) || null
  }

  /**
   * Get all registration information
   */
  getRegistrationInfo(): ProviderRegistrationInfo[] {
    return [...this.registrations]
  }

  /**
   * Record an error for a provider instance
   */
  recordInstanceError(providerId: string, capability: ProviderCapability, error: Error): void {
    const instance = this.instances[capability].get(providerId)
    if (instance) {
      instance.errorCount++
      instance.lastError = error
    }
  }
}