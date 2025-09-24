import { User } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class GetOrCreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(): Promise<User> {
    try {
      this.logger.debug('Getting or creating user')

      let user = await this.userRepository.getUser()

      if (!user) {
        this.logger.info('No existing user found, creating new user')
        user = await this.userRepository.createUser()
        this.logger.info('New user created successfully', { userId: user.userId })
      } else {
        this.logger.debug('Existing user found', undefined, { userId: user.userId })
      }

      return user
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get or create user', errorInstance)
      throw new Error(`Failed to get or create user: ${errorInstance.message}`)
    }
  }
}