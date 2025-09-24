import { User, UserPreferences } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class UpdateUserPreferencesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(preferences: Partial<UserPreferences>): Promise<User> {
    try {
      this.logger.debug('Updating user preferences', undefined, {
        preferenceKeys: Object.keys(preferences)
      })

      const updatedUser = await this.userRepository.updatePreferences(preferences)

      this.logger.info('User preferences updated successfully', {
        userId: updatedUser.userId,
        updatedKeys: Object.keys(preferences)
      })

      return updatedUser
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update user preferences', errorInstance, {
        preferenceKeys: Object.keys(preferences)
      })
      throw new Error(`Failed to update preferences: ${errorInstance.message}`)
    }
  }
}