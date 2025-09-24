/**
 * Settings Feature Slice - Public API
 *
 * This file exports the public interface for the Settings feature slice.
 * Following Feature Slice Design (FSD) principles, only necessary components
 * and utilities are exposed to other parts of the application.
 */

// Main UI Components
export { SettingsScreen } from './ui/settings-screen'
export { PreferenceSection } from './ui/preference-section'
export { PreferenceItem } from './ui/preference-item'

// Configuration and Types
export { SETTINGS_SECTIONS, getSettingByKey, getSettingsByCategory } from './lib/settings.config'
export type {
  SettingConfig,
  SettingSection,
  SettingType,
  SettingCategory,
  SettingsScreenProps,
  PreferenceSectionProps,
  PreferenceItemProps
} from './model/settings.types'

// Utilities (selective export)
export {
  formatSettingValue,
  getPreferenceValue,
  createPreferenceUpdate,
  validateAllSettings,
  filterSettings
} from './model/settings.utils'