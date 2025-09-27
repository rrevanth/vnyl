import type { Locale } from '@/src/presentation/shared/i18n'
import type { TMDBSettings } from './provider-configs.entity'
import { DEFAULT_TMDB_SETTINGS } from './provider-configs.entity'

export type { Locale } from '@/src/presentation/shared/i18n'

export interface User {
  userId: string
  createdAt: string
  updatedAt: string
  preferences: UserPreferences
  metadata: UserMetadata
}

export interface UserMetadata {
  schemaVersion: number
  deviceInfo?: {
    platform: string
    version: string
  }
}

export interface UserPreferences {
  theme: ThemePreference
  locale: LocalePreferences
  displaySettings: DisplaySettings
  streamPreferences: StreamPreferences
  providerPreferences: ProviderPreferences
  providerSettings: ProviderSettings
  homeScreenLayout: HomeScreenLayoutPreference
  notificationSettings: NotificationPreferences
}

export interface ThemePreference {
  mode: 'light' | 'dark' | 'system'
  accentColor?: string
}

export interface LocalePreferences {
  language: Locale
}

export interface DisplaySettings {
  fontSize: FontSize
  fontFamily?: string
  lineHeight: number
  compactMode: boolean
}

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export interface StreamPreferences {
  quality: StreamQuality
  autoplay: boolean
  downloadOnWifi: boolean
  offlineMode: boolean
}

export type StreamQuality = 'auto' | 'high' | 'medium' | 'low'

export interface ProviderPreferences {
  preferredProviders: string[]
  regionSettings: string
  enabledProviders: Record<string, boolean>
}

 
export interface ProviderSettings {
  /** TMDB (The Movie Database) provider settings */
  tmdb?: TMDBSettings
}

export type HomeScreenLayoutPreference = 'grid' | 'list' | 'carousel'

export interface NotificationPreferences {
  enabled: boolean
  types: NotificationType[]
  pushNotifications: boolean
  emailNotifications: boolean
}

export type NotificationType = 'new_releases' | 'recommendations' | 'updates' | 'promotions'

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: {
    mode: 'system',
  },
  locale: {
    language: 'en',
  },
  displaySettings: {
    fontSize: 'md',
    lineHeight: 1.4,
    compactMode: false,
  },
  streamPreferences: {
    quality: 'auto',
    autoplay: true,
    downloadOnWifi: true,
    offlineMode: false
  },
  providerPreferences: {
    preferredProviders: [],
    regionSettings: 'US',
    enabledProviders: {}
  },
  providerSettings: {
    tmdb: DEFAULT_TMDB_SETTINGS
  },
  homeScreenLayout: 'grid',
  notificationSettings: {
    enabled: true,
    types: ['new_releases', 'recommendations'],
    pushNotifications: true,
    emailNotifications: false
  }
}