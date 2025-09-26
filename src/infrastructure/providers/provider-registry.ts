/**
 * Provider Registry - Live Instance Management and Capability Resolution
 * 
 * Central registry for provider management with live instance resolution,
 * capability-based routing, and health monitoring. Implements the
 * registration-based system with efficient provider lookup.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type {
  IBaseProvider,
  BaseProviderConfig,
  ProviderCapability,
  ProviderCapabilityMap
} from './provider-interfaces'
import type { EnhancedMediaContext } from '@/src/domain/entities/media-context.entity'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { ProviderFactory, type FactoryStatistics } from './provider-factory'

/**
 * Provider configuration with registry metadata
 */
export interface ProviderRegistryConfig extends BaseProviderConfig {
  registrationDate: Date
  lastHealthCheck?: Date
  healthCheckInterval?: number // in milliseconds
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown'
  retryCount?: number
  maxRetries?: number
}

/**
 * Capability resolution options
 */
export interface CapabilityResolutionOptions {
  enabledOnly?: boolean
  healthyOnly?: boolean
  maxProviders?: number
  timeoutMs?: number
  fallbackOnError?: boolean
  priorityOrder?: 'asc' | 'desc'
  excludeProviders?: string[]
  includeProviders?: string[]
}

/**
 * Capability resolution result
 */
export interface CapabilityResolutionResult<T extends IBaseProvider> {
  provider: T
  providerId: string
  responseTime: number
  fromCache: boolean
  error?: Error
}

/**
 * Registry statistics
 */
export interface RegistryStatistics extends FactoryStatistics {
  activeProviders: number
  healthyProviders: number
  unhealthyProviders: number
  providerConfigs: number
  averageResponseTime: number
  healthCheckStats: {
    totalChecks: number
    passedChecks: number
    failedChecks: number
    averageLatency: number
  }
}

/**
 * Health monitoring configuration
 */
export interface HealthMonitoringConfig {
  enabled: boolean
  checkInterval: number // milliseconds
  unhealthyThreshold: number // consecutive failures
  staleInstanceCleanup: boolean
  staleInstanceMaxAge: number // milliseconds
}

/**
 * Provider registry with live instance management
 */
export class ProviderRegistry {
  private readonly factory: ProviderFactory
  private readonly configs = new Map<string, ProviderRegistryConfig>()
  private readonly logger: ILoggingService
  private readonly healthMonitoring: HealthMonitoringConfig
  private healthCheckInterval?: NodeJS.Timeout

  // Statistics tracking
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    healthChecks: 0,
    healthChecksPassed: 0,
    healthChecksFailed: 0,
    totalHealthCheckLatency: 0
  }

  constructor(
    logger: ILoggingService,
    healthMonitoring: Partial<HealthMonitoringConfig> = {}
  ) {
    this.logger = logger
    this.factory = new ProviderFactory(logger)
    
    this.healthMonitoring = {
      enabled: true,
      checkInterval: 5 * 60 * 1000, // 5 minutes
      unhealthyThreshold: 3,
      staleInstanceCleanup: true,
      staleInstanceMaxAge: 30 * 60 * 1000, // 30 minutes
      ...healthMonitoring
    }
    
    this.startHealthMonitoring()
  }

  // ============================================================================
  // PROVIDER REGISTRATION AND CONFIGURATION
  // ============================================================================

  /**
   * Register a provider with configuration
   */
  registerProvider<K extends ProviderCapability>(
    providerId: string,
    capability: K,
    constructor: import('./provider-interfaces').ProviderConstructor<ProviderCapabilityMap[K]>,
    config: BaseProviderConfig
  ): void {
    // Register constructor with factory
    this.factory.registerProvider(providerId, capability, constructor)
    
    // Store configuration
    const registryConfig: ProviderRegistryConfig = {
      ...config,
      registrationDate: new Date(),
      healthStatus: 'unknown',
      retryCount: 0,
      maxRetries: 3,
      healthCheckInterval: this.healthMonitoring.checkInterval
    }
    
    this.configs.set(providerId, registryConfig)
    
    this.logger.info(`Registered provider in registry: ${providerId} (${capability})`)
  }

  /**
   * Register multiple capabilities for a provider
   */
  registerProviderWithCapabilities(
    providerId: string,
    capabilities: Partial<Record<ProviderCapability, import('./provider-interfaces').ProviderConstructor<any>>>,
    config: BaseProviderConfig
  ): void {
    // Register all capabilities with factory
    this.factory.registerProviderCapabilities(providerId, capabilities)
    
    // Store configuration once
    const registryConfig: ProviderRegistryConfig = {
      ...config,
      registrationDate: new Date(),
      healthStatus: 'unknown',
      retryCount: 0,
      maxRetries: 3,
      healthCheckInterval: this.healthMonitoring.checkInterval
    }
    
    this.configs.set(providerId, registryConfig)
    
    const capabilityList = Object.keys(capabilities).join(', ')
    this.logger.info(`Registered provider with multiple capabilities: ${providerId} (${capabilityList})`)
  }

  /**
   * Unregister a provider completely
   */
  unregisterProvider(providerId: string): boolean {
    const removedCapabilities = this.factory.unregisterProviderAllCapabilities(providerId)
    const configRemoved = this.configs.delete(providerId)
    
    if (removedCapabilities > 0 || configRemoved) {
      this.logger.info(`Unregistered provider: ${providerId} (${removedCapabilities} capabilities)`)
      return true
    }
    
    return false
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(providerId: string, updates: Partial<BaseProviderConfig>): boolean {
    const config = this.configs.get(providerId)
    if (!config) {
      return false
    }
    
    // Update configuration
    Object.assign(config, updates)
    
    // Clear cached instances to force recreation with new config
    this.factory.removeProviderInstances(providerId)
    
    this.logger.info(`Updated configuration for provider: ${providerId}`)
    return true
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerId: string): ProviderRegistryConfig | null {
    return this.configs.get(providerId) || null
  }

  /**
   * Get all registered provider configurations
   */
  getAllProviderConfigs(): Map<string, ProviderRegistryConfig> {
    return new Map(this.configs)
  }

  // ============================================================================
  // CAPABILITY RESOLUTION - Core registry functionality
  // ============================================================================

  /**
   * Resolve a single provider for a capability with smart selection
   */
  async resolveCapability<K extends ProviderCapability>(
    capability: K,
    context?: EnhancedMediaContext,
    options: CapabilityResolutionOptions = {}
  ): Promise<CapabilityResolutionResult<ProviderCapabilityMap[K]> | null> {
    const startTime = Date.now()
    this.stats.totalRequests++
    
    try {
      const providers = await this.resolveMultipleCapabilities(capability, context, {
        ...options,
        maxProviders: 1
      })
      
      if (providers.length === 0) {
        this.stats.failedRequests++
        return null
      }
      
      const result = providers[0]
      this.stats.successfulRequests++
      this.stats.totalResponseTime += Date.now() - startTime
      
      return result
    } catch (error) {
      this.stats.failedRequests++
      this.logger.error(`Failed to resolve ${capability} capability`, undefined, {
        capability,
        error: error instanceof Error ? error.message : String(error),
        context: context?.id
      })
      return null
    }
  }

  /**
   * Resolve multiple providers for a capability
   */
  async resolveMultipleCapabilities<K extends ProviderCapability>(
    capability: K,
    context?: EnhancedMediaContext,
    options: CapabilityResolutionOptions = {}
  ): Promise<CapabilityResolutionResult<ProviderCapabilityMap[K]>[]> {
    const {
      enabledOnly = true,
      healthyOnly = true,
      maxProviders = 5,
      timeoutMs = 30000,
      priorityOrder = 'asc',
      excludeProviders = [],
      includeProviders = []
    } = options
    
    // Get available providers for this capability
    let providerIds = this.factory.getProvidersForCapability(capability)
    
    // Apply filters
    providerIds = this.filterProviders(providerIds, {
      enabledOnly,
      healthyOnly,
      excludeProviders,
      includeProviders
    })
    
    // Sort by priority
    providerIds = this.sortProvidersByPriority(providerIds, priorityOrder)
    
    // Limit number of providers
    if (maxProviders > 0) {
      providerIds = providerIds.slice(0, maxProviders)
    }
    
    // Resolve providers concurrently
    const resolutionPromises = providerIds.map(async (providerId): Promise<CapabilityResolutionResult<ProviderCapabilityMap[K]> | null> => {
      const startTime = Date.now()
      
      try {
        const config = this.configs.get(providerId)
        if (!config) {
          throw new Error(`No configuration found for provider: ${providerId}`)
        }
        
        // Try to get cached instance first
        let provider = this.factory.getCachedInstance(providerId, capability)
        let fromCache = true
        
        if (!provider) {
          // Create new instance
          provider = this.factory.getOrCreateProvider(providerId, capability, config)
          fromCache = false
        }
        
        if (!provider) {
          throw new Error(`Failed to create provider instance: ${providerId}`)
        }
        
        const responseTime = Date.now() - startTime
        
        return {
          provider,
          providerId,
          responseTime,
          fromCache
        }
      } catch (error) {
        this.logger.warn(`Failed to resolve provider ${providerId} for ${capability}`, undefined, {
          providerId,
          capability,
          error: error instanceof Error ? error.message : String(error)
        })
        
        // Record error for monitoring
        if (error instanceof Error) {
          this.factory.recordInstanceError(providerId, capability, error)
        }
        
        return null
      }
    })
    
    // Wait for all resolutions with timeout
    const timeoutPromise = new Promise<null[]>((_, reject) =>
      setTimeout(() => reject(new Error('Capability resolution timeout')), timeoutMs)
    )
    
    try {
      const raceResult = await Promise.race([
        Promise.all(resolutionPromises),
        timeoutPromise
      ])
      
      // Check if we got actual results (not timeout)
      if (Array.isArray(raceResult)) {
        // Filter out null results explicitly
        const filteredResults: CapabilityResolutionResult<ProviderCapabilityMap[K]>[] = []
        for (const result of raceResult) {
          if (result !== null) {
            filteredResults.push(result)
          }
        }
        return filteredResults
      } else {
        // Timeout occurred
        return []
      }
    } catch {
      this.logger.error(`Timeout resolving ${capability} capability`, undefined, {
        capability,
        timeoutMs,
        providerIds
      })
      return []
    }
  }

  /**
   * Get all providers for a specific capability with health status
   */
  getProvidersForCapability(capability: ProviderCapability): {
    providerId: string
    config: ProviderRegistryConfig
    healthy: boolean
    cached: boolean
  }[] {
    const providerIds = this.factory.getProvidersForCapability(capability)
    
    return providerIds.map(providerId => {
      const config = this.configs.get(providerId)!
      const cached = this.factory.getCachedInstance(providerId, capability) !== null
      const healthy = config.healthStatus === 'healthy'
      
      return {
        providerId,
        config,
        healthy,
        cached
      }
    })
  }

  /**
   * Get all available capabilities for a specific provider
   * This method dynamically resolves what capabilities a provider supports
   * by checking what it's registered for in the factory
   */
  getAvailableCapabilities(providerId: string): ProviderCapability[] {
    if (!providerId || typeof providerId !== 'string' || providerId.trim() === '') {
      this.logger.warn('Invalid provider ID provided to getAvailableCapabilities', undefined, {
        providerId
      })
      return []
    }

    const trimmedProviderId = providerId.trim()
    
    // Check if provider is registered in our configuration
    const config = this.configs.get(trimmedProviderId)
    if (!config) {
      this.logger.debug('Provider not found in registry', undefined, {
        providerId: trimmedProviderId
      })
      return []
    }

    // Get capabilities from the factory (which knows about constructor registrations)
    const capabilities = this.factory.getProviderCapabilities(trimmedProviderId)
    
    this.logger.debug('Retrieved provider capabilities', undefined, {
      providerId: trimmedProviderId,
      capabilities,
      capabilitiesCount: capabilities.length,
      providerEnabled: config.enabled,
      providerHealthy: config.healthStatus === 'healthy'
    })

    return capabilities
  }

  // ============================================================================
  // HEALTH MONITORING AND MANAGEMENT
  // ============================================================================

  /**
   * Start health monitoring background process
   */
  private startHealthMonitoring(): void {
    if (!this.healthMonitoring.enabled) {
      return
    }
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
      
      if (this.healthMonitoring.staleInstanceCleanup) {
        this.factory.cleanupStaleInstances(this.healthMonitoring.staleInstanceMaxAge)
      }
    }, this.healthMonitoring.checkInterval)
    
    this.logger.info('Started provider health monitoring', {
      interval: this.healthMonitoring.checkInterval,
      unhealthyThreshold: this.healthMonitoring.unhealthyThreshold
    })
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = undefined
      this.logger.info('Stopped provider health monitoring')
    }
  }

  /**
   * Perform health checks on all registered providers
   */
  async performHealthChecks(): Promise<void> {
    const startTime = Date.now()
    const providerIds = Array.from(this.configs.keys())
    
    this.logger.debug(`Starting health checks for ${providerIds.length} providers`)
    
    const healthCheckPromises = providerIds.map(async (providerId) => {
      const config = this.configs.get(providerId)!
      
      try {
        // Get any available capability for this provider for health check
        const capabilities = this.factory.getProviderCapabilities(providerId)
        if (capabilities.length === 0) {
          return
        }
        
        // Use the first capability for health check
        const capability = capabilities[0]
        const provider = this.factory.getOrCreateProvider(providerId, capability, config)
        
        if (!provider) {
          throw new Error('Failed to create provider instance for health check')
        }
        
        const healthResult = await provider.healthCheck()
        
        // Update health status
        config.healthStatus = healthResult.healthy ? 'healthy' : 'unhealthy'
        config.lastHealthCheck = new Date()
        
        if (healthResult.healthy) {
          config.retryCount = 0
          this.stats.healthChecksPassed++
        } else {
          config.retryCount = (config.retryCount || 0) + 1
          this.stats.healthChecksFailed++
          
          // If provider has failed too many times, remove from cache
          if (config.retryCount >= (config.maxRetries || 3)) {
            this.factory.removeProviderInstances(providerId)
            this.logger.warn(`Provider ${providerId} exceeded max retries, removing from cache`)
          }
        }
        
        this.stats.totalHealthCheckLatency += healthResult.responseTime || 0
        this.stats.healthChecks++
        
      } catch (error) {
        config.healthStatus = 'unhealthy'
        config.retryCount = (config.retryCount || 0) + 1
        config.lastHealthCheck = new Date()
        
        this.stats.healthChecksFailed++
        this.stats.healthChecks++
        
        this.logger.debug(`Health check failed for provider ${providerId}`, undefined, {
          providerId,
          error: error instanceof Error ? error.message : String(error),
          retryCount: config.retryCount
        })
      }
    })
    
    await Promise.allSettled(healthCheckPromises)
    
    const duration = Date.now() - startTime
    this.logger.debug(`Completed health checks in ${duration}ms`)
  }

  /**
   * Get health status for all providers
   */
  getHealthStatus(): Record<string, { status: string; lastCheck?: Date; retryCount: number }> {
    const status: Record<string, { status: string; lastCheck?: Date; retryCount: number }> = {}
    
    for (const [providerId, config] of this.configs) {
      status[providerId] = {
        status: config.healthStatus || 'unknown',
        lastCheck: config.lastHealthCheck,
        retryCount: config.retryCount || 0
      }
    }
    
    return status
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Filter providers based on criteria
   */
  private filterProviders(
    providerIds: string[],
    filters: {
      enabledOnly: boolean
      healthyOnly: boolean
      excludeProviders: string[]
      includeProviders: string[]
    }
  ): string[] {
    return providerIds.filter(providerId => {
      const config = this.configs.get(providerId)
      if (!config) return false
      
      // Check enabled status
      if (filters.enabledOnly && !config.enabled) {
        return false
      }
      
      // Check health status
      if (filters.healthyOnly && config.healthStatus !== 'healthy') {
        return false
      }
      
      // Check exclusion list
      if (filters.excludeProviders.includes(providerId)) {
        return false
      }
      
      // Check inclusion list (if specified, only include these)
      if (filters.includeProviders.length > 0 && !filters.includeProviders.includes(providerId)) {
        return false
      }
      
      return true
    })
  }

  /**
   * Sort providers by priority
   */
  private sortProvidersByPriority(providerIds: string[], order: 'asc' | 'desc'): string[] {
    return providerIds.sort((a, b) => {
      const configA = this.configs.get(a)
      const configB = this.configs.get(b)
      
      if (!configA || !configB) return 0
      
      const priorityA = configA.priority
      const priorityB = configB.priority
      
      return order === 'asc' ? priorityA - priorityB : priorityB - priorityA
    })
  }

  /**
   * Get comprehensive registry statistics
   */
  getStatistics(): RegistryStatistics {
    const factoryStats = this.factory.getStatistics()
    const totalProviders = this.configs.size
    const healthyProviders = Array.from(this.configs.values())
      .filter(config => config.healthStatus === 'healthy').length
    const unhealthyProviders = Array.from(this.configs.values())
      .filter(config => config.healthStatus === 'unhealthy').length
    
    const averageResponseTime = this.stats.totalRequests > 0 
      ? this.stats.totalResponseTime / this.stats.totalRequests 
      : 0
    
    const averageHealthCheckLatency = this.stats.healthChecks > 0
      ? this.stats.totalHealthCheckLatency / this.stats.healthChecks
      : 0
    
    return {
      ...factoryStats,
      activeProviders: totalProviders,
      healthyProviders,
      unhealthyProviders,
      providerConfigs: totalProviders,
      averageResponseTime,
      healthCheckStats: {
        totalChecks: this.stats.healthChecks,
        passedChecks: this.stats.healthChecksPassed,
        failedChecks: this.stats.healthChecksFailed,
        averageLatency: averageHealthCheckLatency
      }
    }
  }

  /**
   * Clear all cached instances and reset statistics
   */
  reset(): void {
    this.factory.clearAllInstances()
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      healthChecks: 0,
      healthChecksPassed: 0,
      healthChecksFailed: 0,
      totalHealthCheckLatency: 0
    }
    this.logger.info('Registry reset completed')
  }

  /**
   * Shutdown the registry and cleanup resources
   */
  shutdown(): void {
    this.stopHealthMonitoring()
    this.factory.clearAllInstances()
    this.configs.clear()
    this.logger.info('Provider registry shutdown completed')
  }
}