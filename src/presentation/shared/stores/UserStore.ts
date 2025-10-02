/**
 * User Store
 * Manages user authentication, profile, and personalized data
 */

import { observable, ObservableObject } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

// User interfaces
export interface UserProfile {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  joinDate: string
  lastActiveDate: string
  preferences: {
    favoriteGenres: string[]
    contentRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'all'
    parentalControls: boolean
    maturityLevel: number
  }
  subscription: {
    tier: 'free' | 'premium' | 'family'
    expiresAt?: string
    features: string[]
    autoRenew: boolean
  }
  stats: {
    totalWatchTime: number
    moviesWatched: number
    tvShowsWatched: number
    episodesWatched: number
    favoriteGenre: string
    averageRating: number
  }
}

export interface UserWatchlist {
  id: string
  name: string
  description?: string
  mediaIds: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface UserWatchHistory {
  mediaId: string
  mediaType: 'movie' | 'tv' | 'episode'
  title: string
  watchedAt: string
  progressPercent: number
  resumePosition: number
  rating?: number
  notes?: string
}

export interface UserState {
  // Authentication
  auth: {
    isAuthenticated: boolean
    isLoading: boolean
    accessToken: string | null
    refreshToken: string | null
    expiresAt: number | null
    lastLoginAt: string | null
  }
  
  // Profile
  profile: UserProfile | null
  
  // Personalized data
  watchlists: UserWatchlist[]
  watchHistory: UserWatchHistory[]
  favorites: string[]
  ratings: Record<string, number>
  
  // Recommendations
  recommendations: {
    forYou: string[]
    trending: string[]
    newReleases: string[]
    basedOnHistory: string[]
    lastUpdated: string | null
  }
  
  // Downloads and offline content
  downloads: {
    completed: string[]
    inProgress: string[]
    failed: string[]
    totalSize: number
    availableSpace: number
  }
  
  // Social features
  social: {
    following: string[]
    followers: string[]
    sharedWatchlists: string[]
    recentActivity: {
      type: 'watched' | 'rated' | 'added_to_watchlist' | 'shared'
      mediaId: string
      timestamp: string
      data?: any
    }[]
  }
}

// Initial state
const initialState: UserState = {
  auth: {
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    lastLoginAt: null,
  },
  
  profile: null,
  
  watchlists: [],
  watchHistory: [],
  favorites: [],
  ratings: {},
  
  recommendations: {
    forYou: [],
    trending: [],
    newReleases: [],
    basedOnHistory: [],
    lastUpdated: null,
  },
  
  downloads: {
    completed: [],
    inProgress: [],
    failed: [],
    totalSize: 0,
    availableSpace: 0,
  },
  
  social: {
    following: [],
    followers: [],
    sharedWatchlists: [],
    recentActivity: [],
  },
}

// Create observable store
export const userStore = observable<UserState>(initialState)

// Persist configuration - exclude sensitive data
persistObservable(userStore, {
  local: {
    name: 'vnyl-user-store',
  },
})

// Store actions
export const userActions = {
  // Authentication actions
  login: (tokens: { accessToken: string; refreshToken: string; expiresAt: number }) => {
    userStore.auth.isAuthenticated.set(true)
    userStore.auth.accessToken.set(tokens.accessToken)
    userStore.auth.refreshToken.set(tokens.refreshToken)
    userStore.auth.expiresAt.set(tokens.expiresAt)
    userStore.auth.lastLoginAt.set(new Date().toISOString())
    userStore.auth.isLoading.set(false)
  },
  
  logout: () => {
    userStore.auth.set({
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      lastLoginAt: null,
    })
    userStore.profile.set(null)
    // Keep some data for offline access
  },
  
  setAuthLoading: (loading: boolean) => {
    userStore.auth.isLoading.set(loading)
  },
  
  refreshTokens: (tokens: { accessToken: string; expiresAt: number }) => {
    userStore.auth.accessToken.set(tokens.accessToken)
    userStore.auth.expiresAt.set(tokens.expiresAt)
  },
  
  // Profile actions
  setProfile: (profile: UserProfile) => {
    userStore.profile.set(profile)
  },
  
  updateProfile: (updates: Partial<UserProfile>) => {
    const currentProfile = userStore.profile.get()
    if (currentProfile) {
      userStore.profile.set({ ...currentProfile, ...updates })
    }
  },
  
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => {
    const currentProfile = userStore.profile.get()
    if (currentProfile) {
      userStore.profile.preferences.set({
        ...currentProfile.preferences,
        ...preferences,
      })
    }
  },
  
  // Watchlist actions
  addWatchlist: (watchlist: UserWatchlist) => {
    const currentWatchlists = userStore.watchlists.get()
    userStore.watchlists.set([...currentWatchlists, watchlist])
  },
  
  updateWatchlist: (id: string, updates: Partial<UserWatchlist>) => {
    const currentWatchlists = userStore.watchlists.get()
    const updatedWatchlists = currentWatchlists.map(list =>
      list.id === id ? { ...list, ...updates, updatedAt: new Date().toISOString() } : list
    )
    userStore.watchlists.set(updatedWatchlists)
  },
  
  removeWatchlist: (id: string) => {
    const currentWatchlists = userStore.watchlists.get()
    userStore.watchlists.set(currentWatchlists.filter(list => list.id !== id))
  },
  
  addToWatchlist: (watchlistId: string, mediaId: string) => {
    const currentWatchlists = userStore.watchlists.get()
    const updatedWatchlists = currentWatchlists.map(list => {
      if (list.id === watchlistId && !list.mediaIds.includes(mediaId)) {
        return {
          ...list,
          mediaIds: [...list.mediaIds, mediaId],
          updatedAt: new Date().toISOString(),
        }
      }
      return list
    })
    userStore.watchlists.set(updatedWatchlists)
  },
  
  removeFromWatchlist: (watchlistId: string, mediaId: string) => {
    const currentWatchlists = userStore.watchlists.get()
    const updatedWatchlists = currentWatchlists.map(list => {
      if (list.id === watchlistId) {
        return {
          ...list,
          mediaIds: list.mediaIds.filter(id => id !== mediaId),
          updatedAt: new Date().toISOString(),
        }
      }
      return list
    })
    userStore.watchlists.set(updatedWatchlists)
  },
  
  // Watch history actions
  addToWatchHistory: (historyItem: UserWatchHistory) => {
    const currentHistory = userStore.watchHistory.get()
    const existingIndex = currentHistory.findIndex(item => item.mediaId === historyItem.mediaId)
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updatedHistory = [...currentHistory]
      updatedHistory[existingIndex] = historyItem
      userStore.watchHistory.set(updatedHistory)
    } else {
      // Add new entry
      userStore.watchHistory.set([historyItem, ...currentHistory])
    }
  },
  
  removeFromWatchHistory: (mediaId: string) => {
    const currentHistory = userStore.watchHistory.get()
    userStore.watchHistory.set(currentHistory.filter(item => item.mediaId !== mediaId))
  },
  
  clearWatchHistory: () => {
    userStore.watchHistory.set([])
  },
  
  // Favorites actions
  addToFavorites: (mediaId: string) => {
    const currentFavorites = userStore.favorites.get()
    if (!currentFavorites.includes(mediaId)) {
      userStore.favorites.set([...currentFavorites, mediaId])
    }
  },
  
  removeFromFavorites: (mediaId: string) => {
    const currentFavorites = userStore.favorites.get()
    userStore.favorites.set(currentFavorites.filter(id => id !== mediaId))
  },
  
  // Ratings actions
  setRating: (mediaId: string, rating: number) => {
    const currentRatings = userStore.ratings.get()
    userStore.ratings.set({ ...currentRatings, [mediaId]: rating })
  },
  
  removeRating: (mediaId: string) => {
    const currentRatings = userStore.ratings.get()
    const { [mediaId]: _, ...newRatings } = currentRatings
    userStore.ratings.set(newRatings)
  },
  
  // Recommendations actions
  updateRecommendations: (recommendations: Partial<UserState['recommendations']>) => {
    const currentRecs = userStore.recommendations.get()
    userStore.recommendations.set({
      ...currentRecs,
      ...recommendations,
      lastUpdated: new Date().toISOString(),
    })
  },
  
  // Downloads actions
  addToDownloads: (mediaId: string, type: 'completed' | 'inProgress' | 'failed') => {
    const downloads = userStore.downloads.get()
    const updatedDownloads = { ...downloads }
    
    // Remove from other states
    updatedDownloads.completed = downloads.completed.filter(id => id !== mediaId)
    updatedDownloads.inProgress = downloads.inProgress.filter(id => id !== mediaId)
    updatedDownloads.failed = downloads.failed.filter(id => id !== mediaId)
    
    // Add to target state
    updatedDownloads[type] = [...updatedDownloads[type], mediaId]
    
    userStore.downloads.set(updatedDownloads)
  },
  
  removeFromDownloads: (mediaId: string) => {
    const downloads = userStore.downloads.get()
    userStore.downloads.set({
      ...downloads,
      completed: downloads.completed.filter(id => id !== mediaId),
      inProgress: downloads.inProgress.filter(id => id !== mediaId),
      failed: downloads.failed.filter(id => id !== mediaId),
    })
  },
  
  updateDownloadSize: (totalSize: number, availableSpace: number) => {
    userStore.downloads.totalSize.set(totalSize)
    userStore.downloads.availableSpace.set(availableSpace)
  },
  
  // Social actions
  addFollowing: (userId: string) => {
    const currentFollowing = userStore.social.following.get()
    if (!currentFollowing.includes(userId)) {
      userStore.social.following.set([...currentFollowing, userId])
    }
  },
  
  removeFollowing: (userId: string) => {
    const currentFollowing = userStore.social.following.get()
    userStore.social.following.set(currentFollowing.filter(id => id !== userId))
  },
  
  addFollower: (userId: string) => {
    const currentFollowers = userStore.social.followers.get()
    if (!currentFollowers.includes(userId)) {
      userStore.social.followers.set([...currentFollowers, userId])
    }
  },
  
  removeFollower: (userId: string) => {
    const currentFollowers = userStore.social.followers.get()
    userStore.social.followers.set(currentFollowers.filter(id => id !== userId))
  },
  
  addRecentActivity: (activity: UserState['social']['recentActivity'][0]) => {
    const currentActivity = userStore.social.recentActivity.get()
    userStore.social.recentActivity.set([activity, ...currentActivity.slice(0, 49)]) // Keep last 50
  },
  
  // Reset store
  reset: () => {
    userStore.set(initialState)
  },
}

// Computed values
export const userComputed = {
  // Authentication computed
  get isTokenExpired() {
    const expiresAt = userStore.auth.expiresAt.get()
    return expiresAt ? Date.now() >= expiresAt : true
  },
  
  get isAuthenticated() {
    return userStore.auth.isAuthenticated.get() && !userComputed.isTokenExpired
  },
  
  // Profile computed
  get hasProfile() {
    return !!userStore.profile.get()
  },
  
  get isPremiumUser() {
    const profile = userStore.profile.get()
    return profile?.subscription.tier === 'premium' || profile?.subscription.tier === 'family'
  },
  
  get isSubscriptionActive() {
    const profile = userStore.profile.get()
    if (!profile?.subscription.expiresAt) return true // Free tier or no expiration
    return new Date(profile.subscription.expiresAt) > new Date()
  },
  
  // Data computed
  get totalWatchlists() {
    return userStore.watchlists.get().length
  },
  
  get totalFavorites() {
    return userStore.favorites.get().length
  },
  
  get totalWatchHistory() {
    return userStore.watchHistory.get().length
  },
  
  get totalRatings() {
    return Object.keys(userStore.ratings.get()).length
  },
  
  get watchTimeInHours() {
    const profile = userStore.profile.get()
    return profile ? Math.round(profile.stats.totalWatchTime / 60) : 0
  },
  
  get hasRecentActivity() {
    return userStore.social.recentActivity.get().length > 0
  },
  
  get downloadStorageUsed() {
    return userStore.downloads.totalSize.get()
  },
  
  get downloadStorageAvailable() {
    return userStore.downloads.availableSpace.get()
  },
  
  get downloadStoragePercentUsed() {
    const total = userStore.downloads.totalSize.get()
    const available = userStore.downloads.availableSpace.get()
    const used = total - available
    return total > 0 ? Math.round((used / total) * 100) : 0
  },
}

// Export types
export type UserStore = ObservableObject<UserState>
export type UserActions = typeof userActions
export type UserComputed = typeof userComputed