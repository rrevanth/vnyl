/**
 * Catalog Store - Legend State Store for Catalog Management
 * 
 * Manages catalog data from all registered providers with reactive updates.
 * Provides loading states, error handling, and data refresh capabilities.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import { observable } from '@legendapp/state'
import type { 
  GetAllCatalogsResult, 
  ProviderCatalogGroup 
} from '@/src/domain/usecases/get-all-catalogs.usecase'
import type { Catalog } from '@/src/domain/entities/provider-capabilities.entity'

/**
 * Catalog loading state
 */
export type CatalogLoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Catalog store state interface
 */
export interface CatalogStoreState {
  // Loading state
  loadingState: CatalogLoadingState
  isLoading: boolean
  lastUpdated: Date | null
  
  // Data
  providerGroups: ProviderCatalogGroup[]
  totalCatalogs: number
  totalProviders: number
  healthyProviders: number
  
  // Error handling
  errors: {
    providerId: string
    providerName: string
    error: string
    isHealthy: boolean
  }[]
  hasErrors: boolean
  
  // Performance metrics
  loadingTime: number
  
  // Filters and options
  filters: {
    contentTypes: string[]
    providers: string[]
    showEmptyCatalogs: boolean
  }
  
  // UI state
  expandedProviders: string[]
  selectedCatalog: string | null
}

/**
 * Initial store state
 */
const initialState: CatalogStoreState = {
  loadingState: 'idle',
  isLoading: false,
  lastUpdated: null,
  
  providerGroups: [],
  totalCatalogs: 0,
  totalProviders: 0,
  healthyProviders: 0,
  
  errors: [],
  hasErrors: false,
  
  loadingTime: 0,
  
  filters: {
    contentTypes: [],
    providers: [],
    showEmptyCatalogs: false
  },
  
  expandedProviders: [],
  selectedCatalog: null
}

/**
 * Catalog store observable
 */
export const catalogStore = observable<CatalogStoreState>(initialState)

/**
 * Catalog store actions
 */
export const catalogActions = {
  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    catalogStore.isLoading.set(isLoading)
    catalogStore.loadingState.set(isLoading ? 'loading' : 'idle')
  },

  /**
   * Set catalog data from use case result
   */
  setCatalogData: (result: GetAllCatalogsResult) => {
    catalogStore.providerGroups.set(result.providerGroups)
    catalogStore.totalCatalogs.set(result.totalCatalogs)
    catalogStore.totalProviders.set(result.totalProviders)
    catalogStore.healthyProviders.set(result.healthyProviders)
    catalogStore.errors.set(result.errors)
    catalogStore.hasErrors.set(result.errors.length > 0)
    catalogStore.loadingTime.set(result.loadingTime)
    catalogStore.lastUpdated.set(new Date())
    catalogStore.loadingState.set('success')
    catalogStore.isLoading.set(false)
  },

  /**
   * Set error state
   */
  setError: (error: string) => {
    catalogStore.loadingState.set('error')
    catalogStore.isLoading.set(false)
    catalogStore.errors.set([{
      providerId: 'system',
      providerName: 'System',
      error,
      isHealthy: false
    }])
    catalogStore.hasErrors.set(true)
  },

  /**
   * Update filters
   */
  updateFilters: (filters: Partial<CatalogStoreState['filters']>) => {
    Object.keys(filters).forEach(key => {
      const filterKey = key as keyof CatalogStoreState['filters']
      if (filters[filterKey] !== undefined) {
        (catalogStore.filters[filterKey] as any).set(filters[filterKey])
      }
    })
  },

  /**
   * Toggle provider expansion
   */
  toggleProviderExpansion: (providerId: string) => {
    const expandedProviders = catalogStore.expandedProviders.peek()
    const isExpanded = expandedProviders.includes(providerId)
    
    if (isExpanded) {
      catalogStore.expandedProviders.set(
        expandedProviders.filter(id => id !== providerId)
      )
    } else {
      catalogStore.expandedProviders.set([...expandedProviders, providerId])
    }
  },

  /**
   * Set selected catalog
   */
  setSelectedCatalog: (catalogId: string | null) => {
    catalogStore.selectedCatalog.set(catalogId)
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    catalogStore.set(initialState)
  },

  /**
   * Clear errors
   */
  clearErrors: () => {
    catalogStore.errors.set([])
    catalogStore.hasErrors.set(false)
  }
}

/**
 * Computed values for easier access
 */
export const catalogComputed = {
  /**
   * Get catalogs filtered by current filters
   */
  getFilteredCatalogs: (): Catalog[] => {
    const state = catalogStore.peek()
    const { contentTypes, providers, showEmptyCatalogs } = state.filters
    
    let catalogs: Catalog[] = []
    
    // Collect all catalogs from provider groups
    state.providerGroups.forEach(group => {
      // Filter by provider if specified
      if (providers.length > 0 && !providers.includes(group.providerId)) {
        return
      }
      
      group.catalogs.forEach(catalog => {
        // Filter by content type if specified
        if (contentTypes.length > 0 && !contentTypes.includes(catalog.type)) {
          return
        }
        
        // Filter empty catalogs if not requested
        if (!showEmptyCatalogs && (catalog.totalItems === 0 || catalog.items.length === 0)) {
          return
        }
        
        catalogs.push(catalog)
      })
    })
    
    return catalogs
  },

  /**
   * Get catalogs grouped by content type
   */
  getCatalogsByContentType: (): Record<string, Catalog[]> => {
    const catalogs = catalogComputed.getFilteredCatalogs()
    const grouped: Record<string, Catalog[]> = {}
    
    catalogs.forEach(catalog => {
      if (!grouped[catalog.type]) {
        grouped[catalog.type] = []
      }
      grouped[catalog.type].push(catalog)
    })
    
    return grouped
  },

  /**
   * Get unique content types from available catalogs
   */
  getAvailableContentTypes: (): string[] => {
    const state = catalogStore.peek()
    const contentTypes = new Set<string>()
    
    state.providerGroups.forEach(group => {
      group.catalogs.forEach(catalog => {
        contentTypes.add(catalog.type)
      })
    })
    
    return Array.from(contentTypes).sort()
  },

  /**
   * Get provider statistics
   */
  getProviderStats: () => {
    const state = catalogStore.peek()
    
    return {
      total: state.totalProviders,
      healthy: state.healthyProviders,
      unhealthy: state.totalProviders - state.healthyProviders,
      withErrors: state.errors.length,
      avgResponseTime: state.providerGroups.length > 0
        ? state.providerGroups.reduce((sum, group) => sum + group.responseTime, 0) / state.providerGroups.length
        : 0
    }
  }
}