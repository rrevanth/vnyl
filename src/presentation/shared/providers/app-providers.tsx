import React, { useEffect, useState } from 'react'
import { observer } from '@legendapp/state/react'
import { ThemeProvider } from '@/src/presentation/shared/theme'
import { I18nProvider } from '@/src/presentation/shared/i18n'
import { initializeApp } from '@/src/infrastructure/app-container'

interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = observer(({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize DI container and all services
        initializeApp()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        // Still allow app to load even if initialization fails partially
        setIsInitialized(true)
      }
    }

    initialize()
  }, [])

  // Don't render children until DI is initialized
  if (!isInitialized) {
    return null
  }

  return (
    <ThemeProvider initialMode="light">
      <I18nProvider fallbackLocale="en">
        {children}
      </I18nProvider>
    </ThemeProvider>
  )
})