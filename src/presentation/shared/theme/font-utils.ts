import { TextStyle } from 'react-native'
import { Theme } from '@/src/presentation/shared/theme'

/**
 * Helper function to create text styles with proper font family application
 */
export const createTextStyle = (
  typography: Theme['typography'][keyof Theme['typography']],
  additionalStyles: TextStyle = {}
): TextStyle => {
  return {
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    fontWeight: typography.fontWeight as TextStyle['fontWeight'],
    fontFamily: typography.fontFamily,
    ...additionalStyles
  }
}

/**
 * Helper function to get the proper font family name for React Native
 * Handles the mapping between user preference and actual font name
 */
export const getFontFamilyName = (fontFamily?: string): string | undefined => {
  if (!fontFamily || fontFamily === 'system') {
    return undefined // Use system default
  }

  // For iOS, some font names need special handling
  switch (fontFamily) {
    case 'System':
      return undefined // Let iOS use system font
    case 'Inter':
      return 'Inter' // Will work if font is loaded
    case 'Roboto':
      return 'Roboto' // Will work if font is loaded
    case 'Poppins':
      return 'Poppins' // Will work if font is loaded
    case 'OpenSans':
      return 'OpenSans' // Will work if font is loaded
    default:
      return fontFamily
  }
}