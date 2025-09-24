import { User } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class ResetUserPreferencesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(): Promise<User> {
    try {
      this.logger.info('Resetting user preferences to defaults')

      const user = await this.userRepository.resetPreferences()

      this.logger.info('User preferences reset successfully', {
        userId: user.userId
      })

      return user
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to reset user preferences', errorInstance)
      throw new Error(`Failed to reset preferences: ${errorInstance.message}`)
    }
  }
}