/**
 * Library Feature Store
 * Manages user's personal library including watchlists, downloads, and collections
 */

import { observable, ObservableObject } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'

// Library feature interfaces
export interface LibraryCollection {
  id: string
  name: string
  description?: string
  mediaIds: string[]
  type: 'watchlist' | 'favorites' | 'custom' | 'smart'
  isPublic: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
  sortBy: 'dateAdded' | 'alphabetical' | 'releaseDate' | 'rating' | 'custom'
  sortOrder: 'asc' | 'desc'
  coverMediaId?: string
  tags: string[]
  smartCriteria?: {
    genres: string[]
    rating: { min: number; max: number }
    year: { min: number; max: number }
    watchStatus: 'unwatched' | 'watching' | 'completed'
    lastWatchedDays?: number
  }
}

export interface DownloadItem {
  mediaId: string
  title: string
  type: 'movie' | 'tv' | 'episode'
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused'
  progress: number
  downloadedSize: number
  totalSize: number
  quality: '720p' | '1080p' | '4K'
  downloadedAt?: string
  expiresAt?: string
  offlineAvailable: boolean
  episodeInfo?: {
    seasonNumber: number
    episodeNumber: number
    episodeTitle: string
  }
  error?: string
  retryCount: number
}

export interface WatchProgress {
  mediaId: string
  mediaType: 'movie' | 'tv' | 'episode'
  title: string
  progressPercent: number
  currentPosition: number
  duration: number
  lastWatchedAt: string
  isCompleted: boolean
  episodeInfo?: {
    seasonNumber: number
    episodeNumber: number
    totalEpisodes: number
    nextEpisodeId?: string
  }
  deviceId: string
  platformId: string
}

export interface LibraryState {
  // Collections and watchlists
  collections: LibraryCollection[]
  
  // Watch progress and history
  watchProgress: WatchProgress[]
  watchHistory: {
    mediaId: string
    watchedAt: string
    duration: number
    device: string
  }[]
  
  // Downloads and offline content
  downloads: {
    items: DownloadItem[]
    totalSize: number
    availableSpace: number
    wifiOnlyMode: boolean
    autoDownload: boolean
    maxConcurrentDownloads: number
    downloadQuality: '720p' | '1080p' | '4K' | 'auto'
    retentionDays: number
    notifications: boolean
  }
  
  // Ratings and reviews
  ratings: Record<string, {
    rating: number
    ratedAt: string
    review?: string
    isPublic: boolean
  }>
  
  // Recommendations and suggestions
  recommendations: {
    forYou: string[]
    basedOnWatchlist: string[]
    trending: string[]
    newReleases: string[]
    becauseYouLiked: {
      basedOnMediaId: string
      recommendations: string[]
    }[]
    lastUpdated: string | null
  }
  
  // Library organization
  organization: {
    defaultView: 'grid' | 'list' | 'detailed'
    itemsPerRow: number
    sortBy: 'dateAdded' | 'alphabetical' | 'releaseDate' | 'rating' | 'lastWatched'
    sortOrder: 'asc' | 'desc'
    groupBy: 'none' | 'genre' | 'year' | 'rating' | 'status' | 'collection'
    showProgress: boolean
    showRatings: boolean
    compactMode: boolean
  }
  
  // Filters and search within library
  filters: {
    mediaType: 'all' | 'movie' | 'tv'
    watchStatus: 'all' | 'unwatched' | 'watching' | 'completed'
    genres: string[]
    rating: { min: number; max: number } | null
    year: { min: number; max: number } | null
    collection: string | null
    downloadStatus: 'all' | 'downloaded' | 'not_downloaded'
    availability: 'all' | 'online' | 'offline'
  }
  
  // Sync and backup
  sync: {
    lastSyncTime: string | null
    isSyncing: boolean
    autoSync: boolean
    conflictResolution: 'local' | 'remote' | 'merge'
    backupEnabled: boolean
    lastBackupTime: string | null
    syncErrors: string[]
  }
  
  // UI state
  ui: {
    activeTab: 'overview' | 'collections' | 'downloads' | 'history'
    selectedCollectionId: string | null
    multiSelectMode: boolean
    selectedItems: string[]
    showFilters: boolean
    searchQuery: string
    expandedSections: string[]
    viewTransition: boolean
  }
  
  // Statistics
  stats: {
    totalItems: number
    totalWatchTime: number
    averageRating: number
    completionRate: number
    genreDistribution: Record<string, number>
    monthlyStats: {
      month: string
      added: number
      watched: number
      timeSpent: number
    }[]
    achievements: {
      id: string
      name: string
      description: string
      unlockedAt: string
      progress: number
      maxProgress: number
    }[]
  }
}

// Initial state
const initialState: LibraryState = {
  collections: [],
  
  watchProgress: [],
  watchHistory: [],
  
  downloads: {
    items: [],
    totalSize: 0,
    availableSpace: 0,
    wifiOnlyMode: true,
    autoDownload: false,
    maxConcurrentDownloads: 3,
    downloadQuality: 'auto',
    retentionDays: 30,
    notifications: true,
  },
  
  ratings: {},
  
  recommendations: {
    forYou: [],
    basedOnWatchlist: [],
    trending: [],
    newReleases: [],
    becauseYouLiked: [],
    lastUpdated: null,
  },
  
  organization: {
    defaultView: 'grid',
    itemsPerRow: 2,
    sortBy: 'dateAdded',
    sortOrder: 'desc',
    groupBy: 'none',
    showProgress: true,
    showRatings: true,
    compactMode: false,
  },
  
  filters: {
    mediaType: 'all',
    watchStatus: 'all',
    genres: [],
    rating: null,
    year: null,
    collection: null,
    downloadStatus: 'all',
    availability: 'all',
  },
  
  sync: {
    lastSyncTime: null,
    isSyncing: false,
    autoSync: true,
    conflictResolution: 'merge',
    backupEnabled: true,
    lastBackupTime: null,
    syncErrors: [],
  },
  
  ui: {
    activeTab: 'overview',
    selectedCollectionId: null,
    multiSelectMode: false,
    selectedItems: [],
    showFilters: false,
    searchQuery: '',
    expandedSections: ['collections'],
    viewTransition: false,
  },
  
  stats: {
    totalItems: 0,
    totalWatchTime: 0,
    averageRating: 0,
    completionRate: 0,
    genreDistribution: {},
    monthlyStats: [],
    achievements: [],
  },
}

// Create observable store
export const libraryStore = observable<LibraryState>(initialState)

// Persist configuration
persistObservable(libraryStore, {
  local: {
    name: 'vnyl-library-store'
  },
})

// Store actions
export const libraryActions = {
  // Collection actions
  addCollection: (collection: LibraryCollection) => {
    const currentCollections = libraryStore.collections.get()
    libraryStore.collections.set([...currentCollections, collection])
  },
  
  updateCollection: (id: string, updates: Partial<LibraryCollection>) => {
    const currentCollections = libraryStore.collections.get()
    const updatedCollections = currentCollections.map(collection =>
      collection.id === id
        ? { ...collection, ...updates, updatedAt: new Date().toISOString() }
        : collection
    )
    libraryStore.collections.set(updatedCollections)
  },
  
  removeCollection: (id: string) => {
    const currentCollections = libraryStore.collections.get()
    libraryStore.collections.set(currentCollections.filter(collection => collection.id !== id))
  },
  
  addToCollection: (collectionId: string, mediaId: string) => {
    const currentCollections = libraryStore.collections.get()
    const updatedCollections = currentCollections.map(collection => {
      if (collection.id === collectionId && !collection.mediaIds.includes(mediaId)) {
        return {
          ...collection,
          mediaIds: [...collection.mediaIds, mediaId],
          updatedAt: new Date().toISOString(),
        }
      }
      return collection
    })
    libraryStore.collections.set(updatedCollections)
  },
  
  removeFromCollection: (collectionId: string, mediaId: string) => {
    const currentCollections = libraryStore.collections.get()
    const updatedCollections = currentCollections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          mediaIds: collection.mediaIds.filter(id => id !== mediaId),
          updatedAt: new Date().toISOString(),
        }
      }
      return collection
    })
    libraryStore.collections.set(updatedCollections)
  },
  
  reorderCollectionItems: (collectionId: string, fromIndex: number, toIndex: number) => {
    const currentCollections = libraryStore.collections.get()
    const updatedCollections = currentCollections.map(collection => {
      if (collection.id === collectionId) {
        const newMediaIds = [...collection.mediaIds]
        const [movedItem] = newMediaIds.splice(fromIndex, 1)
        newMediaIds.splice(toIndex, 0, movedItem)
        return {
          ...collection,
          mediaIds: newMediaIds,
          updatedAt: new Date().toISOString(),
        }
      }
      return collection
    })
    libraryStore.collections.set(updatedCollections)
  },
  
  // Watch progress actions
  updateWatchProgress: (progress: WatchProgress) => {
    const currentProgress = libraryStore.watchProgress.get()
    const existingIndex = currentProgress.findIndex(p => 
      p.mediaId === progress.mediaId && p.deviceId === progress.deviceId
    )
    
    if (existingIndex >= 0) {
      const updated = [...currentProgress]
      updated[existingIndex] = progress
      libraryStore.watchProgress.set(updated)
    } else {
      libraryStore.watchProgress.set([progress, ...currentProgress])
    }
    
    // Add to watch history
    const historyEntry = {
      mediaId: progress.mediaId,
      watchedAt: progress.lastWatchedAt,
      duration: progress.currentPosition,
      device: progress.deviceId,
    }
    const currentHistory = libraryStore.watchHistory.get()
    libraryStore.watchHistory.set([historyEntry, ...currentHistory.slice(0, 99)]) // Keep last 100
  },
  
  removeWatchProgress: (mediaId: string, deviceId?: string) => {
    const currentProgress = libraryStore.watchProgress.get()
    if (deviceId) {
      libraryStore.watchProgress.set(
        currentProgress.filter(p => !(p.mediaId === mediaId && p.deviceId === deviceId))
      )
    } else {
      libraryStore.watchProgress.set(
        currentProgress.filter(p => p.mediaId !== mediaId)
      )
    }
  },
  
  markAsCompleted: (mediaId: string) => {
    const currentProgress = libraryStore.watchProgress.get()
    const updatedProgress = currentProgress.map(p =>
      p.mediaId === mediaId
        ? { ...p, isCompleted: true, progressPercent: 100, lastWatchedAt: new Date().toISOString() }
        : p
    )
    libraryStore.watchProgress.set(updatedProgress)
  },
  
  clearWatchHistory: () => {
    libraryStore.watchHistory.set([])
  },
  
  // Download actions
  addDownload: (item: DownloadItem) => {
    const currentDownloads = libraryStore.downloads.items.get()
    const existingIndex = currentDownloads.findIndex(d => d.mediaId === item.mediaId)
    
    if (existingIndex >= 0) {
      const updated = [...currentDownloads]
      updated[existingIndex] = item
      libraryStore.downloads.items.set(updated)
    } else {
      libraryStore.downloads.items.set([...currentDownloads, item])
    }
  },
  
  updateDownload: (mediaId: string, updates: Partial<DownloadItem>) => {
    const currentDownloads = libraryStore.downloads.items.get()
    const updatedDownloads = currentDownloads.map(item =>
      item.mediaId === mediaId ? { ...item, ...updates } : item
    )
    libraryStore.downloads.items.set(updatedDownloads)
  },
  
  removeDownload: (mediaId: string) => {
    const currentDownloads = libraryStore.downloads.items.get()
    libraryStore.downloads.items.set(currentDownloads.filter(item => item.mediaId !== mediaId))
  },
  
  pauseDownload: (mediaId: string) => {
    libraryActions.updateDownload(mediaId, { status: 'paused' })
  },
  
  resumeDownload: (mediaId: string) => {
    libraryActions.updateDownload(mediaId, { status: 'downloading' })
  },
  
  retryDownload: (mediaId: string) => {
    const currentDownloads = libraryStore.downloads.items.get()
    const item = currentDownloads.find(d => d.mediaId === mediaId)
    if (item) {
      libraryActions.updateDownload(mediaId, {
        status: 'pending',
        progress: 0,
        error: undefined,
        retryCount: item.retryCount + 1,
      })
    }
  },
  
  updateDownloadSettings: (settings: Partial<LibraryState['downloads']>) => {
    const currentSettings = libraryStore.downloads.get()
    libraryStore.downloads.set({ ...currentSettings, ...settings })
  },
  
  updateStorageInfo: (totalSize: number, availableSpace: number) => {
    libraryStore.downloads.totalSize.set(totalSize)
    libraryStore.downloads.availableSpace.set(availableSpace)
  },
  
  // Rating actions
  setRating: (mediaId: string, rating: number, review?: string, isPublic = false) => {
    const currentRatings = libraryStore.ratings.get()
    libraryStore.ratings.set({
      ...currentRatings,
      [mediaId]: {
        rating,
        ratedAt: new Date().toISOString(),
        review,
        isPublic,
      },
    })
  },
  
  removeRating: (mediaId: string) => {
    const currentRatings = libraryStore.ratings.get()
    const { [mediaId]: _, ...newRatings } = currentRatings
    libraryStore.ratings.set(newRatings)
  },
  
  // Recommendations actions
  updateRecommendations: (recommendations: Partial<LibraryState['recommendations']>) => {
    const current = libraryStore.recommendations.get()
    libraryStore.recommendations.set({
      ...current,
      ...recommendations,
      lastUpdated: new Date().toISOString(),
    })
  },
  
  // Organization actions
  setDefaultView: (view: LibraryState['organization']['defaultView']) => {
    libraryStore.organization.defaultView.set(view)
  },
  
  setItemsPerRow: (count: number) => {
    libraryStore.organization.itemsPerRow.set(Math.max(1, Math.min(4, count)))
  },
  
  setSortBy: (sortBy: LibraryState['organization']['sortBy']) => {
    libraryStore.organization.sortBy.set(sortBy)
  },
  
  setSortOrder: (order: LibraryState['organization']['sortOrder']) => {
    libraryStore.organization.sortOrder.set(order)
  },
  
  setGroupBy: (groupBy: LibraryState['organization']['groupBy']) => {
    libraryStore.organization.groupBy.set(groupBy)
  },
  
  toggleShowProgress: () => {
    libraryStore.organization.showProgress.set(!libraryStore.organization.showProgress.get())
  },
  
  toggleShowRatings: () => {
    libraryStore.organization.showRatings.set(!libraryStore.organization.showRatings.get())
  },
  
  toggleCompactMode: () => {
    libraryStore.organization.compactMode.set(!libraryStore.organization.compactMode.get())
  },
  
  // Filter actions
  setMediaTypeFilter: (type: LibraryState['filters']['mediaType']) => {
    libraryStore.filters.mediaType.set(type)
  },
  
  setWatchStatusFilter: (status: LibraryState['filters']['watchStatus']) => {
    libraryStore.filters.watchStatus.set(status)
  },
  
  setGenreFilter: (genres: string[]) => {
    libraryStore.filters.genres.set(genres)
  },
  
  setRatingFilter: (rating: { min: number; max: number } | null) => {
    libraryStore.filters.rating.set(rating)
  },
  
  setYearFilter: (year: { min: number; max: number } | null) => {
    libraryStore.filters.year.set(year)
  },
  
  setCollectionFilter: (collectionId: string | null) => {
    libraryStore.filters.collection.set(collectionId)
  },
  
  setDownloadStatusFilter: (status: LibraryState['filters']['downloadStatus']) => {
    libraryStore.filters.downloadStatus.set(status)
  },
  
  setAvailabilityFilter: (availability: LibraryState['filters']['availability']) => {
    libraryStore.filters.availability.set(availability)
  },
  
  clearFilters: () => {
    libraryStore.filters.set({
      mediaType: 'all',
      watchStatus: 'all',
      genres: [],
      rating: null,
      year: null,
      collection: null,
      downloadStatus: 'all',
      availability: 'all',
    })
  },
  
  // Sync actions
  startSync: () => {
    libraryStore.sync.isSyncing.set(true)
    libraryStore.sync.syncErrors.set([])
  },
  
  completeSync: () => {
    libraryStore.sync.isSyncing.set(false)
    libraryStore.sync.lastSyncTime.set(new Date().toISOString())
  },
  
  setSyncError: (error: string) => {
    const currentErrors = libraryStore.sync.syncErrors.get()
    libraryStore.sync.syncErrors.set([...currentErrors, error])
    libraryStore.sync.isSyncing.set(false)
  },
  
  updateSyncSettings: (settings: Partial<LibraryState['sync']>) => {
    const current = libraryStore.sync.get()
    libraryStore.sync.set({ ...current, ...settings })
  },
  
  // UI actions
  setActiveTab: (tab: LibraryState['ui']['activeTab']) => {
    libraryStore.ui.activeTab.set(tab)
  },
  
  setSelectedCollection: (collectionId: string | null) => {
    libraryStore.ui.selectedCollectionId.set(collectionId)
  },
  
  toggleMultiSelectMode: () => {
    libraryStore.ui.multiSelectMode.set(!libraryStore.ui.multiSelectMode.get())
    if (!libraryStore.ui.multiSelectMode.get()) {
      libraryStore.ui.selectedItems.set([])
    }
  },
  
  toggleItemSelection: (itemId: string) => {
    const selectedItems = libraryStore.ui.selectedItems.get()
    if (selectedItems.includes(itemId)) {
      libraryStore.ui.selectedItems.set(selectedItems.filter(id => id !== itemId))
    } else {
      libraryStore.ui.selectedItems.set([...selectedItems, itemId])
    }
  },
  
  selectAllItems: (itemIds: string[]) => {
    libraryStore.ui.selectedItems.set(itemIds)
  },
  
  clearSelection: () => {
    libraryStore.ui.selectedItems.set([])
  },
  
  toggleFiltersVisible: () => {
    libraryStore.ui.showFilters.set(!libraryStore.ui.showFilters.get())
  },
  
  setSearchQuery: (query: string) => {
    libraryStore.ui.searchQuery.set(query)
  },
  
  toggleSectionExpanded: (sectionId: string) => {
    const expanded = libraryStore.ui.expandedSections.get()
    if (expanded.includes(sectionId)) {
      libraryStore.ui.expandedSections.set(expanded.filter(id => id !== sectionId))
    } else {
      libraryStore.ui.expandedSections.set([...expanded, sectionId])
    }
  },
  
  setViewTransition: (transitioning: boolean) => {
    libraryStore.ui.viewTransition.set(transitioning)
  },
  
  // Statistics actions
  updateStats: (stats: Partial<LibraryState['stats']>) => {
    const current = libraryStore.stats.get()
    libraryStore.stats.set({ ...current, ...stats })
  },
  
  addAchievement: (achievement: LibraryState['stats']['achievements'][0]) => {
    const currentAchievements = libraryStore.stats.achievements.get()
    const existingIndex = currentAchievements.findIndex(a => a.id === achievement.id)
    
    if (existingIndex >= 0) {
      const updated = [...currentAchievements]
      updated[existingIndex] = achievement
      libraryStore.stats.achievements.set(updated)
    } else {
      libraryStore.stats.achievements.set([...currentAchievements, achievement])
    }
  },
  
  updateMonthlyStats: (monthlyStats: LibraryState['stats']['monthlyStats']) => {
    libraryStore.stats.monthlyStats.set(monthlyStats)
  },
  
  // Reset store
  reset: () => {
    libraryStore.set(initialState)
  },
}

// Computed values
export const libraryComputed = {
  // Collections computed
  get totalCollections() {
    return libraryStore.collections.get().length
  },
  
  get defaultCollections() {
    return libraryStore.collections.get().filter(c => c.isDefault)
  },
  
  get customCollections() {
    return libraryStore.collections.get().filter(c => !c.isDefault)
  },
  
  get publicCollections() {
    return libraryStore.collections.get().filter(c => c.isPublic)
  },
  
  get smartCollections() {
    return libraryStore.collections.get().filter(c => c.type === 'smart')
  },
  
  get totalLibraryItems() {
    const collections = libraryStore.collections.get()
    const allMediaIds = new Set<string>()
    collections.forEach(collection => {
      collection.mediaIds.forEach(id => allMediaIds.add(id))
    })
    return allMediaIds.size
  },
  
  // Watch progress computed
  get continueWatching() {
    return libraryStore.watchProgress.get()
      .filter(p => !p.isCompleted && p.progressPercent > 5)
      .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
  },
  
  get recentlyCompleted() {
    return libraryStore.watchProgress.get()
      .filter(p => p.isCompleted)
      .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
      .slice(0, 10)
  },
  
  get totalWatchTime() {
    return libraryStore.watchHistory.get()
      .reduce((total, entry) => total + entry.duration, 0)
  },
  
  // Downloads computed
  get activeDownloads() {
    return libraryStore.downloads.items.get().filter(d => 
      d.status === 'downloading' || d.status === 'pending'
    )
  },
  
  get completedDownloads() {
    return libraryStore.downloads.items.get().filter(d => d.status === 'completed')
  },
  
  get failedDownloads() {
    return libraryStore.downloads.items.get().filter(d => d.status === 'failed')
  },
  
  get pausedDownloads() {
    return libraryStore.downloads.items.get().filter(d => d.status === 'paused')
  },
  
  get totalDownloadSize() {
    return libraryStore.downloads.items.get()
      .filter(d => d.status === 'completed')
      .reduce((total, item) => total + item.downloadedSize, 0)
  },
  
  get downloadProgress() {
    const items = libraryStore.downloads.items.get()
    const totalItems = items.length
    const completedItems = items.filter(d => d.status === 'completed').length
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0
  },
  
  get storageUsagePercent() {
    const totalSize = libraryStore.downloads.totalSize.get()
    const availableSpace = libraryStore.downloads.availableSpace.get()
    const usedSpace = totalSize - availableSpace
    return totalSize > 0 ? (usedSpace / totalSize) * 100 : 0
  },
  
  // Ratings computed
  get totalRatings() {
    return Object.keys(libraryStore.ratings.get()).length
  },
  
  get averageRating() {
    const ratings = Object.values(libraryStore.ratings.get())
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((total, r) => total + r.rating, 0)
    return sum / ratings.length
  },
  
  get publicRatings() {
    return Object.entries(libraryStore.ratings.get())
      .filter(([_, rating]) => rating.isPublic)
      .map(([mediaId, rating]) => ({ mediaId, ...rating }))
  },
  
  // Filters computed
  get hasActiveFilters() {
    const filters = libraryStore.filters.get()
    return !!(
      filters.mediaType !== 'all' ||
      filters.watchStatus !== 'all' ||
      filters.genres.length > 0 ||
      filters.rating ||
      filters.year ||
      filters.collection ||
      filters.downloadStatus !== 'all' ||
      filters.availability !== 'all'
    )
  },
  
  get activeFiltersCount() {
    const filters = libraryStore.filters.get()
    let count = 0
    if (filters.mediaType !== 'all') count++
    if (filters.watchStatus !== 'all') count++
    if (filters.genres.length > 0) count++
    if (filters.rating) count++
    if (filters.year) count++
    if (filters.collection) count++
    if (filters.downloadStatus !== 'all') count++
    if (filters.availability !== 'all') count++
    return count
  },
  
  // UI computed
  get hasSelectedItems() {
    return libraryStore.ui.selectedItems.get().length > 0
  },
  
  get selectedItemsCount() {
    return libraryStore.ui.selectedItems.get().length
  },
  
  get isMultiSelectActive() {
    return libraryStore.ui.multiSelectMode.get()
  },
  
  get hasSearchQuery() {
    return libraryStore.ui.searchQuery.get().trim().length > 0
  },
  
  // Sync computed
  get isSyncing() {
    return libraryStore.sync.isSyncing.get()
  },
  
  get hasSyncErrors() {
    return libraryStore.sync.syncErrors.get().length > 0
  },
  
  get syncErrorCount() {
    return libraryStore.sync.syncErrors.get().length
  },
  
  get lastSyncTime() {
    return libraryStore.sync.lastSyncTime.get()
  },
  
  // Statistics computed
  get completionRate() {
    const totalProgress = libraryStore.watchProgress.get().length
    const completed = libraryStore.watchProgress.get().filter(p => p.isCompleted).length
    return totalProgress > 0 ? (completed / totalProgress) * 100 : 0
  },
  
  get topGenres() {
    const distribution = libraryStore.stats.genreDistribution.get()
    return Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }))
  },
  
  get unlockedAchievements() {
    return libraryStore.stats.achievements.get().filter(a => a.progress >= a.maxProgress)
  },
  
  get achievementProgress() {
    const achievements = libraryStore.stats.achievements.get()
    const totalAchievements = achievements.length
    const unlockedCount = achievements.filter(a => a.progress >= a.maxProgress).length
    return totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0
  },
}

// Export types
export type LibraryStore = ObservableObject<LibraryState>
export type LibraryActions = typeof libraryActions
export type LibraryComputed = typeof libraryComputed