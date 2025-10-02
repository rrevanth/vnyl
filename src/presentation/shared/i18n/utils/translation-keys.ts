/**
 * Translation key utilities and validation
 * Provides type-safe key generation and validation functions
 */

import { TranslationNamespace, TranslationKey, DeepKeyOf } from '@/src/presentation/shared/i18n/types'
import { translations } from '@/src/presentation/shared/i18n/locales'

/**
 * Type-safe key builder for nested translation keys
 */
export class TranslationKeyBuilder {
  private namespace: TranslationNamespace
  private keyPath: string[] = []

  constructor(namespace: TranslationNamespace) {
    this.namespace = namespace
  }

  /**
   * Add a key segment to the path
   */
  key(segment: string): TranslationKeyBuilder {
    return new TranslationKeyBuilder(this.namespace).setPath([...this.keyPath, segment])
  }

  /**
   * Set the complete key path
   */
  private setPath(path: string[]): TranslationKeyBuilder {
    this.keyPath = path
    return this
  }

  /**
   * Build the final translation key
   */
  build(): string {
    return this.keyPath.join('.')
  }

  /**
   * Get the full namespaced key
   */
  fullKey(): string {
    return `${this.namespace}:${this.build()}`
  }

  /**
   * Validate that the key exists in translations
   */
  isValid(): boolean {
    return validateTranslationKey(this.namespace, this.build())
  }
}

/**
 * Create a key builder for a specific namespace
 */
export const createKeyBuilder = (namespace: TranslationNamespace): TranslationKeyBuilder => {
  return new TranslationKeyBuilder(namespace)
}

/**
 * Common key builders for frequently used namespaces
 */
export const commonKeys = createKeyBuilder('common')
export const homeKeys = createKeyBuilder('home')
export const searchKeys = createKeyBuilder('search')
export const libraryKeys = createKeyBuilder('library')
export const settingsKeys = createKeyBuilder('settings')
export const mediaDetailKeys = createKeyBuilder('media_detail')
export const personDetailKeys = createKeyBuilder('person_detail')
export const streamSelectionKeys = createKeyBuilder('stream_selection')
export const playerKeys = createKeyBuilder('player')

/**
 * Validate that a translation key exists in the given namespace
 */
export const validateTranslationKey = (
  namespace: TranslationNamespace,
  key: string
): boolean => {
  try {
    const namespaceTranslations = translations.en[namespace]
    if (!namespaceTranslations) {
      return false
    }

    const keyParts = key.split('.')
    let current: any = namespaceTranslations

    for (const part of keyParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return false
      }
    }

    return typeof current === 'string'
  } catch {
    return false
  }
}

/**
 * Get all available keys in a namespace
 */
export const getNamespaceKeys = (namespace: TranslationNamespace): string[] => {
  const namespaceTranslations = translations.en[namespace]
  if (!namespaceTranslations) {
    return []
  }

  const collectKeys = (obj: any, prefix = ''): string[] => {
    const keys: string[] = []
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'string') {
        keys.push(currentKey)
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...collectKeys(value, currentKey))
      }
    })
    
    return keys
  }

  return collectKeys(namespaceTranslations)
}

/**
 * Search for translation keys containing a specific term
 */
export const searchTranslationKeys = (
  namespace: TranslationNamespace,
  searchTerm: string
): string[] => {
  const allKeys = getNamespaceKeys(namespace)
  const lowercaseSearch = searchTerm.toLowerCase()
  
  return allKeys.filter(key => 
    key.toLowerCase().includes(lowercaseSearch)
  )
}

/**
 * Get translation value by key path
 */
export const getTranslationValue = (
  namespace: TranslationNamespace,
  key: string
): string | null => {
  try {
    const namespaceTranslations = translations.en[namespace]
    if (!namespaceTranslations) {
      return null
    }

    const keyParts = key.split('.')
    let current: any = namespaceTranslations

    for (const part of keyParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return null
      }
    }

    return typeof current === 'string' ? current : null
  } catch {
    return null
  }
}

/**
 * Generate interpolation placeholders from a translation string
 */
export const extractInterpolationKeys = (translation: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g
  const keys: string[] = []
  let match

  while ((match = regex.exec(translation)) !== null) {
    keys.push(match[1])
  }

  return keys
}

/**
 * Validate interpolation options against a translation string
 */
export const validateInterpolationOptions = (
  translation: string,
  options: Record<string, any>
): {
  valid: boolean
  missingKeys: string[]
  extraKeys: string[]
} => {
  const requiredKeys = extractInterpolationKeys(translation)
  const providedKeys = Object.keys(options)

  const missingKeys = requiredKeys.filter(key => !(key in options))
  const extraKeys = providedKeys.filter(key => !requiredKeys.includes(key))

  return {
    valid: missingKeys.length === 0,
    missingKeys,
    extraKeys,
  }
}

/**
 * Common key patterns for the VNYL app
 */
export const VNYL_KEY_PATTERNS = {
  // Common action keys
  ACTIONS: {
    PLAY: commonKeys.key('actions').key('play').build(),
    PAUSE: commonKeys.key('actions').key('pause').build(),
    DOWNLOAD: commonKeys.key('actions').key('download').build(),
    SHARE: commonKeys.key('actions').key('share').build(),
    SAVE: commonKeys.key('actions').key('save').build(),
    CANCEL: commonKeys.key('actions').key('cancel').build(),
  },
  
  // Navigation keys
  NAVIGATION: {
    HOME: commonKeys.key('navigation').key('home').build(),
    SEARCH: commonKeys.key('navigation').key('search').build(),
    LIBRARY: commonKeys.key('navigation').key('library').build(),
    SETTINGS: commonKeys.key('navigation').key('settings').build(),
  },
  
  // Status keys
  STATUS: {
    LOADING: commonKeys.key('status').key('loading').build(),
    ERROR: commonKeys.key('status').key('error').build(),
    SUCCESS: commonKeys.key('status').key('success').build(),
    EMPTY: commonKeys.key('status').key('empty').build(),
  },
  
  // Media detail keys
  MEDIA: {
    PLAY: mediaDetailKeys.key('actions').key('play').build(),
    RATING: mediaDetailKeys.key('metadata').key('rating').build(),
    DURATION: mediaDetailKeys.key('metadata').key('duration').build(),
    CAST: mediaDetailKeys.key('metadata').key('cast').build(),
  },
  
  // Player keys
  PLAYER: {
    PLAY: playerKeys.key('controls').key('play').build(),
    PAUSE: playerKeys.key('controls').key('pause').build(),
    FULLSCREEN: playerKeys.key('controls').key('fullscreen').build(),
    VOLUME: playerKeys.key('controls').key('volume').build(),
  },
} as const

/**
 * Type-safe key accessor functions
 */
export const getCommonKey = (path: string): string => {
  return commonKeys.key(path).build()
}

export const getMediaDetailKey = (path: string): string => {
  return mediaDetailKeys.key(path).build()
}

export const getPlayerKey = (path: string): string => {
  return playerKeys.key(path).build()
}

/**
 * Utility for batch key validation
 */
export const validateMultipleKeys = (
  keys: { namespace: TranslationNamespace; key: string }[]
): {
  valid: boolean
  invalidKeys: { namespace: TranslationNamespace; key: string; reason: string }[]
} => {
  const invalidKeys: { namespace: TranslationNamespace; key: string; reason: string }[] = []

  for (const { namespace, key } of keys) {
    if (!validateTranslationKey(namespace, key)) {
      invalidKeys.push({
        namespace,
        key,
        reason: 'Key does not exist in namespace',
      })
    }
  }

  return {
    valid: invalidKeys.length === 0,
    invalidKeys,
  }
}