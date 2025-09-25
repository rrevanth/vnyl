import React, { createContext, useContext, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { useGetOrCreateUserUseCase, useStorage } from '@/src/infrastructure/di'
import type {
  UserPreferences,
  ThemePreference,
  LocalePreferences,
  DisplaySettings,
  ProviderPreferences
} from '@/src/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/src/domain/entities'

// Storage key for UserPreferences
const USER_PREFERENCES_STORAGE_KEY = 'user_preferences'

interface UserPreferencesContextValue {
  preferences: UserPreferences
  // Theme preferences
  themePreference: ThemePreference
  // Locale preferences
  localePreferences: LocalePreferences
  // Display settings
  displaySettings: DisplaySettings
  // Provider preferences
  providerPreferences: ProviderPreferences
  // Loading state
  isLoading: boolean
  // Error state
  error: Error | null
  // Refresh function
  refresh: () => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)

// Observable user preferences state
const userPreferencesState = observable<{
  preferences: UserPreferences
  isLoading: boolean
  error: Error | null
  ready: boolean
}>({
  preferences: DEFAULT_USER_PREFERENCES,
  isLoading: true,
  error: null,
  ready: false
})

interface UserPreferencesProviderProps {
  children: React.ReactNode
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = observer(({
  children
}) => {
  // Safely try to get services, handling DI container race condition
  let getOrCreateUserUseCase: any = null
  let storageService: any = null

  try {
    getOrCreateUserUseCase = useGetOrCreateUserUseCase()
  } catch {
    // Services not ready yet, continue with default preferences
  }

  try {
    storageService = useStorage()
  } catch {
    // Storage service not ready yet
  }

  // Initialize storage service for persistence
  useEffect(() => {
    if (storageService) {
      setStorageService(storageService)
    }
  }, [storageService])

  // Load preferences from storage on startup
  useEffect(() => {
    const loadStoredPreferences = async () => {
      if (!storageService) return

      try {
        const stored = await storageService.getItem(USER_PREFERENCES_STORAGE_KEY)
        if (stored) {
          const parsedPreferences = JSON.parse(stored) as UserPreferences
          userPreferencesState.preferences.set(parsedPreferences)
          console.log('Loaded user preferences from storage')
        }
      } catch (error) {
        console.warn('Failed to load user preferences from storage:', error)
        // Continue with defaults
      }
    }

    loadStoredPreferences()
  }, [storageService])

  // Initialize user preferences from backend
  useEffect(() => {
    if (!getOrCreateUserUseCase) {
      return
    }

    const initializePreferences = async () => {
      try {
        userPreferencesState.isLoading.set(true)
        userPreferencesState.error.set(null)

        const user = await getOrCreateUserUseCase.execute()

        userPreferencesState.preferences.set(user.preferences)
        userPreferencesState.ready.set(true)
      } catch (error) {
        console.warn('UserPreferencesProvider: Failed to load user preferences', error)
        userPreferencesState.error.set(error instanceof Error ? error : new Error(String(error)))
        // Continue with default preferences
        userPreferencesState.preferences.set(DEFAULT_USER_PREFERENCES)
      } finally {
        userPreferencesState.isLoading.set(false)
      }
    }

    initializePreferences()
  }, [getOrCreateUserUseCase])

  const refresh = async (): Promise<void> => {
    if (!getOrCreateUserUseCase) return

    try {
      userPreferencesState.isLoading.set(true)
      userPreferencesState.error.set(null)

      const user = await getOrCreateUserUseCase.execute()
      userPreferencesState.preferences.set(user.preferences)
    } catch (error) {
      console.warn('UserPreferencesProvider: Failed to refresh user preferences', error)
      userPreferencesState.error.set(error instanceof Error ? error : new Error(String(error)))
    } finally {
      userPreferencesState.isLoading.set(false)
    }
  }

  const contextValue: UserPreferencesContextValue = {
    preferences: userPreferencesState.preferences.get(),
    themePreference: userPreferencesState.preferences.theme.get(),
    localePreferences: userPreferencesState.preferences.locale.get(),
    displaySettings: userPreferencesState.preferences.displaySettings.get(),
    providerPreferences: userPreferencesState.preferences.providerPreferences.get(),
    isLoading: userPreferencesState.isLoading.get(),
    error: userPreferencesState.error.get(),
    refresh
  }

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  )
})

// Hooks for accessing user preferences
export const useUserPreferences = (): UserPreferencesContextValue => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}

export const useThemePreference = (): ThemePreference => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useThemePreference must be used within a UserPreferencesProvider')
  }
  return context.themePreference
}

export const useLocalePreferences = (): LocalePreferences => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useLocalePreferences must be used within a UserPreferencesProvider')
  }
  return context.localePreferences
}

export const useDisplaySettings = (): DisplaySettings => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useDisplaySettings must be used within a UserPreferencesProvider')
  }
  return context.displaySettings
}

export const useProviderPreferences = (): ProviderPreferences => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useProviderPreferences must be used within a UserPreferencesProvider')
  }
  return context.providerPreferences
}

// Export observable state for theme context to observe
export const getUserPreferencesObservable = () => userPreferencesState.preferences

// Storage helper functions
let _storageService: any = null

export const setStorageService = (storage: any) => {
  _storageService = storage
}

const persistPreferencesToStorage = async (preferences: UserPreferences) => {
  if (!_storageService) return

  try {
    await _storageService.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
    console.log('Successfully persisted user preferences to storage')
  } catch (error) {
    console.warn('Failed to persist user preferences to storage:', error)
  }
}

// Utility function to update preferences in observable state and persist to storage
export const updateUserPreferencesState = async (preferences: Partial<UserPreferences>): Promise<void> => {
  const currentPreferences = userPreferencesState.preferences.get()

  // Deep merge the preferences
  const updatedPreferences: UserPreferences = {
    ...currentPreferences,
    ...preferences,
    theme: {
      ...currentPreferences.theme,
      ...preferences.theme
    },
    locale: {
      ...currentPreferences.locale,
      ...preferences.locale
    },
    displaySettings: {
      ...currentPreferences.displaySettings,
      ...preferences.displaySettings
    },
    providerPreferences: {
      ...currentPreferences.providerPreferences,
      ...preferences.providerPreferences,
      enabledProviders: {
        ...currentPreferences.providerPreferences.enabledProviders,
        ...preferences.providerPreferences?.enabledProviders
      }
    },
    streamPreferences: {
      ...currentPreferences.streamPreferences,
      ...preferences.streamPreferences
    },
    notificationSettings: {
      ...currentPreferences.notificationSettings,
      ...preferences.notificationSettings
    }
  }

  // Update observable state immediately for instant UI updates
  userPreferencesState.preferences.set(updatedPreferences)

  // Persist to storage asynchronously
  await persistPreferencesToStorage(updatedPreferences)

  // Note: Theme updates are handled by the theme context listening to user preferences
  // The theme context will automatically recreate themes when it detects preference changes
}