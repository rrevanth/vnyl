import { useEffect } from 'react'
import { User, UserPreferences } from '@/src/domain/entities'
import { userStore, userStoreActions, userPreferencesComputed } from '@/src/presentation/shared/stores'
import {
  UseUserQueryResult,
  UseUserPreferencesQueryResult,
  UseUpdatePreferencesMutationResult,
  UseResetPreferencesMutationResult
} from '@/src/infrastructure/query'

// Re-export store actions and computed values for convenience
export { userStoreActions, userPreferencesComputed }

export interface UserPreferencesHook {
  // Current state
  user: User | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null

  // Query results
  userQuery: UseUserQueryResult
  preferencesQuery: UseUserPreferencesQueryResult

  // Mutations
  updatePreferences: UseUpdatePreferencesMutationResult
  resetPreferences: UseResetPreferencesMutationResult

  // Computed values
  currentTheme: 'light' | 'dark'
  hasApiKeys: boolean
  isAuthenticated: boolean
  notificationsEnabled: boolean
  homeLayout: 'grid' | 'list' | 'carousel'
  preferredProviders: string[]

  // Actions
  actions: typeof userStoreActions
}

export interface UseUserPreferencesOptions {
  autoSync?: boolean // Automatically sync TanStack Query with Legend State
}

// This will be injected with the actual query hooks from DI
let queryHooks: {
  useUserQuery: () => UseUserQueryResult
  useUserPreferencesQuery: () => UseUserPreferencesQueryResult
  useUpdatePreferencesMutation: () => UseUpdatePreferencesMutationResult
  useResetPreferencesMutation: () => UseResetPreferencesMutationResult
} | null = null

export const setUserQueryHooks = (hooks: typeof queryHooks) => {
  queryHooks = hooks
}

export const useUserPreferences = (options: UseUserPreferencesOptions = {}): UserPreferencesHook => {
  const { autoSync = true } = options

  if (!queryHooks) {
    throw new Error('User query hooks not initialized. Make sure UserPreferencesProvider is set up.')
  }

  // TanStack Query hooks
  const userQuery = queryHooks.useUserQuery()
  const preferencesQuery = queryHooks.useUserPreferencesQuery()
  const updatePreferences = queryHooks.useUpdatePreferencesMutation()
  const resetPreferences = queryHooks.useResetPreferencesMutation()

  // Auto-sync TanStack Query data with Legend State
  useEffect(() => {
    if (autoSync && userQuery.data) {
      userStoreActions.setUser(userQuery.data)
      userStoreActions.setLoading(false)
      userStoreActions.clearError()
    }
  }, [userQuery.data, autoSync])

  useEffect(() => {
    if (autoSync) {
      userStoreActions.setLoading(userQuery.isLoading || preferencesQuery.isLoading)
    }
  }, [userQuery.isLoading, preferencesQuery.isLoading, autoSync])

  useEffect(() => {
    if (autoSync && (userQuery.error || preferencesQuery.error)) {
      const error = userQuery.error || preferencesQuery.error
      userStoreActions.setError(error?.message || 'Unknown error occurred')
    }
  }, [userQuery.error, preferencesQuery.error, autoSync])

  return {
    // Current state from Legend State
    user: userStore.user.get(),
    preferences: userStore.preferences.get(),
    isLoading: userStore.isLoading.get(),
    error: userStore.error.get(),

    // Query results
    userQuery,
    preferencesQuery,
    updatePreferences,
    resetPreferences,

    // Computed values
    currentTheme: userPreferencesComputed.currentTheme.get(),
    hasApiKeys: userPreferencesComputed.hasApiKeys.get(),
    isAuthenticated: userPreferencesComputed.isAuthenticated.get(),
    notificationsEnabled: userPreferencesComputed.notificationsEnabled.get(),
    homeLayout: userPreferencesComputed.homeLayout.get(),
    preferredProviders: userPreferencesComputed.preferredProviders.get(),

    // Actions
    actions: userStoreActions
  }
}

// Convenience hooks for specific preference categories
export const useThemePreferences = () => {
  const { currentTheme, actions } = useUserPreferences()
  return {
    currentTheme,
    setTheme: actions.setTheme
  }
}

export const useApiKeyPreferences = () => {
  const { preferences, hasApiKeys, actions } = useUserPreferences()
  return {
    apiKeys: preferences?.apiKeys || {},
    hasApiKeys,
    updateApiKey: actions.updateApiKey
  }
}

export const useAuthPreferences = () => {
  const { preferences, isAuthenticated, actions } = useUserPreferences()
  return {
    authTokens: preferences?.authTokens || {},
    isAuthenticated,
    setAuthTokens: actions.setAuthTokens
  }
}

export const useStreamPreferences = () => {
  const { preferences, actions } = useUserPreferences()
  return {
    streamPreferences: preferences?.streamPreferences,
    setStreamQuality: actions.setStreamQuality
  }
}

export const useNotificationPreferences = () => {
  const { preferences, notificationsEnabled, actions } = useUserPreferences()
  return {
    notificationSettings: preferences?.notificationSettings,
    notificationsEnabled,
    toggleNotifications: actions.toggleNotifications
  }
}

export const useHomeLayoutPreferences = () => {
  const { homeLayout, actions } = useUserPreferences()
  return {
    homeLayout,
    setHomeLayout: actions.setHomeLayout
  }
}