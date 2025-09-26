export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  background: {
    primary: string
    secondary: string
    tertiary: string
    elevated: string
    inverse: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
    disabled: string
  }
  border: {
    primary: string
    secondary: string
    focus: string
    error: string
  }
  interactive: {
    primary: string
    primaryPressed: string
    secondary: string
    secondaryPressed: string
    tertiary: string
    disabled: string
  }
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
  overlay: {
    backdrop: string
    surface: string
  }
}

export interface ThemeSpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
  xxxl: number
}

export type FontWeight = 
  | 'normal' 
  | 'bold' 
  | '100' 
  | '200' 
  | '300' 
  | '400' 
  | '500' 
  | '600' 
  | '700' 
  | '800' 
  | '900'
  | 100 
  | 200 
  | 300 
  | 400 
  | 500 
  | 600 
  | 700 
  | 800 
  | 900

export interface ThemeTypography {
  display: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  heading1: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  heading2: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  heading3: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  body: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  bodySmall: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  caption: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
  button: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    fontFamily?: string
  }
}

export interface ThemeRadius {
  none: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  full: number
}

export interface ThemeShadows {
  none: object
  xs: object
  sm: object
  md: object
  lg: object
  xl: object
}

export interface ThemeTransition {
  duration: {
    fast: number
    normal: number
    slow: number
  }
  easing: {
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

export interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  radius: ThemeRadius
  shadows: ThemeShadows
  transition: ThemeTransition
}

export interface ThemeContextValue {
  theme: Theme
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}