/**
 * Media Detail Use Case - Business Logic for Media Detail Loading
 * 
 * Coordinates the loading of comprehensive media details using multiple
 * capability providers through the provider registry system.
 * 
 * CLEAN Architecture: Domain layer business logic
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { ProviderRegistry } from '@/src/infrastructure/providers/provider-registry'
import type { EnhancedCatalogItem, MediaDetail, BasicCatalogItem } from '@/src/domain/entities/enhanced-catalog-item.entity'
import type { EnhancedMediaContext } from '@/src/domain/entities/media-context.entity'
import type { MediaMetadata } from '@/src/domain/entities/provider-capabilities.entity'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'

/**
 * Media detail loading request
 */
export interface MediaDetailRequest {
  catalogItem: BasicCatalogItem
  requiredCapabilities?: ProviderCapability[]
  includeImages?: boolean
  includeVideos?: boolean
  includeRecommendations?: boolean
}

/**
 * Media detail loading result
 */
export interface MediaDetailResult {
  enhancedItem: EnhancedCatalogItem
  loadedCapabilities: ProviderCapability[]
  errors: {
    capability: ProviderCapability
    providerId: string
    error: string
  }[]
  loadingTime: number
}

/**
 * Media Detail Use Case
 * 
 * Encapsulates the business logic for loading comprehensive media details
 * by coordinating multiple capability providers.
 */
export class MediaDetailUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Load comprehensive media detail for a catalog item
   */
  async execute(request: MediaDetailRequest): Promise<MediaDetailResult> {
    const startTime = Date.now()
    const { catalogItem, requiredCapabilities = [ProviderCapability.METADATA] } = request
    
    this.logger.info('Loading media detail', {
      mediaId: catalogItem.id,
      mediaType: catalogItem.mediaType,
      requiredCapabilities
    })

    try {
      // Create enhanced media context for provider operations
      const mediaContext = this.createMediaContext(catalogItem)
      
      // Load capabilities in parallel for better performance
      const capabilityResults = await Promise.allSettled(
        requiredCapabilities.map(capability => 
          this.loadCapability(capability, mediaContext)
        )
      )

      // Process results and collect data
      const loadedCapabilities: ProviderCapability[] = []
      const errors: MediaDetailResult['errors'] = []
      let mediaDetail: MediaDetail | undefined

      capabilityResults.forEach((result, index) => {
        const capability = requiredCapabilities[index]
        
        if (result.status === 'fulfilled' && result.value.success) {
          loadedCapabilities.push(capability)
          
          // Merge capability data into media detail
          if (capability === ProviderCapability.METADATA && result.value.data) {
            mediaDetail = this.createMediaDetailFromMetadata(
              result.value.data as MediaMetadata,
              catalogItem
            )
          }
          
          // TODO: Handle other capabilities (images, videos, recommendations)
        } else {
          const error = result.status === 'rejected' 
            ? result.reason?.message || 'Unknown error'
            : result.value.error || 'Capability loading failed'
            
          errors.push({
            capability,
            providerId: result.status === 'fulfilled' ? result.value.providerId || 'unknown' : 'unknown',
            error
          })
        }
      })

      // Create enhanced catalog item with loaded detail
      const enhancedItem: EnhancedCatalogItem = {
        ...catalogItem,
        mediaDetail,
        enhancementLevel: mediaDetail ? 'complete' : 'basic',
        lastEnhanced: new Date()
      }

      const loadingTime = Date.now() - startTime
      
      this.logger.info('Media detail loading completed', {
        mediaId: catalogItem.id,
        loadedCapabilities,
        errorCount: errors.length,
        loadingTime
      })

      return {
        enhancedItem,
        loadedCapabilities,
        errors,
        loadingTime
      }

    } catch (error) {
      const loadingTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.logger.error('Media detail loading failed', error instanceof Error ? error : new Error(String(error)), {
        mediaId: catalogItem.id,
        loadingTime
      })

      return {
        enhancedItem: {
          ...catalogItem,
          enhancementLevel: 'basic',
          lastEnhanced: new Date()
        },
        loadedCapabilities: [],
        errors: [{
          capability: ProviderCapability.METADATA,
          providerId: 'system',
          error: errorMessage
        }],
        loadingTime
      }
    }
  }

  /**
   * Create enhanced media context from catalog item
   */
  private createMediaContext(catalogItem: BasicCatalogItem): EnhancedMediaContext {
    return {
      id: catalogItem.id,
      type: catalogItem.mediaType as any, // ContentType mapping
      title: catalogItem.name,
      year: catalogItem.year,
      releaseDate: catalogItem.releaseDate,
      externalIds: catalogItem.externalIds || {},
      providerInfo: {
        sourceProvider: catalogItem.providerInfo.providerId,
        sourceId: catalogItem.providerInfo.providerMediaId,
        lastUpdated: catalogItem.providerInfo.lastUpdated || new Date()
      },
      contextMetadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        version: 1,
        accessCount: 0,
        lastAccessTime: new Date(),
        contributingProviders: [catalogItem.providerInfo.providerId],
        primaryProvider: catalogItem.providerInfo.providerId,
        cacheKey: `${catalogItem.id}-${catalogItem.mediaType}`,
        cacheHits: 0,
        flags: [],
        performance: {
          fetchTime: 0,
          aggregationTime: 0,
          providerResponseTimes: {},
          totalProviderCalls: 0,
          cachedResponses: 0
        }
      }
    }
  }

  /**
   * Load a specific capability using available providers
   */
  private async loadCapability(
    capability: ProviderCapability,
    mediaContext: EnhancedMediaContext
  ): Promise<{
    success: boolean
    data?: unknown
    providerId?: string
    error?: string
  }> {
    try {
      // Get providers for this capability
      const providers = this.providerRegistry.getProvidersForCapability(capability)
      
      if (providers.length === 0) {
        return {
          success: false,
          error: `No providers available for capability: ${capability}`
        }
      }

      // Try providers in priority order
      for (const provider of providers) {
        try {
          let data: unknown

          switch (capability) {
            case ProviderCapability.METADATA:
              if ('getMetadata' in provider) {
                data = await (provider as any).getMetadata(mediaContext)
              }
              break
            case ProviderCapability.IMAGE:
              if ('getImages' in provider) {
                data = await (provider as any).getImages(mediaContext)
              }
              break
            // Add other capabilities as needed
            default:
              return {
                success: false,
                error: `Capability ${capability} not implemented in use case`
              }
          }

          if (data) {
            return {
              success: true,
              data,
              providerId: provider.config.id
            }
          }
        } catch (providerError) {
          this.logger.warn(`Provider ${provider.config.id} failed for capability ${capability}`, undefined, {
            error: providerError instanceof Error ? providerError.message : 'Unknown error',
            mediaId: mediaContext.id
          })
          // Continue to next provider
        }
      }

      return {
        success: false,
        error: `All providers failed for capability: ${capability}`
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Create MediaDetail from metadata provider result
   */
  private createMediaDetailFromMetadata(
    metadata: MediaMetadata,
    catalogItem: BasicCatalogItem
  ): MediaDetail {
    return {
      originalTitle: metadata.originalTitle,
      tagline: metadata.tagline,
      overview: metadata.description,
      status: metadata.status,
      runtime: metadata.runtime,
      originalLanguage: metadata.languages?.[0],
      contentRating: metadata.contentRating,
      cast: metadata.cast as any, // Type conversion needed
      crew: metadata.crew as any, // Type conversion needed
      directors: metadata.directors,
      writers: metadata.writers,
      producers: metadata.producers,
      lastUpdated: new Date(),
      sourceProviders: [metadata.providerInfo.sourceProvider]
    }
  }
}