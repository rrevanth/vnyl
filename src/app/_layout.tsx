import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AppProviders } from '@/src/presentation/shared/providers'

// Prevent the splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // Hide splash screen immediately - providers will handle initialization
  SplashScreen.hideAsync()

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  )
}
