/**
 * GetAllCatalogsUseCase
 * 
 * Returns all supported catalogs from all registered catalog providers with first page loaded.
 * Implements parallel loading for optimal performance and complete context traceability.
 */

import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { ICatalogProvider } from '@/src/domain/providers/catalog/catalog-provider.interface'
import { ILoggingService } from '@/src/domain/services'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'

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
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the use case to get all catalogs from all providers
   */
  async execute(): Promise<GetAllCatalogsResult> {
    const requestId = `get-all-catalogs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = performance.now()

    try {
      this.logger.info('Starting GetAllCatalogsUseCase execution', {
        context: 'get_all_catalogs_usecase',
        requestId,
        providerCount: this.catalogProviders.length
      })

      if (this.catalogProviders.length === 0) {
        this.logger.warn('No catalog providers registered', undefined, {
          context: 'get_all_catalogs_usecase',
          requestId
        })

        return {
          catalogs: [],
          totalProviders: 0,
          successfulProviders: 0,
          providerErrors: [],
          executionTime: performance.now() - startTime,
          requestId
        }
      }

      // Initialize all providers in parallel
      this.logger.debug('Initializing catalog providers', undefined, {
        context: 'get_all_catalogs_usecase',
        requestId,
        providerIds: this.catalogProviders.map(p => p.id)
      })

      const initResults = await Promise.allSettled(
        this.catalogProviders.map(async (provider) => {
          try {
            await provider.initialize()
            return provider
          } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error))
            this.logger.warn('Failed to initialize catalog provider', errorInstance, {
              context: 'get_all_catalogs_usecase',
              requestId,
              providerId: provider.id,
              providerName: provider.name
            })
            throw errorInstance
          }
        })
      )

      // Extract successfully initialized providers
      const initializedProviders = initResults
        .filter((result): result is PromiseFulfilledResult<ICatalogProvider> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)

      // Collect initialization errors
      const initErrors: ProviderError[] = initResults
        .map((result, index) => {
          if (result.status === 'rejected') {
            const provider = this.catalogProviders[index]
            return {
              providerId: provider.id,
              providerName: provider.name,
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
              capability: ProviderCapability.CATALOG
            }
          }
          return null
        })
        .filter((error): error is ProviderError => error !== null)

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

        return {
          catalogs: [],
          totalProviders: this.catalogProviders.length,
          successfulProviders: 0,
          providerErrors: initErrors,
          executionTime: performance.now() - startTime,
          requestId
        }
      }

      // Fetch catalogs from all initialized providers in parallel
      this.logger.debug('Fetching catalogs from initialized providers', undefined, {
        context: 'get_all_catalogs_usecase',
        requestId,
        providerCount: initializedProviders.length
      })

      const catalogResults = await Promise.allSettled(
        initializedProviders.map(async (provider) => {
          try {
            const providerStartTime = performance.now()
            const catalogs = await provider.getAllCatalogs()
            const providerTime = performance.now() - providerStartTime

            this.logger.debug('Successfully fetched catalogs from provider', undefined, {
              context: 'get_all_catalogs_usecase',
              requestId,
              providerId: provider.id,
              catalogCount: catalogs.length,
              fetchTime: Math.round(providerTime)
            })

            return {
              provider,
              catalogs,
              fetchTime: providerTime
            }
          } catch (error) {
            const errorInstance = error instanceof Error ? error : new Error(String(error))
            this.logger.error('Failed to fetch catalogs from provider', errorInstance, {
              context: 'get_all_catalogs_usecase',
              requestId,
              providerId: provider.id,
              providerName: provider.name
            })
            throw errorInstance
          }
        })
      )

      // Extract successful catalog results
      const successfulResults = catalogResults
        .filter((result): result is PromiseFulfilledResult<{
          provider: ICatalogProvider
          catalogs: Catalog[]
          fetchTime: number
        }> => result.status === 'fulfilled')
        .map(result => result.value)

      // Collect catalog fetch errors
      const fetchErrors: ProviderError[] = catalogResults
        .map((result, index) => {
          if (result.status === 'rejected') {
            const provider = initializedProviders[index]
            return {
              providerId: provider.id,
              providerName: provider.name,
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
              capability: ProviderCapability.CATALOG
            }
          }
          return null
        })
        .filter((error): error is ProviderError => error !== null)

      // Flatten all catalogs from successful providers
      const allCatalogs = successfulResults.flatMap(result => result.catalogs)

      // Combine all errors
      const allErrors = [...initErrors, ...fetchErrors]

      const executionTime = performance.now() - startTime

      this.logger.info('GetAllCatalogsUseCase execution completed', {
        context: 'get_all_catalogs_usecase',
        requestId,
        totalCatalogs: allCatalogs.length,
        totalProviders: this.catalogProviders.length,
        successfulProviders: successfulResults.length,
        errorCount: allErrors.length,
        executionTime: Math.round(executionTime)
      })

      return {
        catalogs: allCatalogs,
        totalProviders: this.catalogProviders.length,
        successfulProviders: successfulResults.length,
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