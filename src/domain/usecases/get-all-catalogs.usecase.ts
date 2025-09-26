/**
 * Get All Catalogs Use Case - Business Logic for Loading All Available Catalogs
 * 
 * Discovers and loads all available catalogs from registered providers for
 * the homescreen display. Optimized for presenting catalog overviews with
 * minimal data loading.
 * 
 * CLEAN Architecture: Domain layer business logic
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { ProviderRegistry } from '@/src/infrastructure/providers/provider-registry'
import type { Catalog } from '@/src/domain/entities/provider-capabilities.entity'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'

/**
 * Catalog discovery request parameters
 */
export interface GetAllCatalogsRequest {
  contentTypeFilter?: string[] // Filter to specific content types
  providerFilter?: string[] // Filter to specific providers
  includeEmptyCatalogs?: boolean // Include catalogs with no items
  loadSampleItems?: boolean // Load a few sample items per catalog
  sampleItemsLimit?: number // Number of sample items to load (default: 3)
}

/**
 * Provider catalog group
 */
export interface ProviderCatalogGroup {
  providerId: string
  providerName: string
  providerType: string
  catalogs: Catalog[]
  isHealthy: boolean
  responseTime: number
  errorMessage?: string
}

/**
 * All catalogs discovery result
 */
export interface GetAllCatalogsResult {
  providerGroups: ProviderCatalogGroup[]
  totalCatalogs: number
  totalProviders: number
  healthyProviders: number
  loadingTime: number
  errors: {
    providerId: string
    providerName: string
    error: string
    isHealthy: boolean
  }[]
}

/**
 * Get All Catalogs Use Case
 * 
 * Encapsulates the business logic for discovering and loading all available
 * catalogs from registered providers for homescreen display.
 */
export class GetAllCatalogsUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Load all available catalogs from registered providers
   */
  async execute(request: GetAllCatalogsRequest = {}): Promise<GetAllCatalogsResult> {
    const startTime = Date.now()
    const {
      contentTypeFilter,
      providerFilter,
      includeEmptyCatalogs = false,
      loadSampleItems = false,
      sampleItemsLimit = 3
    } = request
    
    this.logger.info('Loading all catalogs from registered providers', {
      contentTypeFilter,
      providerFilter,
      includeEmptyCatalogs,
      loadSampleItems,
      sampleItemsLimit
    })

    try {
      // Get all providers that support catalog capability
      const catalogProviders = this.providerRegistry.getProvidersForCapability(
        ProviderCapability.CATALOG
      )

      if (catalogProviders.length === 0) {
        this.logger.warn('No providers available for catalog loading')
        return this.createEmptyResult(Date.now() - startTime)
      }

      // Filter providers if requested
      const filteredProviders = providerFilter
        ? catalogProviders.filter(p => providerFilter.includes(p.providerId))
        : catalogProviders

      this.logger.info(`Loading catalogs from ${filteredProviders.length} providers`, {
        totalAvailable: catalogProviders.length,
        filtered: filteredProviders.length,
        providerIds: filteredProviders.map(p => p.providerId)
      })

      // Load catalogs from all providers in parallel
      const providerResults = await Promise.allSettled(
        filteredProviders.map(providerInfo => 
          this.loadCatalogsFromProvider(
            providerInfo,
            contentTypeFilter,
            includeEmptyCatalogs,
            loadSampleItems,
            sampleItemsLimit
          )
        )
      )

      // Process results
      const providerGroups: ProviderCatalogGroup[] = []
      const errors: GetAllCatalogsResult['errors'] = []
      let totalCatalogs = 0
      let healthyProviders = 0

      providerResults.forEach((result, index) => {
        const providerInfo = filteredProviders[index]
        
        if (result.status === 'fulfilled' && result.value.success) {
          const providerGroup = result.value.data!
          providerGroups.push(providerGroup)
          totalCatalogs += providerGroup.catalogs.length
          
          if (providerGroup.isHealthy) {
            healthyProviders++
          }
        } else {
          const error = result.status === 'rejected' 
            ? result.reason?.message || 'Unknown error'
            : result.value.error || 'Provider loading failed'
            
          errors.push({
            providerId: providerInfo.providerId,
            providerName: providerInfo.config.name,
            error,
            isHealthy: providerInfo.healthy
          })
        }
      })

      const loadingTime = Date.now() - startTime
      
      this.logger.info('All catalogs loading completed', {
        totalProviders: filteredProviders.length,
        healthyProviders,
        totalCatalogs,
        errorCount: errors.length,
        loadingTime
      })

      return {
        providerGroups,
        totalCatalogs,
        totalProviders: filteredProviders.length,
        healthyProviders,
        loadingTime,
        errors
      }

    } catch (error) {
      const loadingTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.logger.error('All catalogs loading failed', error instanceof Error ? error : new Error(String(error)), {
        loadingTime
      })

      throw new Error(`Failed to load all catalogs: ${errorMessage}`)
    }
  }

  /**
   * Load catalogs from a specific provider
   */
  private async loadCatalogsFromProvider(
    providerInfo: {
      providerId: string
      config: any
      healthy: boolean
      cached: boolean
    },
    contentTypeFilter?: string[],
    includeEmptyCatalogs = false,
    loadSampleItems = false,
    sampleItemsLimit = 3
  ): Promise<{
    success: boolean
    data?: ProviderCatalogGroup
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      // Resolve provider instance from registry
      const providerResult = await this.providerRegistry.resolveCapability(
        ProviderCapability.CATALOG,
        undefined, // No specific media context needed
        {
          enabledOnly: true,
          healthyOnly: false, // Allow unhealthy providers to try
          maxProviders: 1,
          includeProviders: [providerInfo.providerId]
        }
      )

      if (!providerResult) {
        return {
          success: false,
          error: `Failed to resolve provider: ${providerInfo.providerId}`
        }
      }

      const provider = providerResult.provider

      // Check if provider has getCatalogs method
      if (!('getCatalogs' in provider)) {
        return {
          success: false,
          error: `Provider ${providerInfo.providerId} does not support getCatalogs method`
        }
      }

      // Load catalogs without content type filter (get all catalogs)
      const allCatalogs = await (provider as any).getCatalogs()

      if (!Array.isArray(allCatalogs)) {
        return {
          success: false,
          error: `Provider ${providerInfo.providerId} returned invalid catalog data`
        }
      }

      // Filter catalogs by content type if requested
      let filteredCatalogs = contentTypeFilter
        ? allCatalogs.filter(catalog => contentTypeFilter.includes(catalog.type))
        : allCatalogs

      // Filter empty catalogs if not requested
      if (!includeEmptyCatalogs) {
        filteredCatalogs = filteredCatalogs.filter(catalog => 
          catalog.totalItems === undefined || catalog.totalItems > 0
        )
      }

      // Load sample items for each catalog if requested
      if (loadSampleItems && 'getCatalogItems' in provider) {
        const catalogsWithSamples = await Promise.allSettled(
          filteredCatalogs.map(async (catalog) => {
            try {
              const sampleItems = await (provider as any).getCatalogItems(
                catalog.id,
                { page: 1, limit: sampleItemsLimit }
              )
              
              return {
                ...catalog,
                items: sampleItems.results || []
              }
            } catch {
              // If loading sample items fails, return catalog without items
              return catalog
            }
          })
        )

        filteredCatalogs = catalogsWithSamples
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<Catalog>).value)
      }

      const responseTime = Date.now() - startTime

      this.logger.info(`Catalogs loaded from provider ${providerInfo.providerId}`, {
        catalogCount: filteredCatalogs.length,
        totalCatalogs: allCatalogs.length,
        responseTime,
        isHealthy: providerInfo.healthy
      })

      return {
        success: true,
        data: {
          providerId: providerInfo.providerId,
          providerName: providerInfo.config.name,
          providerType: providerInfo.config.type,
          catalogs: filteredCatalogs,
          isHealthy: providerInfo.healthy,
          responseTime
        }
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.logger.warn(`Failed to load catalogs from provider ${providerInfo.providerId}`, undefined, {
        error: errorMessage,
        responseTime,
        isHealthy: providerInfo.healthy
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Create empty result for error cases
   */
  private createEmptyResult(loadingTime: number): GetAllCatalogsResult {
    return {
      providerGroups: [],
      totalCatalogs: 0,
      totalProviders: 0,
      healthyProviders: 0,
      loadingTime,
      errors: [{
        providerId: 'system',
        providerName: 'System',
        error: 'No catalog providers available',
        isHealthy: false
      }]
    }
  }
}