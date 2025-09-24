import type { Locale } from '@/src/presentation/shared/i18n'
import type { TMDBConfig } from './provider-configs.entity'
import { DEFAULT_TMDB_CONFIG } from './provider-configs.entity'

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
  locale: Locale
  tmdbConfig: TMDBConfig
  streamPreferences: StreamPreferences
  providerPreferences: ProviderPreferences
  homeScreenLayout: HomeScreenLayoutPreference
  notificationSettings: NotificationPreferences
}

export type ThemePreference = 'light' | 'dark' | 'system'

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
  theme: 'system',
  locale: 'en',
  tmdbConfig: DEFAULT_TMDB_CONFIG,
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