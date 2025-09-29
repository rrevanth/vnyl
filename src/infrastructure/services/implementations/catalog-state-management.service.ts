/**
 * Catalog State Management Service Implementation
 * 
 * Infrastructure layer implementation that bridges domain interface with presentation state management.
 * This service acts as an adapter between the domain layer and Legend State.
 */

import type { ICatalogStateManagementService } from '@/src/domain/services/state-management.service.interface'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { ICatalogStateService } from '@/src/presentation/shared/services/catalog-state.service'

/**
 * Infrastructure implementation of catalog state management
 * Adapts domain interface to presentation service
 */
export class CatalogStateManagementService implements ICatalogStateManagementService {
  constructor(
    private readonly presentationStateService: ICatalogStateService
  ) {}

  reset(): void {
    this.presentationStateService.reset()
  }

  setLoading(loading: boolean): void {
    this.presentationStateService.setLoading(loading)
  }

  setError(error: string | null): void {
    this.presentationStateService.setError(error)
  }

  clearError(): void {
    this.presentationStateService.clearError()
  }

  setRefreshing(refreshing: boolean): void {
    this.presentationStateService.setRefreshing(refreshing)
  }

  updateData(data: any): void {
    // Generic implementation - for catalog-specific, use updateCatalogs
    if (Array.isArray(data) && data.length > 0 && 'items' in data[0]) {
      this.updateCatalogs(data as Catalog[])
    }
  }

  updateCatalogs(catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }): void {
    this.presentationStateService.updateCatalogs(catalogs, stats)
  }

  addItemsToCatalog(catalogId: string, newItems: CatalogItem[], newPagination: any): void {
    this.presentationStateService.addItemsToCatalog(catalogId, newItems, newPagination)
  }

  getCurrentState(): {
    catalogs: Catalog[]
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    hasData: boolean
  } {
    return this.presentationStateService.getCurrentState()
  }
}