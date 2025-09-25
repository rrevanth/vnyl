import type {
  UserPreferences,
  StreamPreferences,
  ProviderPreferences,
  NotificationPreferences,
  ThemePreference,
  LocalePreferences,
  DisplaySettings,
  HomeScreenLayoutPreference
} from '@/src/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/src/domain/entities'
import type { IUserPreferenceService, ILoggingService, IEnvironmentService } from '@/src/domain/services'
import type { IUserRepository } from '@/src/domain/repositories'

/**
 * User preference service with caching for performance
 * Provides synchronous access to user preferences for services
 * Must be initialized before use
 */
export class UserPreferenceService implements IUserPreferenceService {
  private preferencesCache: UserPreferences | null = null
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService,
    private readonly environmentService: IEnvironmentService
  ) {
    // Don't initialize in constructor - will be called explicitly
  }

  /**
   * Initialize the service - must be called before using any methods
   */
  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.initializeCache()
    return this.initializationPromise
  }

  private async initializeCache(): Promise<void> {
    try {
      this.logger.debug('Initializing user preferences cache')
      const user = await this.userRepository.getUser()

      if (user) {
        this.preferencesCache = user.preferences
        this.logger.debug('User preferences cache initialized successfully')
      } else {
        this.logger.debug('No user found, using default preferences')
        this.preferencesCache = { ...DEFAULT_USER_PREFERENCES }
      }

      this.isInitialized = true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize user preferences cache', errorInstance)
      this.preferencesCache = { ...DEFAULT_USER_PREFERENCES }
      this.isInitialized = true
    }
  }

  async refreshCache(): Promise<void> {
    try {
      this.logger.debug('Refreshing user preferences cache')
      const user = await this.userRepository.getUser()

      if (user) {
        this.preferencesCache = user.preferences
        this.logger.debug('User preferences cache refreshed successfully')
      } else {
        this.logger.warn('No user found during cache refresh, keeping current cache')
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to refresh user preferences cache', errorInstance)
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getPreferences(): UserPreferences | null {
    if (!this.isInitialized) {
      // Return defaults when not initialized instead of null
      this.logger.warn('User preferences accessed before initialization, returning defaults')
      return { ...DEFAULT_USER_PREFERENCES }
    }
    return this.preferencesCache
  }

  getStreamPreferences(): StreamPreferences {
    const preferences = this.getPreferences()
    if (!preferences) {
      this.logger.debug('No preferences available, returning default stream preferences')
      return DEFAULT_USER_PREFERENCES.streamPreferences
    }
    return preferences.streamPreferences ?? DEFAULT_USER_PREFERENCES.streamPreferences
  }

  getProviderPreferences(): ProviderPreferences {
    const preferences = this.getPreferences()
    if (!preferences) {
      this.logger.debug('No preferences available, returning default provider preferences')
      return DEFAULT_USER_PREFERENCES.providerPreferences
    }
    return preferences.providerPreferences ?? DEFAULT_USER_PREFERENCES.providerPreferences
  }

  getNotificationPreferences(): NotificationPreferences {
    const preferences = this.getPreferences()
    if (!preferences) {
      this.logger.debug('No preferences available, returning default notification preferences')
      return DEFAULT_USER_PREFERENCES.notificationSettings
    }
    return preferences.notificationSettings ?? DEFAULT_USER_PREFERENCES.notificationSettings
  }

  getThemePreferences(): ThemePreference {
    const preferences = this.getPreferences()
    return preferences?.theme ?? DEFAULT_USER_PREFERENCES.theme
  }

  getLocalePreferences(): LocalePreferences {
    const preferences = this.getPreferences()
    return preferences?.locale ?? DEFAULT_USER_PREFERENCES.locale
  }

  getDisplaySettings(): DisplaySettings {
    const preferences = this.getPreferences()
    return preferences?.displaySettings ?? DEFAULT_USER_PREFERENCES.displaySettings
  }

  getTheme(): ThemePreference {
    return this.getThemePreferences()
  }

  getLocale(): LocalePreferences {
    return this.getLocalePreferences()
  }

  getRegionSettings(): string {
    const preferences = this.getPreferences()
    return preferences?.providerPreferences?.regionSettings ?? DEFAULT_USER_PREFERENCES.providerPreferences.regionSettings
  }

  getHomeScreenLayout(): HomeScreenLayoutPreference {
    const preferences = this.getPreferences()
    return preferences?.homeScreenLayout ?? DEFAULT_USER_PREFERENCES.homeScreenLayout
  }
}