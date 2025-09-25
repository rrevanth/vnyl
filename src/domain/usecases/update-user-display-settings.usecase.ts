import { User, DisplaySettings } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class UpdateUserDisplaySettingsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(displaySettings: DisplaySettings): Promise<User> {
    try {
      this.logger.debug('Updating user display settings', undefined, { displaySettings })

      const updatedUser = await this.userRepository.updatePreferences({ displaySettings })

      this.logger.info('User display settings updated successfully', {
        userId: updatedUser.userId,
        fontSize: displaySettings.fontSize,
        compactMode: displaySettings.compactMode
      })

      return updatedUser
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update user display settings', errorInstance, { displaySettings })
      throw new Error(`Failed to update display settings: ${errorInstance.message}`)
    }
  }
}