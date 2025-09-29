import type {
  UserPreferences,
  StreamPreferences,
  ProviderPreferences,
  NotificationPreferences,
  ThemePreference,
  LocalePreferences,
  DisplaySettings,
  HomeScreenLayoutPreference,
  ProviderSettings,
  TMDBSettings
} from '@/src/domain/entities'

/**
 * Service interface for accessing user preferences with caching and reactive updates
 */
export interface IUserPreferenceService {
  /**
   * Initialize the service - must be called before using any methods
   */
  initialize(): Promise<void>

  /**
   * Get all user preferences (cached)
   * Returns null if no user exists or preferences unavailable
   */
  getPreferences(): UserPreferences | null

  /**
   * Get specific preference categories with fallbacks
   */
  getStreamPreferences(): StreamPreferences
  getProviderPreferences(): ProviderPreferences
  getProviderSettings(): ProviderSettings
  getNotificationPreferences(): NotificationPreferences
  getThemePreferences(): ThemePreference
  getLocalePreferences(): LocalePreferences
  getDisplaySettings(): DisplaySettings

  /**
   * Get individual preference values with fallbacks
   */
  getTheme(): ThemePreference
  getLocale(): LocalePreferences
  getRegionSettings(): string
  getHomeScreenLayout(): HomeScreenLayoutPreference

  /**
   * Get provider-specific settings
   */
  getTMDBSettings(): TMDBSettings

  /**
   * Refresh preferences cache from storage
   */
  refreshCache(): Promise<void>

  /**
   * Check if service is ready (preferences loaded)
   */
  isReady(): boolean
}