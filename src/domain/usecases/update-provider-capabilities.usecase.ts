/**
 * Update Provider Capabilities Use Case
 * 
 * Updates capability configuration for a provider in user preferences.
 * This use case follows CLEAN architecture principles by using dependency
 * injection and leveraging the existing user repository pattern.
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { User, CapabilityConfig } from '@/src/domain/entities'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'
import { IUserRepository } from '@/src/domain/repositories'
import { ILoggingService } from '@/src/domain/services'

/**
 * Use case for updating provider capability settings in user preferences
 */
export class UpdateProviderCapabilitiesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to update provider capability settings
   * 
   * @param providerId - The ID of the provider to update capabilities for
   * @param capabilitySettings - Record of capability configurations to update
   * @returns Promise<User> - Updated user with new capability settings
   */
  async execute(
    providerId: string,
    capabilitySettings: Record<ProviderCapability, CapabilityConfig>
  ): Promise<User> {
    try {
      this.logger.debug('Updating provider capability settings', undefined, {
        providerId,
        capabilityCount: Object.keys(capabilitySettings).length,
        capabilities: Object.keys(capabilitySettings)
      })

      // Validate inputs
      if (!providerId || typeof providerId !== 'string' || providerId.trim() === '') {
        throw new Error('Provider ID is required and must be a non-empty string')
      }

      if (!capabilitySettings || typeof capabilitySettings !== 'object') {
        throw new Error('Capability settings must be a valid object')
      }

      const trimmedProviderId = providerId.trim()

      // Validate capability settings structure
      for (const [capability, config] of Object.entries(capabilitySettings)) {
        if (!Object.values(ProviderCapability).includes(capability as ProviderCapability)) {
          throw new Error(`Invalid capability: ${capability}`)
        }

        if (!config || typeof config !== 'object') {
          throw new Error(`Invalid capability config for ${capability}`)
        }

        if (typeof config.enabled !== 'boolean') {
          throw new Error(`Capability config for ${capability} must have a boolean 'enabled' property`)
        }
      }

      // Get current user to access existing preferences
      const currentUser = await this.userRepository.getUser()
      if (!currentUser) {
        throw new Error('User not found - cannot update provider capabilities')
      }

      // Create the updated preferences structure
      // For TMDB provider, we update the tmdbSettings.capabilitySettings
      // For other providers, we would extend the ProviderSettings interface
      let updatedPreferences

      if (trimmedProviderId === 'tmdb') {
        // Update TMDB capabilities specifically
        updatedPreferences = {
          providerSettings: {
            ...currentUser.preferences.providerSettings,
            tmdbSettings: {
              ...currentUser.preferences.providerSettings.tmdbSettings,
              capabilitySettings: {
                ...currentUser.preferences.providerSettings.tmdbSettings.capabilitySettings,
                ...capabilitySettings
              }
            }
          }
        }
      } else {
        // For other providers, log that they need extended support
        this.logger.warn('Provider capability updates not yet supported', undefined, {
          providerId: trimmedProviderId,
          supportedProviders: ['tmdb']
        })
        throw new Error(`Provider capability updates not yet implemented for provider: ${trimmedProviderId}`)
      }

      this.logger.debug('Prepared capability updates', undefined, {
        providerId: trimmedProviderId,
        updatedCapabilities: Object.keys(capabilitySettings),
        enabledCapabilities: Object.entries(capabilitySettings)
          .filter(([, config]) => config.enabled)
          .map(([capability]) => capability)
      })

      // Update user preferences through repository
      const updatedUser = await this.userRepository.updatePreferences(updatedPreferences)

      this.logger.info('Provider capability settings updated successfully', {
        userId: updatedUser.userId,
        providerId: trimmedProviderId,
        updatedCapabilities: Object.keys(capabilitySettings),
        enabledCount: Object.values(capabilitySettings).filter(config => config.enabled).length,
        disabledCount: Object.values(capabilitySettings).filter(config => !config.enabled).length
      })

      return updatedUser
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update provider capability settings', errorInstance, {
        providerId,
        capabilityCount: capabilitySettings ? Object.keys(capabilitySettings).length : 0,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      })
      throw new Error(`Failed to update capabilities for provider ${providerId}: ${errorInstance.message}`)
    }
  }
}