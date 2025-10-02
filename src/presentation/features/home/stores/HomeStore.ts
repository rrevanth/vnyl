/**
 * Home Feature Store
 * Manages home screen state including catalogs, recommendations, and discovery
 */

import { observable, ObservableObject } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'

// Home feature interfaces
export interface CatalogSection {
  id: string
  title: string
  type: 'trending' | 'new_releases' | 'popular' | 'recommendations' | 'genre' | 'custom'
  mediaIds: string[]
  hasMore: boolean
  isLoading: boolean
  lastUpdated: string
  error?: string
  metadata?: {
    genre?: string
    timeWindow?: 'day' | 'week' | 'month'
    customQuery?: string
  }
}

export interface HeroContent {
  mediaId: string
  title: string
  description: string
  backdropUrl: string
  logoUrl?: string
  trailerUrl?: string
  releaseDate: string
  rating: number
  genres: string[]
  duration?: number
  type: 'movie' | 'tv'
}

export interface HomeState {
  // Hero section
  hero: {
    content: HeroContent | null
    isLoading: boolean
    error: string | null
    autoRotate: boolean
    currentIndex: number
    rotationInterval: number
  }
  
  // Catalog sections
  sections: CatalogSection[]
  
  // Discovery and recommendations
  discovery: {
    personalizedSections: string[]
    trendingNow: string[]
    newThisWeek: string[]
    popularThisMonth: string[]
    becauseYouWatched: {
      basedOnMediaId: string
      basedOnTitle: string
      recommendations: string[]
    }[]
    continueWatching: {
      mediaId: string
      progressPercent: number
      lastWatchedAt: string
      episodeInfo?: {
        seasonNumber: number
        episodeNumber: number
        episodeTitle: string
      }
    }[]
  }
  
  // UI state
  ui: {
    isRefreshing: boolean
    lastRefreshTime: string | null
    scrollPosition: number
    activeSection: string | null
    expandedSections: string[]
    viewMode: 'grid' | 'list' | 'carousel'
    itemsPerRow: number
  }
  
  // Cache management
  cache: {
    lastFetch: string | null
    ttl: number
    invalidationKeys: string[]
    backgroundRefreshEnabled: boolean
    preloadNext: boolean
  }
  
  // Filters and sorting
  filters: {
    genre: string | null
    year: { min: number; max: number } | null
    rating: { min: number; max: number } | null
    duration: { min: number; max: number } | null
    contentRating: string | null
    availability: 'all' | 'free' | 'subscription' | 'rental'
    sortBy: 'popularity' | 'rating' | 'release_date' | 'alphabetical' | 'recently_added'
    sortOrder: 'asc' | 'desc'
  }
}

// Initial state
const initialState: HomeState = {
  hero: {
    content: null,
    isLoading: false,
    error: null,
    autoRotate: true,
    currentIndex: 0,
    rotationInterval: 10000, // 10 seconds
  },
  
  sections: [],
  
  discovery: {
    personalizedSections: [],
    trendingNow: [],
    newThisWeek: [],
    popularThisMonth: [],
    becauseYouWatched: [],
    continueWatching: [],
  },
  
  ui: {
    isRefreshing: false,
    lastRefreshTime: null,
    scrollPosition: 0,
    activeSection: null,
    expandedSections: [],
    viewMode: 'carousel',
    itemsPerRow: 2,
  },
  
  cache: {
    lastFetch: null,
    ttl: 300000, // 5 minutes
    invalidationKeys: [],
    backgroundRefreshEnabled: true,
    preloadNext: true,
  },
  
  filters: {
    genre: null,
    year: null,
    rating: null,
    duration: null,
    contentRating: null,
    availability: 'all',
    sortBy: 'popularity',
    sortOrder: 'desc',
  },
}

// Create observable store
export const homeStore = observable<HomeState>(initialState)

// Persist configuration
persistObservable(homeStore, {
  local: {
    name: 'vnyl-home-store'
  }
})

// Store actions
export const homeActions = {
  // Hero actions
  setHeroContent: (content: HeroContent) => {
    homeStore.hero.content.set(content)
    homeStore.hero.isLoading.set(false)
    homeStore.hero.error.set(null)
  },
  
  setHeroLoading: (loading: boolean) => {
    homeStore.hero.isLoading.set(loading)
    if (loading) {
      homeStore.hero.error.set(null)
    }
  },
  
  setHeroError: (error: string) => {
    homeStore.hero.error.set(error)
    homeStore.hero.isLoading.set(false)
  },
  
  nextHero: () => {
    const currentIndex = homeStore.hero.currentIndex.get()
    homeStore.hero.currentIndex.set(currentIndex + 1)
  },
  
  setHeroIndex: (index: number) => {
    homeStore.hero.currentIndex.set(index)
  },
  
  toggleAutoRotate: () => {
    homeStore.hero.autoRotate.set(!homeStore.hero.autoRotate.get())
  },
  
  // Section actions
  addSection: (section: CatalogSection) => {
    const currentSections = homeStore.sections.get()
    homeStore.sections.set([...currentSections, section])
  },
  
  updateSection: (sectionId: string, updates: Partial<CatalogSection>) => {
    const currentSections = homeStore.sections.get()
    const updatedSections = currentSections.map(section =>
      section.id === sectionId
        ? { ...section, ...updates, lastUpdated: new Date().toISOString() }
        : section
    )
    homeStore.sections.set(updatedSections)
  },
  
  setSectionLoading: (sectionId: string, loading: boolean) => {
    homeActions.updateSection(sectionId, { isLoading: loading })
  },
  
  setSectionError: (sectionId: string, error: string) => {
    homeActions.updateSection(sectionId, { error, isLoading: false })
  },
  
  addMediaToSection: (sectionId: string, mediaIds: string[]) => {
    const currentSections = homeStore.sections.get()
    const updatedSections = currentSections.map(section => {
      if (section.id === sectionId) {
        const existingIds = new Set(section.mediaIds)
        const newIds = mediaIds.filter(id => !existingIds.has(id))
        return {
          ...section,
          mediaIds: [...section.mediaIds, ...newIds],
          lastUpdated: new Date().toISOString(),
        }
      }
      return section
    })
    homeStore.sections.set(updatedSections)
  },
  
  removeSection: (sectionId: string) => {
    const currentSections = homeStore.sections.get()
    homeStore.sections.set(currentSections.filter(section => section.id !== sectionId))
  },
  
  reorderSections: (fromIndex: number, toIndex: number) => {
    const currentSections = homeStore.sections.get()
    const newSections = [...currentSections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)
    homeStore.sections.set(newSections)
  },
  
  // Discovery actions
  updatePersonalizedSections: (sectionIds: string[]) => {
    homeStore.discovery.personalizedSections.set(sectionIds)
  },
  
  updateTrendingNow: (mediaIds: string[]) => {
    homeStore.discovery.trendingNow.set(mediaIds)
  },
  
  updateNewThisWeek: (mediaIds: string[]) => {
    homeStore.discovery.newThisWeek.set(mediaIds)
  },
  
  updatePopularThisMonth: (mediaIds: string[]) => {
    homeStore.discovery.popularThisMonth.set(mediaIds)
  },
  
  addBecauseYouWatched: (item: HomeState['discovery']['becauseYouWatched'][0]) => {
    const current = homeStore.discovery.becauseYouWatched.get()
    const existing = current.find(existing => existing.basedOnMediaId === item.basedOnMediaId)
    
    if (existing) {
      const updated = current.map(existing =>
        existing.basedOnMediaId === item.basedOnMediaId ? item : existing
      )
      homeStore.discovery.becauseYouWatched.set(updated)
    } else {
      homeStore.discovery.becauseYouWatched.set([...current, item])
    }
  },
  
  updateContinueWatching: (items: HomeState['discovery']['continueWatching']) => {
    homeStore.discovery.continueWatching.set(items)
  },
  
  addToContinueWatching: (item: HomeState['discovery']['continueWatching'][0]) => {
    const current = homeStore.discovery.continueWatching.get()
    const existingIndex = current.findIndex(existing => existing.mediaId === item.mediaId)
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updated = [...current]
      updated[existingIndex] = item
      homeStore.discovery.continueWatching.set(updated)
    } else {
      // Add new entry at the beginning
      homeStore.discovery.continueWatching.set([item, ...current.slice(0, 9)]) // Keep max 10 items
    }
  },
  
  removeFromContinueWatching: (mediaId: string) => {
    const current = homeStore.discovery.continueWatching.get()
    homeStore.discovery.continueWatching.set(current.filter(item => item.mediaId !== mediaId))
  },
  
  // UI actions
  setRefreshing: (refreshing: boolean) => {
    homeStore.ui.isRefreshing.set(refreshing)
    if (refreshing) {
      homeStore.ui.lastRefreshTime.set(new Date().toISOString())
    }
  },
  
  setScrollPosition: (position: number) => {
    homeStore.ui.scrollPosition.set(position)
  },
  
  setActiveSection: (sectionId: string | null) => {
    homeStore.ui.activeSection.set(sectionId)
  },
  
  toggleSectionExpanded: (sectionId: string) => {
    const expanded = homeStore.ui.expandedSections.get()
    if (expanded.includes(sectionId)) {
      homeStore.ui.expandedSections.set(expanded.filter(id => id !== sectionId))
    } else {
      homeStore.ui.expandedSections.set([...expanded, sectionId])
    }
  },
  
  setViewMode: (mode: HomeState['ui']['viewMode']) => {
    homeStore.ui.viewMode.set(mode)
  },
  
  setItemsPerRow: (count: number) => {
    homeStore.ui.itemsPerRow.set(Math.max(1, Math.min(4, count)))
  },
  
  // Filter actions
  setGenreFilter: (genre: string | null) => {
    homeStore.filters.genre.set(genre)
  },
  
  setYearFilter: (year: { min: number; max: number } | null) => {
    homeStore.filters.year.set(year)
  },
  
  setRatingFilter: (rating: { min: number; max: number } | null) => {
    homeStore.filters.rating.set(rating)
  },
  
  setDurationFilter: (duration: { min: number; max: number } | null) => {
    homeStore.filters.duration.set(duration)
  },
  
  setContentRatingFilter: (rating: string | null) => {
    homeStore.filters.contentRating.set(rating)
  },
  
  setAvailabilityFilter: (availability: HomeState['filters']['availability']) => {
    homeStore.filters.availability.set(availability)
  },
  
  setSortBy: (sortBy: HomeState['filters']['sortBy']) => {
    homeStore.filters.sortBy.set(sortBy)
  },
  
  setSortOrder: (order: HomeState['filters']['sortOrder']) => {
    homeStore.filters.sortOrder.set(order)
  },
  
  clearFilters: () => {
    homeStore.filters.set({
      genre: null,
      year: null,
      rating: null,
      duration: null,
      contentRating: null,
      availability: 'all',
      sortBy: 'popularity',
      sortOrder: 'desc',
    })
  },
  
  // Cache actions
  setCacheKey: (key: string) => {
    const current = homeStore.cache.invalidationKeys.get()
    if (!current.includes(key)) {
      homeStore.cache.invalidationKeys.set([...current, key])
    }
  },
  
  invalidateCache: (keys?: string[]) => {
    if (keys) {
      const current = homeStore.cache.invalidationKeys.get()
      homeStore.cache.invalidationKeys.set(current.filter(key => !keys.includes(key)))
    } else {
      homeStore.cache.invalidationKeys.set([])
      homeStore.cache.lastFetch.set(null)
    }
  },
  
  updateLastFetch: () => {
    homeStore.cache.lastFetch.set(new Date().toISOString())
  },
  
  setBackgroundRefresh: (enabled: boolean) => {
    homeStore.cache.backgroundRefreshEnabled.set(enabled)
  },
  
  setPreloadNext: (enabled: boolean) => {
    homeStore.cache.preloadNext.set(enabled)
  },
  
  // Reset store
  reset: () => {
    homeStore.set(initialState)
  },
}

// Computed values
export const homeComputed = {
  // Hero computed
  get hasHeroContent() {
    return !!homeStore.hero.content.get()
  },
  
  get isHeroLoading() {
    return homeStore.hero.isLoading.get()
  },
  
  get heroError() {
    return homeStore.hero.error.get()
  },
  
  // Sections computed
  get sectionsCount() {
    return homeStore.sections.get().length
  },
  
  get loadingSections() {
    return homeStore.sections.get().filter(section => section.isLoading)
  },
  
  get sectionsWithErrors() {
    return homeStore.sections.get().filter(section => section.error)
  },
  
  get personalizedSectionsData() {
    const personalizedIds = homeStore.discovery.personalizedSections.get()
    const allSections = homeStore.sections.get()
    return allSections.filter(section => personalizedIds.includes(section.id))
  },
  
  // Discovery computed
  get hasContinueWatching() {
    return homeStore.discovery.continueWatching.get().length > 0
  },
  
  get continueWatchingCount() {
    return homeStore.discovery.continueWatching.get().length
  },
  
  get hasRecommendations() {
    return homeStore.discovery.becauseYouWatched.get().length > 0
  },
  
  get totalDiscoveryItems() {
    const discovery = homeStore.discovery.get()
    return discovery.trendingNow.length +
           discovery.newThisWeek.length +
           discovery.popularThisMonth.length +
           discovery.continueWatching.length
  },
  
  // UI computed
  get isRefreshing() {
    return homeStore.ui.isRefreshing.get()
  },
  
  get hasActiveFilters() {
    const filters = homeStore.filters.get()
    return !!(
      filters.genre ||
      filters.year ||
      filters.rating ||
      filters.duration ||
      filters.contentRating ||
      filters.availability !== 'all'
    )
  },
  
  get activeFiltersCount() {
    const filters = homeStore.filters.get()
    let count = 0
    if (filters.genre) count++
    if (filters.year) count++
    if (filters.rating) count++
    if (filters.duration) count++
    if (filters.contentRating) count++
    if (filters.availability !== 'all') count++
    return count
  },
  
  // Cache computed
  get isCacheValid() {
    const lastFetch = homeStore.cache.lastFetch.get()
    const ttl = homeStore.cache.ttl.get()
    if (!lastFetch) return false
    return Date.now() - new Date(lastFetch).getTime() < ttl
  },
  
  get cacheAge() {
    const lastFetch = homeStore.cache.lastFetch.get()
    return lastFetch ? Date.now() - new Date(lastFetch).getTime() : 0
  },
  
  get shouldBackgroundRefresh() {
    return homeStore.cache.backgroundRefreshEnabled.get() && !homeComputed.isCacheValid
  },
}

// Export types
export type HomeStore = ObservableObject<HomeState>
export type HomeActions = typeof homeActions
export type HomeComputed = typeof homeComputed