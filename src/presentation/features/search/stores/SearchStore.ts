/**
 * Search Feature Store
 * Manages search state including queries, results, filters, and history
 */

import { observable, ObservableObject } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'

// Search feature interfaces
export interface SearchQuery {
  id: string
  query: string
  timestamp: string
  resultCount: number
  filters?: SearchFilters
}

export interface SearchResult {
  id: string
  type: 'movie' | 'tv' | 'person' | 'collection'
  title: string
  subtitle?: string
  year?: number
  posterUrl?: string
  backdropUrl?: string
  rating?: number
  genres?: string[]
  overview?: string
  relevanceScore: number
  metadata?: {
    runtime?: number
    episodeCount?: number
    seasonCount?: number
    knownFor?: string[] // For persons
    character?: string // For cast search results
    job?: string // For crew search results
  }
}

export interface SearchFilters {
  contentType: 'all' | 'movies' | 'tv' | 'people'
  genre?: string[]
  year?: { min: number; max: number }
  rating?: { min: number; max: number }
  duration?: { min: number; max: number }
  contentRating?: string[]
  availability?: 'all' | 'free' | 'subscription' | 'rental'
  sortBy?: 'relevance' | 'popularity' | 'rating' | 'release_date' | 'alphabetical'
  sortOrder?: 'asc' | 'desc'
  includeAdult?: boolean
}

export interface SearchSuggestion {
  id: string
  text: string
  type: 'query' | 'title' | 'person' | 'genre'
  count?: number
  metadata?: {
    year?: number
    mediaType?: 'movie' | 'tv'
    popularity?: number
  }
}

export interface SearchState {
  // Current search
  current: {
    query: string
    isSearching: boolean
    results: SearchResult[]
    totalResults: number
    hasMore: boolean
    page: number
    error: string | null
    lastSearchTime: string | null
    searchId: string | null
  }
  
  // Search history and suggestions
  history: {
    recentQueries: SearchQuery[]
    popularQueries: string[]
    suggestions: SearchSuggestion[]
    autoComplete: string[]
    trending: SearchSuggestion[]
  }
  
  // Filters and preferences
  filters: SearchFilters
  
  // Advanced search
  advanced: {
    isEnabled: boolean
    cast: string[]
    crew: string[]
    keywords: string[]
    companies: string[]
    collections: string[]
    originalLanguage?: string
    spokenLanguages?: string[]
    countries?: string[]
  }
  
  // UI state
  ui: {
    activeTab: 'all' | 'movies' | 'tv' | 'people'
    viewMode: 'grid' | 'list'
    itemsPerRow: number
    showFilters: boolean
    showAdvanced: boolean
    searchBarFocused: boolean
    selectedCategories: string[]
    recentSearchesVisible: boolean
  }
  
  // Voice search
  voice: {
    isSupported: boolean
    isListening: boolean
    isProcessing: boolean
    lastTranscript: string | null
    confidence: number
    error: string | null
  }
  
  // Search analytics
  analytics: {
    totalSearches: number
    searchesThisSession: number
    avgResultsPerSearch: number
    mostSearchedTerms: Record<string, number>
    clickThroughRates: Record<string, number>
    zeroResultQueries: string[]
  }
}

// Initial state
const initialState: SearchState = {
  current: {
    query: '',
    isSearching: false,
    results: [],
    totalResults: 0,
    hasMore: false,
    page: 1,
    error: null,
    lastSearchTime: null,
    searchId: null,
  },
  
  history: {
    recentQueries: [],
    popularQueries: [],
    suggestions: [],
    autoComplete: [],
    trending: [],
  },
  
  filters: {
    contentType: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
    includeAdult: false,
  },
  
  advanced: {
    isEnabled: false,
    cast: [],
    crew: [],
    keywords: [],
    companies: [],
    collections: [],
  },
  
  ui: {
    activeTab: 'all',
    viewMode: 'grid',
    itemsPerRow: 2,
    showFilters: false,
    showAdvanced: false,
    searchBarFocused: false,
    selectedCategories: [],
    recentSearchesVisible: true,
  },
  
  voice: {
    isSupported: false,
    isListening: false,
    isProcessing: false,
    lastTranscript: null,
    confidence: 0,
    error: null,
  },
  
  analytics: {
    totalSearches: 0,
    searchesThisSession: 0,
    avgResultsPerSearch: 0,
    mostSearchedTerms: {},
    clickThroughRates: {},
    zeroResultQueries: [],
  },
}

// Create observable store
export const searchStore = observable<SearchState>(initialState)

// Persist configuration
persistObservable(searchStore, {
  local: {
    name: 'vnyl-search-store'
  },
})

// Store actions
export const searchActions = {
  // Search actions
  setQuery: (query: string) => {
    searchStore.current.query.set(query)
  },
  
  startSearch: (query: string, filters?: Partial<SearchFilters>) => {
    const searchId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    searchStore.current.set({
      query,
      isSearching: true,
      results: [],
      totalResults: 0,
      hasMore: false,
      page: 1,
      error: null,
      lastSearchTime: new Date().toISOString(),
      searchId,
    })
    
    if (filters) {
      searchStore.filters.set({ ...searchStore.filters.get(), ...filters })
    }
    
    // Update analytics
    const currentSearches = searchStore.analytics.searchesThisSession.get()
    searchStore.analytics.searchesThisSession.set(currentSearches + 1)
    
    const totalSearches = searchStore.analytics.totalSearches.get()
    searchStore.analytics.totalSearches.set(totalSearches + 1)
    
    // Update search terms tracking
    const mostSearched = searchStore.analytics.mostSearchedTerms.get()
    const normalizedQuery = query.toLowerCase().trim()
    mostSearched[normalizedQuery] = (mostSearched[normalizedQuery] || 0) + 1
    searchStore.analytics.mostSearchedTerms.set(mostSearched)
  },
  
  setSearchResults: (results: SearchResult[], totalResults: number, hasMore: boolean) => {
    searchStore.current.results.set(results)
    searchStore.current.totalResults.set(totalResults)
    searchStore.current.hasMore.set(hasMore)
    searchStore.current.isSearching.set(false)
    searchStore.current.error.set(null)
    
    // Track zero result queries
    if (totalResults === 0) {
      const query = searchStore.current.query.get()
      const zeroResults = searchStore.analytics.zeroResultQueries.get()
      if (!zeroResults.includes(query)) {
        searchStore.analytics.zeroResultQueries.set([...zeroResults, query])
      }
    }
    
    // Update average results per search
    const totalSearches = searchStore.analytics.totalSearches.get()
    const currentAvg = searchStore.analytics.avgResultsPerSearch.get()
    const newAvg = ((currentAvg * (totalSearches - 1)) + totalResults) / totalSearches
    searchStore.analytics.avgResultsPerSearch.set(newAvg)
  },
  
  appendSearchResults: (results: SearchResult[]) => {
    const currentResults = searchStore.current.results.get()
    searchStore.current.results.set([...currentResults, ...results])
    const currentPage = searchStore.current.page.get()
    searchStore.current.page.set(currentPage + 1)
  },
  
  setSearchError: (error: string) => {
    searchStore.current.error.set(error)
    searchStore.current.isSearching.set(false)
  },
  
  clearSearch: () => {
    searchStore.current.set({
      query: '',
      isSearching: false,
      results: [],
      totalResults: 0,
      hasMore: false,
      page: 1,
      error: null,
      lastSearchTime: null,
      searchId: null,
    })
  },
  
  // History actions
  addToHistory: (query: SearchQuery) => {
    const currentHistory = searchStore.history.recentQueries.get()
    const existingIndex = currentHistory.findIndex(q => q.query === query.query)
    
    if (existingIndex >= 0) {
      // Update existing query
      const updated = [...currentHistory]
      updated[existingIndex] = query
      searchStore.history.recentQueries.set(updated)
    } else {
      // Add new query at the beginning
      searchStore.history.recentQueries.set([query, ...currentHistory.slice(0, 49)]) // Keep max 50
    }
  },
  
  removeFromHistory: (queryId: string) => {
    const currentHistory = searchStore.history.recentQueries.get()
    searchStore.history.recentQueries.set(currentHistory.filter(q => q.id !== queryId))
  },
  
  clearHistory: () => {
    searchStore.history.recentQueries.set([])
  },
  
  updateSuggestions: (suggestions: SearchSuggestion[]) => {
    searchStore.history.suggestions.set(suggestions)
  },
  
  updateAutoComplete: (suggestions: string[]) => {
    searchStore.history.autoComplete.set(suggestions)
  },
  
  updateTrending: (trending: SearchSuggestion[]) => {
    searchStore.history.trending.set(trending)
  },
  
  updatePopularQueries: (queries: string[]) => {
    searchStore.history.popularQueries.set(queries)
  },
  
  // Filter actions
  setContentType: (type: SearchFilters['contentType']) => {
    searchStore.filters.contentType.set(type)
    searchStore.ui.activeTab.set(type)
  },
  
  setGenreFilter: (genres: string[]) => {
    searchStore.filters.genre.set(genres)
  },
  
  setYearFilter: (year: { min: number; max: number } | undefined) => {
    searchStore.filters.year.set(year)
  },
  
  setRatingFilter: (rating: { min: number; max: number } | undefined) => {
    searchStore.filters.rating.set(rating)
  },
  
  setDurationFilter: (duration: { min: number; max: number } | undefined) => {
    searchStore.filters.duration.set(duration)
  },
  
  setContentRatingFilter: (ratings: string[] | undefined) => {
    searchStore.filters.contentRating.set(ratings)
  },
  
  setAvailabilityFilter: (availability: SearchFilters['availability']) => {
    searchStore.filters.availability.set(availability)
  },
  
  setSortBy: (sortBy: SearchFilters['sortBy']) => {
    searchStore.filters.sortBy.set(sortBy)
  },
  
  setSortOrder: (order: SearchFilters['sortOrder']) => {
    searchStore.filters.sortOrder.set(order)
  },
  
  setIncludeAdult: (include: boolean) => {
    searchStore.filters.includeAdult.set(include)
  },
  
  clearFilters: () => {
    searchStore.filters.set({
      contentType: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
      includeAdult: false,
    })
  },
  
  // Advanced search actions
  toggleAdvancedSearch: () => {
    searchStore.advanced.isEnabled.set(!searchStore.advanced.isEnabled.get())
  },
  
  setCast: (cast: string[]) => {
    searchStore.advanced.cast.set(cast)
  },
  
  setCrew: (crew: string[]) => {
    searchStore.advanced.crew.set(crew)
  },
  
  setKeywords: (keywords: string[]) => {
    searchStore.advanced.keywords.set(keywords)
  },
  
  setCompanies: (companies: string[]) => {
    searchStore.advanced.companies.set(companies)
  },
  
  setCollections: (collections: string[]) => {
    searchStore.advanced.collections.set(collections)
  },
  
  setOriginalLanguage: (language: string | undefined) => {
    searchStore.advanced.originalLanguage.set(language)
  },
  
  setSpokenLanguages: (languages: string[] | undefined) => {
    searchStore.advanced.spokenLanguages.set(languages)
  },
  
  setCountries: (countries: string[] | undefined) => {
    searchStore.advanced.countries.set(countries)
  },
  
  clearAdvanced: () => {
    searchStore.advanced.set({
      isEnabled: false,
      cast: [],
      crew: [],
      keywords: [],
      companies: [],
      collections: [],
    })
  },
  
  // UI actions
  setActiveTab: (tab: SearchState['ui']['activeTab']) => {
    searchStore.ui.activeTab.set(tab)
    searchActions.setContentType(tab)
  },
  
  setViewMode: (mode: SearchState['ui']['viewMode']) => {
    searchStore.ui.viewMode.set(mode)
  },
  
  setItemsPerRow: (count: number) => {
    searchStore.ui.itemsPerRow.set(Math.max(1, Math.min(4, count)))
  },
  
  toggleFilters: () => {
    searchStore.ui.showFilters.set(!searchStore.ui.showFilters.get())
  },
  
  toggleAdvanced: () => {
    searchStore.ui.showAdvanced.set(!searchStore.ui.showAdvanced.get())
  },
  
  setSearchBarFocused: (focused: boolean) => {
    searchStore.ui.searchBarFocused.set(focused)
  },
  
  setSelectedCategories: (categories: string[]) => {
    searchStore.ui.selectedCategories.set(categories)
  },
  
  toggleRecentSearchesVisible: () => {
    searchStore.ui.recentSearchesVisible.set(!searchStore.ui.recentSearchesVisible.get())
  },
  
  // Voice search actions
  setVoiceSupported: (supported: boolean) => {
    searchStore.voice.isSupported.set(supported)
  },
  
  startVoiceSearch: () => {
    searchStore.voice.isListening.set(true)
    searchStore.voice.error.set(null)
  },
  
  stopVoiceSearch: () => {
    searchStore.voice.isListening.set(false)
  },
  
  setVoiceProcessing: (processing: boolean) => {
    searchStore.voice.isProcessing.set(processing)
  },
  
  setVoiceTranscript: (transcript: string, confidence: number) => {
    searchStore.voice.lastTranscript.set(transcript)
    searchStore.voice.confidence.set(confidence)
    searchStore.voice.isListening.set(false)
    searchStore.voice.isProcessing.set(false)
  },
  
  setVoiceError: (error: string) => {
    searchStore.voice.error.set(error)
    searchStore.voice.isListening.set(false)
    searchStore.voice.isProcessing.set(false)
  },
  
  // Analytics actions
  trackClickThrough: (resultId: string, position: number) => {
    const clickRates = searchStore.analytics.clickThroughRates.get()
    const key = `${resultId}_${position}`
    clickRates[key] = (clickRates[key] || 0) + 1
    searchStore.analytics.clickThroughRates.set(clickRates)
  },
  
  resetSessionAnalytics: () => {
    searchStore.analytics.searchesThisSession.set(0)
  },
  
  // Reset store
  reset: () => {
    searchStore.set({
      ...initialState,
      analytics: {
        ...initialState.analytics,
        totalSearches: searchStore.analytics.totalSearches.get(),
        mostSearchedTerms: searchStore.analytics.mostSearchedTerms.get(),
        clickThroughRates: searchStore.analytics.clickThroughRates.get(),
      },
    })
  },
}

// Computed values
export const searchComputed = {
  // Search computed
  get hasQuery() {
    return searchStore.current.query.get().trim().length > 0
  },
  
  get isSearching() {
    return searchStore.current.isSearching.get()
  },
  
  get hasResults() {
    return searchStore.current.results.get().length > 0
  },
  
  get hasError() {
    return !!searchStore.current.error.get()
  },
  
  get canLoadMore() {
    return searchStore.current.hasMore.get() && !searchStore.current.isSearching.get()
  },
  
  get resultsByType() {
    const results = searchStore.current.results.get()
    return {
      movies: results.filter(r => r.type === 'movie'),
      tv: results.filter(r => r.type === 'tv'),
      people: results.filter(r => r.type === 'person'),
      collections: results.filter(r => r.type === 'collection'),
    }
  },
  
  // History computed
  get hasHistory() {
    return searchStore.history.recentQueries.get().length > 0
  },
  
  get recentQueriesCount() {
    return searchStore.history.recentQueries.get().length
  },
  
  get hasSuggestions() {
    return searchStore.history.suggestions.get().length > 0
  },
  
  get hasAutoComplete() {
    return searchStore.history.autoComplete.get().length > 0
  },
  
  get hasTrending() {
    return searchStore.history.trending.get().length > 0
  },
  
  // Filters computed
  get hasActiveFilters() {
    const filters = searchStore.filters.get()
    return !!(
      filters.genre?.length ||
      filters.year ||
      filters.rating ||
      filters.duration ||
      filters.contentRating?.length ||
      filters.availability !== 'all' ||
      filters.includeAdult
    )
  },
  
  get activeFiltersCount() {
    const filters = searchStore.filters.get()
    let count = 0
    if (filters.genre?.length) count++
    if (filters.year) count++
    if (filters.rating) count++
    if (filters.duration) count++
    if (filters.contentRating?.length) count++
    if (filters.availability !== 'all') count++
    if (filters.includeAdult) count++
    return count
  },
  
  get hasAdvancedFilters() {
    const advanced = searchStore.advanced.get()
    return !!(
      advanced.cast.length ||
      advanced.crew.length ||
      advanced.keywords.length ||
      advanced.companies.length ||
      advanced.collections.length ||
      advanced.originalLanguage ||
      advanced.spokenLanguages?.length ||
      advanced.countries?.length
    )
  },
  
  // Voice computed
  get isVoiceActive() {
    return searchStore.voice.isListening.get() || searchStore.voice.isProcessing.get()
  },
  
  get voiceConfidenceLevel() {
    const confidence = searchStore.voice.confidence.get()
    if (confidence >= 0.8) return 'high'
    if (confidence >= 0.6) return 'medium'
    return 'low'
  },
  
  // Analytics computed
  get searchSuccessRate() {
    const total = searchStore.analytics.totalSearches.get()
    const zeroResults = searchStore.analytics.zeroResultQueries.get().length
    return total > 0 ? ((total - zeroResults) / total) * 100 : 0
  },
  
  get topSearchTerms() {
    const terms = searchStore.analytics.mostSearchedTerms.get()
    return Object.entries(terms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }))
  },
}

// Export types
export type SearchStore = ObservableObject<SearchState>
export type SearchActions = typeof searchActions
export type SearchComputed = typeof searchComputed