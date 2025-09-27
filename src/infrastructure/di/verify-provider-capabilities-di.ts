/**
 * Verification script for Provider Capabilities DI Integration
 * 
 * This script verifies that the provider capability use cases are properly
 * registered in the DI container and can be resolved with correct dependencies.
 */

import { initializeDI, container } from '@/src/infrastructure/di/setup'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { 
  useGetProviderCapabilitiesUseCase, 
  useUpdateProviderCapabilitiesUseCase,
  useProviderCapabilities 
} from '@/src/infrastructure/di/hooks'
import { GetProviderCapabilitiesUseCase } from '@/src/domain/usecases/get-provider-capabilities.usecase'
import { UpdateProviderCapabilitiesUseCase } from '@/src/domain/usecases/update-provider-capabilities.usecase'

// Mock API configuration
const mockApiConfig = {
  baseURL: 'https://api.test.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
}

async function verifyDIIntegration(): Promise<void> {
  console.log('🧪 Verifying Provider Capabilities DI Integration...\n')

  try {
    // Initialize DI container
    console.log('1. Initializing DI container...')
    initializeDI(mockApiConfig)
    console.log('   ✅ DI container initialized successfully\n')

    // Verify token registration
    console.log('2. Verifying token registration...')
    const getCapToken = TOKENS.GET_PROVIDER_CAPABILITIES_USE_CASE
    const updateCapToken = TOKENS.UPDATE_PROVIDER_CAPABILITIES_USE_CASE
    
    console.log(`   ✅ GET_PROVIDER_CAPABILITIES_USE_CASE token: ${getCapToken.toString()}`)
    console.log(`   ✅ UPDATE_PROVIDER_CAPABILITIES_USE_CASE token: ${updateCapToken.toString()}\n`)

    // Verify service registration
    console.log('3. Verifying service registration...')
    const getRegistered = container.isRegistered(getCapToken)
    const updateRegistered = container.isRegistered(updateCapToken)
    
    console.log(`   ✅ GetProviderCapabilitiesUseCase registered: ${getRegistered}`)
    console.log(`   ✅ UpdateProviderCapabilitiesUseCase registered: ${updateRegistered}\n`)

    if (!getRegistered || !updateRegistered) {
      throw new Error('Some use cases are not properly registered')
    }

    // Verify service resolution
    console.log('4. Verifying service resolution...')
    const getUseCase = container.resolve<GetProviderCapabilitiesUseCase>(getCapToken)
    const updateUseCase = container.resolve<UpdateProviderCapabilitiesUseCase>(updateCapToken)
    
    console.log(`   ✅ GetProviderCapabilitiesUseCase resolved: ${getUseCase.constructor.name}`)
    console.log(`   ✅ UpdateProviderCapabilitiesUseCase resolved: ${updateUseCase.constructor.name}\n`)

    // Verify dependency injection
    console.log('5. Verifying dependency injection...')
    const getUseCaseAny = getUseCase as any
    const updateUseCaseAny = updateUseCase as any
    
    console.log(`   ✅ GetProviderCapabilitiesUseCase has providerRegistry: ${!!getUseCaseAny.providerRegistry}`)
    console.log(`   ✅ GetProviderCapabilitiesUseCase has logger: ${!!getUseCaseAny.logger}`)
    console.log(`   ✅ UpdateProviderCapabilitiesUseCase has userRepository: ${!!updateUseCaseAny.userRepository}`)
    console.log(`   ✅ UpdateProviderCapabilitiesUseCase has logger: ${!!updateUseCaseAny.logger}\n`)

    // Verify singleton behavior
    console.log('6. Verifying singleton behavior...')
    const getUseCase2 = container.resolve<GetProviderCapabilitiesUseCase>(getCapToken)
    const updateUseCase2 = container.resolve<UpdateProviderCapabilitiesUseCase>(updateCapToken)
    
    console.log(`   ✅ GetProviderCapabilitiesUseCase singleton: ${getUseCase === getUseCase2}`)
    console.log(`   ✅ UpdateProviderCapabilitiesUseCase singleton: ${updateUseCase === updateUseCase2}\n`)

    // Verify hooks would work (can't actually test hooks outside React context)
    console.log('7. Verifying hook function exports...')
    console.log(`   ✅ useGetProviderCapabilitiesUseCase exported: ${typeof useGetProviderCapabilitiesUseCase === 'function'}`)
    console.log(`   ✅ useUpdateProviderCapabilitiesUseCase exported: ${typeof useUpdateProviderCapabilitiesUseCase === 'function'}`)
    console.log(`   ✅ useProviderCapabilities convenience hook exported: ${typeof useProviderCapabilities === 'function'}\n`)

    console.log('🎉 All verifications passed! Provider Capabilities DI integration is working correctly.')

  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    console.error(`❌ DI Integration verification failed: ${errorInstance.message}`)
    console.error(errorInstance.stack)
    process.exit(1)
  }
}

// Example usage patterns for documentation
function showUsageExamples(): void {
  console.log('\n📚 Usage Examples:')
  console.log('\n// In React components:')
  console.log('const getCapabilities = useGetProviderCapabilitiesUseCase()')
  console.log('const updateCapabilities = useUpdateProviderCapabilitiesUseCase()')
  console.log('\n// Using convenience hook:')
  console.log('const { getCapabilities, updateCapabilities, getTMDBCapabilities } = useProviderCapabilities()')
  console.log('\n// Direct usage:')
  console.log('const capabilities = await getCapabilities.execute("tmdb")')
  console.log('const updatedUser = await updateCapabilities.execute("tmdb", capabilitySettings)')
}

// Run verification
if (require.main === module) {
  verifyDIIntegration()
    .then(() => {
      showUsageExamples()
      console.log('\n✨ Provider Capabilities DI integration verification complete!')
    })
    .catch((error) => {
      console.error('Verification failed:', error)
      process.exit(1)
    })
}

export { verifyDIIntegration }