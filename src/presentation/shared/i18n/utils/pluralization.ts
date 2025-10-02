/**
 * Pluralization utilities for different languages
 * Handles complex plural rules for various languages
 */

import { SupportedLanguage } from '@/src/domain/services/i18n.service.interface'

/**
 * Plural form types
 */
export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

/**
 * Plural rule function type
 */
export type PluralRuleFunction = (count: number) => PluralForm

/**
 * English plural rules (simple: one/other)
 */
const englishPluralRules: PluralRuleFunction = (count: number): PluralForm => {
  if (count === 1) return 'one'
  return 'other'
}

/**
 * Spanish plural rules
 */
const spanishPluralRules: PluralRuleFunction = (count: number): PluralForm => {
  if (count === 1) return 'one'
  return 'other'
}

/**
 * French plural rules
 */
const frenchPluralRules: PluralRuleFunction = (count: number): PluralForm => {
  if (count === 0 || count === 1) return 'one'
  return 'other'
}

/**
 * German plural rules
 */
const germanPluralRules: PluralRuleFunction = (count: number): PluralForm => {
  if (count === 1) return 'one'
  return 'other'
}

/**
 * Japanese plural rules (no pluralization)
 */
const japanesePluralRules: PluralRuleFunction = (count: number): PluralForm => {
  return 'other'
}

/**
 * Plural rules mapping by language
 */
const PLURAL_RULES: Record<SupportedLanguage, PluralRuleFunction> = {
  en: englishPluralRules,
  es: spanishPluralRules,
  fr: frenchPluralRules,
  de: germanPluralRules,
  ja: japanesePluralRules,
  it: englishPluralRules, // Italian uses same rules as English for simple cases
  pt: spanishPluralRules, // Portuguese uses same rules as Spanish
  ru: englishPluralRules, // Simplified Russian rules
  ko: japanesePluralRules, // Korean doesn't pluralize like Japanese
  zh: japanesePluralRules, // Chinese doesn't pluralize like Japanese
}

/**
 * Get the plural form for a given count and language
 */
export const getPluralForm = (count: number, language: SupportedLanguage): PluralForm => {
  const ruleFunction = PLURAL_RULES[language] || PLURAL_RULES.en
  return ruleFunction(count)
}

/**
 * Generate plural key suffix for a given count and language
 */
export const getPluralKeySuffix = (count: number, language: SupportedLanguage): string => {
  const form = getPluralForm(count, language)
  
  // Map plural forms to key suffixes
  switch (form) {
    case 'zero':
      return '_zero'
    case 'one':
      return '_one'
    case 'two':
      return '_two'
    case 'few':
      return '_few'
    case 'many':
      return '_many'
    case 'other':
    default:
      return '_other'
  }
}

/**
 * Build plural translation key
 */
export const buildPluralKey = (
  baseKey: string,
  count: number,
  language: SupportedLanguage
): string => {
  const suffix = getPluralKeySuffix(count, language)
  return `${baseKey}${suffix}`
}

/**
 * Plural key variants for common cases
 */
export const getPluralKeyVariants = (baseKey: string): string[] => {
  return [
    `${baseKey}_zero`,
    `${baseKey}_one`,
    `${baseKey}_two`,
    `${baseKey}_few`,
    `${baseKey}_many`,
    `${baseKey}_other`,
    `${baseKey}_plural`, // Legacy support
  ]
}

/**
 * Smart plural key resolution
 * Tries different plural forms in order of preference
 */
export const resolvePluralKey = (
  baseKey: string,
  count: number,
  language: SupportedLanguage,
  availableKeys: string[]
): string => {
  // First try the exact plural form for the language
  const exactForm = buildPluralKey(baseKey, count, language)
  if (availableKeys.includes(exactForm)) {
    return exactForm
  }
  
  // Try common fallbacks
  const fallbacks = [
    count === 1 ? `${baseKey}_one` : `${baseKey}_other`,
    `${baseKey}_plural`,
    baseKey, // No suffix fallback
  ]
  
  for (const fallback of fallbacks) {
    if (availableKeys.includes(fallback)) {
      return fallback
    }
  }
  
  // Return the base key as final fallback
  return baseKey
}

/**
 * Validate plural translation structure
 */
export const validatePluralTranslations = (
  baseKey: string,
  translations: Record<string, string>,
  language: SupportedLanguage
): {
  valid: boolean
  missingForms: string[]
  extraForms: string[]
  recommendations: string[]
} => {
  const requiredForms = getRequiredPluralForms(language)
  const availableForms = Object.keys(translations).filter(key => 
    key.startsWith(baseKey)
  )
  
  const missingForms = requiredForms.filter(form => {
    const fullKey = `${baseKey}${form}`
    return !availableForms.includes(fullKey)
  })
  
  const validSuffixes = new Set([
    '_zero', '_one', '_two', '_few', '_many', '_other', '_plural'
  ])
  
  const extraForms = availableForms.filter(key => {
    const suffix = key.replace(baseKey, '')
    return suffix && !validSuffixes.has(suffix)
  })
  
  const recommendations: string[] = []
  
  // Language-specific recommendations
  if (language === 'en' && !availableForms.includes(`${baseKey}_other`)) {
    recommendations.push('Consider adding "_other" form for English plurals')
  }
  
  if (language === 'fr' && !availableForms.includes(`${baseKey}_one`)) {
    recommendations.push('French uses "_one" for 0 and 1, "_other" for 2+')
  }
  
  return {
    valid: missingForms.length === 0,
    missingForms,
    extraForms,
    recommendations,
  }
}

/**
 * Get required plural forms for a language
 */
export const getRequiredPluralForms = (language: SupportedLanguage): string[] => {
  switch (language) {
    case 'en':
    case 'es':
    case 'de':
      return ['_one', '_other']
    case 'fr':
      return ['_one', '_other']
    case 'ja':
      return ['_other'] // Japanese doesn't pluralize
    default:
      return ['_one', '_other']
  }
}

/**
 * Format count with appropriate plural form
 */
export const formatCountWithPlural = (
  count: number,
  singularText: string,
  pluralText?: string,
  language: SupportedLanguage = 'en'
): string => {
  const form = getPluralForm(count, language)
  
  if (form === 'one') {
    return `${count} ${singularText}`
  }
  
  const plural = pluralText || `${singularText}s`
  return `${count} ${plural}`
}

/**
 * Generate plural key mappings for a base key
 */
export const generatePluralKeyMappings = (baseKey: string): Record<string, string> => {
  return {
    zero: `${baseKey}_zero`,
    one: `${baseKey}_one`,
    two: `${baseKey}_two`,
    few: `${baseKey}_few`,
    many: `${baseKey}_many`,
    other: `${baseKey}_other`,
    plural: `${baseKey}_plural`,
  }
}

/**
 * Common VNYL app plural patterns
 */
export const VNYL_PLURAL_PATTERNS = {
  // Media counts
  MOVIES: {
    base: 'movies_count',
    one: 'movies_count_one', // "1 movie"
    other: 'movies_count_other', // "5 movies"
  },
  
  TV_SHOWS: {
    base: 'shows_count',
    one: 'shows_count_one',
    other: 'shows_count_other',
  },
  
  EPISODES: {
    base: 'episodes',
    one: 'episodes_one',
    other: 'episodes_other',
  },
  
  SEASONS: {
    base: 'seasons',
    one: 'seasons_one',
    other: 'seasons_other',
  },
  
  // Time units
  MINUTES: {
    base: 'minutes_ago',
    one: 'minutes_ago_one',
    other: 'minutes_ago_other',
  },
  
  HOURS: {
    base: 'hours_ago',
    one: 'hours_ago_one',
    other: 'hours_ago_other',
  },
  
  DAYS: {
    base: 'days_ago',
    one: 'days_ago_one',
    other: 'days_ago_other',
  },
  
  // Search results
  RESULTS: {
    base: 'found_results',
    one: 'found_results_one',
    other: 'found_results_other',
  },
} as const

/**
 * Helper for VNYL-specific plural formatting
 */
export const formatVNYLCount = (
  count: number,
  pattern: keyof typeof VNYL_PLURAL_PATTERNS,
  language: SupportedLanguage = 'en'
): string => {
  const { base } = VNYL_PLURAL_PATTERNS[pattern]
  return buildPluralKey(base, count, language)
}