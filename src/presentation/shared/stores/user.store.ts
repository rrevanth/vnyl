import { observable, computed } from '@legendapp/state'
import { User, UserPreferences, ThemePreference } from '@/src/domain/entities'

export interface UserStore {
  user: User | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null
}

export const userStore = observable<UserStore>({
  user: null,
  preferences: null,
  isLoading: false,
  error: null
})

// Computed values for easy access to specific preferences
export const userPreferencesComputed = {
  // Theme preference with system fallback
  currentTheme: computed(() => {
    const theme = userStore.preferences.get()?.theme
    if (theme === 'system') {
      // In a real app, you'd check system theme here
      return 'dark' // Default fallback
    }
    return theme || 'dark'
  }),

  // API keys with validation
  hasApiKeys: computed(() => {
    const apiKeys = userStore.preferences.get()?.apiKeys
    return apiKeys && Object.keys(apiKeys).some(key => apiKeys[key])
  }),

  // Auth status
  isAuthenticated: computed(() => {
    const authTokens = userStore.preferences.get()?.authTokens
    return !!(authTokens?.accessToken)
  }),

  // Stream quality with fallback
  streamQuality: computed(() => {
    return userStore.preferences.get()?.streamPreferences.quality || 'auto'
  }),

  // Notification settings
  notificationsEnabled: computed(() => {
    return userStore.preferences.get()?.notificationSettings.enabled || false
  }),

  // Home layout preference
  homeLayout: computed(() => {
    return userStore.preferences.get()?.homeScreenLayout || 'grid'
  }),

  // Preferred providers list
  preferredProviders: computed(() => {
    return userStore.preferences.get()?.providerPreferences.preferredProviders || []
  }),

  // User ID for easy access
  userId: computed(() => {
    return userStore.user.get()?.userId
  }),

  // Last updated timestamp
  lastUpdated: computed(() => {
    return userStore.user.get()?.updatedAt
  })
}

// Actions to update the store
export const userStoreActions = {
  setUser: (user: User | null) => {
    userStore.user.set(user)
    userStore.preferences.set(user?.preferences || null)
  },

  setPreferences: (preferences: UserPreferences) => {
    userStore.preferences.set(preferences)
    // Also update preferences in user object if it exists
    const currentUser = userStore.user.get()
    if (currentUser) {
      userStore.user.set({
        ...currentUser,
        preferences,
        updatedAt: new Date().toISOString()
      })
    }
  },

  updatePreferences: (partialPreferences: Partial<UserPreferences>) => {
    const currentPreferences = userStore.preferences.get()
    if (currentPreferences) {
      const updatedPreferences = { ...currentPreferences, ...partialPreferences }
      userStoreActions.setPreferences(updatedPreferences)
    }
  },

  setLoading: (isLoading: boolean) => {
    userStore.isLoading.set(isLoading)
  },

  setError: (error: string | null) => {
    userStore.error.set(error)
  },

  clearError: () => {
    userStore.error.set(null)
  },

  // Specific preference updaters for common operations
  setTheme: (theme: ThemePreference) => {
    userStoreActions.updatePreferences({ theme })
  },

  updateApiKey: (provider: string, key: string) => {
    const currentPreferences = userStore.preferences.get()
    if (currentPreferences) {
      userStoreActions.updatePreferences({
        apiKeys: {
          ...currentPreferences.apiKeys,
          [provider]: key
        }
      })
    }
  },

  setAuthTokens: (accessToken?: string, refreshToken?: string) => {
    userStoreActions.updatePreferences({
      authTokens: {
        accessToken,
        refreshToken,
        tokenExpiry: accessToken ? new Date(Date.now() + 3600000).toISOString() : undefined // 1 hour from now
      }
    })
  },

  setStreamQuality: (quality: 'auto' | 'high' | 'medium' | 'low') => {
    const currentPreferences = userStore.preferences.get()
    if (currentPreferences) {
      userStoreActions.updatePreferences({
        streamPreferences: {
          ...currentPreferences.streamPreferences,
          quality
        }
      })
    }
  },

  setHomeLayout: (layout: 'grid' | 'list' | 'carousel') => {
    userStoreActions.updatePreferences({ homeScreenLayout: layout })
  },

  toggleNotifications: () => {
    const currentPreferences = userStore.preferences.get()
    if (currentPreferences) {
      userStoreActions.updatePreferences({
        notificationSettings: {
          ...currentPreferences.notificationSettings,
          enabled: !currentPreferences.notificationSettings.enabled
        }
      })
    }
  }
}