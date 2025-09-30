import { observable, batch } from '@legendapp/state'
import type { Observable } from '@legendapp/state'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'

/**
 * Interface for PersonDetail store state
 * Manages person detail screen state including enriched person item,
 * filmography catalogs, loading states, and UI state
 */
interface PersonDetailStoreState {
  /** Core enriched person item displayed on detail screen */
  enrichedPerson: PersonCatalogItem | null
  
  /** Filmography data as catalogs (Movies, TV Shows, As Director, etc.) */
  filmographyCatalogs: Catalog[]
  
  /** Loading state for enrichment process */
  isEnriching: boolean
  
  /** Loading state for loading more filmography items */
  isLoadingMoreFilmography: boolean
  
  /** Error message if any operation fails */
  error: string | null
  
  /** Whether biography section is expanded */
  expandedBiography: boolean
  
  /** Timestamp of last update for cache invalidation */
  lastUpdated: Date | null
}

/**
 * Initial state for PersonDetail store
 */
const initialState: PersonDetailStoreState = {
  enrichedPerson: null,
  filmographyCatalogs: [],
  isEnriching: false,
  isLoadingMoreFilmography: false,
  error: null,
  expandedBiography: false,
  lastUpdated: null
}

/**
 * PersonDetail Store - Manages state for person detail screen
 * 
 * Handles enriched person item, filmography catalogs, loading states,
 * and UI interactions following the same patterns as MediaDetailStore.
 * 
 * Key Features:
 * - Enriched person item management
 * - Filmography catalogs with infinite scrolling
 * - Loading state management
 * - Error handling
 * - UI state management (biography expansion)
 * - Performance optimized with batch operations
 */
class PersonDetailStore {
  /** Observable state */
  private readonly state: Observable<PersonDetailStoreState>

  constructor() {
    this.state = observable(initialState)
  }

  // CORE DATA ACTIONS

  /**
   * Set the main enriched person item
   * @param person - The enriched person catalog item to display
   */
  setEnrichedPerson = (person: PersonCatalogItem | null): void => {
    batch(() => {
      this.state.enrichedPerson.set(person)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Set filmography catalogs
   * @param catalogs - Array of filmography catalogs
   */
  setFilmographyCatalogs = (catalogs: Catalog[]): void => {
    batch(() => {
      this.state.filmographyCatalogs.set(catalogs)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  // INFINITE SCROLLING ACTIONS

  /**
   * Add more filmography items to existing catalog (infinite scroll)
   * @param catalogId - ID of the catalog to update
   * @param items - New items to add
   * @param pagination - Pagination metadata
   */
  addMoreFilmographyItems = (catalogId: string, items: any[], pagination: any): void => {
    batch(() => {
      const catalogs = this.state.filmographyCatalogs.get()
      const updatedCatalogs = catalogs.map(catalog => {
        if (catalog.id === catalogId) {
          return {
            ...catalog,
            items: [...catalog.items, ...items],
            pagination
          }
        }
        return catalog
      })
      
      this.state.filmographyCatalogs.set(updatedCatalogs)
      this.state.isLoadingMoreFilmography.set(false)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  // LOADING STATE ACTIONS

  /**
   * Set loading state for filmography infinite scroll
   * @param loading - Loading state
   */
  setLoadingMoreFilmography = (loading: boolean): void => {
    this.state.isLoadingMoreFilmography.set(loading)
  }

  /**
   * Set loading state for enrichment process
   * @param enriching - Enrichment loading state
   */
  setEnriching = (enriching: boolean): void => {
    this.state.isEnriching.set(enriching)
  }

  // ERROR MANAGEMENT ACTIONS

  /**
   * Set error message
   * @param error - Error message or null to clear
   */
  setError = (error: string | null): void => {
    this.state.error.set(error)
  }

  /**
   * Clear current error
   */
  clearError = (): void => {
    this.state.error.set(null)
  }

  // UI STATE ACTIONS

  /**
   * Set biography expansion state
   * @param expanded - Whether biography is expanded
   */
  setExpandedBiography = (expanded: boolean): void => {
    this.state.expandedBiography.set(expanded)
  }

  /**
   * Reset store to initial state
   */
  reset = (): void => {
    batch(() => {
      this.state.set(initialState)
    })
  }

  // SELECTORS

  /**
   * Get combined data state
   * @returns Object with enriched person and filmography catalogs
   */
  get dataState() {
    return {
      enrichedPerson: this.state.enrichedPerson.get(),
      filmographyCatalogs: this.state.filmographyCatalogs.get(),
      lastUpdated: this.state.lastUpdated.get()
    }
  }

  /**
   * Get combined loading states
   * @returns Object with all loading states
   */
  get loadingState() {
    return {
      isLoadingMoreFilmography: this.state.isLoadingMoreFilmography.get(),
      isEnriching: this.state.isEnriching.get(),
      isAnyLoading: this.state.isLoadingMoreFilmography.get() || 
                   this.state.isEnriching.get()
    }
  }

  /**
   * Get error state
   * @returns Current error message or null
   */
  get errorState() {
    return this.state.error.get()
  }

  /**
   * Get UI state
   * @returns Object with UI state values
   */
  get uiState() {
    return {
      expandedBiography: this.state.expandedBiography.get()
    }
  }

  /**
   * Get filmography-specific state and loading
   * @returns Object with filmography catalogs and loading state
   */
  get filmographyState() {
    return {
      catalogs: this.state.filmographyCatalogs.get(),
      isLoading: this.state.isLoadingMoreFilmography.get(),
      hasData: this.state.filmographyCatalogs.get().length > 0
    }
  }

  // OBSERVABLE GETTERS FOR COMPONENTS

  /**
   * Get enriched person observable for component subscription
   */
  get enrichedPerson$() {
    return this.state.enrichedPerson
  }

  /**
   * Get filmography catalogs observable for component subscription
   */
  get filmographyCatalogs$() {
    return this.state.filmographyCatalogs
  }

  /**
   * Get filmography loading state observable for component subscription
   */
  get isLoadingMoreFilmography$() {
    return this.state.isLoadingMoreFilmography
  }

  /**
   * Get enriching state observable for component subscription
   */
  get isEnriching$() {
    return this.state.isEnriching
  }

  /**
   * Get error observable for component subscription
   */
  get error$() {
    return this.state.error
  }

  /**
   * Get expanded biography observable for component subscription
   */
  get expandedBiography$() {
    return this.state.expandedBiography
  }

  // UTILITY METHODS

  /**
   * Find filmography catalog by ID
   * @param catalogId - Catalog ID to find
   * @returns Catalog or undefined if not found
   */
  findFilmographyCatalog = (catalogId: string): Catalog | undefined => {
    return this.state.filmographyCatalogs.get().find(catalog => catalog.id === catalogId)
  }

  /**
   * Check if more filmography items can be loaded for a catalog
   * @param catalogId - Catalog ID to check
   * @returns Boolean indicating if more items can be loaded
   */
  canLoadMoreFilmography = (catalogId: string): boolean => {
    const catalog = this.findFilmographyCatalog(catalogId)
    if (!catalog?.pagination) return false
    
    const { page, totalPages } = catalog.pagination
    return page < (totalPages ?? Infinity) && !this.state.isLoadingMoreFilmography.get()
  }

  // DEBUGGING UTILITIES

  /**
   * Get debug information about store state
   * @returns Debug information object
   */
  getDebugInfo = () => {
    const state = this.state.get()
    return {
      hasEnrichedPerson: !!state.enrichedPerson,
      filmographyCatalogsCount: state.filmographyCatalogs.length,
      loadingStates: {
        isLoadingMoreFilmography: state.isLoadingMoreFilmography,
        isEnriching: state.isEnriching
      },
      uiState: {
        expandedBiography: state.expandedBiography
      },
      error: state.error,
      lastUpdated: state.lastUpdated
    }
  }

  /**
   * Get performance metrics
   * @returns Performance metrics object
   */
  getPerformanceMetrics = () => {
    const state = this.state.get()
    
    const totalFilmographyItems = state.filmographyCatalogs.reduce(
      (sum, catalog) => sum + catalog.items.length, 
      0
    )

    return {
      totalFilmographyItems,
      filmographyCatalogsCount: state.filmographyCatalogs.length,
      memoryFootprint: {
        enrichedPerson: state.enrichedPerson ? 1 : 0,
        totalItems: totalFilmographyItems
      }
    }
  }
}

/**
 * Export singleton instance of PersonDetailStore
 */
export const personDetailStore = new PersonDetailStore()

/**
 * Export store actions following established store pattern
 */
export const personDetailActions = {
  // Core data actions
  setEnrichedPerson: personDetailStore.setEnrichedPerson,
  setFilmographyCatalogs: personDetailStore.setFilmographyCatalogs,
  
  // Infinite scrolling actions
  addMoreFilmographyItems: personDetailStore.addMoreFilmographyItems,
  
  // Loading state actions
  setLoadingMoreFilmography: personDetailStore.setLoadingMoreFilmography,
  setEnriching: personDetailStore.setEnriching,
  
  // Error management actions
  setError: personDetailStore.setError,
  clearError: personDetailStore.clearError,
  
  // UI state actions
  setExpandedBiography: personDetailStore.setExpandedBiography,
  
  // Utility actions
  reset: personDetailStore.reset
}

/**
 * Export store selectors following established store pattern
 */
export const personDetailSelectors = {
  // Core data selectors
  dataState: personDetailStore.dataState,
  loadingState: personDetailStore.loadingState,
  errorState: personDetailStore.errorState,
  uiState: personDetailStore.uiState,
  
  // Specific data selectors
  filmographyState: personDetailStore.filmographyState,
  
  // Individual item selectors (computed getter functions)
  enrichedPerson: {
    get: () => personDetailStore.enrichedPerson$.get()
  },
  filmographyCatalogs: {
    get: () => personDetailStore.filmographyCatalogs$.get()
  },
  expandedBiography: {
    get: () => personDetailStore.expandedBiography$.get()
  },
  error: {
    get: () => personDetailStore.error$.get()
  },
  
  // Loading state selectors
  isLoadingMoreFilmography: {
    get: () => personDetailStore.isLoadingMoreFilmography$.get()
  },
  isEnriching: {
    get: () => personDetailStore.isEnriching$.get()
  },
  
  // Utility selectors
  findFilmographyCatalog: personDetailStore.findFilmographyCatalog,
  canLoadMoreFilmography: personDetailStore.canLoadMoreFilmography
}

/**
 * Export store class for dependency injection
 */
export { PersonDetailStore }

/**
 * Export types for use in components
 */
export type { PersonDetailStoreState }