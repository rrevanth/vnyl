/**
 * Service registry for dependency injection container
 * Manages service registration, resolution, and lifecycle
 */

import { ServiceToken, getTokenName } from './tokens'

export type ServiceLifetime = 'singleton' | 'scoped' | 'transient'

export interface ServiceDescriptor<T = any> {
  token: ServiceToken
  factory: (...args: any[]) => T
  lifetime: ServiceLifetime
  dependencies?: ServiceToken[]
  instance?: T
  isInitialized?: boolean
}

export interface ServiceRegistrationOptions {
  lifetime?: ServiceLifetime
  dependencies?: ServiceToken[]
  tags?: string[]
}

export class ServiceRegistry {
  private services = new Map<ServiceToken, ServiceDescriptor>()
  private resolutionStack = new Set<ServiceToken>()
  private enableLogging: boolean

  constructor(enableLogging = __DEV__) {
    this.enableLogging = enableLogging
  }

  /**
   * Register a service with the container
   */
  register<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    options: ServiceRegistrationOptions = {}
  ): void {
    const { lifetime = 'singleton', dependencies = [] } = options

    if (this.services.has(token)) {
      if (this.enableLogging) {
        console.warn(`Service ${getTokenName(token)} is already registered. Overwriting.`)
      }
    }

    const descriptor: ServiceDescriptor<T> = {
      token,
      factory,
      lifetime,
      dependencies,
      isInitialized: false,
    }

    this.services.set(token, descriptor)

    if (this.enableLogging) {
      console.log(`Registered service: ${getTokenName(token)} (${lifetime})`)
    }
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    dependencies?: ServiceToken[]
  ): void {
    this.register(token, factory, { lifetime: 'singleton', dependencies })
  }

  /**
   * Register a scoped service
   */
  registerScoped<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    dependencies?: ServiceToken[]
  ): void {
    this.register(token, factory, { lifetime: 'scoped', dependencies })
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(
    token: ServiceToken,
    factory: (...args: any[]) => T,
    dependencies?: ServiceToken[]
  ): void {
    this.register(token, factory, { lifetime: 'transient', dependencies })
  }

  /**
   * Register an instance directly as a singleton
   */
  registerInstance<T>(token: ServiceToken, instance: T): void {
    const descriptor: ServiceDescriptor<T> = {
      token,
      factory: () => instance,
      lifetime: 'singleton',
      dependencies: [],
      instance,
      isInitialized: true,
    }

    this.services.set(token, descriptor)

    if (this.enableLogging) {
      console.log(`Registered instance: ${getTokenName(token)}`)
    }
  }

  /**
   * Resolve a service by token
   */
  resolve<T>(token: ServiceToken): T {
    const descriptor = this.services.get(token)
    if (!descriptor) {
      throw new Error(`Service not registered: ${getTokenName(token)}`)
    }

    // Check for circular dependencies
    if (this.resolutionStack.has(token)) {
      const stackArray = Array.from(this.resolutionStack).map(getTokenName)
      throw new Error(
        `Circular dependency detected: ${stackArray.join(' -> ')} -> ${getTokenName(token)}`
      )
    }

    try {
      this.resolutionStack.add(token)
      return this.createInstance(descriptor)
    } finally {
      this.resolutionStack.delete(token)
    }
  }

  /**
   * Try to resolve a service, return null if not registered
   */
  tryResolve<T>(token: ServiceToken): T | null {
    try {
      return this.resolve<T>(token)
    } catch (error) {
      if (this.enableLogging) {
        console.warn(`Failed to resolve service ${getTokenName(token)}:`, error)
      }
      return null
    }
  }

  /**
   * Check if a service is registered
   */
  isRegistered(token: ServiceToken): boolean {
    return this.services.has(token)
  }

  /**
   * Get all registered service tokens
   */
  getRegisteredTokens(): ServiceToken[] {
    return Array.from(this.services.keys())
  }

  /**
   * Get service descriptor
   */
  getDescriptor(token: ServiceToken): ServiceDescriptor | undefined {
    return this.services.get(token)
  }

  /**
   * Unregister a service
   */
  unregister(token: ServiceToken): boolean {
    const descriptor = this.services.get(token)
    if (descriptor) {
      // Clean up singleton instance if it has cleanup method
      if (descriptor.instance && typeof descriptor.instance === 'object') {
        const instance = descriptor.instance as any
        if (typeof instance.destroy === 'function') {
          try {
            instance.destroy()
          } catch (error) {
            console.warn(`Error destroying service ${getTokenName(token)}:`, error)
          }
        }
      }

      this.services.delete(token)
      
      if (this.enableLogging) {
        console.log(`Unregistered service: ${getTokenName(token)}`)
      }
      
      return true
    }
    return false
  }

  /**
   * Clear all services
   */
  clear(): void {
    // Clean up all singleton instances
    this.services.forEach((descriptor, token) => {
      if (descriptor.instance && typeof descriptor.instance === 'object') {
        const instance = descriptor.instance as any
        if (typeof instance.destroy === 'function') {
          try {
            instance.destroy()
          } catch (error) {
            console.warn(`Error destroying service ${getTokenName(token)}:`, error)
          }
        }
      }
    })

    this.services.clear()
    this.resolutionStack.clear()
    
    if (this.enableLogging) {
      console.log('All services cleared')
    }
  }

  /**
   * Get service statistics
   */
  getStats(): {
    totalServices: number
    singletonServices: number
    scopedServices: number
    transientServices: number
    initializedSingletons: number
  } {
    const descriptors = Array.from(this.services.values())
    
    return {
      totalServices: descriptors.length,
      singletonServices: descriptors.filter(d => d.lifetime === 'singleton').length,
      scopedServices: descriptors.filter(d => d.lifetime === 'scoped').length,
      transientServices: descriptors.filter(d => d.lifetime === 'transient').length,
      initializedSingletons: descriptors.filter(d => d.lifetime === 'singleton' && d.isInitialized).length,
    }
  }

  /**
   * Validate service registrations
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    this.services.forEach((descriptor, token) => {
      // Check if all dependencies are registered
      descriptor.dependencies?.forEach(depToken => {
        if (!this.services.has(depToken)) {
          errors.push(
            `Service ${getTokenName(token)} depends on unregistered service ${getTokenName(depToken)}`
          )
        }
      })

      // Check for self-dependency
      if (descriptor.dependencies?.includes(token)) {
        errors.push(`Service ${getTokenName(token)} has a self-dependency`)
      }
    })

    // Check for circular dependencies
    this.services.forEach((_, token) => {
      try {
        this.checkCircularDependencies(token, new Set())
      } catch (error) {
        if (error instanceof Error && error.message.includes('Circular dependency')) {
          errors.push(error.message)
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Initialize all singleton services
   */
  initializeAll(): void {
    const singletonTokens = Array.from(this.services.entries())
      .filter(([_, descriptor]) => descriptor.lifetime === 'singleton')
      .map(([token]) => token)

    singletonTokens.forEach(token => {
      try {
        this.resolve(token)
      } catch (error) {
        console.error(`Failed to initialize singleton service ${getTokenName(token)}:`, error)
      }
    })

    if (this.enableLogging) {
      console.log(`Initialized ${singletonTokens.length} singleton services`)
    }
  }

  // Private helper methods
  private createInstance<T>(descriptor: ServiceDescriptor<T>): T {
    switch (descriptor.lifetime) {
      case 'singleton':
        if (descriptor.instance && descriptor.isInitialized) {
          return descriptor.instance
        }
        descriptor.instance = this.createServiceInstance(descriptor)
        descriptor.isInitialized = true
        return descriptor.instance

      case 'scoped':
        // For now, scoped behaves like singleton
        // In a full implementation, this would be tied to a scope (e.g., request scope)
        if (descriptor.instance && descriptor.isInitialized) {
          return descriptor.instance
        }
        descriptor.instance = this.createServiceInstance(descriptor)
        descriptor.isInitialized = true
        return descriptor.instance

      case 'transient':
        return this.createServiceInstance(descriptor)

      default:
        throw new Error(`Unknown service lifetime: ${descriptor.lifetime}`)
    }
  }

  private createServiceInstance<T>(descriptor: ServiceDescriptor<T>): T {
    try {
      const dependencies = descriptor.dependencies?.map(depToken => this.resolve(depToken)) || []
      const instance = descriptor.factory(...dependencies)

      if (this.enableLogging) {
        console.log(`Created instance: ${getTokenName(descriptor.token)}`)
      }

      return instance
    } catch (error) {
      throw new Error(
        `Failed to create instance of ${getTokenName(descriptor.token)}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  private checkCircularDependencies(token: ServiceToken, visited: Set<ServiceToken>): void {
    if (visited.has(token)) {
      const cycle = Array.from(visited).map(getTokenName).join(' -> ')
      throw new Error(`Circular dependency detected: ${cycle} -> ${getTokenName(token)}`)
    }

    const descriptor = this.services.get(token)
    if (!descriptor) return

    visited.add(token)

    descriptor.dependencies?.forEach(depToken => {
      this.checkCircularDependencies(depToken, new Set(visited))
    })

    visited.delete(token)
  }
}