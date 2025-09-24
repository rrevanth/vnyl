import { User, TMDBConfig } from '@/src/domain/entities'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

export class UpdateTMDBConfigUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  async execute(config: Partial<TMDBConfig>): Promise<User> {
    try {
      this.logger.debug('Updating TMDB configuration', undefined, config)

      // Get current user or create if not exists
      let user = await this.userRepository.getUser()
      if (!user) {
        this.logger.info('No user found, creating new user before updating TMDB config')
        user = await this.userRepository.createUser()
      }

      // Merge the new TMDB config with existing preferences
      const currentTMDBConfig = user.preferences.tmdbConfig
      const updatedTMDBConfig: TMDBConfig = {
        ...currentTMDBConfig,
        ...config
      }

      // Update user preferences with new TMDB config
      const updatedPreferences = {
        ...user.preferences,
        tmdbConfig: updatedTMDBConfig
      }

      this.logger.info('Updating user TMDB configuration', {
        userId: user.userId,
        configKeys: Object.keys(config),
        hasApiKey: !!updatedTMDBConfig.apiKey,
        hasBearerToken: !!updatedTMDBConfig.bearerToken,
        language: updatedTMDBConfig.language,
        region: updatedTMDBConfig.region
      })

      // Update preferences in repository
      const updatedUser = await this.userRepository.updatePreferences(updatedPreferences)

      this.logger.info('TMDB configuration updated successfully', {
        userId: updatedUser.userId,
        configurationComplete: !!(updatedTMDBConfig.apiKey && updatedTMDBConfig.bearerToken)
      })

      return updatedUser
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update TMDB configuration', errorInstance, {
        configKeys: Object.keys(config)
      })
      throw new Error(`Failed to update TMDB configuration: ${errorInstance.message}`)
    }
  }
}