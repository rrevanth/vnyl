/**
 * Demonstration of getAvailableCapabilities functionality
 * 
 * This script demonstrates how the new getAvailableCapabilities method works
 * with the provider registry system and use case.
 */

import { ProviderRegistry } from '@/src/infrastructure/providers/provider-registry'
import { GetProviderCapabilitiesUseCase } from '@/src/domain/usecases/get-provider-capabilities.usecase'
import { ProviderCapability, type IMetadataProvider, type ICatalogProvider, type BaseProviderConfig } from '@/src/infrastructure/providers/provider-interfaces'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

// Simple console logger for demonstration
const logger: ILoggingService = {
  debug: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    console.log(`[DEBUG] ${message}`, meta || '')
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, meta || '')
  },
  warn: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta || '')
  },
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error?.message || '', meta || '')
  }
}

// Mock provider implementations
class TMDBMetadataProvider implements IMetadataProvider {
  readonly id = 'tmdb-metadata'
  readonly name = 'TMDB Metadata Provider'
  readonly type = 'metadata'

  constructor(private config: BaseProviderConfig, private logger: ILoggingService) {}

  getConfig() { return this.config }
  isEnabled() { return this.config.enabled }
  getPriority() { return this.config.priority }

  async healthCheck() {
    return { healthy: true, lastCheck: new Date(), responseTime: 150 }
  }

  async validateConfig() {
    return { valid: true, errors: [], warnings: [] }
  }

  async getMetadata() {
    return null
  }

  async getMetadataByExternalId() {
    return null
  }
}

class TMDBCatalogProvider implements ICatalogProvider {
  readonly id = 'tmdb-catalog'
  readonly name = 'TMDB Catalog Provider'
  readonly type = 'catalog'

  constructor(private config: BaseProviderConfig, private logger: ILoggingService) {}

  getConfig() { return this.config }
  isEnabled() { return this.config.enabled }
  getPriority() { return this.config.priority }

  async healthCheck() {
    return { healthy: true, lastCheck: new Date(), responseTime: 120 }
  }

  async validateConfig() {
    return { valid: true, errors: [], warnings: [] }
  }

  async getCatalogs() {
    return []
  }

  async getCatalogItems() {
    return { results: [], page: 1, hasMore: false }
  }
}

async function demonstrateCapabilityResolution() {
  console.log('🎬 VNYL Provider Capability Resolution Demo\\n')

  // Create provider registry (disable health monitoring for demo)
  const registry = new ProviderRegistry(logger, { enabled: false })

  // Create the use case
  const useCase = new GetProviderCapabilitiesUseCase(registry, logger)

  try {
    // 1. Test with non-existent provider
    console.log('1️⃣ Testing non-existent provider:')
    const nonExistentCapabilities = await useCase.execute('non-existent')
    console.log(`   Capabilities: ${nonExistentCapabilities.length === 0 ? 'None (correct!)' : nonExistentCapabilities}\\n`)

    // 2. Register TMDB provider with multiple capabilities
    console.log('2️⃣ Registering TMDB provider with multiple capabilities...')
    registry.registerProviderWithCapabilities(
      'tmdb',
      {
        [ProviderCapability.METADATA]: TMDBMetadataProvider,
        [ProviderCapability.CATALOG]: TMDBCatalogProvider
      },
      {
        id: 'tmdb',
        name: 'The Movie Database',
        type: 'external-api',
        enabled: true,
        priority: 1,
        apiKey: 'demo-key',
        baseUrl: 'https://api.themoviedb.org/3'
      }
    )

    // 3. Test getAvailableCapabilities directly
    console.log('3️⃣ Testing getAvailableCapabilities directly:')
    const directCapabilities = registry.getAvailableCapabilities('tmdb')
    console.log(`   Direct capabilities: [${directCapabilities.join(', ')}]\\n`)

    // 4. Test through the use case
    console.log('4️⃣ Testing through GetProviderCapabilitiesUseCase:')
    const useCaseCapabilities = await useCase.execute('tmdb')
    console.log(`   Use case capabilities: [${useCaseCapabilities.join(', ')}]\\n`)

    // 5. Test edge cases
    console.log('5️⃣ Testing edge cases:')
    
    console.log('   Empty string:')
    try {
      await useCase.execute('')
    } catch (error) {
      console.log(`   ✅ Correctly threw error: ${error instanceof Error ? error.message : String(error)}`)
    }

    console.log('   Whitespace only:')
    try {
      await useCase.execute('   ')
    } catch (error) {
      console.log(`   ✅ Correctly threw error: ${error instanceof Error ? error.message : String(error)}`)
    }

    console.log('   Trimming test (should work):')
    const trimmedResult = await useCase.execute('  tmdb  ')
    console.log(`   ✅ Trimmed result: [${trimmedResult.join(', ')}]\\n`)

    // 6. Show registry statistics
    console.log('6️⃣ Registry statistics:')
    const stats = registry.getStatistics()
    console.log(`   Total registrations: ${stats.totalRegistrations}`)
    console.log(`   Active providers: ${stats.activeProviders}`)
    console.log(`   Metadata providers: ${stats.registrationsByCapability[ProviderCapability.METADATA]}`)
    console.log(`   Catalog providers: ${stats.registrationsByCapability[ProviderCapability.CATALOG]}\\n`)

    console.log('✅ Demo completed successfully!')

  } catch (error) {
    console.error('❌ Demo failed:', error instanceof Error ? error.message : String(error))
  } finally {
    // Cleanup
    registry.shutdown()
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateCapabilityResolution()
}