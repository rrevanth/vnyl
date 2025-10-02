/**
 * Simplified VNYL Theme Hook
 * Basic theme access using Unistyles
 */

import { useUnistyles } from 'react-native-unistyles'
import { useColorScheme, Dimensions } from 'react-native'

export interface VnylThemeHook {
  theme: any
  isDark: boolean
  isLight: boolean
  screenWidth: number
  screenHeight: number
  breakpoint: string
}

export const useVnylTheme = (): VnylThemeHook => {
  const { theme, rt } = useUnistyles()
  const systemColorScheme = useColorScheme()
  const { width, height } = Dimensions.get('window')
  
  // Determine current theme
  const isDark = systemColorScheme === 'dark'
  const isLight = !isDark
  
  // Get current breakpoint based on width
  let breakpoint = 'xs'
  if (width >= 1920) breakpoint = '2xl'
  else if (width >= 1280) breakpoint = 'xl'
  else if (width >= 1024) breakpoint = 'lg'
  else if (width >= 768) breakpoint = 'md'
  else if (width >= 414) breakpoint = 'sm'
  
  return {
    theme,
    isDark,
    isLight,
    screenWidth: width,
    screenHeight: height,
    breakpoint
  }
}

/**
 * Simple color access hook
 */
export const useVnylColors = () => {
  const { theme } = useVnylTheme()
  
  return {
    background: theme.colors.background,
    text: theme.colors.text,
    interactive: theme.colors.interactive
  }
}