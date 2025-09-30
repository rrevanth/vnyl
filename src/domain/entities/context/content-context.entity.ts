import type { CatalogContext } from './catalog-context.entity'

/**
 * Content Context Entity
 * 
 * Complete context information for individual content items, linking back to
 * their catalog source and preserving original provider data for full traceability.
 */
export interface ContentContext {
  /** Reference to the catalog this content came from */
  readonly catalogContext: CatalogContext
  
  /** Original provider media information */
  readonly originalMediaType: string
  readonly originalMediaId: string | number
  readonly providerId: string
  readonly providerName: string
  
  /** Position and metadata */
  readonly positionInCatalog: number
  readonly fetchedAt: Date
  readonly requestId: string
  
  /** Raw provider response for debugging and future enrichment */
  readonly originalData?: Record<string, unknown>
}

/**
 * Enriched Data Entity
 * 
 * Manages enrichment data from multiple providers for content items.
 * Only applies to CatalogItem entities, not Catalog entities.
 */
export interface EnrichedData<T = unknown> {
  /** Original data before enrichment */
  readonly originalData: T
  
  /** Map of enrichments by capability */
  readonly enrichments: Map<ProviderCapability, EnrichmentResult>
  
  /** When enrichment was performed */
  readonly enrichedAt: Date
  
  /** List of provider IDs that contributed enrichments */
  readonly enrichmentSources: string[]
}

export interface EnrichmentResult {
  /** Capability that provided this enrichment */
  readonly capability: ProviderCapability
  
  /** Provider that performed the enrichment */
  readonly providerId: string
  
  /** Enriched data */
  readonly data: unknown
  
  /** When this enrichment was performed */
  readonly enrichedAt: Date
  
  /** Additional metadata about the enrichment */
  readonly metadata?: Record<string, unknown>
}

export enum ProviderCapability {
  ACTIVITY = 'activity',
  CATALOG = 'catalog',
  EXTERNAL_IDS = 'external_ids',
  FILMOGRAPHY = 'filmography',
  IMAGES = 'images',
  METADATA = 'metadata',
  PEOPLE = 'people',
  RATINGS = 'ratings',
  RECOMMENDATIONS = 'recommendations',
  REVIEWS = 'reviews',
  SEARCH = 'search',
  SEASONS_EPISODES = 'seasons_episodes',
  STREAMS = 'streams',
  SUBTITLES = 'subtitles',
  WATCHLIST = 'watchlist'
}

/**
 * Utility functions for working with ContentContext and EnrichedData
 */
export class ContentContextUtils {
  /**
   * Creates a unique identifier for content based on its context
   */
  static createContentId(context: ContentContext): string {
    return `${context.providerId}-${context.originalMediaType}-${context.originalMediaId}`
  }
  
  /**
   * Checks if content was fetched from a specific catalog
   */
  static isFromCatalog(context: ContentContext, catalogId: string, providerId: string): boolean {
    return context.catalogContext.catalogId === catalogId && 
           context.catalogContext.providerId === providerId
  }
  
  /**
   * Creates a content context for an item
   */
  static createContentContext(
    catalogContext: CatalogContext,
    originalMediaType: string,
    originalMediaId: string | number,
    positionInCatalog: number,
    originalData?: Record<string, unknown>
  ): ContentContext {
    return {
      catalogContext,
      originalMediaType,
      originalMediaId,
      providerId: catalogContext.providerId,
      providerName: catalogContext.providerName,
      positionInCatalog,
      fetchedAt: new Date(),
      requestId: `${catalogContext.providerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalData
    }
  }
}

export class EnrichedDataUtils {
  /**
   * Creates initial enriched data structure
   */
  static createEnrichedData<T>(originalData: T): EnrichedData<T> {
    return {
      originalData,
      enrichments: new Map(),
      enrichedAt: new Date(),
      enrichmentSources: []
    }
  }
  
  /**
   * Adds an enrichment to existing enriched data
   */
  static addEnrichment<T>(
    enrichedData: EnrichedData<T>,
    result: EnrichmentResult
  ): EnrichedData<T> {
    const newEnrichments = new Map(enrichedData.enrichments)
    newEnrichments.set(result.capability, result)
    
    const newSources = enrichedData.enrichmentSources.includes(result.providerId)
      ? enrichedData.enrichmentSources
      : [...enrichedData.enrichmentSources, result.providerId]
    
    return {
      ...enrichedData,
      enrichments: newEnrichments,
      enrichedAt: new Date(),
      enrichmentSources: newSources
    }
  }
  
  /**
   * Gets enrichment data for a specific capability
   */
  static getEnrichment<T>(
    enrichedData: EnrichedData<T>,
    capability: ProviderCapability
  ): EnrichmentResult | undefined {
    return enrichedData.enrichments.get(capability)
  }
  
  /**
   * Checks if content has been enriched by a specific capability
   */
  static hasEnrichment<T>(
    enrichedData: EnrichedData<T>,
    capability: ProviderCapability
  ): boolean {
    return enrichedData.enrichments.has(capability)
  }
}