/**
 * TMDB External IDs Provider
 * 
 * Implementation of IExternalIdsProvider for The Movie Database (TMDB)
 * Provides external ID fetching for cross-platform content identification
 */

import { IExternalIdsProvider, ExternalIdsResult } from '@/src/domain/providers/external-ids/external-ids-provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'

/**
 * Cache entry for external IDs responses
 */
interface CacheEntry<T> {
  readonly data: T
  readonly timestamp: Date
  readonly ttlMs: number
}

/**
 * TMDB External IDs Provider - Implementation of IExternalIdsProvider
 */
export class TMDBExternalIdsProvider implements IExternalIdsProvider {
  public readonly id = 'tmdb-external-ids'
  public readonly name = 'TMDB External IDs Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.EXTERNAL_IDS]
  public readonly priority = 10

  private readonly cache = new Map<string, CacheEntry<ExternalIdsResult>>()
  private readonly defaultCacheTtl = 30 * 60 * 1000 // 30 minutes

  constructor(
    private readonly tmdbService: ITMDBService,
    private readonly logger: ILoggingService,
    sourceId: string
  ) {
    this.sourceId = sourceId
  }

  async initialize(): Promise<void> {
    try {
      await this.tmdbService.initialize()
      this.logger.info('TMDB external IDs provider initialized successfully', { 
        provider: 'tmdb_external_ids'
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB external IDs provider', errorInstance, { 
        provider: 'tmdb_external_ids'
      })
      throw new Error(`TMDB external IDs provider initialization failed: ${errorInstance.message}`)
    }
  }

  async getExternalIds(catalogItem: CatalogItem): Promise<ExternalIdsResult> {
    const cacheKey = `externalIds:${catalogItem.id}`
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      this.logger.debug('Returning cached external IDs', undefined, {
        provider: 'tmdb_external_ids',
        catalogItemId: catalogItem.id
      })
      return cached
    }

    try {
      const tmdbId = this.extractTMDBIdFromCatalogItem(catalogItem)
      if (!tmdbId) {
        throw new Error(`Cannot extract TMDB ID from catalog item: ${catalogItem.id}`)
      }

      this.logger.info('Fetching TMDB external IDs', {
        provider: 'tmdb_external_ids',
        catalogItemId: catalogItem.id,
        mediaType: catalogItem.mediaType,
        tmdbId
      })

      const startTime = performance.now()
      let externalIds: ExternalIds = { tmdb: tmdbId }

      // Fetch external IDs based on media type
      switch (catalogItem.mediaType) {
        case MediaType.MOVIE:
          const movieExternalIds = await this.tmdbService.client.movies.getExternalIds(tmdbId)
          externalIds = {
            tmdb: tmdbId,
            imdb: movieExternalIds.imdb_id || undefined,
            tvdb: movieExternalIds.tvdb_id || undefined,
            wikidata: movieExternalIds.wikidata_id || undefined,
            facebook: movieExternalIds.facebook_id || undefined,
            instagram: movieExternalIds.instagram_id || undefined,
            twitter: movieExternalIds.twitter_id || undefined
          }
          break

        case MediaType.TV_SERIES:
          const tvExternalIds = await this.tmdbService.client.tv.getExternalIds(tmdbId)
          externalIds = {
            tmdb: tmdbId,
            imdb: tvExternalIds.imdb_id || undefined,
            tvdb: tvExternalIds.tvdb_id || undefined,
            wikidata: tvExternalIds.wikidata_id || undefined,
            facebook: tvExternalIds.facebook_id || undefined,
            instagram: tvExternalIds.instagram_id || undefined,
            twitter: tvExternalIds.twitter_id || undefined
          }
          break

        case MediaType.PERSON:
          const personExternalIds = await this.tmdbService.client.people.getExternalIds(tmdbId)
          externalIds = {
            tmdb: tmdbId,
            imdb: personExternalIds.imdb_id || undefined,
            wikidata: personExternalIds.wikidata_id || undefined,
            facebook: personExternalIds.facebook_id || undefined,
            instagram: personExternalIds.instagram_id || undefined,
            twitter: personExternalIds.twitter_id || undefined,
            youtube: (personExternalIds as any).youtube_id || undefined
          }
          break

        default:
          throw new Error(`Unsupported media type for external IDs: ${catalogItem.mediaType}`)
      }

      const fetchTime = performance.now() - startTime

      // Calculate quality score based on available external IDs
      const availableIds = Object.values(externalIds).filter(id => id !== undefined).length
      const totalPossibleIds = this.getSupportedExternalSources().length
      const qualityScore = availableIds / totalPossibleIds

      const result: ExternalIdsResult = {
        externalIds,
        sourceItem: catalogItem,
        fetchedAt: new Date(),
        fromCache: false,
        qualityScore
      }

      // Cache the result
      this.setCache(cacheKey, result)

      this.logger.info('Successfully fetched TMDB external IDs', {
        provider: 'tmdb_external_ids',
        catalogItemId: catalogItem.id,
        tmdbId,
        availableIds,
        qualityScore: Math.round(qualityScore * 100) / 100,
        fetchTime: Math.round(fetchTime)
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TMDB external IDs', errorInstance, {
        provider: 'tmdb_external_ids',
        catalogItemId: catalogItem.id,
        mediaType: catalogItem.mediaType
      })
      throw new Error(`Failed to fetch external IDs: ${errorInstance.message}`)
    }
  }

  async getBulkExternalIds(catalogItems: CatalogItem[]): Promise<Record<string, ExternalIdsResult>> {
    try {
      this.logger.info('Fetching bulk TMDB external IDs', {
        provider: 'tmdb_external_ids',
        itemCount: catalogItems.length
      })

      const startTime = performance.now()
      
      // Process in parallel with error handling
      const externalIdsPromises = catalogItems.map(async (item) => {
        try {
          const result = await this.getExternalIds(item)
          return { itemId: item.id, result }
        } catch (error) {
          this.logger.warn('Failed to fetch external IDs for item', error instanceof Error ? error : new Error(String(error)), {
            provider: 'tmdb_external_ids',
            itemId: item.id,
            mediaType: item.mediaType
          })
          return { itemId: item.id, result: null }
        }
      })

      const results = await Promise.allSettled(externalIdsPromises)
      const externalIdsMap: Record<string, ExternalIdsResult> = {}

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.result) {
          externalIdsMap[result.value.itemId] = result.value.result
        }
      })

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched bulk TMDB external IDs', {
        provider: 'tmdb_external_ids',
        requested: catalogItems.length,
        successful: Object.keys(externalIdsMap).length,
        fetchTime: Math.round(fetchTime)
      })

      return externalIdsMap

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch bulk TMDB external IDs', errorInstance, {
        provider: 'tmdb_external_ids',
        itemCount: catalogItems.length
      })
      throw new Error(`Failed to fetch bulk external IDs: ${errorInstance.message}`)
    }
  }

  supportsMediaType(mediaType: string): boolean {
    return [MediaType.MOVIE, MediaType.TV_SERIES, MediaType.PERSON].includes(mediaType as MediaType)
  }

  getSupportedExternalSources(): string[] {
    return ['tmdb', 'imdb', 'tvdb', 'facebook', 'instagram', 'twitter', 'wikidata', 'youtube']
  }

  canFetchExternalIds(catalogItem: CatalogItem): boolean {
    return this.extractTMDBIdFromCatalogItem(catalogItem) !== null
  }

  // ================================
  // Helper Methods
  // ================================

  /**
   * Extract TMDB ID from CatalogItem context
   */
  private extractTMDBIdFromCatalogItem(catalogItem: CatalogItem): number | null {
    // Try external IDs first
    if (catalogItem.externalIds?.tmdb) {
      return catalogItem.externalIds.tmdb
    }

    // Try to extract from item ID
    return this.extractTMDBId(catalogItem.id)
  }

  /**
   * Extract TMDB ID from various formats
   */
  private extractTMDBId(mediaId: string): number | null {
    // Try to parse as direct number
    const directId = parseInt(mediaId, 10)
    if (!isNaN(directId)) {
      return directId
    }

    // Try to extract from catalog item ID format: mediaType:tmdbId:source
    const parts = mediaId.split(':')
    if (parts.length >= 2) {
      const tmdbId = parseInt(parts[1], 10)
      if (!isNaN(tmdbId)) {
        return tmdbId
      }
    }

    return null
  }

  /**
   * Caching utilities
   */
  private getFromCache(key: string): ExternalIdsResult | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = new Date()
    const isExpired = (now.getTime() - entry.timestamp.getTime()) > entry.ttlMs

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return { ...entry.data, fromCache: true }
  }

  private setCache(key: string, data: ExternalIdsResult, ttlMs: number = this.defaultCacheTtl): void {
    const entry: CacheEntry<ExternalIdsResult> = {
      data,
      timestamp: new Date(),
      ttlMs
    }
    this.cache.set(key, entry)
  }
}