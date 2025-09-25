import React, { useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { ThemeProvider } from '@/src/presentation/shared/theme'
import { I18nProvider } from '@/src/presentation/shared/i18n'
import { AppErrorBoundary } from '@/src/presentation/shared/error-boundary'
import { UserPreferencesProvider } from './user-preferences-provider'
import { FontProvider } from './font-provider'
import { initializeApp } from '@/src/infrastructure/app-container'

interface AppProvidersProps {
  children: React.ReactNode
}

// Observable app state
const appState = observable<{
  isInitialized: boolean
  hasError: boolean
}>({
  isInitialized: false,
  hasError: false
})

export const AppProviders: React.FC<AppProvidersProps> = observer(({ children }) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize DI container and all services with user creation
        await initializeApp()
        appState.isInitialized.set(true)
      } catch (error) {
        // Fallback to console during initialization since logger might not be ready
        console.error('Failed to initialize app:', error)
        appState.hasError.set(true)
        // Still allow app to load even if initialization fails partially
        appState.isInitialized.set(true)
      }
    }

    initialize()
  }, [])

  // Don't render providers until DI container is fully initialized
  if (!appState.isInitialized.get()) {
    return null // Show loading screen or spinner here
  }

  return (
    <AppErrorBoundary>
      <FontProvider>
        <UserPreferencesProvider>
          <ThemeProvider initialMode="light">
            <I18nProvider fallbackLocale="en">
              {children}
            </I18nProvider>
          </ThemeProvider>
        </UserPreferencesProvider>
      </FontProvider>
    </AppErrorBoundary>
  )
})