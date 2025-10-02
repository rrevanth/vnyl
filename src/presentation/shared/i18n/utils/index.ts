/**
 * i18n utilities export
 * Provides easy access to all internationalization utilities
 */

export {
  TranslationKeyBuilder,
  createKeyBuilder,
  commonKeys,
  homeKeys,
  searchKeys,
  libraryKeys,
  settingsKeys,
  mediaDetailKeys,
  personDetailKeys,
  streamSelectionKeys,
  playerKeys,
  validateTranslationKey,
  getNamespaceKeys,
  searchTranslationKeys,
  getTranslationValue,
  extractInterpolationKeys,
  validateInterpolationOptions,
  VNYL_KEY_PATTERNS,
  getCommonKey,
  getMediaDetailKey,
  getPlayerKey,
  validateMultipleKeys,
} from './translation-keys'

export {
  getPluralForm,
  getPluralKeySuffix,
  buildPluralKey,
  getPluralKeyVariants,
  resolvePluralKey,
  validatePluralTranslations,
  getRequiredPluralForms,
  formatCountWithPlural,
  generatePluralKeyMappings,
  VNYL_PLURAL_PATTERNS,
  formatVNYLCount,
} from './pluralization'

export type {
  PluralForm,
  PluralRuleFunction,
} from './pluralization'