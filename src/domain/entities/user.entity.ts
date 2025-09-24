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
  apiKeys: ApiKeyPreferences
  authTokens: AuthTokenPreferences
  streamPreferences: StreamPreferences
  providerPreferences: ProviderPreferences
  homeScreenLayout: HomeScreenLayoutPreference
  notificationSettings: NotificationPreferences
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface ApiKeyPreferences {
  tmdb?: string
  spotify?: string
  lastfm?: string
  [key: string]: string | undefined
}

export interface AuthTokenPreferences {
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: string
}

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
  apiKeys: {},
  authTokens: {},
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