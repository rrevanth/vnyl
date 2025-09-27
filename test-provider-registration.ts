/**
 * Test script to verify TMDB provider registration
 * Run this to check if providers are properly registered
 */

// Define __DEV__ for test environment
declare global {
  var __DEV__: boolean
}
globalThis.__DEV__ = true

import { initializeApp } from '@/src/infrastructure/app-container'
import { container } from '@/src/infrastructure/di/setup'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { ProviderRegistry, ProviderCapability } from '@/src/infrastructure/providers'
import { ILoggingService } from '@/src/domain/services'

async function testProviderRegistration() {
  console.log('Starting provider registration test...')
  
  try {
    // Initialize the app (this should register TMDB providers)
    await initializeApp()
    console.log('App initialization completed')
    
    // Get the provider registry
    const providerRegistry = container.resolve<ProviderRegistry>(TOKENS.PROVIDER_REGISTRY)
    const logger = container.resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)
    
    // Check if TMDB providers are registered
    const tmdbCapabilities = providerRegistry.getAvailableCapabilities('tmdb')
    console.log('TMDB registered capabilities:', tmdbCapabilities)
    
    // Check catalog providers specifically
    const catalogProviders = providerRegistry.getProvidersForCapability(ProviderCapability.CATALOG)
    console.log('Catalog providers:', catalogProviders.map(p => ({ id: p.providerId, healthy: p.healthy })))
    
    // Check all capabilities
    const allCapabilities = [
      ProviderCapability.METADATA,
      ProviderCapability.CATALOG,
      ProviderCapability.SEARCH,
      ProviderCapability.RECOMMENDATION,
      ProviderCapability.RATING,
      ProviderCapability.IMAGE,
      ProviderCapability.VIDEO
    ]
    
    console.log('\nCapability availability:')
    for (const capability of allCapabilities) {
      const providers = providerRegistry.getProvidersForCapability(capability)
      console.log(`- ${capability}: ${providers.length} providers (${providers.map(p => p.providerId).join(', ')})`)
    }
    
    // Test resolving a catalog provider
    console.log('\nTesting catalog provider resolution...')
    const catalogProvider = await providerRegistry.resolveCapability(ProviderCapability.CATALOG)
    console.log('Resolved catalog provider:', catalogProvider ? 'SUCCESS' : 'FAILED')
    
    if (catalogProvider) {
      console.log('Provider details:', {
        providerId: catalogProvider.providerId,
        responseTime: catalogProvider.responseTime,
        fromCache: catalogProvider.fromCache
      })
    }
    
    console.log('\n✅ Provider registration test completed successfully')
    
  } catch (error) {
    console.error('❌ Provider registration test failed:', error)
  }
}

// Run the test
testProviderRegistration()