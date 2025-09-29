/**
 * Catalog State Service
 * 
 * Manages catalog UI state through Legend State with clean interface for domain layer.
 * Provides proper separation between domain logic and presentation state management.
 * Follows CLEAN architecture by exposing domain-friendly interfaces.
 */

import { catalogStore$, catalogActions, catalogComputed } from '@/src/presentation/shared/stores/catalog-store'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Interface for catalog state management service
 * Domain layer uses this interface without knowing about Legend State
 */
export interface ICatalogStateService {
  /** Reset all catalog state */
  reset(): void
  
  /** Set loading state */
  setLoading(loading: boolean): void
  
  /** Set error state */
  setError(error: string | null): void
  
  /** Clear any errors */
  clearError(): void
  
  /** Set refreshing state */
  setRefreshing(refreshing: boolean): void
  
  /** Update catalogs with provider statistics */
  updateCatalogs(catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }): void
  
  /** Add more items to a specific catalog */
  addItemsToCatalog(catalogId: string, newItems: CatalogItem[], newPagination: any): void
  
  /** Get current catalog state (read-only) */
  getCurrentState(): {
    catalogs: Catalog[]
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    hasData: boolean
  }
}

/**
 * Catalog State Service Implementation
 * Concrete implementation using Legend State
 */
export class CatalogStateService implements ICatalogStateService {
  reset(): void {
    catalogActions.reset()
  }

  setLoading(loading: boolean): void {
    catalogActions.setLoading(loading)
  }

  setError(error: string | null): void {
    catalogActions.setError(error)
  }

  clearError(): void {
    catalogActions.clearError()
  }

  setRefreshing(refreshing: boolean): void {
    catalogActions.setRefreshing(refreshing)
  }

  updateCatalogs(catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }): void {
    catalogActions.setCatalogs(catalogs, stats)
  }

  addItemsToCatalog(catalogId: string, newItems: CatalogItem[], newPagination: any): void {
    catalogActions.addMoreItemsToCatalog(catalogId, newItems, newPagination)
  }

  getCurrentState(): {
    catalogs: Catalog[]
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    hasData: boolean
  } {
    return {
      catalogs: catalogStore$.catalogs.get(),
      isLoading: catalogStore$.isLoading.get(),
      error: catalogStore$.error.get(),
      isEmpty: catalogComputed.isEmpty,
      hasData: catalogComputed.hasData
    }
  }
}

/**
 * Singleton instance for dependency injection
 */
export const catalogStateService = new CatalogStateService()