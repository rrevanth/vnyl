/**
 * Main translations export
 * Combines all language translations
 */

import { en } from './en/index'
import { es } from './es/index'
import { fr } from './fr/index'
import { de } from './de/index'
import { ja } from './ja/index'

export const translations = {
  en,
  es,
  fr,
  de,
  ja,
} as const

export type AvailableTranslations = typeof translations

export default translations