/**
 * Shared Stores Barrel Export
 * Centralized exports for all global stores
 */

// Store exports
// Store hooks for React components
import { useObservable } from '@legendapp/state/react'
import { appStore } from './AppStore'
import { userStore } from './UserStore'

export { appStore, appActions, appComputed } from './AppStore'
export { userStore, userActions, userComputed } from './UserStore'

// Type exports
export type { AppStore, AppActions, AppComputed, AppState } from './AppStore'
export type { 
  UserStore, 
  UserActions, 
  UserComputed, 
  UserState, 
  UserProfile, 
  UserWatchlist, 
  UserWatchHistory 
} from './UserStore'

/**
 * Hook to access app store with reactivity
 * @returns Reactive app store
 */
export const useAppStore = () => {
  return useObservable(appStore)
}

/**
 * Hook to access user store with reactivity
 * @returns Reactive user store
 */
export const useUserStore = () => {
  return useObservable(userStore)
}

/**
 * Hook to access specific app state slice
 * @param selector - Function to select specific state slice
 * @returns Selected state slice with reactivity
 */
export const useAppState = <T>(selector: (state: typeof appStore) => T): T => {
  return useObservable(() => selector(appStore)) as T
}

/**
 * Hook to access specific user state slice
 * @param selector - Function to select specific state slice
 * @returns Selected state slice with reactivity
 */
export const useUserState = <T>(selector: (state: typeof userStore) => T): T => {
  return useObservable(() => selector(userStore)) as T
}

// Combined store utilities
export const storeUtils = {
  /**
   * Reset all stores to initial state
   */
  resetAll: () => {
    appStore.set({
      theme: {
        mode: 'system',
        accentColor: '#007AFF',
        highContrast: false,
      },
      preferences: {
        language: 'en',
        region: 'US',
        defaultQuality: 'auto',
        autoplay: true,
        skipIntro: false,
        notifications: true,
        downloadOnWiFi: true,
      },
      app: {
        isInitialized: false,
        isOnline: true,
        lastSyncTime: null,
        currentVersion: '1.0.0',
        updateAvailable: false,
      },
      navigation: {
        currentTab: 'home',
        history: [],
        canGoBack: false,
      },
      errors: {
        global: null,
        network: null,
        auth: null,
      },
    })
    
    userStore.set({
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
    })
  },
  
  /**
   * Get store hydration status
   */
  getHydrationStatus: () => {
    return {
      app: {
        isInitialized: appStore.app.isInitialized.get(),
        hasErrors: !!(appStore.errors.global.get() || appStore.errors.network.get() || appStore.errors.auth.get()),
      },
      user: {
        isAuthenticated: userStore.auth.isAuthenticated.get(),
        hasProfile: !!userStore.profile.get(),
      },
    }
  },
  
  /**
   * Export store data for debugging
   */
  exportData: () => {
    return {
      app: appStore.get(),
      user: {
        ...userStore.get(),
        auth: {
          ...userStore.auth.get(),
          accessToken: userStore.auth.accessToken.get() ? '[REDACTED]' : null,
          refreshToken: userStore.auth.refreshToken.get() ? '[REDACTED]' : null,
        },
      },
    }
  },
}

// Store initialization utilities
export const initializeStores = async () => {
  try {
    // Mark app as initialized
    appStore.app.isInitialized.set(true)
    
    // Check authentication status
    const accessToken = userStore.auth.accessToken.get()
    const expiresAt = userStore.auth.expiresAt.get()
    
    if (accessToken && expiresAt && Date.now() < expiresAt) {
      userStore.auth.isAuthenticated.set(true)
    } else {
      userStore.auth.isAuthenticated.set(false)
      userStore.auth.accessToken.set(null)
      userStore.auth.refreshToken.set(null)
    }
    
    return true
  } catch (error) {
    console.error('Failed to initialize stores:', error)
    appStore.errors.global.set('Failed to initialize application')
    return false
  }
}

// Export all computed values for easy access
export const computed = {
  app: {
    get isDarkMode() {
      const mode = appStore.theme.mode.get()
      if (mode === 'system') {
        // This would need to be handled by a system theme listener
        return false // Default fallback
      }
      return mode === 'dark'
    },
    
    get isFullyInitialized() {
      return appStore.app.isInitialized.get() && appStore.app.isOnline.get()
    },
    
    get hasErrors() {
      const errors = appStore.errors.get()
      return !!(errors.global || errors.network || errors.auth)
    },
  },
  
  user: {
    get isAuthenticated() {
      const isAuth = userStore.auth.isAuthenticated.get()
      const expiresAt = userStore.auth.expiresAt.get()
      return isAuth && (!expiresAt || Date.now() < expiresAt)
    },
    
    get isPremiumUser() {
      const profile = userStore.profile.get()
      return profile?.subscription.tier === 'premium' || profile?.subscription.tier === 'family'
    },
    
    get totalContent() {
      return {
        watchlists: userStore.watchlists.get().length,
        favorites: userStore.favorites.get().length,
        watchHistory: userStore.watchHistory.get().length,
        ratings: Object.keys(userStore.ratings.get()).length,
      }
    },
  },
}