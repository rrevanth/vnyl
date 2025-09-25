import { TextStyle } from 'react-native'
import { Theme } from '@/src/presentation/shared/theme'

/**
 * Helper function to create text styles with proper font family application
 */
export const createTextStyle = (
  typography: Theme['typography'][keyof Theme['typography']],
  additionalStyles: TextStyle = {}
): TextStyle => {
  const fontFamily = getFontFamilyName(typography.fontFamily, typography.fontWeight)

  return {
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    fontWeight: fontFamily ? undefined : typography.fontWeight as TextStyle['fontWeight'], // Don't use fontWeight with custom fonts
    fontFamily,
    ...additionalStyles
  }
}

/**
 * Helper function to get the proper font family name for React Native
 * Handles the mapping between user preference and actual font name with weight
 */
export const getFontFamilyName = (fontFamily?: string, fontWeight?: string): string | undefined => {
  if (!fontFamily || fontFamily === 'system') {
    return undefined // Use system default
  }

  // For system font
  if (fontFamily === 'System') {
    return undefined // Let iOS use system font
  }

  // Map font family and weight to exact font names loaded by expo-font
  const weight = fontWeight || '400'

  switch (fontFamily) {
    case 'Inter':
      if (weight === '700' || weight === 'bold') return 'Inter-Bold'
      if (weight === '600' || weight === 'semibold') return 'Inter-SemiBold'
      if (weight === '500' || weight === 'medium') return 'Inter-Medium'
      return 'Inter-Regular'

    case 'Roboto':
      if (weight === '700' || weight === 'bold') return 'Roboto-Bold'
      if (weight === '500' || weight === 'medium') return 'Roboto-Medium'
      return 'Roboto-Regular'

    case 'Poppins':
      if (weight === '700' || weight === 'bold') return 'Poppins-Bold'
      if (weight === '600' || weight === 'semibold') return 'Poppins-SemiBold'
      if (weight === '500' || weight === 'medium') return 'Poppins-Medium'
      return 'Poppins-Regular'

    case 'OpenSans':
      if (weight === '700' || weight === 'bold') return 'OpenSans-Bold'
      if (weight === '600' || weight === 'semibold') return 'OpenSans-SemiBold'
      if (weight === '500' || weight === 'medium') return 'OpenSans-Medium'
      return 'OpenSans-Regular'

    default:
      return fontFamily
  }
}