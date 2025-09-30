/**
 * HomeScreen Store using Legend State
 * 
 * Single source of truth for homescreen data with reactive UI updates.
 * Uses TanStack Query for API caching only, Legend State for UI state.
 */

import { observable, computed, batch } from '@legendapp/state'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

interface HomescreenStoreState {
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
  // Selected catalog item for navigation to media detail
  selectedItem: CatalogItem | null
}

const initialState: HomescreenStoreState = {
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
  lastUpdated: null,
  selectedItem: null
}

// Create the observable store
export const homescreenStore$ = observable<HomescreenStoreState>(initialState)

// Store actions
export const homescreenActions = {
  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => {
    homescreenStore$.isLoading.set(loading)
  },

  /**
   * Set loading more state
   */
  setLoadingMore: (loading: boolean) => {
    homescreenStore$.isLoadingMore.set(loading)
  },

  /**
   * Set refreshing state
   */
  setRefreshing: (refreshing: boolean) => {
    homescreenStore$.refreshing.set(refreshing)
  },

  /**
   * Set error
   */
  setError: (error: string | null) => {
    homescreenStore$.error.set(error)
  },

  /**
   * Clear error
   */
  clearError: () => {
    homescreenStore$.error.set(null)
  },

  /**
   * Set selected catalog item for navigation
   */
  setSelectedItem: (item: CatalogItem | null) => {
    homescreenStore$.selectedItem.set(item)
  },

  /**
   * Set catalogs (initial load or refresh) - batched for performance
   */
  setCatalogs: (catalogs: Catalog[], stats?: {
    successfulProviders: number
    totalProviders: number
  }) => {
    batch(() => {
      homescreenStore$.catalogs.set(catalogs)
      homescreenStore$.totalCatalogs.set(catalogs.length)
      homescreenStore$.totalItems.set(
        catalogs.reduce((sum, catalog) => sum + catalog.items.length, 0)
      )
      homescreenStore$.hasMore.set(
        catalogs.some(catalog => catalog.pagination.hasMore)
      )
      homescreenStore$.lastUpdated.set(new Date())
      
      if (stats) {
        homescreenStore$.successfulProviders.set(stats.successfulProviders)
        homescreenStore$.totalProviders.set(stats.totalProviders)
      }
    })
  },

  /**
   * Add more items to a specific catalog (pagination) - batched for performance
   */
  addMoreItemsToCatalog: (catalogId: string, newItems: CatalogItem[], newPagination: any) => {
    // Find the catalog by ID or by catalog context type (flexible matching)
    const catalogs = homescreenStore$.catalogs.peek()
    
    const catalogIndex = catalogs.findIndex(cat => {
      return cat.id === catalogId || 
             cat.catalogContext?.catalogId === catalogId ||
             cat.catalogContext?.catalogType === catalogId.replace(/^catalog_/, '').replace(/_tmdb.*$/, '')
    })
    
    if (catalogIndex >= 0) {
      batch(() => {
        const catalog$ = homescreenStore$.catalogs[catalogIndex]
        
        // Append new items efficiently without full re-render
        catalog$.items.push(...newItems)
        catalog$.pagination.set(newPagination)
        catalog$.updatedAt.set(new Date())
        
        // Update aggregate stats
        homescreenStore$.totalItems.set(prev => prev + newItems.length)
        homescreenStore$.hasMore.set(newPagination.hasMore)
        homescreenStore$.lastUpdated.set(new Date())
      })
    }
  },

  /**
   * Update a specific catalog completely - batched for performance
   */
  updateCatalog: (catalogId: string, updatedCatalog: Catalog) => {
    const catalogs = homescreenStore$.catalogs.peek()
    const updatedCatalogs = catalogs.map(catalog => 
      catalog.id === catalogId ? updatedCatalog : catalog
    )

    batch(() => {
      homescreenStore$.catalogs.set(updatedCatalogs)
      homescreenStore$.totalItems.set(
        updatedCatalogs.reduce((sum, catalog) => sum + catalog.items.length, 0)
      )
      homescreenStore$.hasMore.set(
        updatedCatalogs.some(catalog => catalog.pagination.hasMore)
      )
      homescreenStore$.lastUpdated.set(new Date())
    })
  },

  /**
   * Find catalog by ID (non-reactive read)
   */
  getCatalogById: (catalogId: string): Catalog | undefined => {
    return homescreenStore$.catalogs.peek().find(catalog => catalog.id === catalogId)
  },

  /**
   * Get catalogs by type (non-reactive read)
   */
  getCatalogsByType: (mediaType: string): Catalog[] => {
    return homescreenStore$.catalogs.peek().filter(catalog => catalog.mediaType === mediaType)
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    homescreenStore$.set(initialState)
  }
}

// Performance monitoring utilities
export const homescreenPerformance = {
  /**
   * Get subscription count for debugging
   */
  getSubscriptionCount: () => {
    // This would need to be implemented with Legend State's internal APIs
    // For now, return a placeholder that could be implemented
    return 0
  },

  /**
   * Get current store state for debugging
   */
  getStoreState: () => {
    return {
      catalogsCount: homescreenStore$.catalogs.peek().length,
      totalItems: homescreenStore$.totalItems.peek(),
      isLoading: homescreenStore$.isLoading.peek(),
      isLoadingMore: homescreenStore$.isLoadingMore.peek(),
      refreshing: homescreenStore$.refreshing.peek(),
      hasError: homescreenStore$.error.peek() !== null,
      lastUpdated: homescreenStore$.lastUpdated.peek()
    }
  }
}

// Selective state selectors for optimized component subscriptions
export const homescreenSelectors = {
  /**
   * Select only essential loading state
   */
  loadingState: computed(() => ({
    isLoading: homescreenStore$.isLoading.get(),
    isLoadingMore: homescreenStore$.isLoadingMore.get(),
    refreshing: homescreenStore$.refreshing.get()
  })),

  /**
   * Select only error state
   */
  errorState: computed(() => ({
    error: homescreenStore$.error.get(),
    isError: homescreenStore$.error.get() !== null
  })),

  /**
   * Select only data state
   */
  dataState: computed(() => ({
    catalogs: homescreenStore$.catalogs.get(),
    totalCatalogs: homescreenStore$.totalCatalogs.get(),
    totalItems: homescreenStore$.totalItems.get(),
    hasMore: homescreenStore$.hasMore.get(),
    isEmpty: homescreenStore$.catalogs.get().length === 0,
    hasData: homescreenStore$.catalogs.get().length > 0
  })),

  /**
   * Select only stats state
   */
  statsState: computed(() => ({
    successfulProviders: homescreenStore$.successfulProviders.get(),
    totalProviders: homescreenStore$.totalProviders.get(),
    lastUpdated: homescreenStore$.lastUpdated.get()
  })),

  /**
   * Select the currently selected catalog item for navigation
   */
  selectedItem: computed(() => homescreenStore$.selectedItem.get())
}

// Reactive computed values for performance optimization
export const homescreenComputed = {
  /**
   * Check if store is empty (reactive)
   */
  isEmpty: computed(() => homescreenStore$.catalogs.get().length === 0),

  /**
   * Check if store has data (reactive)
   */
  hasData: computed(() => homescreenStore$.catalogs.get().length > 0),

  /**
   * Check if there's an error (reactive)
   */
  isError: computed(() => homescreenStore$.error.get() !== null),

  /**
   * Check if any catalog has more items to load (reactive)
   */
  hasMoreItems: computed(() => homescreenStore$.catalogs.get().some(catalog => catalog.pagination.hasMore)),

  /**
   * Get catalogs count (reactive)
   */
  catalogsCount: computed(() => homescreenStore$.catalogs.get().length),

  /**
   * Get total items across all catalogs (reactive)
   */
  totalItemsComputed: computed(() => 
    homescreenStore$.catalogs.get().reduce((sum, catalog) => sum + catalog.items.length, 0)
  ),

  /**
   * Check if currently loading (reactive)
   */
  isLoading: computed(() => 
    homescreenStore$.isLoading.get() || homescreenStore$.isLoadingMore.get() || homescreenStore$.refreshing.get()
  ),

  /**
   * Get fresh catalogs (less than specified age)
   */
  getFreshCatalogs: (maxAgeSeconds: number): Catalog[] => {
    const cutoff = new Date(Date.now() - maxAgeSeconds * 1000)
    return homescreenStore$.catalogs.peek().filter(catalog => 
      catalog.updatedAt > cutoff
    )
  }
}