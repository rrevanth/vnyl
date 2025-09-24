import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { AppErrorBoundary, AppLoadingScreen } from '@/src/presentation/shared/components'
import { AppInitializationProvider, useAppInitialization } from '@/src/presentation/shared/providers'

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

const RootLayoutContent: React.FC = () => {
  const { isInitialized, isLoading, error, retryInitialization } = useAppInitialization()

  React.useEffect(() => {
    if (isInitialized && !isLoading && !error) {
      // Hide splash screen when app is fully initialized
      SplashScreen.hideAsync()
    }
  }, [isInitialized, isLoading, error])

  // Show loading screen during initialization
  if (isLoading || !isInitialized || error) {
    return (
      <AppLoadingScreen
        isLoading={isLoading}
        error={error}
        onRetry={retryInitialization}
      />
    )
  }

  // App is initialized, show the main navigation
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <StatusBar style="light" backgroundColor="#000000" />
    </>
  )
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <AppInitializationProvider>
        <RootLayoutContent />
      </AppInitializationProvider>
    </AppErrorBoundary>
  )
}
