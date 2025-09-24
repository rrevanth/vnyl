import type {
  UserPreferences,
  StreamPreferences,
  ProviderPreferences,
  NotificationPreferences,
  ThemePreference,
  HomeScreenLayoutPreference,
  TMDBConfig
} from '@/src/domain/entities'
import { DEFAULT_USER_PREFERENCES, DEFAULT_TMDB_CONFIG } from '@/src/domain/entities'
import type { IUserPreferenceService, ILoggingService, IEnvironmentService } from '@/src/domain/services'
import type { IUserRepository } from '@/src/domain/repositories'
import type { Locale } from '@/src/presentation/shared/i18n'

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

  getTMDBConfig(): TMDBConfig {
    if (!this.isInitialized) {
      this.logger.warn('TMDB config accessed before initialization, returning defaults')
      return { ...DEFAULT_TMDB_CONFIG }
    }

    const preferences = this.getPreferences()
    const userTMDBConfig = preferences?.tmdbConfig ?? DEFAULT_TMDB_CONFIG

    // Return user config as-is, without automatic environment fallback
    return userTMDBConfig
  }

  /**
   * Get the default API key from environment variables
   * This is separate from user preferences for transparency
   */
  getDefaultTMDBApiKey(): string {
    return this.environmentService.getTMDBApiKey() || ''
  }

  /**
   * Get the effective API key (user preference or default)
   * This is what should be used for actual API calls
   */
  getEffectiveTMDBApiKey(): string {
    const userConfig = this.getTMDBConfig()
    return userConfig.apiKey || this.getDefaultTMDBApiKey()
  }

  getStreamPreferences(): StreamPreferences {
    const preferences = this.getPreferences()
    return preferences?.streamPreferences ?? DEFAULT_USER_PREFERENCES.streamPreferences
  }

  getProviderPreferences(): ProviderPreferences {
    const preferences = this.getPreferences()
    return preferences?.providerPreferences ?? DEFAULT_USER_PREFERENCES.providerPreferences
  }

  getNotificationPreferences(): NotificationPreferences {
    const preferences = this.getPreferences()
    return preferences?.notificationSettings ?? DEFAULT_USER_PREFERENCES.notificationSettings
  }

  getTheme(): ThemePreference {
    const preferences = this.getPreferences()
    return preferences?.theme ?? DEFAULT_USER_PREFERENCES.theme
  }

  getLocale(): Locale {
    const preferences = this.getPreferences()
    return preferences?.locale ?? DEFAULT_USER_PREFERENCES.locale
  }

  getRegionSettings(): string {
    const preferences = this.getPreferences()
    return preferences?.providerPreferences?.regionSettings ?? DEFAULT_USER_PREFERENCES.providerPreferences.regionSettings
  }

  getHomeScreenLayout(): HomeScreenLayoutPreference {
    const preferences = this.getPreferences()
    return preferences?.homeScreenLayout ?? DEFAULT_USER_PREFERENCES.homeScreenLayout
  }

  // TMDB-specific methods
  hasTMDBConfig(): boolean {
    const tmdbConfig = this.getTMDBConfig()
    return !!(tmdbConfig.apiKey || tmdbConfig.bearerToken)
  }

  isTMDBConfigured(): boolean {
    const tmdbConfig = this.getTMDBConfig()
    // Configuration is valid if we have either Bearer token OR API key
    return !!(tmdbConfig.bearerToken || tmdbConfig.apiKey)
  }

  getTMDBApiKey(): string | null {
    const tmdbConfig = this.getTMDBConfig()
    return tmdbConfig.apiKey || null
  }

  getTMDBBearerToken(): string | null {
    const tmdbConfig = this.getTMDBConfig()
    return tmdbConfig.bearerToken || null
  }

  getTMDBLanguage(): string {
    const tmdbConfig = this.getTMDBConfig()
    return tmdbConfig.language || DEFAULT_TMDB_CONFIG.language
  }

  getTMDBRegion(): string {
    const tmdbConfig = this.getTMDBConfig()
    return tmdbConfig.region || DEFAULT_TMDB_CONFIG.region
  }

  getTMDBIncludeAdult(): boolean {
    const tmdbConfig = this.getTMDBConfig()
    return tmdbConfig.includeAdult ?? DEFAULT_TMDB_CONFIG.includeAdult
  }
}