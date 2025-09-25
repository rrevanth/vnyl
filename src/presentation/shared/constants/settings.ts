import type { FontSize } from '@/src/domain/entities'

// Available accent colors for theme customization
export interface AccentColor {
  name: string
  color: string
}

export const ACCENT_COLORS: AccentColor[] = [
  { name: 'Blue', color: '#007AFF' },
  { name: 'Purple', color: '#5856D6' },
  { name: 'Green', color: '#34C759' },
  { name: 'Orange', color: '#FF9500' },
  { name: 'Red', color: '#FF453A' },
  { name: 'Pink', color: '#FF2D92' },
  { name: 'Teal', color: '#5AC8FA' },
  { name: 'Indigo', color: '#4B0082' }
]

// Font size options with labels
export interface FontSizeOption {
  label: string
  value: FontSize
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: 'XS', value: 'xs' },
  { label: 'SM', value: 'sm' },
  { label: 'MD', value: 'md' },
  { label: 'LG', value: 'lg' },
  { label: 'XL', value: 'xl' },
  { label: 'XXL', value: 'xxl' }
]

// Available fonts (system + expo-font custom fonts)
export interface FontFamily {
  name: string
  value: string
  isCustom?: boolean
}

export const FONT_FAMILIES: FontFamily[] = [
  { name: 'System Default', value: 'system' },
  { name: 'SF Pro Display', value: 'System' }, // Use 'System' for iOS system font
  { name: 'Inter', value: 'Inter', isCustom: true },
  { name: 'Roboto', value: 'Roboto', isCustom: true },
  { name: 'Poppins', value: 'Poppins', isCustom: true },
  { name: 'Open Sans', value: 'OpenSans', isCustom: true } // Note: no spaces in font names
]

// Theme mode options
export interface ThemeModeOption {
  label: string
  value: 'light' | 'dark' | 'system'
}

export const THEME_MODE_OPTIONS: ThemeModeOption[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
]