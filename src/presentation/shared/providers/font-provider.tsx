import React, { createContext, useContext, useEffect, useState } from 'react'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

// Import fonts from @expo-google-fonts packages
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter'

import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold
} from '@expo-google-fonts/roboto'

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins'

import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold
} from '@expo-google-fonts/open-sans'

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

  // Load custom fonts from @expo-google-fonts packages
  const [fontsLoaded, fontLoadError] = useFonts({
    // Inter font family
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,

    // Roboto font family
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,

    // Poppins font family
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,

    // Open Sans font family
    'OpenSans-Regular': OpenSans_400Regular,
    'OpenSans-Medium': OpenSans_500Medium,
    'OpenSans-SemiBold': OpenSans_600SemiBold,
    'OpenSans-Bold': OpenSans_700Bold,
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
        fontsLoaded,
        fontError
      }}
    >
      {children}
    </FontContext.Provider>
  )
}