import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeApp } from '@/src/infrastructure/app-container'

interface AppInitializationContextType {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  retryInitialization: () => void
}

const AppInitializationContext = createContext<AppInitializationContextType | null>(null)

export const useAppInitialization = (): AppInitializationContextType => {
  const context = useContext(AppInitializationContext)
  if (!context) {
    throw new Error('useAppInitialization must be used within an AppInitializationProvider')
  }
  return context
}

interface AppInitializationProviderProps {
  children: React.ReactNode
}

export const AppInitializationProvider: React.FC<AppInitializationProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const performInitialization = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // Initialize the DI container and all services
      initializeApp()

      // Small delay to ensure everything is properly set up
      await new Promise(resolve => setTimeout(resolve, 100))

      setIsInitialized(true)
    } catch (initError) {
      const errorInstance = initError instanceof Error ? initError : new Error(String(initError))
      setError(`Failed to initialize app: ${errorInstance.message}`)
      setIsInitialized(false)
    } finally {
      setIsLoading(false)
    }
  }

  const retryInitialization = (): void => {
    performInitialization()
  }

  useEffect(() => {
    performInitialization()
  }, [])

  const contextValue: AppInitializationContextType = {
    isInitialized,
    isLoading,
    error,
    retryInitialization
  }

  return (
    <AppInitializationContext.Provider value={contextValue}>
      {children}
    </AppInitializationContext.Provider>
  )
}

// Hook to get services after initialization
export const useInitializedServices = () => {
  const { isInitialized, error } = useAppInitialization()

  if (!isInitialized) {
    throw new Error('Services not yet initialized')
  }

  if (error) {
    throw new Error(`Initialization failed: ${error}`)
  }

  // Services are available via DI hooks after initialization
  return {
    isReady: true
  }
}