/**
 * Source-Aware Provider Registry Integration Example
 * 
 * Demonstrates how to use the enhanced provider registry system with source-level management
 */

import { DIContainer } from '@/src/infrastructure/di/container'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { ProviderRegistry } from '@/src/infrastructure/providers/provider-registry.impl'
import { TMDBProviderSource } from '@/src/infrastructure/providers/tmdb-provider-source'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ILoggingService } from '@/src/domain/services'
import { IProviderRegistry } from '@/src/domain/providers/base/provider-registry.interface'

/**
 * Example demonstrating source-aware provider registry usage
 */
export class SourceAwareProviderRegistryExample {
  constructor(
    private readonly container: DIContainer,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Initialize and demonstrate the source-aware provider registry system
   */
  async demonstrateSourceAwareRegistry(): Promise<void> {
    try {
      this.logger.info('SourceAwareProviderRegistryExample: Starting demonstration')

      // 1. Create the provider registry
      const registry = new ProviderRegistry(this.logger)

      // 2. Create and initialize TMDB provider source
      const tmdbSource = new TMDBProviderSource(registry, this.container, this.logger)
      await tmdbSource.initialize()

      // 3. Register all TMDB providers (they will be tagged with sourceId 'tmdb')
      await tmdbSource.registerProviders(registry)

      // 4. Demonstrate source-level operations
      await this.demonstrateSourceOperations(registry)

      this.logger.info('SourceAwareProviderRegistryExample: Demonstration completed successfully')

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('SourceAwareProviderRegistryExample: Demonstration failed', errorInstance)
      throw errorInstance
    }
  }

  /**
   * Demonstrate various source-level operations
   */
  private async demonstrateSourceOperations(registry: IProviderRegistry): Promise<void> {
    this.logger.info('=== Source-Level Operations Demonstration ===')

    // Get all sources
    const allSources = registry.getAllSources()
    this.logger.info('Available sources:', { sources: allSources })

    // Get providers from TMDB source
    const tmdbProviders = registry.getProvidersBySource('tmdb')
    this.logger.info('TMDB Providers:', {
      count: tmdbProviders.length,
      providers: tmdbProviders.map(p => ({
        id: p.id,
        name: p.name,
        sourceId: p.sourceId,
        capabilities: p.capabilities
      }))
    })

    // Get capabilities available from TMDB source
    const tmdbCapabilities = registry.getCapabilitiesBySource('tmdb')
    this.logger.info('TMDB Capabilities:', { capabilities: tmdbCapabilities })

    // Demonstrate enhanced statistics
    const stats = registry.getStats()
    this.logger.info('Registry Statistics:', {
      totalProviders: stats.totalProviders,
      totalSources: stats.totalSources,
      providersBySource: stats.providersBySource,
      capabilitiesBySource: stats.capabilitiesBySource
    })

    // Test capability-based lookup (existing functionality still works)
    const catalogProviders = await registry.getProvidersByCapability(ProviderCapability.CATALOG)
    this.logger.info('Catalog Providers:', {
      count: catalogProviders.length,
      providers: catalogProviders.map(p => ({
        id: p.id,
        name: p.name,
        sourceId: p.sourceId
      }))
    })

    // Test individual provider lookup (existing functionality enhanced with sourceId)
    if (catalogProviders.length > 0) {
      const firstCatalogProvider = await registry.getProvider(catalogProviders[0].id)
      if (firstCatalogProvider) {
        this.logger.info('Individual Provider Lookup:', {
          id: firstCatalogProvider.id,
          name: firstCatalogProvider.name,
          sourceId: firstCatalogProvider.sourceId,
          capabilities: firstCatalogProvider.capabilities
        })
      }
    }

    // Demonstrate source-level unregistration (commented out to preserve providers)
    // this.logger.info('Demonstrating source-level unregistration...')
    // registry.unregisterProvidersBySource('tmdb')
    // const afterUnregister = registry.getStats()
    // this.logger.info('After unregistering TMDB providers:', {
    //   totalProviders: afterUnregister.totalProviders,
    //   totalSources: afterUnregister.totalSources
    // })
  }

  /**
   * Example of how to integrate with existing DI container setup
   */
  static async createWithContainer(container: DIContainer): Promise<SourceAwareProviderRegistryExample> {
    const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
    return new SourceAwareProviderRegistryExample(container, logger)
  }
}

/**
 * Usage example function
 */
export async function runSourceAwareRegistryExample(): Promise<void> {
  // This would typically be called from your app initialization
  const container = new DIContainer()
  // ... container setup with required services ...
  
  const example = await SourceAwareProviderRegistryExample.createWithContainer(container)
  await example.demonstrateSourceAwareRegistry()
}

/**
 * Example of source-specific operations you can now perform:
 * 
 * 1. Get all providers from a specific source:
 *    const tmdbProviders = registry.getProvidersBySource('tmdb')
 * 
 * 2. Get capabilities available from a source:
 *    const capabilities = registry.getCapabilitiesBySource('tmdb')
 * 
 * 3. Bulk unregister providers from a source:
 *    registry.unregisterProvidersBySource('tmdb')
 * 
 * 4. Get all registered sources:
 *    const sources = registry.getAllSources()
 * 
 * 5. Enhanced statistics with source breakdowns:
 *    const stats = registry.getStats()
 *    console.log(stats.providersBySource, stats.capabilitiesBySource)
 * 
 * 6. All existing functionality works with sourceId tracking:
 *    const provider = await registry.getProvider('tmdb-catalog')
 *    console.log(provider.sourceId) // 'tmdb'
 */