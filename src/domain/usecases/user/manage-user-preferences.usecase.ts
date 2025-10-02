import { UserEntity, UserPreferencesUpdate } from '@/domain/entities/user'
import { IUserRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface ManageUserPreferencesRequest {
  userId: string
  preferences: UserPreferencesUpdate
}

export interface ManageUserPreferencesResponse {
  user: UserEntity
  updated: boolean
}

/**
 * Use case for managing user preferences and settings
 * Handles preference validation and persistence
 */
export class ManageUserPreferencesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: ManageUserPreferencesRequest): Promise<ManageUserPreferencesResponse> {
    const { userId, preferences } = request

    // Validate input
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (!preferences || Object.keys(preferences).length === 0) {
      throw new Error('Preferences update cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log preference update
      this.loggingService.logUserAction('update_preferences', userId, {
        preferencesUpdated: Object.keys(preferences)
      })

      // Validate user exists
      const existingUser = await this.userRepository.findById(userId)
      if (!existingUser) {
        this.loggingService.warn('User not found for preference update', {
          userId
        })
        throw new Error(`User with ID ${userId} not found`)
      }

      // Validate preferences
      this.validatePreferences(preferences)

      // Update preferences
      const updatedUser = await this.userRepository.updatePreferences(userId, preferences)

      if (!updatedUser) {
        throw new Error('Failed to update user preferences')
      }

      // Log successful update
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('manage_user_preferences', duration, {
        userId,
        preferencesUpdated: Object.keys(preferences)
      })

      this.loggingService.info('User preferences updated successfully', {
        userId,
        preferencesUpdated: Object.keys(preferences),
        duration_ms: duration
      })

      return {
        user: updatedUser,
        updated: true
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to update user preferences',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          preferencesUpdated: Object.keys(preferences),
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  private validatePreferences(preferences: UserPreferencesUpdate): void {
    // Validate display preferences
    if (preferences.display_preferences) {
      const { theme, language, font_size } = preferences.display_preferences

      if (theme && !['light', 'dark', 'system'].includes(theme)) {
        throw new Error('Invalid theme preference')
      }

      if (language && !['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'].includes(language)) {
        throw new Error('Invalid language preference')
      }

      if (font_size && !['small', 'medium', 'large', 'extra_large'].includes(font_size)) {
        throw new Error('Invalid font size preference')
      }
    }

    // Validate streaming preferences
    if (preferences.streaming_preferences) {
      const { default_quality, download_quality } = preferences.streaming_preferences

      const validQualities = ['auto', '240p', '360p', '480p', '720p', '1080p', '2160p']

      if (default_quality && !validQualities.includes(default_quality)) {
        throw new Error('Invalid default quality preference')
      }

      if (download_quality && !validQualities.includes(download_quality)) {
        throw new Error('Invalid download quality preference')
      }
    }

    // Validate content preferences
    if (preferences.content_preferences) {
      const { favorite_languages } = preferences.content_preferences

      if (favorite_languages) {
        const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
        const invalidLanguages = favorite_languages.filter(lang => !validLanguages.includes(lang))
        
        if (invalidLanguages.length > 0) {
          throw new Error(`Invalid favorite languages: ${invalidLanguages.join(', ')}`)
        }
      }
    }
  }
}