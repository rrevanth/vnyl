/**
 * Settings Feature Types
 *
 * TypeScript definitions specific to the Settings feature slice
 */

import type { ReactNode } from 'react'
import type { UserPreferences } from '@/src/domain/entities'

// Re-export types that are used elsewhere
export type {
  ThemePreference,
  StreamQuality,
  HomeScreenLayoutPreference,
  NotificationType
} from '@/src/domain/entities'

// Re-export config types that are used elsewhere
export type SettingType =
  | 'switch'
  | 'select'
  | 'multiSelect'
  | 'text'
  | 'password'
  | 'button'
  | 'navigation'

export type SettingCategory =
  | 'theme'
  | 'apiKeys'
  | 'streaming'
  | 'notifications'
  | 'homeLayout'
  | 'account'
  | 'privacy'
  | 'about'

export interface SettingOption {
  label: string
  value: string | boolean | number
  description?: string
  icon?: string
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean
}

export interface SettingConfig {
  key: string
  label: string
  description: string
  type: SettingType
  category: SettingCategory
  defaultValue?: any
  validation?: ValidationRule[]
  options?: SettingOption[]
  placeholder?: string
  secure?: boolean
  disabled?: boolean
  icon?: string
}

export interface SettingSection {
  id: SettingCategory
  title: string
  description?: string
  icon?: string
  settings: SettingConfig[]
  order: number
}

// Settings Screen Props - Reserved for future navigation props
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SettingsScreenProps {
  // Future: navigation, route, and other props will be added here
}

// Settings Section Component Props
export interface PreferenceSectionProps {
  title: string
  description?: string
  icon?: string
  children: ReactNode
  headerAction?: {
    title: string
    onPress: () => void
  }
  showDivider?: boolean
  containerStyle?: any
}

// Settings Item Component Props
export interface PreferenceItemProps {
  config: SettingConfig
  value?: any
  onValueChange: (key: string, value: any) => void
  disabled?: boolean
  loading?: boolean
  error?: string
}

// Settings State Types
export interface SettingsState {
  activeSection?: SettingCategory
  searchQuery: string
  isLoading: boolean
  errors: Record<string, string>
  hasUnsavedChanges: boolean
  validationErrors: Record<string, string[]>
}

// Settings Actions
export interface SettingsActions {
  setActiveSection: (section: SettingCategory | undefined) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (key: string, error: string) => void
  clearError: (key: string) => void
  clearAllErrors: () => void
  setValidationError: (key: string, errors: string[]) => void
  clearValidationError: (key: string) => void
  markUnsavedChanges: (hasChanges: boolean) => void
}

// Settings Value Change Handler Type
export type SettingValueChangeHandler = (key: string, value: any) => Promise<void> | void

// Settings Validation Result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Settings Export Data
export interface SettingsExportData {
  preferences: UserPreferences
  exportedAt: string
  version: string
  deviceInfo?: {
    platform: string
    version: string
  }
}

// Settings Import Result
export interface SettingsImportResult {
  success: boolean
  importedPreferences?: Partial<UserPreferences>
  errors?: string[]
  warnings?: string[]
}

// Settings Action Handlers
export interface SettingsActionHandlers {
  handleExportData: () => Promise<void>
  handleBackupData: () => Promise<void>
  handleResetPreferences: () => Promise<void>
  handlePrivacyPolicy: () => void
  handleTermsOfService: () => void
  handleSupport: () => void
  handleAppVersion: () => void
}

// Settings Form Data
export interface SettingsFormData {
  [key: string]: any
}

// Settings Change Event
export interface SettingsChangeEvent {
  key: string
  value: any
  previousValue: any
  category: SettingCategory
}

// Settings Validation Context
export interface SettingsValidationContext {
  currentPreferences: UserPreferences
  changedValues: Record<string, any>
  category: SettingCategory
}

// Settings UI State
export interface SettingsUIState {
  expandedSections: Set<SettingCategory>
  focusedInput?: string
  showAdvancedSettings: boolean
  confirmationDialog?: {
    type: 'reset' | 'export' | 'backup'
    title: string
    message: string
    onConfirm: () => void
  }
}

// Settings Filter Options
export interface SettingsFilterOptions {
  category?: SettingCategory
  hasErrors?: boolean
  hasChanges?: boolean
  searchQuery?: string
}

// Settings Accessibility Props
export interface SettingsAccessibilityProps {
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: string
  accessibilityState?: {
    disabled?: boolean
    expanded?: boolean
    selected?: boolean
  }
}

// Platform-specific Settings
export interface PlatformSettingsConfig {
  ios?: Partial<SettingConfig>
  android?: Partial<SettingConfig>
  web?: Partial<SettingConfig>
}

// Settings Theme Integration
export interface SettingsThemeProps {
  variant?: 'default' | 'compact' | 'detailed'
  colorScheme?: 'light' | 'dark' | 'system'
}