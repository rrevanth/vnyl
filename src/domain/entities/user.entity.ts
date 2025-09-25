import type { Locale } from '@/src/presentation/shared/i18n'

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
  homeScreenLayout: HomeScreenLayoutPreference
  notificationSettings: NotificationPreferences
}

export interface ThemePreference {
  mode: 'light' | 'dark' | 'system'
  accentColor?: string
  highContrast: boolean
  adaptToContent: boolean
}

export interface LocalePreferences {
  language: Locale
  region: string
  dateFormat: 'iso' | 'us' | 'eu'
  timeFormat: '12h' | '24h'
  currency: string
}

export interface DisplaySettings {
  fontSize: FontSize
  fontFamily?: string
  lineHeight: number
  compactMode: boolean
  animationScale: number
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
    highContrast: false,
    adaptToContent: true
  },
  locale: {
    language: 'en',
    region: 'US',
    dateFormat: 'iso',
    timeFormat: '12h',
    currency: 'USD'
  },
  displaySettings: {
    fontSize: 'md',
    lineHeight: 1.4,
    compactMode: false,
    animationScale: 1.0
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
  homeScreenLayout: 'grid',
  notificationSettings: {
    enabled: true,
    types: ['new_releases', 'recommendations'],
    pushNotifications: true,
    emailNotifications: false
  }
}