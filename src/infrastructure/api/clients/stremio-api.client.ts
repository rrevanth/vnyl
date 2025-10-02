/**
 * Stremio API client implementation
 * Provides access to Stremio addon ecosystem and streaming sources
 */

import { AxiosApiService, AxiosClientConfig } from '@/src/infrastructure/api/axios'
import { IApiService } from '@/src/domain/services/api.service.interface'

export interface StremioConfig {
  baseURL?: string
  enableLogging?: boolean
  timeout?: number
  retries?: number
  userAgent?: string
}

export interface StremioAddon {
  manifest: {
    id: string
    version: string
    name: string
    description: string
    logo?: string
    background?: string
    contactEmail?: string
    resources: string[]
    types: string[]
    catalogs?: {
      type: string
      id: string
      name: string
      extra?: {
        name: string
        isRequired?: boolean
        options?: string[]
        optionsLimit?: number
      }[]
    }[]
    idPrefixes?: string[]
    behaviorHints?: {
      adult?: boolean
      p2p?: boolean
      configurable?: boolean
      configurationRequired?: boolean
    }
  }
  transportUrl: string
  flags: {
    official?: boolean
    protected?: boolean
  }
}

export interface StremioStream {
  url: string
  title?: string
  name?: string
  description?: string
  subtitles?: {
    url: string
    lang: string
  }[]
  behaviorHints?: {
    notWebReady?: boolean
    bingeGroup?: string
    countryWhitelist?: string[]
    proxyHeaders?: Record<string, string>
  }
}

export interface StreemioCatalogItem {
  id: string
  type: 'movie' | 'series' | 'channel' | 'tv'
  name: string
  poster?: string
  background?: string
  logo?: string
  description?: string
  releaseInfo?: string
  director?: string[]
  cast?: string[]
  genre?: string[]
  imdbRating?: string
  year?: string
  country?: string
  language?: string
  runtime?: string
  website?: string
  behaviorHints?: {
    defaultVideoId?: string
  }
  videos?: {
    id: string
    title: string
    released: string
    season?: number
    episode?: number
    overview?: string
    thumbnail?: string
    streams?: StremioStream[]
  }[]
}

export class StremioApiClient {
  private apiService: IApiService
  private addons: Map<string, StremioAddon> = new Map()

  constructor(config: StremioConfig = {}) {
    const axiosConfig: AxiosClientConfig = {
      baseURL: config.baseURL || 'https://api.strem.io',
      timeout: config.timeout || 15000,
      retries: config.retries || 2,
      retryDelay: 2000,
      enableLogging: config.enableLogging ?? __DEV__,
    }

    this.apiService = new AxiosApiService(axiosConfig)
    
    // Set user agent for Stremio requests
    this.apiService.setDefaultHeaders({
      'User-Agent': config.userAgent || 'VNYL-App/1.0.0',
    })

    // Enable caching for addon manifests and catalog data
    this.apiService.enableCache(15 * 60 * 1000) // 15 minutes
  }

  /**
   * Get the underlying API service for direct access
   */
  getApiService(): IApiService {
    return this.apiService
  }

  /**
   * Fetch addon manifest
   */
  async getAddonManifest(addonUrl: string): Promise<StremioAddon> {
    const manifestUrl = addonUrl.endsWith('/') ? `${addonUrl}manifest.json` : `${addonUrl}/manifest.json`
    
    try {
      const response = await this.apiService.get<StremioAddon['manifest']>(manifestUrl, {
        cache: true,
        cacheTTL: 60 * 60 * 1000, // Cache manifests for 1 hour
      })

      const addon: StremioAddon = {
        manifest: response.data,
        transportUrl: addonUrl,
        flags: {
          official: false,
          protected: false,
        },
      }

      this.addons.set(addon.manifest.id, addon)
      return addon
    } catch (error) {
      throw new Error(`Failed to fetch addon manifest from ${manifestUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get catalog from addon
   */
  async getCatalog(
    addonUrl: string,
    type: string,
    id: string,
    extra: Record<string, string> = {}
  ): Promise<{ metas: StreemioCatalogItem[] }> {
    const extraParams = Object.entries(extra)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    
    const catalogUrl = extraParams
      ? `${addonUrl}/catalog/${type}/${id}/${extraParams}.json`
      : `${addonUrl}/catalog/${type}/${id}.json`

    try {
      const response = await this.apiService.get<{ metas: StreemioCatalogItem[] }>(catalogUrl, {
        cache: true,
        cacheTTL: 30 * 60 * 1000, // Cache catalog for 30 minutes
      })

      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch catalog from ${catalogUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get meta information for a specific item
   */
  async getMeta(
    addonUrl: string,
    type: string,
    id: string
  ): Promise<{ meta: StreemioCatalogItem }> {
    const metaUrl = `${addonUrl}/meta/${type}/${id}.json`

    try {
      const response = await this.apiService.get<{ meta: StreemioCatalogItem }>(metaUrl, {
        cache: true,
        cacheTTL: 60 * 60 * 1000, // Cache meta for 1 hour
      })

      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch meta from ${metaUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get streams for a specific video
   */
  async getStreams(
    addonUrl: string,
    type: string,
    id: string,
    videoId?: string
  ): Promise<{ streams: StremioStream[] }> {
    const streamId = videoId ? `${id}:${videoId}` : id
    const streamsUrl = `${addonUrl}/stream/${type}/${streamId}.json`

    try {
      const response = await this.apiService.get<{ streams: StremioStream[] }>(streamsUrl, {
        cache: true,
        cacheTTL: 5 * 60 * 1000, // Cache streams for 5 minutes
      })

      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch streams from ${streamsUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search across multiple addons
   */
  async searchAcrossAddons(
    query: string,
    type: 'movie' | 'series' = 'movie',
    addonUrls: string[] = []
  ): Promise<{ addon: StremioAddon; results: StreemioCatalogItem[] }[]> {
    const searchPromises = addonUrls.map(async (addonUrl) => {
      try {
        const addon = await this.getAddonManifest(addonUrl)
        
        // Check if addon supports search
        const searchCatalog = addon.manifest.catalogs?.find(
          catalog => catalog.type === type && catalog.extra?.some(extra => extra.name === 'search')
        )

        if (!searchCatalog) {
          return { addon, results: [] }
        }

        const catalog = await this.getCatalog(addonUrl, type, searchCatalog.id, { search: query })
        return { addon, results: catalog.metas }
      } catch (error) {
        console.warn(`Search failed for addon ${addonUrl}:`, error)
        return { addon: { manifest: { id: addonUrl } } as StremioAddon, results: [] }
      }
    })

    return Promise.allSettled(searchPromises).then(results =>
      results
        .filter((result): result is PromiseFulfilledResult<{ addon: StremioAddon; results: StreemioCatalogItem[] }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .filter(result => result.results.length > 0)
    )
  }

  /**
   * Get streams from multiple addons
   */
  async getStreamsFromMultipleAddons(
    type: string,
    id: string,
    videoId: string | undefined,
    addonUrls: string[]
  ): Promise<{ addon: StremioAddon; streams: StremioStream[] }[]> {
    const streamPromises = addonUrls.map(async (addonUrl) => {
      try {
        const addon = await this.getAddonManifest(addonUrl)
        
        // Check if addon supports streams for this type
        if (!addon.manifest.resources.includes('stream') || 
            !addon.manifest.types.includes(type)) {
          return { addon, streams: [] }
        }

        const result = await this.getStreams(addonUrl, type, id, videoId)
        return { addon, streams: result.streams }
      } catch (error) {
        console.warn(`Stream fetch failed for addon ${addonUrl}:`, error)
        return { addon: { manifest: { id: addonUrl } } as StremioAddon, streams: [] }
      }
    })

    return Promise.allSettled(streamPromises).then(results =>
      results
        .filter((result): result is PromiseFulfilledResult<{ addon: StremioAddon; streams: StremioStream[] }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
        .filter(result => result.streams.length > 0)
    )
  }

  /**
   * Get popular Stremio addons from the official addon collection
   */
  async getOfficialAddons(): Promise<StremioAddon[]> {
    try {
      const response = await this.apiService.get<{ addons: { manifest: StremioAddon['manifest']; transportUrl: string }[] }>('/addonsofficialcollection', {
        cache: true,
        cacheTTL: 60 * 60 * 1000, // Cache for 1 hour
      })

      return response.data.addons.map(addon => ({
        manifest: addon.manifest,
        transportUrl: addon.transportUrl,
        flags: {
          official: true,
          protected: false,
        },
      }))
    } catch (error) {
      console.warn('Failed to fetch official addons:', error)
      return []
    }
  }

  /**
   * Get addon collections
   */
  async getAddonCollections(): Promise<{
    id: string
    name: string
    description: string
    addons: string[]
  }[]> {
    try {
      const response = await this.apiService.get<{ collections: {
        id: string
        name: string
        description: string
        addons: string[]
      }[] }>('/addoncollections', {
        cache: true,
        cacheTTL: 60 * 60 * 1000,
      })

      return response.data.collections
    } catch (error) {
      console.warn('Failed to fetch addon collections:', error)
      return []
    }
  }

  /**
   * Validate addon URL and check if it's reachable
   */
  async validateAddon(addonUrl: string): Promise<{
    valid: boolean
    error?: string
    manifest?: StremioAddon['manifest']
  }> {
    try {
      const addon = await this.getAddonManifest(addonUrl)
      return {
        valid: true,
        manifest: addon.manifest,
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get registered addons
   */
  getRegisteredAddons(): StremioAddon[] {
    return Array.from(this.addons.values())
  }

  /**
   * Register an addon for future use
   */
  registerAddon(addon: StremioAddon): void {
    this.addons.set(addon.manifest.id, addon)
  }

  /**
   * Unregister an addon
   */
  unregisterAddon(addonId: string): boolean {
    return this.addons.delete(addonId)
  }

  /**
   * Clear all registered addons
   */
  clearAddons(): void {
    this.addons.clear()
  }

  /**
   * Health check for Stremio API
   */
  async healthCheck() {
    return this.apiService.ping('/addonsofficialcollection')
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.apiService.cleanup()
    this.addons.clear()
  }
}