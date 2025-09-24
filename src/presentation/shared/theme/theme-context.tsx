import React, { createContext, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { createTheme, Theme } from './theme-factory'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  initialMode?: ThemeMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'dark' // Default to dark mode based on existing app
}) => {
  const systemColorScheme = useColorScheme()
  const [mode, setMode] = React.useState<ThemeMode>(initialMode)

  const isDark = React.useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark'
    }
    return mode === 'dark'
  }, [mode, systemColorScheme])

  const theme = React.useMemo(() => {
    return createTheme(isDark ? 'dark' : 'light')
  }, [isDark])

  const contextValue = React.useMemo(
    () => ({
      theme,
      mode,
      isDark,
      setMode
    }),
    [theme, mode, isDark]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const useThemeValue = (): Theme => {
  const { theme } = useTheme()
  return theme
}

export const useIsDarkMode = (): boolean => {
  const { isDark } = useTheme()
  return isDark
}