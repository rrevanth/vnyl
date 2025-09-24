import { ServiceToken } from './tokens'

export interface IDIContainer {
  register<T>(token: ServiceToken, factory: () => T): void
  registerSingleton<T>(token: ServiceToken, factory: () => T): void
  resolve<T>(token: ServiceToken): T
  isRegistered(token: ServiceToken): boolean
}

export class DIContainer implements IDIContainer {
  private services = new Map<ServiceToken, () => unknown>()
  private singletons = new Map<ServiceToken, unknown>()
  private singletonFactories = new Map<ServiceToken, () => unknown>()

  register<T>(token: ServiceToken, factory: () => T): void {
    this.services.set(token, factory)
  }

  registerSingleton<T>(token: ServiceToken, factory: () => T): void {
    this.singletonFactories.set(token, factory)
  }

  resolve<T>(token: ServiceToken): T {
    // Check if it's a singleton
    if (this.singletonFactories.has(token)) {
      if (!this.singletons.has(token)) {
        const factory = this.singletonFactories.get(token)!
        this.singletons.set(token, factory())
      }
      return this.singletons.get(token) as T
    }

    // Check if it's a regular service
    if (this.services.has(token)) {
      const factory = this.services.get(token)!
      return factory() as T
    }

    throw new Error(`Service not registered: ${token.toString()}`)
  }

  isRegistered(token: ServiceToken): boolean {
    return this.services.has(token) || this.singletonFactories.has(token)
  }
}