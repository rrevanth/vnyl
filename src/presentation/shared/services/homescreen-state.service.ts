/**
 * HomeScreen State Service
 * 
 * Manages homescreen UI state through Legend State with clean interface for domain layer.
 * Provides proper separation between domain logic and presentation state management.
 * Follows CLEAN architecture by exposing domain-friendly interfaces.
 */

import { homescreenStore$, homescreenActions, homescreenComputed } from '@/src/presentation/shared/stores/homescreen-store'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Interface for homescreen state management service
 * Domain layer uses this interface without knowing about Legend State
 */
export interface IHomescreenStateService {
  /** Reset all homescreen state */
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
  
  /** Get current homescreen state (read-only) */
  getCurrentState(): {
    catalogs: Catalog[]
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    hasData: boolean
  }
}

/**
 * HomeScreen State Service Implementation
 * Concrete implementation using Legend State
 */
export class HomescreenStateService implements IHomescreenStateService {
  reset(): void {
    homescreenActions.reset()
  }

  setLoading(loading: boolean): void {
    homescreenActions.setLoading(loading)
  }

  setError(error: string | null): void {
    homescreenActions.setError(error)
  }

  clearError(): void {
    homescreenActions.clearError()
  }

  setRefreshing(refreshing: boolean): void {
    homescreenActions.setRefreshing(refreshing)
  }

  updateCatalogs(catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }): void {
    homescreenActions.setCatalogs(catalogs, stats)
  }

  addItemsToCatalog(catalogId: string, newItems: CatalogItem[], newPagination: any): void {
    homescreenActions.addMoreItemsToCatalog(catalogId, newItems, newPagination)
  }

  getCurrentState(): {
    catalogs: Catalog[]
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    hasData: boolean
  } {
    return {
      catalogs: homescreenStore$.catalogs.get(),
      isLoading: homescreenStore$.isLoading.get(),
      error: homescreenStore$.error.get(),
      isEmpty: homescreenComputed.isEmpty,
      hasData: homescreenComputed.hasData
    }
  }
}

/**
 * Singleton instance for dependency injection
 */
export const homescreenStateService = new HomescreenStateService()