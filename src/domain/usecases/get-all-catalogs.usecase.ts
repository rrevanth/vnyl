/**
 * GetAllCatalogsUseCase
 * 
 * Returns all supported catalogs from all registered catalog providers with first page loaded.
 * Implements deterministic sequential loading for stable catalog ordering.
 * Integrates directly with Legend State for immediate UI updates.
 */

import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { ICatalogProvider } from '@/src/domain/providers/catalog/catalog-provider.interface'
import { ILoggingService } from '@/src/domain/services'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import type { ICatalogStateManagementService } from '@/src/domain/services/state-management.service.interface'

/**
 * Result type for GetAllCatalogsUseCase
 */
export interface GetAllCatalogsResult {
  /** Successfully loaded catalogs */
  readonly catalogs: Catalog[]
  
  /** Total number of catalog providers discovered */
  readonly totalProviders: number
  
  /** Number of successful provider loads */
  readonly successfulProviders: number
  
  /** Provider errors that occurred during loading */
  readonly providerErrors: ProviderError[]
  
  /** Overall execution time in milliseconds */
  readonly executionTime: number
  
  /** Request context for traceability */
  readonly requestId: string
}

/**
 * Provider error information
 */
export interface ProviderError {
  readonly providerId: string
  readonly providerName: string
  readonly error: string
  readonly capability: ProviderCapability
}

export class GetAllCatalogsUseCase {
  constructor(
    private readonly catalogProviders: ICatalogProvider[],
    private readonly logger: ILoggingService,
    private readonly catalogStateService: ICatalogStateManagementService
  ) {}

  /**
   * Execute the use case to get all catalogs from all providers
   * Implements deterministic sequential loading with immediate Legend State updates
   */
  async execute(): Promise<GetAllCatalogsResult> {
    const requestId = `get-all-catalogs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()

    try {
      this.logger.info('Starting GetAllCatalogsUseCase execution with deterministic ordering', {
        context: 'get_all_catalogs_usecase',
        requestId,
        providerCount: this.catalogProviders.length
      })

      // Clear existing catalogs at start
      this.catalogStateService.reset()
      this.catalogStateService.setLoading(true)
      this.catalogStateService.clearError()

      if (this.catalogProviders.length === 0) {
        this.logger.warn('No catalog providers registered', undefined, {
          context: 'get_all_catalogs_usecase',
          requestId
        })

        this.catalogStateService.setLoading(false)
        return {
          catalogs: [],
          totalProviders: 0,
          successfulProviders: 0,
          providerErrors: [],
          executionTime: performance.now() - startTime,
          requestId
        }
      }

      // Sort providers by priority for deterministic ordering
      const sortedProviders = [...this.catalogProviders].sort((a, b) => {
        // Primary sort by provider type (TMDB first)
        const aPriority = a.id.includes('tmdb') ? 0 : 1
        const bPriority = b.id.includes('tmdb') ? 0 : 1
        if (aPriority !== bPriority) return aPriority - bPriority
        
        // Secondary sort by provider ID for consistency
        return a.id.localeCompare(b.id)
      })

      // Initialize providers sequentially to maintain order
      this.logger.debug('Initializing catalog providers in deterministic order', undefined, {
        context: 'get_all_catalogs_usecase',
        requestId,
        providerIds: sortedProviders.map(p => p.id)
      })

      const initializedProviders: ICatalogProvider[] = []
      const initErrors: ProviderError[] = []

      for (const provider of sortedProviders) {
        try {
          await provider.initialize()
          initializedProviders.push(provider)
          this.logger.debug('Provider initialized successfully', undefined, {
            context: 'get_all_catalogs_usecase',
            requestId,
            providerId: provider.id,
            providerName: provider.name
          })
        } catch (error) {
          const errorInstance = error instanceof Error ? error : new Error(String(error))
          initErrors.push({
            providerId: provider.id,
            providerName: provider.name,
            error: errorInstance.message,
            capability: ProviderCapability.CATALOG
          })
          this.logger.warn('Failed to initialize catalog provider', errorInstance, {
            context: 'get_all_catalogs_usecase',
            requestId,
            providerId: provider.id,
            providerName: provider.name
          })
        }
      }

      this.logger.info('Provider initialization completed', {
        context: 'get_all_catalogs_usecase',
        requestId,
        totalProviders: this.catalogProviders.length,
        successfulInitializations: initializedProviders.length,
        failedInitializations: initErrors.length
      })

      if (initializedProviders.length === 0) {
        this.logger.error('All catalog providers failed to initialize', new Error('No providers available'), {
          context: 'get_all_catalogs_usecase',
          requestId
        })

        this.catalogStateService.setError('All catalog providers failed to initialize')
        this.catalogStateService.setLoading(false)
        return {
          catalogs: [],
          totalProviders: this.catalogProviders.length,
          successfulProviders: 0,
          providerErrors: initErrors,
          executionTime: performance.now() - startTime,
          requestId
        }
      }

      // Fetch catalogs sequentially to maintain deterministic order
      this.logger.debug('Fetching catalogs from initialized providers in order', undefined, {
        context: 'get_all_catalogs_usecase',
        requestId,
        providerCount: initializedProviders.length
      })

      const allCatalogs: Catalog[] = []
      const fetchErrors: ProviderError[] = []
      let successfulProviders = 0

      for (const provider of initializedProviders) {
        try {
          const providerStartTime = performance.now()
          const catalogs = await provider.getAllCatalogs()
          const providerTime = performance.now() - providerStartTime

          // Sort catalogs within provider for consistency
          const sortedCatalogs = catalogs.sort((a, b) => {
            // Primary sort by catalog type priority
            const typeOrder = ['popular', 'trending', 'top_rated', 'upcoming', 'now_playing']
            const aTypeIndex = typeOrder.indexOf(a.catalogContext?.catalogType || '')
            const bTypeIndex = typeOrder.indexOf(b.catalogContext?.catalogType || '')
            
            const aPriority = aTypeIndex >= 0 ? aTypeIndex : 999
            const bPriority = bTypeIndex >= 0 ? bTypeIndex : 999
            
            if (aPriority !== bPriority) return aPriority - bPriority
            
            // Secondary sort by catalog name for consistency
            return a.name.localeCompare(b.name)
          })

          // Add catalogs to collection in order
          allCatalogs.push(...sortedCatalogs)
          successfulProviders++

          // Update Legend State immediately with current catalogs
          this.catalogStateService.updateCatalogs(allCatalogs, {
            successfulProviders,
            totalProviders: this.catalogProviders.length
          })

          this.logger.debug('Successfully fetched and added catalogs from provider', undefined, {
            context: 'get_all_catalogs_usecase',
            requestId,
            providerId: provider.id,
            catalogCount: sortedCatalogs.length,
            totalCatalogs: allCatalogs.length,
            fetchTime: Math.round(providerTime)
          })

        } catch (error) {
          const errorInstance = error instanceof Error ? error : new Error(String(error))
          fetchErrors.push({
            providerId: provider.id,
            providerName: provider.name,
            error: errorInstance.message,
            capability: ProviderCapability.CATALOG
          })
          this.logger.error('Failed to fetch catalogs from provider', errorInstance, {
            context: 'get_all_catalogs_usecase',
            requestId,
            providerId: provider.id,
            providerName: provider.name
          })
        }
      }

      // Combine all errors
      const allErrors = [...initErrors, ...fetchErrors]
      const executionTime = performance.now() - startTime

      // Final Legend State update
      this.catalogStateService.setLoading(false)
      if (allErrors.length > 0 && allCatalogs.length === 0) {
        this.catalogStateService.setError('Failed to load any catalogs')
      }

      this.logger.info('GetAllCatalogsUseCase execution completed with deterministic ordering', {
        context: 'get_all_catalogs_usecase',
        requestId,
        totalCatalogs: allCatalogs.length,
        totalProviders: this.catalogProviders.length,
        successfulProviders,
        errorCount: allErrors.length,
        executionTime: Math.round(executionTime)
      })

      return {
        catalogs: allCatalogs,
        totalProviders: this.catalogProviders.length,
        successfulProviders,
        providerErrors: allErrors,
        executionTime,
        requestId
      }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const executionTime = performance.now() - startTime

      this.logger.error('GetAllCatalogsUseCase execution failed', errorInstance, {
        context: 'get_all_catalogs_usecase',
        requestId,
        executionTime: Math.round(executionTime)
      })

      throw new Error(`Failed to get all catalogs: ${errorInstance.message}`)
    }
  }
}