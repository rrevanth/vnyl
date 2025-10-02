/**
 * Main i18n export for the presentation layer
 * Provides comprehensive internationalization support for React Native components
 */

// Export hooks
export { 
  useTranslation, 
  useNamespacedTranslation, 
  withTranslation,
} from './hooks'

// Export utilities
export {
  createKeyBuilder,
  validateTranslationKey,
  commonKeys,
  homeKeys,
  searchKeys,
  libraryKeys,
  settingsKeys,
  mediaDetailKeys,
  personDetailKeys,
  streamSelectionKeys,
  playerKeys,
  VNYL_KEY_PATTERNS,
  getPluralForm,
  buildPluralKey,
  VNYL_PLURAL_PATTERNS,
} from './utils'

// Export types
export type {
  TranslationNamespace,
  UseTranslationReturn,
  TranslationParams,
  PluralForm,
} from './types'

// Export translations
export { translations, type AvailableTranslations } from './locales'

// Export configuration and setup
export { setupI18n, I18nProvider, detectBestSupportedLanguage } from './setup'