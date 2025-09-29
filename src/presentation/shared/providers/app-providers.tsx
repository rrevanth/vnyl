import React, { useEffect, useState } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { ThemeProvider } from '@/src/presentation/shared/theme'
import { I18nProvider } from '@/src/presentation/shared/i18n'
import { AppErrorBoundary } from '@/src/presentation/shared/error-boundary'
import { UserPreferencesProvider } from './user-preferences-provider'
import { FontProvider } from './font-provider'
import { QueryProvider } from './query-provider'
import { AppLoadingScreen } from '@/src/presentation/components/loading/AppLoadingScreen'
import { MinimalLoadingScreen } from '@/src/presentation/components/loading/MinimalLoadingScreen'
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
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
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

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false)
  }

  // Show minimal loading screen until DI container is initialized
  if (!appState.isInitialized.get()) {
    return <MinimalLoadingScreen progress={50} />
  }

  // Show full loading screen with DI services until fully ready
  if (showLoadingScreen) {
    return (
      <AppErrorBoundary>
        <FontProvider>
          <ThemeProvider initialMode="light">
            <I18nProvider fallbackLocale="en">
              <AppLoadingScreen onLoadingComplete={handleLoadingComplete} />
            </I18nProvider>
          </ThemeProvider>
        </FontProvider>
      </AppErrorBoundary>
    )
  }

  return (
    <AppErrorBoundary>
      <FontProvider>
        <UserPreferencesProvider>
          <ThemeProvider initialMode="light">
            <I18nProvider fallbackLocale="en">
              <QueryProvider>
                {children}
              </QueryProvider>
            </I18nProvider>
          </ThemeProvider>
        </UserPreferencesProvider>
      </FontProvider>
    </AppErrorBoundary>
  )
})