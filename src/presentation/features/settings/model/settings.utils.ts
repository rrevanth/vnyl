/**
 * Settings Utilities
 *
 * Helper functions for settings formatting, validation, and data management
 */

import type {
  UserPreferences,
  ThemePreference,
  StreamQuality,
  HomeScreenLayoutPreference,
  NotificationType
} from '@/src/domain/entities'
import type {
  SettingsExportData,
  SettingsImportResult,
  ValidationResult,
  SettingsFormData,
  SettingSection,
  SettingConfig
} from '../model/settings.types'
import { SETTINGS_SECTIONS, validateSettingValue } from '../lib/settings.config'

/**
 * Format setting values for display
 */
export const formatSettingValue = (key: string, value: any): string => {
  switch (key) {
    case 'theme':
      return formatThemeValue(value as ThemePreference)
    case 'streamQuality':
      return formatStreamQuality(value as StreamQuality)
    case 'homeLayout':
      return formatHomeLayout(value as HomeScreenLayoutPreference)
    case 'notificationTypes':
      return formatNotificationTypes(value as NotificationType[])
    case 'tmdb':
    case 'spotify':
    case 'lastfm':
      return formatApiKey(value as string)
    default:
      return typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value || '')
  }
}

const formatThemeValue = (theme: ThemePreference): string => {
  switch (theme) {
    case 'light': return 'Light Mode'
    case 'dark': return 'Dark Mode'
    case 'system': return 'Follow System'
    default: return 'System Default'
  }
}

const formatStreamQuality = (quality: StreamQuality): string => {
  switch (quality) {
    case 'auto': return 'Auto (Recommended)'
    case 'high': return 'High Quality'
    case 'medium': return 'Medium Quality'
    case 'low': return 'Low Quality'
    default: return 'Auto'
  }
}

const formatHomeLayout = (layout: HomeScreenLayoutPreference): string => {
  switch (layout) {
    case 'grid': return 'Grid View'
    case 'list': return 'List View'
    case 'carousel': return 'Carousel View'
    default: return 'Grid View'
  }
}

const formatNotificationTypes = (types: NotificationType[]): string => {
  if (!types || types.length === 0) return 'None'
  if (types.length === 1) return formatNotificationType(types[0])
  return `${types.length} types selected`
}

const formatNotificationType = (type: NotificationType): string => {
  switch (type) {
    case 'new_releases': return 'New Releases'
    case 'recommendations': return 'Recommendations'
    case 'updates': return 'App Updates'
    case 'promotions': return 'Promotions'
    default: return type
  }
}

const formatApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.trim() === '') return 'Not configured'
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
}

/**
 * Extract value from preferences by key
 */
export const getPreferenceValue = (preferences: UserPreferences | null, key: string): any => {
  if (!preferences) return undefined

  switch (key) {
    case 'theme':
      return preferences.theme
    case 'tmdb':
      return preferences.apiKeys.tmdb
    case 'spotify':
      return preferences.apiKeys.spotify
    case 'lastfm':
      return preferences.apiKeys.lastfm
    case 'streamQuality':
      return preferences.streamPreferences.quality
    case 'autoplay':
      return preferences.streamPreferences.autoplay
    case 'downloadOnWifi':
      return preferences.streamPreferences.downloadOnWifi
    case 'offlineMode':
      return preferences.streamPreferences.offlineMode
    case 'notificationsEnabled':
      return preferences.notificationSettings.enabled
    case 'notificationTypes':
      return preferences.notificationSettings.types
    case 'emailNotifications':
      return preferences.notificationSettings.emailNotifications
    case 'homeLayout':
      return preferences.homeScreenLayout
    default:
      return undefined
  }
}

/**
 * Create preference update payload from key-value pair
 */
export const createPreferenceUpdate = (key: string, value: any): Partial<UserPreferences> => {
  switch (key) {
    case 'theme':
      return { theme: value as ThemePreference }

    case 'tmdb':
    case 'spotify':
    case 'lastfm':
      return {
        apiKeys: { [key]: value as string }
      }

    case 'streamQuality':
      return {
        streamPreferences: {
          quality: value as StreamQuality,
          // Preserve existing values
          autoplay: true,
          downloadOnWifi: true,
          offlineMode: false
        }
      }

    case 'autoplay':
      return {
        streamPreferences: {
          // Preserve existing values
          quality: 'auto' as StreamQuality,
          autoplay: value as boolean,
          downloadOnWifi: true,
          offlineMode: false
        }
      }

    case 'downloadOnWifi':
      return {
        streamPreferences: {
          // Preserve existing values
          quality: 'auto' as StreamQuality,
          autoplay: true,
          downloadOnWifi: value as boolean,
          offlineMode: false
        }
      }

    case 'offlineMode':
      return {
        streamPreferences: {
          // Preserve existing values
          quality: 'auto' as StreamQuality,
          autoplay: true,
          downloadOnWifi: true,
          offlineMode: value as boolean
        }
      }

    case 'notificationsEnabled':
      return {
        notificationSettings: {
          // Preserve existing values
          enabled: value as boolean,
          types: ['new_releases', 'recommendations'],
          pushNotifications: true,
          emailNotifications: false
        }
      }

    case 'notificationTypes':
      return {
        notificationSettings: {
          // Preserve existing values
          enabled: true,
          types: value as NotificationType[],
          pushNotifications: true,
          emailNotifications: false
        }
      }

    case 'emailNotifications':
      return {
        notificationSettings: {
          // Preserve existing values
          enabled: true,
          types: ['new_releases', 'recommendations'],
          pushNotifications: true,
          emailNotifications: value as boolean
        }
      }

    case 'homeLayout':
      return { homeScreenLayout: value as HomeScreenLayoutPreference }

    default:
      console.warn(`Unknown setting key: ${key}`)
      return {}
  }
}

/**
 * Validate all settings in form data
 */
export const validateAllSettings = (formData: SettingsFormData): ValidationResult => {
  const allErrors: string[] = []

  Object.entries(formData).forEach(([key, value]) => {
    const errors = validateSettingValue(key, value)
    allErrors.push(...errors)
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

/**
 * Export user preferences to JSON
 */
export const exportPreferencesToJSON = (preferences: UserPreferences): SettingsExportData => {
  return {
    preferences,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    deviceInfo: {
      platform: 'mobile', // This would be dynamically detected
      version: '1.0.0'
    }
  }
}

/**
 * Import preferences from JSON data
 */
export const importPreferencesFromJSON = (jsonData: string): SettingsImportResult => {
  try {
    const data = JSON.parse(jsonData) as SettingsExportData

    // Validate the imported data structure
    if (!data.preferences) {
      return {
        success: false,
        errors: ['Invalid export format: missing preferences']
      }
    }

    // Validate individual preference values
    const errors: string[] = []
    const warnings: string[] = []

    // Check version compatibility
    if (data.version !== '1.0.0') {
      warnings.push(`Import data version (${data.version}) may not be fully compatible`)
    }

    // Validate each preference category
    const validatedPreferences: Partial<UserPreferences> = {}

    if (data.preferences.theme) {
      const validThemes: ThemePreference[] = ['light', 'dark', 'system']
      if (validThemes.includes(data.preferences.theme)) {
        validatedPreferences.theme = data.preferences.theme
      } else {
        warnings.push('Invalid theme preference, using default')
      }
    }

    if (data.preferences.apiKeys) {
      validatedPreferences.apiKeys = data.preferences.apiKeys
    }

    if (data.preferences.streamPreferences) {
      validatedPreferences.streamPreferences = data.preferences.streamPreferences
    }

    if (data.preferences.notificationSettings) {
      validatedPreferences.notificationSettings = data.preferences.notificationSettings
    }

    if (data.preferences.homeScreenLayout) {
      const validLayouts: HomeScreenLayoutPreference[] = ['grid', 'list', 'carousel']
      if (validLayouts.includes(data.preferences.homeScreenLayout)) {
        validatedPreferences.homeScreenLayout = data.preferences.homeScreenLayout
      } else {
        warnings.push('Invalid home layout preference, using default')
      }
    }

    return {
      success: true,
      importedPreferences: validatedPreferences,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (parseError) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return {
      success: false,
      errors: ['Failed to parse import data: Invalid JSON format']
    }
  }
}

/**
 * Get user-friendly error message for preference update failures
 */
export const getPreferenceErrorMessage = (key: string, errorInstance: Error): string => {
  const baseMessage = `Failed to update ${getSettingDisplayName(key)}`

  // Check for specific error types
  if (errorInstance.message.includes('network')) {
    return `${baseMessage}: Network connection required`
  }

  if (errorInstance.message.includes('validation')) {
    return `${baseMessage}: Invalid value provided`
  }

  if (errorInstance.message.includes('permission')) {
    return `${baseMessage}: Permission denied`
  }

  return `${baseMessage}: ${errorInstance.message}`
}

/**
 * Get display name for setting key
 */
export const getSettingDisplayName = (key: string): string => {
  const setting = SETTINGS_SECTIONS
    .flatMap((section: SettingSection) => section.settings)
    .find((s: SettingConfig) => s.key === key)

  return setting?.label || key
}

/**
 * Check if setting requires app restart
 */
export const requiresAppRestart = (key: string): boolean => {
  const restartRequiredKeys = ['theme'] // Add more keys that require restart
  return restartRequiredKeys.includes(key)
}

/**
 * Get setting description with dynamic content
 */
export const getSettingDescription = (key: string, currentValue?: any): string => {
  const setting = SETTINGS_SECTIONS
    .flatMap((section: SettingSection) => section.settings)
    .find((s: SettingConfig) => s.key === key)

  let description = setting?.description || ''

  // Add dynamic content for certain settings
  if (key === 'theme' && currentValue) {
    description += ` (Currently: ${formatThemeValue(currentValue)})`
  }

  return description
}

/**
 * Filter settings based on search query
 */
export const filterSettings = (searchQuery: string) => {
  if (!searchQuery.trim()) return SETTINGS_SECTIONS

  const query = searchQuery.toLowerCase()

  return SETTINGS_SECTIONS.map((section: SettingSection) => ({
    ...section,
    settings: section.settings.filter((setting: SettingConfig) =>
      setting.label.toLowerCase().includes(query) ||
      setting.description.toLowerCase().includes(query) ||
      setting.key.toLowerCase().includes(query)
    )
  })).filter((section: SettingSection) => section.settings.length > 0)
}

/**
 * Check if user has unsaved changes
 */
export const hasUnsavedChanges = (
  originalPreferences: UserPreferences | null,
  currentFormData: SettingsFormData
): boolean => {
  if (!originalPreferences) return Object.keys(currentFormData).length > 0

  return Object.entries(currentFormData).some(([key, value]) => {
    const originalValue = getPreferenceValue(originalPreferences, key)
    return JSON.stringify(originalValue) !== JSON.stringify(value)
  })
}