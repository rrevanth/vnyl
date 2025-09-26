import React, { useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/src/presentation/shared/theme'
import { I18nProvider } from '@/src/presentation/shared/i18n'
import { AppErrorBoundary } from '@/src/presentation/shared/error-boundary'
import { UserPreferencesProvider } from './user-preferences-provider'
import { FontProvider } from './font-provider'
import { initializeApp } from '@/src/infrastructure/app-container'
import { createQueryClient } from '@/src/infrastructure/query/query-client.config'

interface AppProvidersProps {
  children: React.ReactNode
}

// Observable app state
const appState = observable<{
  isInitialized: boolean
  hasError: boolean
  queryClient: QueryClient | null
}>({
  isInitialized: false,
  hasError: false,
  queryClient: null
})

export const AppProviders: React.FC<AppProvidersProps> = observer(({ children }) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize DI container and all services with user creation
        await initializeApp()
        
        // Create QueryClient after DI container is ready (for logger access)
        const queryClient = createQueryClient()
        appState.queryClient.set(queryClient)
        
        appState.isInitialized.set(true)
      } catch (error) {
        // Fallback to console during initialization since logger might not be ready
        console.error('Failed to initialize app:', error)
        appState.hasError.set(true)
        
        // Create QueryClient without logger as fallback
        const queryClient = createQueryClient()
        appState.queryClient.set(queryClient)
        
        // Still allow app to load even if initialization fails partially
        appState.isInitialized.set(true)
      }
    }

    initialize()
  }, [])

  // Don't render providers until DI container is fully initialized
  if (!appState.isInitialized.get() || !appState.queryClient.get()) {
    return null // Show loading screen or spinner here
  }

  const queryClient = appState.queryClient.get()!

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FontProvider>
          <UserPreferencesProvider>
            <ThemeProvider initialMode="light">
              <I18nProvider fallbackLocale="en">
                {children}
              </I18nProvider>
            </ThemeProvider>
          </UserPreferencesProvider>
        </FontProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
})