/**
 * Media State Management - Legend State Integration for UI State
 * 
 * Observable state management for media-related UI states including
 * loading, caching, user interactions, and component state.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import type { BasicCatalogItem, EnhancedCatalogItem } from '@/src/domain/entities/enhanced-catalog-item.entity'

/**
 * Media loading states
 */
export interface MediaLoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  retry: () => void
}

/**
 * Catalog display state
 */
export interface CatalogDisplayState {
  viewMode: 'grid' | 'list' | 'card'
  sortBy: 'name' | 'year' | 'rating' | 'popularity' | 'added'
  sortOrder: 'asc' | 'desc'
  filterGenre: string | null
  filterYear: number | null
  searchQuery: string
  showFilters: boolean
}

/**
 * Media detail state
 */
export interface MediaDetailState {
  selectedItem: EnhancedCatalogItem | null
  showFullDescription: boolean
  activeTab: 'overview' | 'cast' | 'reviews' | 'similar' | 'videos'
  showTrailer: boolean
  trailerUrl: string | null
  userRating: number | null
  inWatchlist: boolean
  isFavorite: boolean
}

/**
 * Search state
 */
export interface SearchState {
  query: string
  results: BasicCatalogItem[]
  recentSearches: string[]
  isSearching: boolean
  hasResults: boolean
  selectedFilters: {
    contentType: string | null
    genre: string | null
    year: number | null
    rating: number | null
  }
}

/**
 * Global media state
 */
export interface MediaState {
  // Catalog states
  catalog: {
    display: CatalogDisplayState
    loading: Record<string, MediaLoadingState>
    items: Record<string, BasicCatalogItem[]>
    currentCatalog: string | null
  }
  
  // Detail states
  detail: MediaDetailState
  
  // Search states
  search: SearchState
  
  // User preferences
  preferences: {
    defaultViewMode: 'grid' | 'list' | 'card'
    autoPlayTrailers: boolean
    showSpoilers: boolean
    preferredLanguage: string
    preferredRegion: string
  }
  
  // Cache and performance
  cache: {
    lastCleared: Date | null
    cacheSize: number
    prefetchEnabled: boolean
  }
}

/**
 * Default media state
 */
const defaultMediaState: MediaState = {
  catalog: {
    display: {
      viewMode: 'grid',
      sortBy: 'popularity',
      sortOrder: 'desc',
      filterGenre: null,
      filterYear: null,
      searchQuery: '',
      showFilters: false
    },
    loading: {},
    items: {},
    currentCatalog: null
  },
  
  detail: {
    selectedItem: null,
    showFullDescription: false,
    activeTab: 'overview',
    showTrailer: false,
    trailerUrl: null,
    userRating: null,
    inWatchlist: false,
    isFavorite: false
  },
  
  search: {
    query: '',
    results: [],
    recentSearches: [],
    isSearching: false,
    hasResults: false,
    selectedFilters: {
      contentType: null,
      genre: null,
      year: null,
      rating: null
    }
  },
  
  preferences: {
    defaultViewMode: 'grid',
    autoPlayTrailers: false,
    showSpoilers: false,
    preferredLanguage: 'en',
    preferredRegion: 'US'
  },
  
  cache: {
    lastCleared: null,
    cacheSize: 0,
    prefetchEnabled: true
  }
}

/**
 * Observable media state
 */
export const mediaState = observable<MediaState>(defaultMediaState)

/**
 * Media state actions
 */
export const mediaActions = {
  // Catalog actions
  catalog: {
    setViewMode: (viewMode: 'grid' | 'list' | 'card') => {
      mediaState.catalog.display.viewMode.set(viewMode)
    },
    
    setSortBy: (sortBy: 'name' | 'year' | 'rating' | 'popularity' | 'added') => {
      mediaState.catalog.display.sortBy.set(sortBy)
    },
    
    setSortOrder: (sortOrder: 'asc' | 'desc') => {
      mediaState.catalog.display.sortOrder.set(sortOrder)
    },
    
    setFilterGenre: (genre: string | null) => {
      mediaState.catalog.display.filterGenre.set(genre)
    },
    
    setFilterYear: (year: number | null) => {
      mediaState.catalog.display.filterYear.set(year)
    },
    
    setSearchQuery: (query: string) => {
      mediaState.catalog.display.searchQuery.set(query)
    },
    
    toggleFilters: () => {
      mediaState.catalog.display.showFilters.set(
        !mediaState.catalog.display.showFilters.get()
      )
    },
    
    setCurrentCatalog: (catalogId: string | null) => {
      mediaState.catalog.currentCatalog.set(catalogId)
    },
    
    setCatalogItems: (catalogId: string, items: BasicCatalogItem[]) => {
      mediaState.catalog.items[catalogId].set(items)
    },
    
    setLoadingState: (catalogId: string, loadingState: Partial<MediaLoadingState>) => {
      const currentState = mediaState.catalog.loading[catalogId].get() || {
        isLoading: false,
        error: null,
        lastUpdated: null,
        retry: () => {}
      }
      
      mediaState.catalog.loading[catalogId].set({
        ...currentState,
        ...loadingState
      })
    }
  },
  
  // Detail actions
  detail: {
    setSelectedItem: (item: EnhancedCatalogItem | null) => {
      mediaState.detail.selectedItem.set(item)
      // Reset detail state when changing items
      if (item) {
        mediaState.detail.showFullDescription.set(false)
        mediaState.detail.activeTab.set('overview')
        mediaState.detail.showTrailer.set(false)
      }
    },
    
    toggleFullDescription: () => {
      mediaState.detail.showFullDescription.set(
        !mediaState.detail.showFullDescription.get()
      )
    },
    
    setActiveTab: (tab: 'overview' | 'cast' | 'reviews' | 'similar' | 'videos') => {
      mediaState.detail.activeTab.set(tab)
    },
    
    setShowTrailer: (show: boolean, url?: string | null) => {
      mediaState.detail.showTrailer.set(show)
      if (url !== undefined) {
        mediaState.detail.trailerUrl.set(url)
      }
    },
    
    setUserRating: (rating: number | null) => {
      mediaState.detail.userRating.set(rating)
    },
    
    toggleWatchlist: () => {
      mediaState.detail.inWatchlist.set(
        !mediaState.detail.inWatchlist.get()
      )
    },
    
    toggleFavorite: () => {
      mediaState.detail.isFavorite.set(
        !mediaState.detail.isFavorite.get()
      )
    }
  },
  
  // Search actions
  search: {
    setQuery: (query: string) => {
      mediaState.search.query.set(query)
    },
    
    setResults: (results: BasicCatalogItem[]) => {
      mediaState.search.results.set(results)
      mediaState.search.hasResults.set(results.length > 0)
    },
    
    setIsSearching: (isSearching: boolean) => {
      mediaState.search.isSearching.set(isSearching)
    },
    
    addRecentSearch: (query: string) => {
      if (!query.trim()) return
      
      const recent = mediaState.search.recentSearches.get()
      const filtered = recent.filter(item => item !== query)
      const updated = [query, ...filtered].slice(0, 10) // Keep last 10 searches
      
      mediaState.search.recentSearches.set(updated)
    },
    
    clearRecentSearches: () => {
      mediaState.search.recentSearches.set([])
    },
    
    setContentTypeFilter: (contentType: string | null) => {
      mediaState.search.selectedFilters.contentType.set(contentType)
    },
    
    setGenreFilter: (genre: string | null) => {
      mediaState.search.selectedFilters.genre.set(genre)
    },
    
    setYearFilter: (year: number | null) => {
      mediaState.search.selectedFilters.year.set(year)
    },
    
    setRatingFilter: (rating: number | null) => {
      mediaState.search.selectedFilters.rating.set(rating)
    },
    
    clearFilters: () => {
      mediaState.search.selectedFilters.set({
        contentType: null,
        genre: null,
        year: null,
        rating: null
      })
    }
  },
  
  // Preference actions
  preferences: {
    setDefaultViewMode: (viewMode: 'grid' | 'list' | 'card') => {
      mediaState.preferences.defaultViewMode.set(viewMode)
    },
    
    setAutoPlayTrailers: (enabled: boolean) => {
      mediaState.preferences.autoPlayTrailers.set(enabled)
    },
    
    setShowSpoilers: (enabled: boolean) => {
      mediaState.preferences.showSpoilers.set(enabled)
    },
    
    setPreferredLanguage: (language: string) => {
      mediaState.preferences.preferredLanguage.set(language)
    },
    
    setPreferredRegion: (region: string) => {
      mediaState.preferences.preferredRegion.set(region)
    }
  },
  
  // Cache actions
  cache: {
    setCacheSize: (size: number) => {
      mediaState.cache.cacheSize.set(size)
    },
    
    setLastCleared: (date: Date) => {
      mediaState.cache.lastCleared.set(date)
    },
    
    setPrefetchEnabled: (enabled: boolean) => {
      mediaState.cache.prefetchEnabled.set(enabled)
    }
  },
  
  // Utility actions
  reset: () => {
    mediaState.set(defaultMediaState)
  },
  
  resetCatalog: () => {
    mediaState.catalog.set(defaultMediaState.catalog)
  },
  
  resetDetail: () => {
    mediaState.detail.set(defaultMediaState.detail)
  },
  
  resetSearch: () => {
    mediaState.search.set(defaultMediaState.search)
  }
}

/**
 * Computed values and selectors
 */
export const mediaSelectors = {
  // Catalog selectors
  catalog: {
    currentItems: () => {
      const currentCatalog = mediaState.catalog.currentCatalog.get()
      if (!currentCatalog) return []
      return mediaState.catalog.items[currentCatalog].get() || []
    },
    
    currentLoadingState: () => {
      const currentCatalog = mediaState.catalog.currentCatalog.get()
      if (!currentCatalog) return null
      return mediaState.catalog.loading[currentCatalog].get()
    },
    
    isCurrentCatalogLoading: () => {
      const loadingState = mediaSelectors.catalog.currentLoadingState()
      return loadingState?.isLoading || false
    },
    
    filteredItems: () => {
      const items = mediaSelectors.catalog.currentItems()
      const display = mediaState.catalog.display.get()
      
      let filtered = items
      
      // Apply search filter
      if (display.searchQuery) {
        const query = display.searchQuery.toLowerCase()
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query)
        )
      }
      
      // Apply genre filter
      if (display.filterGenre) {
        filtered = filtered.filter(item => 
          item.genres?.some(genre => 
            genre.name.toLowerCase() === display.filterGenre?.toLowerCase()
          )
        )
      }
      
      // Apply year filter
      if (display.filterYear) {
        filtered = filtered.filter(item => item.year === display.filterYear)
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (display.sortBy) {
          case 'name':
            aValue = a.name
            bValue = b.name
            break
          case 'year':
            aValue = a.year || 0
            bValue = b.year || 0
            break
          case 'rating':
            aValue = a.ratings?.[0]?.value || 0
            bValue = b.ratings?.[0]?.value || 0
            break
          case 'popularity':
            aValue = a.popularity || 0
            bValue = b.popularity || 0
            break
          default:
            return 0
        }
        
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue)
          return display.sortOrder === 'asc' ? comparison : -comparison
        } else {
          const comparison = aValue - bValue
          return display.sortOrder === 'asc' ? comparison : -comparison
        }
      })
      
      return filtered
    }
  },
  
  // Search selectors
  search: {
    hasActiveFilters: () => {
      const filters = mediaState.search.selectedFilters.get()
      return Object.values(filters).some(value => value !== null)
    },
    
    filteredResults: () => {
      const results = mediaState.search.results.get()
      const filters = mediaState.search.selectedFilters.get()
      
      let filtered = results
      
      // Apply content type filter
      if (filters.contentType) {
        filtered = filtered.filter(item => item.mediaType === filters.contentType)
      }
      
      // Apply genre filter
      if (filters.genre) {
        filtered = filtered.filter(item => 
          item.genres?.some(genre => 
            genre.name.toLowerCase() === filters.genre?.toLowerCase()
          )
        )
      }
      
      // Apply year filter
      if (filters.year) {
        filtered = filtered.filter(item => item.year === filters.year)
      }
      
      // Apply rating filter
      if (filters.rating) {
        filtered = filtered.filter(item => {
          const rating = item.ratings?.[0]?.value || 0
          return rating >= (filters.rating || 0)
        })
      }
      
      return filtered
    }
  }
}

/**
 * Export observer for React components
 */
export { observer as MediaObserver }