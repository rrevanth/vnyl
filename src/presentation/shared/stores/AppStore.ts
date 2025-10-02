/**
 * Global Application Store
 * Manages app-wide state including user preferences, theme, and navigation
 */

import { observable, ObservableObject } from '@legendapp/state'
import { persistObservable } from '@legendapp/state/persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

// App state interfaces
export interface AppState {
  // Theme and appearance
  theme: {
    mode: 'light' | 'dark' | 'system'
    accentColor: string
    highContrast: boolean
  }
  
  // User preferences
  preferences: {
    language: string
    region: string
    defaultQuality: 'auto' | '720p' | '1080p' | '4K'
    autoplay: boolean
    skipIntro: boolean
    notifications: boolean
    downloadOnWiFi: boolean
  }
  
  // App state
  app: {
    isInitialized: boolean
    isOnline: boolean
    lastSyncTime: number | null
    currentVersion: string
    updateAvailable: boolean
  }
  
  // Navigation state
  navigation: {
    currentTab: 'home' | 'search' | 'library' | 'settings'
    history: string[]
    canGoBack: boolean
  }
  
  // Error handling
  errors: {
    global: string | null
    network: string | null
    auth: string | null
  }
}

// Initial state
const initialState: AppState = {
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
}

// Create observable store
export const appStore = observable<AppState>(initialState)

// Persist configuration
persistObservable(appStore, {
  local: {
    name: 'vnyl-app-store',
  },
})

// Store actions
export const appActions = {
  // Theme actions
  setTheme: (mode: AppState['theme']['mode']) => {
    appStore.theme.mode.set(mode)
  },
  
  setAccentColor: (color: string) => {
    appStore.theme.accentColor.set(color)
  },
  
  toggleHighContrast: () => {
    appStore.theme.highContrast.set(!appStore.theme.highContrast.get())
  },
  
  // Preference actions
  updatePreferences: (preferences: Partial<AppState['preferences']>) => {
    Object.entries(preferences).forEach(([key, value]) => {
      if (key in appStore.preferences) {
        ;(appStore.preferences as any)[key].set(value)
      }
    })
  },
  
  setLanguage: (language: string) => {
    appStore.preferences.language.set(language)
  },
  
  setRegion: (region: string) => {
    appStore.preferences.region.set(region)
  },
  
  setDefaultQuality: (quality: AppState['preferences']['defaultQuality']) => {
    appStore.preferences.defaultQuality.set(quality)
  },
  
  toggleAutoplay: () => {
    appStore.preferences.autoplay.set(!appStore.preferences.autoplay.get())
  },
  
  toggleSkipIntro: () => {
    appStore.preferences.skipIntro.set(!appStore.preferences.skipIntro.get())
  },
  
  toggleNotifications: () => {
    appStore.preferences.notifications.set(!appStore.preferences.notifications.get())
  },
  
  toggleDownloadOnWiFi: () => {
    appStore.preferences.downloadOnWiFi.set(!appStore.preferences.downloadOnWiFi.get())
  },
  
  // App state actions
  initialize: () => {
    appStore.app.isInitialized.set(true)
  },
  
  setOnlineStatus: (isOnline: boolean) => {
    appStore.app.isOnline.set(isOnline)
  },
  
  updateLastSyncTime: () => {
    appStore.app.lastSyncTime.set(Date.now())
  },
  
  setUpdateAvailable: (available: boolean) => {
    appStore.app.updateAvailable.set(available)
  },
  
  // Navigation actions
  setCurrentTab: (tab: AppState['navigation']['currentTab']) => {
    appStore.navigation.currentTab.set(tab)
  },
  
  addToHistory: (route: string) => {
    const currentHistory = appStore.navigation.history.get()
    appStore.navigation.history.set([...currentHistory, route])
    appStore.navigation.canGoBack.set(currentHistory.length > 0)
  },
  
  goBack: () => {
    const currentHistory = appStore.navigation.history.get()
    if (currentHistory.length > 0) {
      const newHistory = currentHistory.slice(0, -1)
      appStore.navigation.history.set(newHistory)
      appStore.navigation.canGoBack.set(newHistory.length > 0)
    }
  },
  
  clearHistory: () => {
    appStore.navigation.history.set([])
    appStore.navigation.canGoBack.set(false)
  },
  
  // Error actions
  setGlobalError: (error: string | null) => {
    appStore.errors.global.set(error)
  },
  
  setNetworkError: (error: string | null) => {
    appStore.errors.network.set(error)
  },
  
  setAuthError: (error: string | null) => {
    appStore.errors.auth.set(error)
  },
  
  clearErrors: () => {
    appStore.errors.global.set(null)
    appStore.errors.network.set(null)
    appStore.errors.auth.set(null)
  },
  
  // Reset store
  reset: () => {
    appStore.set(initialState)
  },
}

// Computed values
export const appComputed = {
  // Theme computed
  get isDarkMode() {
    const mode = appStore.theme.mode.get()
    if (mode === 'system') {
      // This would need to be handled by a system theme listener
      return false // Default fallback
    }
    return mode === 'dark'
  },
  
  // App state computed
  get isFullyInitialized() {
    return appStore.app.isInitialized.get() && appStore.app.isOnline.get()
  },
  
  get hasErrors() {
    const errors = appStore.errors.get()
    return !!(errors.global || errors.network || errors.auth)
  },
  
  get errorCount() {
    const errors = appStore.errors.get()
    return [errors.global, errors.network, errors.auth].filter(Boolean).length
  },
  
  // Navigation computed
  get navigationHistoryCount() {
    return appStore.navigation.history.get().length
  },
  
  get currentRoute() {
    const history = appStore.navigation.history.get()
    return history[history.length - 1] || '/'
  },
}

// Export types
export type AppStore = ObservableObject<AppState>
export type AppActions = typeof appActions
export type AppComputed = typeof appComputed