/**
 * Catalog Store using Legend State
 * 
 * Single source of truth for catalog data with reactive UI updates.
 * Uses TanStack Query for API caching only, Legend State for UI state.
 */

import { observable, computed, batch } from '@legendapp/state'
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
   * Set catalogs (initial load or refresh) - batched for performance
   */
  setCatalogs: (catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }) => {
    batch(() => {
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
    })
  },

  /**
   * Add more items to a specific catalog (pagination) - batched for performance
   */
  addMoreItemsToCatalog: (catalogId: string, newItems: CatalogItem[], newPagination: any) => {
    // Find the catalog by ID or by catalog context type (flexible matching)
    const catalogIndex = catalogStore$.catalogs.peek().findIndex(cat => {
      return cat.id === catalogId || 
             cat.catalogContext?.catalogId === catalogId ||
             cat.catalogContext?.catalogType === catalogId.replace(/^catalog_/, '').replace(/_tmdb.*$/, '')
    })
    
    if (catalogIndex >= 0) {
      batch(() => {
        const catalog$ = catalogStore$.catalogs[catalogIndex]
        
        // Append new items efficiently without full re-render
        catalog$.items.push(...newItems)
        catalog$.pagination.set(newPagination)
        catalog$.updatedAt.set(new Date())
        
        // Update aggregate stats
        catalogStore$.totalItems.set(prev => prev + newItems.length)
        catalogStore$.hasMore.set(newPagination.hasMore)
        catalogStore$.lastUpdated.set(new Date())
      })
      
      console.log(`✅ Added ${newItems.length} items to catalog ${catalogId}`)
    } else {
      console.warn(`❌ Catalog not found for ID: ${catalogId}`)
    }
  },

  /**
   * Update a specific catalog completely - batched for performance
   */
  updateCatalog: (catalogId: string, updatedCatalog: Catalog) => {
    const catalogs = catalogStore$.catalogs.peek()
    const updatedCatalogs = catalogs.map(catalog => 
      catalog.id === catalogId ? updatedCatalog : catalog
    )

    batch(() => {
      catalogStore$.catalogs.set(updatedCatalogs)
      catalogStore$.totalItems.set(
        updatedCatalogs.reduce((sum, catalog) => sum + catalog.items.length, 0)
      )
      catalogStore$.hasMore.set(
        updatedCatalogs.some(catalog => catalog.pagination.hasMore)
      )
      catalogStore$.lastUpdated.set(new Date())
    })
  },

  /**
   * Find catalog by ID (non-reactive read)
   */
  getCatalogById: (catalogId: string): Catalog | undefined => {
    return catalogStore$.catalogs.peek().find(catalog => catalog.id === catalogId)
  },

  /**
   * Get catalogs by type (non-reactive read)
   */
  getCatalogsByType: (mediaType: string): Catalog[] => {
    return catalogStore$.catalogs.peek().filter(catalog => catalog.mediaType === mediaType)
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    catalogStore$.set(initialState)
  }
}

// Performance monitoring utilities
export const catalogPerformance = {
  /**
   * Get subscription count for debugging
   */
  getSubscriptionCount: () => {
    // This would need to be implemented with Legend State's internal APIs
    // For now, return a placeholder that could be implemented
    return 0
  },

  /**
   * Log current store state for debugging
   */
  logStoreState: () => {
    const state = {
      catalogsCount: catalogStore$.catalogs.peek().length,
      totalItems: catalogStore$.totalItems.peek(),
      isLoading: catalogStore$.isLoading.peek(),
      isLoadingMore: catalogStore$.isLoadingMore.peek(),
      refreshing: catalogStore$.refreshing.peek(),
      hasError: catalogStore$.error.peek() !== null,
      lastUpdated: catalogStore$.lastUpdated.peek()
    }
    console.log('📊 Catalog Store State:', state)
    return state
  }
}

// Selective state selectors for optimized component subscriptions
export const catalogSelectors = {
  /**
   * Select only essential loading state
   */
  loadingState: computed(() => ({
    isLoading: catalogStore$.isLoading.get(),
    isLoadingMore: catalogStore$.isLoadingMore.get(),
    refreshing: catalogStore$.refreshing.get()
  })),

  /**
   * Select only error state
   */
  errorState: computed(() => ({
    error: catalogStore$.error.get(),
    isError: catalogStore$.error.get() !== null
  })),

  /**
   * Select only data state
   */
  dataState: computed(() => ({
    catalogs: catalogStore$.catalogs.get(),
    totalCatalogs: catalogStore$.totalCatalogs.get(),
    totalItems: catalogStore$.totalItems.get(),
    hasMore: catalogStore$.hasMore.get(),
    isEmpty: catalogStore$.catalogs.get().length === 0,
    hasData: catalogStore$.catalogs.get().length > 0
  })),

  /**
   * Select only stats state
   */
  statsState: computed(() => ({
    successfulProviders: catalogStore$.successfulProviders.get(),
    totalProviders: catalogStore$.totalProviders.get(),
    lastUpdated: catalogStore$.lastUpdated.get()
  }))
}

// Reactive computed values for performance optimization
export const catalogComputed = {
  /**
   * Check if store is empty (reactive)
   */
  isEmpty: computed(() => catalogStore$.catalogs.get().length === 0),

  /**
   * Check if store has data (reactive)
   */
  hasData: computed(() => catalogStore$.catalogs.get().length > 0),

  /**
   * Check if there's an error (reactive)
   */
  isError: computed(() => catalogStore$.error.get() !== null),

  /**
   * Check if any catalog has more items to load (reactive)
   */
  hasMoreItems: computed(() => catalogStore$.catalogs.get().some(catalog => catalog.pagination.hasMore)),

  /**
   * Get catalogs count (reactive)
   */
  catalogsCount: computed(() => catalogStore$.catalogs.get().length),

  /**
   * Get total items across all catalogs (reactive)
   */
  totalItemsComputed: computed(() => 
    catalogStore$.catalogs.get().reduce((sum, catalog) => sum + catalog.items.length, 0)
  ),

  /**
   * Check if currently loading (reactive)
   */
  isLoading: computed(() => 
    catalogStore$.isLoading.get() || catalogStore$.isLoadingMore.get() || catalogStore$.refreshing.get()
  ),

  /**
   * Get fresh catalogs (less than specified age)
   */
  getFreshCatalogs: (maxAgeSeconds: number): Catalog[] => {
    const cutoff = new Date(Date.now() - maxAgeSeconds * 1000)
    return catalogStore$.catalogs.peek().filter(catalog => 
      catalog.updatedAt > cutoff
    )
  }
}