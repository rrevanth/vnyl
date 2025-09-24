import { User, ThemePreference } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class UpdateUserThemeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(theme: ThemePreference): Promise<User> {
    try {
      this.logger.debug('Updating user theme preference', undefined, { theme })

      const updatedUser = await this.userRepository.updatePreferences({ theme })

      this.logger.info('User theme preference updated successfully', {
        userId: updatedUser.userId,
        theme
      })

      return updatedUser
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update user theme preference', errorInstance, { theme })
      throw new Error(`Failed to update theme preference: ${errorInstance.message}`)
    }
  }
}