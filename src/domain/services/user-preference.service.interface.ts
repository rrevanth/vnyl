import type {
  UserPreferences,
  StreamPreferences,
  ProviderPreferences,
  NotificationPreferences,
  ThemePreference,
  HomeScreenLayoutPreference
} from '@/src/domain/entities'
import type { Locale } from '@/src/presentation/shared/i18n'

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
  getNotificationPreferences(): NotificationPreferences

  /**
   * Get individual preference values with fallbacks
   */
  getTheme(): ThemePreference
  getLocale(): Locale
  getRegionSettings(): string
  getHomeScreenLayout(): HomeScreenLayoutPreference

  /**
   * Refresh preferences cache from storage
   */
  refreshCache(): Promise<void>

  /**
   * Check if service is ready (preferences loaded)
   */
  isReady(): boolean
}