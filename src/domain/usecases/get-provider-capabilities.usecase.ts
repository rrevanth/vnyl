/**
 * Get Provider Capabilities Use Case
 * 
 * Dynamically resolves available capabilities for a specific provider using the
 * provider registry. This use case follows CLEAN architecture principles by
 * using dependency injection and providing comprehensive error handling.
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'
import { ProviderRegistry } from '@/src/infrastructure/providers/provider-registry'
import { ILoggingService } from '@/src/domain/services'

/**
 * Use case for getting available capabilities for a specific provider
 */
export class GetProviderCapabilitiesUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to get provider capabilities
   * 
   * @param providerId - The ID of the provider to get capabilities for
   * @returns Promise<ProviderCapability[]> - Array of available capabilities
   */
  async execute(providerId: string): Promise<ProviderCapability[]> {
    try {
      this.logger.debug('Getting provider capabilities', undefined, {
        providerId
      })

      // Validate input
      if (!providerId || typeof providerId !== 'string' || providerId.trim() === '') {
        throw new Error('Provider ID is required and must be a non-empty string')
      }

      const trimmedProviderId = providerId.trim()

      // Check if provider is registered
      const providerConfig = this.providerRegistry.getProviderConfig(trimmedProviderId)
      if (!providerConfig) {
        this.logger.warn('Provider not found in registry', undefined, {
          providerId: trimmedProviderId
        })
        return []
      }

      // Use the registry's getAvailableCapabilities method for direct capability resolution
      const availableCapabilities = this.providerRegistry.getAvailableCapabilities(trimmedProviderId)

      this.logger.info('Successfully retrieved provider capabilities', {
        providerId: trimmedProviderId,
        capabilitiesCount: availableCapabilities.length,
        capabilities: availableCapabilities,
        providerEnabled: providerConfig.enabled,
        providerHealthy: providerConfig.healthStatus === 'healthy'
      })

      return availableCapabilities
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get provider capabilities', errorInstance, {
        providerId,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      })
      throw new Error(`Failed to get capabilities for provider ${providerId}: ${errorInstance.message}`)
    }
  }
}