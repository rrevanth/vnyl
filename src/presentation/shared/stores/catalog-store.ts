/**
 * Catalog Store using Legend State
 * 
 * Single source of truth for catalog data with reactive UI updates.
 * Uses TanStack Query for API caching only, Legend State for UI state.
 */

import { observable } from '@legendapp/state'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

interface CatalogStoreState {
  catalogs: Catalog[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  refreshing: boolean
  totalCatalogs: number
  totalItems: number
  successfulProviders: number
  totalProviders: number
  lastUpdated: Date | null
}

const initialState: CatalogStoreState = {
  catalogs: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: false,
  refreshing: false,
  totalCatalogs: 0,
  totalItems: 0,
  successfulProviders: 0,
  totalProviders: 0,
  lastUpdated: null
}

// Create the observable store
export const catalogStore$ = observable<CatalogStoreState>(initialState)

// Store actions
export const catalogActions = {
  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => {
    catalogStore$.isLoading.set(loading)
  },

  /**
   * Set loading more state
   */
  setLoadingMore: (loading: boolean) => {
    catalogStore$.isLoadingMore.set(loading)
  },

  /**
   * Set refreshing state
   */
  setRefreshing: (refreshing: boolean) => {
    catalogStore$.refreshing.set(refreshing)
  },

  /**
   * Set error
   */
  setError: (error: string | null) => {
    catalogStore$.error.set(error)
  },

  /**
   * Clear error
   */
  clearError: () => {
    catalogStore$.error.set(null)
  },

  /**
   * Set catalogs (initial load or refresh)
   */
  setCatalogs: (catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }) => {
    catalogStore$.catalogs.set(catalogs)
    catalogStore$.totalCatalogs.set(catalogs.length)
    catalogStore$.totalItems.set(
      catalogs.reduce((sum, catalog) => sum + catalog.items.length, 0)
    )
    catalogStore$.hasMore.set(
      catalogs.some(catalog => catalog.pagination.hasMore)
    )
    catalogStore$.lastUpdated.set(new Date())
    
    if (stats) {
      catalogStore$.successfulProviders.set(stats.successfulProviders)
      catalogStore$.totalProviders.set(stats.totalProviders)
    }
  },

  /**
   * Add more items to a specific catalog (pagination) - efficient update
   */
  addMoreItemsToCatalog: (catalogId: string, newItems: CatalogItem[], newPagination: any) => {
    // Find the catalog by ID or by catalog context type (flexible matching)
    const catalogIndex = catalogStore$.catalogs.get().findIndex(cat => {
      return cat.id === catalogId || 
             cat.catalogContext?.catalogId === catalogId ||
             cat.catalogContext?.catalogType === catalogId.replace(/^catalog_/, '').replace(/_tmdb.*$/, '')
    })
    
    if (catalogIndex >= 0) {
      const catalog$ = catalogStore$.catalogs[catalogIndex]
      
      // Append new items efficiently without full re-render
      catalog$.items.push(...newItems)
      catalog$.pagination.set(newPagination)
      catalog$.updatedAt.set(new Date())
      
      // Update aggregate stats
      catalogStore$.totalItems.set(prev => prev + newItems.length)
      catalogStore$.hasMore.set(newPagination.hasMore)
      catalogStore$.lastUpdated.set(new Date())
      
      console.log(`✅ Added ${newItems.length} items to catalog ${catalogId}`)
    } else {
      console.warn(`❌ Catalog not found for ID: ${catalogId}`)
    }
  },

  /**
   * Update a specific catalog completely
   */
  updateCatalog: (catalogId: string, updatedCatalog: Catalog) => {
    const catalogs = catalogStore$.catalogs.get()
    const updatedCatalogs = catalogs.map(catalog => 
      catalog.id === catalogId ? updatedCatalog : catalog
    )

    catalogStore$.catalogs.set(updatedCatalogs)
    catalogStore$.totalItems.set(
      updatedCatalogs.reduce((sum, catalog) => sum + catalog.items.length, 0)
    )
    catalogStore$.hasMore.set(
      updatedCatalogs.some(catalog => catalog.pagination.hasMore)
    )
    catalogStore$.lastUpdated.set(new Date())
  },

  /**
   * Find catalog by ID
   */
  getCatalogById: (catalogId: string): Catalog | undefined => {
    return catalogStore$.catalogs.get().find(catalog => catalog.id === catalogId)
  },

  /**
   * Get catalogs by type
   */
  getCatalogsByType: (mediaType: string): Catalog[] => {
    return catalogStore$.catalogs.get().filter(catalog => catalog.mediaType === mediaType)
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    catalogStore$.set(initialState)
  }
}

// Computed values
export const catalogComputed = {
  /**
   * Check if store is empty
   */
  get isEmpty() {
    return catalogStore$.catalogs.get().length === 0
  },

  /**
   * Check if store has data
   */
  get hasData() {
    return catalogStore$.catalogs.get().length > 0
  },

  /**
   * Check if there's an error
   */
  get isError() {
    return catalogStore$.error.get() !== null
  },

  /**
   * Get fresh catalogs (less than specified age)
   */
  getFreshCatalogs: (maxAgeSeconds: number): Catalog[] => {
    const cutoff = new Date(Date.now() - maxAgeSeconds * 1000)
    return catalogStore$.catalogs.get().filter(catalog => 
      catalog.updatedAt > cutoff
    )
  }
}