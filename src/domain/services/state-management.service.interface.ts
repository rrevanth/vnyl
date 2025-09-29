/**
 * State Management Service Interface
 * 
 * Domain-level interface for state management without knowledge of specific UI libraries.
 * This allows the domain layer to manage state without depending on presentation concerns.
 */

import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Generic state management service interface for domain layer
 * Implementation will be in infrastructure layer using Legend State or other solutions
 */
export interface IStateManagementService {
  /** Reset all state */
  reset(): void
  
  /** Set loading state */
  setLoading(loading: boolean): void
  
  /** Set error state */
  setError(error: string | null): void
  
  /** Clear any errors */
  clearError(): void
  
  /** Set refreshing state */
  setRefreshing(refreshing: boolean): void
  
  /** Update state with new data */
  updateData(data: any): void
  
  /** Get current state (read-only) */
  getCurrentState(): any
}

/**
 * Catalog-specific state management interface
 * Extends the generic interface with catalog-specific operations
 */
export interface ICatalogStateManagementService extends IStateManagementService {
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