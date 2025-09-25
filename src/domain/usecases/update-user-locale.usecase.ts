import { LocalePreferences, User } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class UpdateUserLocaleUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(locale: LocalePreferences): Promise<User> {
    try {
      this.logger.debug('Updating user locale preference', undefined, { locale })

      const updatedUser = await this.userRepository.updatePreferences({ locale })

      this.logger.info('User locale preference updated successfully', {
        userId: updatedUser.userId,
      })

      return updatedUser
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update user locale preference', errorInstance, { locale })
      throw new Error(`Failed to update locale preference: ${errorInstance.message}`)
    }
  }
}