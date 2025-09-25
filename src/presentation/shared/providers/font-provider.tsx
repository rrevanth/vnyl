import React, { createContext, useContext, useEffect, useState } from 'react'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

interface FontContextValue {
  fontsLoaded: boolean
  fontError: Error | null
}

const FontContext = createContext<FontContextValue>({
  fontsLoaded: false,
  fontError: null
})

export const useFontContext = () => useContext(FontContext)

interface FontProviderProps {
  children: React.ReactNode
}

export const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [fontError, setFontError] = useState<Error | null>(null)

  // Load custom fonts
  const [fontsLoaded, fontLoadError] = useFonts({
    // For now, we'll use system fonts and add custom fonts later
    // 'Inter-Regular': require('../../../../assets/fonts/Inter-Regular.ttf'),
    // 'Inter-Medium': require('../../../../assets/fonts/Inter-Medium.ttf'),
    // 'Inter-SemiBold': require('../../../../assets/fonts/Inter-SemiBold.ttf'),
    // 'Inter-Bold': require('../../../../assets/fonts/Inter-Bold.ttf'),

    // 'Roboto-Regular': require('../../../../assets/fonts/Roboto-Regular.ttf'),
    // 'Roboto-Medium': require('../../../../assets/fonts/Roboto-Medium.ttf'),
    // 'Roboto-Bold': require('../../../../assets/fonts/Roboto-Bold.ttf'),

    // For now, let's just ensure the provider works with system fonts
  })

  useEffect(() => {
    if (fontLoadError) {
      setFontError(fontLoadError)
    }
  }, [fontLoadError])

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  return (
    <FontContext.Provider
      value={{
        fontsLoaded: true, // Set to true for now since we're using system fonts
        fontError
      }}
    >
      {children}
    </FontContext.Provider>
  )
}