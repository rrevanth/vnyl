/**
 * DI Container Hook - React Hook for Dependency Injection
 * 
 * Provides access to services from the DI container within React components.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import { useMemo } from 'react'
import { getContainer } from '@/src/infrastructure/app-container'
import { ServiceToken } from '@/src/infrastructure/di/tokens'

/**
 * React hook for accessing services from the DI container
 * 
 * @param token - Service token to retrieve
 * @returns The service instance
 */
export function useDI<T>(token: ServiceToken): T {
  const service = useMemo(() => {
    try {
      const container = getContainer()
      return container.resolve<T>(token)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to get service '${token.toString()}' from DI container:`, errorMessage)
      throw new Error(`Service '${token.toString()}' not found in DI container`)
    }
  }, [token])

  return service
}

/**
 * React hook for conditionally accessing services from the DI container
 * 
 * @param token - Service token to retrieve
 * @returns The service instance or undefined
 */
export function useOptionalDI<T>(token: ServiceToken): T | undefined {
  const service = useMemo(() => {
    try {
      const container = getContainer()
      if (container.isRegistered(token)) {
        return container.resolve<T>(token)
      }
      return undefined
    } catch (error) {
      console.warn(`Failed to get optional service '${token.toString()}' from DI container:`, error)
      return undefined
    }
  }, [token])

  return service
}

/**
 * React hook for checking if a service is registered in the DI container
 * 
 * @param token - Service token to check
 * @returns True if the service is registered
 */
export function useServiceExists(token: ServiceToken): boolean {
  const exists = useMemo(() => {
    try {
      const container = getContainer()
      return container.isRegistered(token)
    } catch (error) {
      console.warn(`Failed to check service existence '${token.toString()}':`, error)
      return false
    }
  }, [token])

  return exists
}

/**
 * React hook factory for creating service-specific hooks
 * 
 * @param token - Service token
 * @returns Hook function for the specific service
 */
export function createServiceHook<T>(token: ServiceToken) {
  return (): T => useDI<T>(token)
}