import { observable, batch } from '@legendapp/state'
import type { Observable } from '@legendapp/state'
import type { CatalogItem, EpisodeInfo } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { Season, SeasonMetadata } from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'

/**
 * Interface for MediaDetail store state
 * Manages media detail screen state including enriched media item,
 * people catalogs, recommendations, seasons, and UI state
 */
interface MediaDetailStoreState {
  /** Core enriched media item displayed on detail screen */
  enrichedItem: CatalogItem | null
  
  /** People data as catalogs (cast/crew) */
  peopleCatalogs: Catalog[]
  
  /** Recommendations data as catalogs */
  recommendationCatalogs: Catalog[]
  
  /** Seasons data (not catalogs - just season details) */
  seasonDetails: { seasons: Season[] } | null
  
  /** Progressive season loading state - All seasons info without episodes */
  seasonMetadata: SeasonMetadata[] | null
  
  /** Progressive season loading state - Loaded seasons with episodes mapped by season number */
  loadedSeasonsMap: Map<number, Season>
  
  /** Progressive season loading state - Flat list of all loaded episodes for efficient access */
  allLoadedEpisodes: EpisodeInfo[]
  
  /** Progressive season loading state - Currently visible season number */
  currentSeasonNumber: number
  
  /** Progressive season loading state - Which season is currently loading (null if none) */
  isLoadingSeasonNumber: number | null
  
  /** Progressive season loading state - Track last loaded season for infinite scroll */
  lastLoadedSeasonNumber: number
  
  /** Loading state for loading more people items */
  isLoadingMorePeople: boolean
  
  /** Loading state for loading more recommendation items */
  isLoadingMoreRecommendations: boolean
  
  /** Loading state for enrichment process */
  isEnriching: boolean
  
  /** Error message if any operation fails */
  error: string | null
  
  /** Currently selected season number for TV shows */
  selectedSeason: number
  
  /** Whether overview section is expanded */
  expandedOverview: boolean
  
  /** Timestamp of last update for cache invalidation */
  lastUpdated: Date | null
}

/**
 * Initial state for MediaDetail store
 */
const initialState: MediaDetailStoreState = {
  enrichedItem: null,
  peopleCatalogs: [],
  recommendationCatalogs: [],
  seasonDetails: null,
  seasonMetadata: null,
  loadedSeasonsMap: new Map<number, Season>(),
  allLoadedEpisodes: [],
  currentSeasonNumber: 1,
  isLoadingSeasonNumber: null,
  lastLoadedSeasonNumber: 0,
  isLoadingMorePeople: false,
  isLoadingMoreRecommendations: false,
  isEnriching: false,
  error: null,
  selectedSeason: 1,
  expandedOverview: false,
  lastUpdated: null
}

/**
 * MediaDetail Store - Manages state for media detail screen
 * 
 * Handles enriched media item, people catalogs, recommendations,
 * seasons data, loading states, and UI interactions.
 * 
 * Key Features:
 * - Enriched media item management
 * - People catalogs with infinite scrolling
 * - Recommendations catalogs with infinite scrolling
 * - Seasons data management
 * - Loading state management
 * - Error handling
 * - UI state management (season selection, overview expansion)
 * - Performance optimized with batch operations
 */
class MediaDetailStore {
  /** Observable state */
  private readonly state: Observable<MediaDetailStoreState>

  constructor() {
    this.state = observable(initialState)
  }

  // CORE DATA ACTIONS

  /**
   * Set the main enriched media item
   * @param item - The enriched catalog item to display
   */
  setEnrichedItem = (item: CatalogItem | null): void => {
    batch(() => {
      this.state.enrichedItem.set(item)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Set initial people catalogs (cast/crew)
   * @param catalogs - Array of people catalogs
   */
  setPeopleCatalogs = (catalogs: Catalog[]): void => {
    batch(() => {
      this.state.peopleCatalogs.set(catalogs)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Set initial recommendation catalogs
   * @param catalogs - Array of recommendation catalogs
   */
  setRecommendationCatalogs = (catalogs: Catalog[]): void => {
    batch(() => {
      this.state.recommendationCatalogs.set(catalogs)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Set seasons data for TV shows
   * @param details - Season details data
   */
  setSeasonDetails = (details: { seasons: Season[] } | null): void => {
    batch(() => {
      this.state.seasonDetails.set(details)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  // PROGRESSIVE SEASON LOADING ACTIONS

  /**
   * Set season metadata for progressive loading (seasons without episodes)
   * This is typically called first to show season overview before loading episodes
   * @param metadata - Array of season metadata without episodes
   */
  setSeasonMetadata = (metadata: SeasonMetadata[]): void => {
    batch(() => {
      this.state.seasonMetadata.set(metadata)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Add a loaded season with episodes to the progressive loading state
   * Updates both the loaded seasons map and the flat episodes list
   * @param season - Complete season with episodes to add
   */
  addLoadedSeason = (season: Season): void => {
    batch(() => {
      // Update loaded seasons map
      const currentMap = new Map(this.state.loadedSeasonsMap.get())
      currentMap.set(season.seasonNumber, season)
      this.state.loadedSeasonsMap.set(currentMap)
      
      // Update flat episodes list for efficient access
      const currentEpisodes = this.state.allLoadedEpisodes.get()
      const newEpisodes = [...currentEpisodes, ...season.episodes]
      this.state.allLoadedEpisodes.set(newEpisodes)
      
      // Update last loaded season number
      this.state.lastLoadedSeasonNumber.set(season.seasonNumber)
      
      // Clear loading state
      this.state.isLoadingSeasonNumber.set(null)
      
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Set the currently visible season number
   * Used for tracking which season the user is viewing
   * @param seasonNumber - Season number currently visible
   */
  setCurrentSeasonNumber = (seasonNumber: number): void => {
    this.state.currentSeasonNumber.set(seasonNumber)
  }

  /**
   * Set which season is currently loading episodes
   * Used to show loading indicators for specific seasons
   * @param seasonNumber - Season number being loaded, or null if none loading
   */
  setLoadingSeasonNumber = (seasonNumber: number | null): void => {
    this.state.isLoadingSeasonNumber.set(seasonNumber)
  }

  /**
   * Get the next unloaded season number for progressive loading
   * Returns the next season that hasn't been loaded yet, or null if all are loaded
   * @returns Next unloaded season number or null
   */
  getNextUnloadedSeasonNumber = (): number | null => {
    const metadata = this.state.seasonMetadata.get()
    const loadedMap = this.state.loadedSeasonsMap.get()
    
    if (!metadata) return null
    
    // Find first season that isn't loaded yet
    for (const season of metadata) {
      if (!loadedMap.has(season.seasonNumber)) {
        return season.seasonNumber
      }
    }
    
    return null
  }

  /**
   * Check if a specific season has been loaded with episodes
   * @param seasonNumber - Season number to check
   * @returns True if season is loaded with episodes
   */
  isSeasonLoaded = (seasonNumber: number): boolean => {
    return this.state.loadedSeasonsMap.get().has(seasonNumber)
  }

  /**
   * Find the first episode index for a given season in the flat episodes list
   * Useful for scrolling to specific seasons in a combined episodes view
   * @param seasonNumber - Season number to find first episode for
   * @returns Index of first episode for season, or -1 if not found
   */
  findFirstEpisodeIndexForSeason = (seasonNumber: number): number => {
    const allEpisodes = this.state.allLoadedEpisodes.get()
    return allEpisodes.findIndex(episode => episode.seasonNumber === seasonNumber)
  }

  // INFINITE SCROLLING ACTIONS

  /**
   * Add more people items to existing catalog (infinite scroll)
   * @param catalogId - ID of the catalog to update
   * @param items - New items to add
   * @param pagination - Pagination metadata
   */
  addMorePeopleItems = (catalogId: string, items: CatalogItem[], pagination: any): void => {
    batch(() => {
      const catalogs = this.state.peopleCatalogs.get()
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
      
      this.state.peopleCatalogs.set(updatedCatalogs)
      this.state.isLoadingMorePeople.set(false)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  /**
   * Add more recommendation items to existing catalog (infinite scroll)
   * @param catalogId - ID of the catalog to update
   * @param items - New items to add
   * @param pagination - Pagination metadata
   */
  addMoreRecommendationItems = (catalogId: string, items: CatalogItem[], pagination: any): void => {
    batch(() => {
      const catalogs = this.state.recommendationCatalogs.get()
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
      
      this.state.recommendationCatalogs.set(updatedCatalogs)
      this.state.isLoadingMoreRecommendations.set(false)
      this.state.lastUpdated.set(new Date())
      this.state.error.set(null)
    })
  }

  // LOADING STATE ACTIONS

  /**
   * Set loading state for people infinite scroll
   * @param loading - Loading state
   */
  setLoadingMorePeople = (loading: boolean): void => {
    this.state.isLoadingMorePeople.set(loading)
  }

  /**
   * Set loading state for recommendations infinite scroll
   * @param loading - Loading state
   */
  setLoadingMoreRecommendations = (loading: boolean): void => {
    this.state.isLoadingMoreRecommendations.set(loading)
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
   * Set selected season for TV shows
   * @param season - Season number
   */
  setSelectedSeason = (season: number): void => {
    this.state.selectedSeason.set(season)
  }

  /**
   * Set overview expansion state
   * @param expanded - Whether overview is expanded
   */
  setExpandedOverview = (expanded: boolean): void => {
    this.state.expandedOverview.set(expanded)
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
   * @returns Object with enriched item, catalogs, and seasons
   */
  get dataState() {
    return {
      enrichedItem: this.state.enrichedItem.get(),
      peopleCatalogs: this.state.peopleCatalogs.get(),
      recommendationCatalogs: this.state.recommendationCatalogs.get(),
      seasonDetails: this.state.seasonDetails.get(),
      lastUpdated: this.state.lastUpdated.get()
    }
  }

  /**
   * Get progressive season loading state
   * @returns Object with all progressive season loading data
   */
  get progressiveSeasonState() {
    return {
      seasonMetadata: this.state.seasonMetadata.get(),
      loadedSeasonsMap: this.state.loadedSeasonsMap.get(),
      allLoadedEpisodes: this.state.allLoadedEpisodes.get(),
      currentSeasonNumber: this.state.currentSeasonNumber.get(),
      isLoadingSeasonNumber: this.state.isLoadingSeasonNumber.get(),
      lastLoadedSeasonNumber: this.state.lastLoadedSeasonNumber.get()
    }
  }

  /**
   * Get combined loading states
   * @returns Object with all loading states
   */
  get loadingState() {
    return {
      isLoadingMorePeople: this.state.isLoadingMorePeople.get(),
      isLoadingMoreRecommendations: this.state.isLoadingMoreRecommendations.get(),
      isEnriching: this.state.isEnriching.get(),
      isLoadingSeasonNumber: this.state.isLoadingSeasonNumber.get(),
      isAnyLoading: this.state.isLoadingMorePeople.get() || 
                   this.state.isLoadingMoreRecommendations.get() || 
                   this.state.isEnriching.get() ||
                   this.state.isLoadingSeasonNumber.get() !== null
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
      selectedSeason: this.state.selectedSeason.get(),
      expandedOverview: this.state.expandedOverview.get()
    }
  }

  /**
   * Get people-specific state and loading
   * @returns Object with people catalogs and loading state
   */
  get peopleState() {
    return {
      catalogs: this.state.peopleCatalogs.get(),
      isLoading: this.state.isLoadingMorePeople.get(),
      hasData: this.state.peopleCatalogs.get().length > 0
    }
  }

  /**
   * Get recommendations-specific state and loading
   * @returns Object with recommendations catalogs and loading state
   */
  get recommendationsState() {
    return {
      catalogs: this.state.recommendationCatalogs.get(),
      isLoading: this.state.isLoadingMoreRecommendations.get(),
      hasData: this.state.recommendationCatalogs.get().length > 0
    }
  }

  // OBSERVABLE GETTERS FOR COMPONENTS

  /**
   * Get enriched item observable for component subscription
   */
  get enrichedItem$() {
    return this.state.enrichedItem
  }

  /**
   * Get people catalogs observable for component subscription
   */
  get peopleCatalogs$() {
    return this.state.peopleCatalogs
  }

  /**
   * Get recommendation catalogs observable for component subscription
   */
  get recommendationCatalogs$() {
    return this.state.recommendationCatalogs
  }

  /**
   * Get season details observable for component subscription
   */
  get seasonDetails$() {
    return this.state.seasonDetails
  }

  /**
   * Get season metadata observable for component subscription
   */
  get seasonMetadata$() {
    return this.state.seasonMetadata
  }

  /**
   * Get loaded seasons map observable for component subscription
   */
  get loadedSeasonsMap$() {
    return this.state.loadedSeasonsMap
  }

  /**
   * Get all loaded episodes observable for component subscription
   */
  get allLoadedEpisodes$() {
    return this.state.allLoadedEpisodes
  }

  /**
   * Get current season number observable for component subscription
   */
  get currentSeasonNumber$() {
    return this.state.currentSeasonNumber
  }

  /**
   * Get loading season number observable for component subscription
   */
  get isLoadingSeasonNumber$() {
    return this.state.isLoadingSeasonNumber
  }

  /**
   * Get last loaded season number observable for component subscription
   */
  get lastLoadedSeasonNumber$() {
    return this.state.lastLoadedSeasonNumber
  }

  /**
   * Get people loading state observable for component subscription
   */
  get isLoadingMorePeople$() {
    return this.state.isLoadingMorePeople
  }

  /**
   * Get recommendations loading state observable for component subscription
   */
  get isLoadingMoreRecommendations$() {
    return this.state.isLoadingMoreRecommendations
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
   * Get selected season observable for component subscription
   */
  get selectedSeason$() {
    return this.state.selectedSeason
  }

  /**
   * Get expanded overview observable for component subscription
   */
  get expandedOverview$() {
    return this.state.expandedOverview
  }

  // UTILITY METHODS

  /**
   * Find people catalog by ID
   * @param catalogId - Catalog ID to find
   * @returns Catalog or undefined if not found
   */
  findPeopleCatalog = (catalogId: string): Catalog | undefined => {
    return this.state.peopleCatalogs.get().find(catalog => catalog.id === catalogId)
  }

  /**
   * Find recommendation catalog by ID
   * @param catalogId - Catalog ID to find
   * @returns Catalog or undefined if not found
   */
  findRecommendationCatalog = (catalogId: string): Catalog | undefined => {
    return this.state.recommendationCatalogs.get().find(catalog => catalog.id === catalogId)
  }

  /**
   * Check if more people items can be loaded for a catalog
   * @param catalogId - Catalog ID to check
   * @returns Boolean indicating if more items can be loaded
   */
  canLoadMorePeople = (catalogId: string): boolean => {
    const catalog = this.findPeopleCatalog(catalogId)
    if (!catalog?.pagination) return false
    
    const { page, totalPages } = catalog.pagination
    return page < (totalPages ?? Infinity) && !this.state.isLoadingMorePeople.get()
  }

  /**
   * Check if more recommendation items can be loaded for a catalog
   * @param catalogId - Catalog ID to check
   * @returns Boolean indicating if more items can be loaded
   */
  canLoadMoreRecommendations = (catalogId: string): boolean => {
    const catalog = this.findRecommendationCatalog(catalogId)
    if (!catalog?.pagination) return false
    
    const { page, totalPages } = catalog.pagination
    return page < (totalPages ?? Infinity) && !this.state.isLoadingMoreRecommendations.get()
  }

  // DEBUGGING UTILITIES

  /**
   * Get debug information about store state
   * @returns Debug information object
   */
  getDebugInfo = () => {
    const state = this.state.get()
    return {
      hasEnrichedItem: !!state.enrichedItem,
      peopleCatalogsCount: state.peopleCatalogs.length,
      recommendationCatalogsCount: state.recommendationCatalogs.length,
      hasSeasonDetails: !!state.seasonDetails,
      loadingStates: {
        isLoadingMorePeople: state.isLoadingMorePeople,
        isLoadingMoreRecommendations: state.isLoadingMoreRecommendations,
        isEnriching: state.isEnriching
      },
      uiState: {
        selectedSeason: state.selectedSeason,
        expandedOverview: state.expandedOverview
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
    
    const totalPeopleItems = state.peopleCatalogs.reduce(
      (sum, catalog) => sum + catalog.items.length, 
      0
    )
    
    const totalRecommendationItems = state.recommendationCatalogs.reduce(
      (sum, catalog) => sum + catalog.items.length, 
      0
    )

    return {
      totalPeopleItems,
      totalRecommendationItems,
      peopleCatalogsCount: state.peopleCatalogs.length,
      recommendationCatalogsCount: state.recommendationCatalogs.length,
      memoryFootprint: {
        enrichedItem: state.enrichedItem ? 1 : 0,
        seasonDetails: state.seasonDetails ? 1 : 0,
        totalItems: totalPeopleItems + totalRecommendationItems
      }
    }
  }
}

/**
 * Export singleton instance of MediaDetailStore
 */
export const mediaDetailStore = new MediaDetailStore()

/**
 * Export store actions following homescreen store pattern
 */
export const mediaDetailActions = {
  // Core data actions
  setEnrichedItem: mediaDetailStore.setEnrichedItem,
  setPeopleCatalogs: mediaDetailStore.setPeopleCatalogs,
  setRecommendationCatalogs: mediaDetailStore.setRecommendationCatalogs,
  setSeasonDetails: mediaDetailStore.setSeasonDetails,
  
  // Progressive season loading actions
  setSeasonMetadata: mediaDetailStore.setSeasonMetadata,
  addLoadedSeason: mediaDetailStore.addLoadedSeason,
  setCurrentSeasonNumber: mediaDetailStore.setCurrentSeasonNumber,
  setLoadingSeasonNumber: mediaDetailStore.setLoadingSeasonNumber,
  getNextUnloadedSeasonNumber: mediaDetailStore.getNextUnloadedSeasonNumber,
  isSeasonLoaded: mediaDetailStore.isSeasonLoaded,
  findFirstEpisodeIndexForSeason: mediaDetailStore.findFirstEpisodeIndexForSeason,
  
  // Infinite scrolling actions
  addMorePeopleItems: mediaDetailStore.addMorePeopleItems,
  addMoreRecommendationItems: mediaDetailStore.addMoreRecommendationItems,
  
  // Loading state actions
  setLoadingMorePeople: mediaDetailStore.setLoadingMorePeople,
  setLoadingMoreRecommendations: mediaDetailStore.setLoadingMoreRecommendations,
  setEnriching: mediaDetailStore.setEnriching,
  
  // Error management actions
  setError: mediaDetailStore.setError,
  clearError: mediaDetailStore.clearError,
  
  // UI state actions
  setSelectedSeason: mediaDetailStore.setSelectedSeason,
  setExpandedOverview: mediaDetailStore.setExpandedOverview,
  
  // Utility actions
  reset: mediaDetailStore.reset
}

/**
 * Export store selectors following homescreen store pattern
 */
export const mediaDetailSelectors = {
  // Core data selectors
  dataState: mediaDetailStore.dataState,
  loadingState: mediaDetailStore.loadingState,
  errorState: mediaDetailStore.errorState,
  uiState: mediaDetailStore.uiState,
  progressiveSeasonState: mediaDetailStore.progressiveSeasonState,
  
  // Specific data selectors
  peopleState: mediaDetailStore.peopleState,
  recommendationsState: mediaDetailStore.recommendationsState,
  
  // Individual item selectors (computed getter functions)
  enrichedItem: {
    get: () => mediaDetailStore.enrichedItem$.get()
  },
  peopleCatalogs: {
    get: () => mediaDetailStore.peopleCatalogs$.get()
  },
  recommendationCatalogs: {
    get: () => mediaDetailStore.recommendationCatalogs$.get()
  },
  seasonDetails: {
    get: () => mediaDetailStore.seasonDetails$.get()
  },
  seasonMetadata: {
    get: () => mediaDetailStore.seasonMetadata$.get()
  },
  loadedSeasonsMap: {
    get: () => mediaDetailStore.loadedSeasonsMap$.get()
  },
  allLoadedEpisodes: {
    get: () => mediaDetailStore.allLoadedEpisodes$.get()
  },
  currentSeasonNumber: {
    get: () => mediaDetailStore.currentSeasonNumber$.get()
  },
  isLoadingSeasonNumber: {
    get: () => mediaDetailStore.isLoadingSeasonNumber$.get()
  },
  lastLoadedSeasonNumber: {
    get: () => mediaDetailStore.lastLoadedSeasonNumber$.get()
  },
  selectedSeason: {
    get: () => mediaDetailStore.selectedSeason$.get()
  },
  expandedOverview: {
    get: () => mediaDetailStore.expandedOverview$.get()
  },
  error: {
    get: () => mediaDetailStore.error$.get()
  },
  
  // Loading state selectors
  isLoadingMorePeople: {
    get: () => mediaDetailStore.isLoadingMorePeople$.get()
  },
  isLoadingMoreRecommendations: {
    get: () => mediaDetailStore.isLoadingMoreRecommendations$.get()
  },
  isEnriching: {
    get: () => mediaDetailStore.isEnriching$.get()
  },
  
  // Utility selectors
  findPeopleCatalog: mediaDetailStore.findPeopleCatalog,
  findRecommendationCatalog: mediaDetailStore.findRecommendationCatalog,
  canLoadMorePeople: mediaDetailStore.canLoadMorePeople,
  canLoadMoreRecommendations: mediaDetailStore.canLoadMoreRecommendations
}

/**
 * Export store class for dependency injection
 */
export { MediaDetailStore }

/**
 * Export types for use in components
 */
export type { MediaDetailStoreState }