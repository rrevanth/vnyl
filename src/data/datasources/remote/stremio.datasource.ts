// Custom DI container pattern
import { 
  IApiService, 
  ILoggingService, 
  ApiResponse,
  ApiError 
} from '@/src/domain/services'
import { TOKENS } from '@/src/infrastructure/di/tokens'

/**
 * Stremio addon API data source for fetching stream data
 * Handles interactions with multiple Stremio addon endpoints
 */
export class StremioDataSource {
  constructor(
    private readonly apiService: IApiService,
    private readonly logger: ILoggingService
  ) {}

  // Addon discovery and management
  async getAvailableAddons(): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching available Stremio addons')
      return await this.apiService.get('/addons')
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch available addons', errorInstance)
      throw new Error(`Failed to fetch available addons: ${errorInstance.message}`)
    }
  }

  async getAddonManifest(addonUrl: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching addon manifest', { addonUrl })
      return await this.apiService.get(`${addonUrl}/manifest.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch addon manifest', errorInstance, { addonUrl })
      throw new Error(`Failed to fetch addon manifest from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  async checkAddonHealth(addonUrl: string): Promise<ApiResponse<any>> {
    try {
      const startTime = Date.now()
      const response = await this.apiService.get(`${addonUrl}/manifest.json`)
      const responseTime = Date.now() - startTime
      
      return {
        data: {
          online: true,
          response_time_ms: responseTime,
          last_checked: new Date().toISOString(),
          manifest: response.data
        },
        status: 200,
        statusText: 'OK',
        headers: response.headers,
        config: { url: `${addonUrl}/manifest.json`, method: 'GET' }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.warn(`Addon health check failed: ${errorInstance.message}`, { addonUrl })
      
      return {
        data: {
          online: false,
          response_time_ms: 0,
          last_checked: new Date().toISOString(),
          error: errorInstance.message
        },
        status: 500,
        statusText: 'Error',
        headers: {},
        config: { url: '', method: 'GET' }
      }
    }
  }

  // Stream discovery operations
  async getStreamsForMovie(addonUrl: string, imdbId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching movie streams', { addonUrl, imdbId })
      return await this.apiService.get(`${addonUrl}/stream/movie/${imdbId}.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch movie streams', errorInstance, { addonUrl, imdbId })
      throw new Error(`Failed to fetch movie streams for ${imdbId} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  async getStreamsForTVSeries(
    addonUrl: string, 
    imdbId: string, 
    season: number, 
    episode: number
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching TV series streams', { addonUrl, imdbId, season, episode })
      return await this.apiService.get(`${addonUrl}/stream/series/${imdbId}:${season}:${episode}.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TV series streams', errorInstance, { addonUrl, imdbId, season, episode })
      throw new Error(`Failed to fetch streams for ${imdbId} S${season}E${episode} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  async getStreamsForSeason(
    addonUrl: string, 
    imdbId: string, 
    season: number
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching season streams', { addonUrl, imdbId, season })
      
      // Get season metadata first to determine episode count
      const seasonInfo = await this.getSeasonInfo(addonUrl, imdbId, season)
      const episodeCount = seasonInfo.data?.episode_count || 24 // Default fallback
      
      // Fetch streams for all episodes in parallel
      const episodePromises = Array.from({ length: episodeCount }, (_, i) => {
        const episodeNum = i + 1
        return this.getStreamsForTVSeries(addonUrl, imdbId, season, episodeNum)
          .then(response => ({ episode: episodeNum, streams: response.data?.streams || [] }))
          .catch(error => {
            const errorInstance = error instanceof Error ? error : new Error(String(error))
            this.logger.warn(`Failed to fetch episode streams: ${errorInstance.message}`, { 
              addonUrl, imdbId, season, episode: episodeNum 
            })
            return { episode: episodeNum, streams: [] }
          })
      })
      
      const episodeResults = await Promise.allSettled(episodePromises)
      const episodeStreams: { [episode: number]: any[] } = {}
      
      episodeResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          episodeStreams[result.value.episode] = result.value.streams
        }
      })
      
      return {
        data: episodeStreams,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '', method: 'GET' }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch season streams', errorInstance, { addonUrl, imdbId, season })
      throw new Error(`Failed to fetch season ${season} streams for ${imdbId} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  // Subtitle operations
  async getSubtitlesForMovie(addonUrl: string, imdbId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching movie subtitles', { addonUrl, imdbId })
      return await this.apiService.get(`${addonUrl}/subtitles/movie/${imdbId}.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch movie subtitles', errorInstance, { addonUrl, imdbId })
      throw new Error(`Failed to fetch subtitles for movie ${imdbId} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  async getSubtitlesForTVSeries(
    addonUrl: string, 
    imdbId: string, 
    season: number, 
    episode: number
  ): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching TV series subtitles', { addonUrl, imdbId, season, episode })
      return await this.apiService.get(`${addonUrl}/subtitles/series/${imdbId}:${season}:${episode}.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TV series subtitles', errorInstance, { addonUrl, imdbId, season, episode })
      throw new Error(`Failed to fetch subtitles for ${imdbId} S${season}E${episode} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  // Catalog operations
  async getCatalog(addonUrl: string, catalogId: string, genre?: string, skip = 0): Promise<ApiResponse<any>> {
    try {
      let url = `${addonUrl}/catalog/${catalogId}/catalog.json?skip=${skip}`
      if (genre) {
        url += `&genre=${encodeURIComponent(genre)}`
      }
      
      this.logger.debug('Fetching addon catalog', { addonUrl, catalogId, genre, skip })
      return await this.apiService.get(url)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch addon catalog', errorInstance, { addonUrl, catalogId, genre, skip })
      throw new Error(`Failed to fetch catalog ${catalogId} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  async getMetadata(addonUrl: string, type: string, id: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching addon metadata', { addonUrl, type, id })
      return await this.apiService.get(`${addonUrl}/meta/${type}/${id}.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch addon metadata', errorInstance, { addonUrl, type, id })
      throw new Error(`Failed to fetch metadata for ${type}/${id} from ${addonUrl}: ${errorInstance.message}`)
    }
  }

  // Stream validation and health checks
  async validateStreamUrl(streamUrl: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Validating stream URL', { streamUrl })
      
      const startTime = Date.now()
      const response = await this.apiService.head(streamUrl)
      const responseTime = Date.now() - startTime
      
      return {
        data: {
          valid: response.status >= 200 && response.status < 400,
          response_time_ms: responseTime,
          content_type: response.headers['content-type'],
          content_length: response.headers['content-length'],
          redirectUrl: response.headers['location']
        },
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: { url: streamUrl, method: 'HEAD' }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.warn(`Stream URL validation failed: ${errorInstance.message}`, { streamUrl })
      
      return {
        data: {
          valid: false,
          error: errorInstance.message
        },
        status: 500,
        statusText: 'Error',
        headers: {},
        config: { url: '', method: 'GET' }
      }
    }
  }

  async checkStreamHealth(streamUrl: string): Promise<ApiResponse<any>> {
    try {
      const startTime = Date.now()
      const response = await this.apiService.get(streamUrl, {
        timeout: 5000,
        headers: {
          'Range': 'bytes=0-1023' // Request first 1KB to check availability
        }
      })
      const responseTime = Date.now() - startTime
      
      return {
        data: {
          available: true,
          response_time_ms: responseTime,
          content_type: response.headers['content-type'],
          partial_content_supported: response.status === 206
        },
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: { url: streamUrl, method: 'GET' }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.warn(`Stream health check failed: ${errorInstance.message}`, { streamUrl })
      
      return {
        data: {
          available: false,
          response_time_ms: 0,
          error: errorInstance.message
        },
        status: 500,
        statusText: 'Error',
        headers: {},
        config: { url: '', method: 'GET' }
      }
    }
  }

  // Helper methods
  private async getSeasonInfo(addonUrl: string, imdbId: string, season: number): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`${addonUrl}/meta/series/${imdbId}:${season}.json`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.warn(`Failed to fetch season info: ${errorInstance.message}`, { addonUrl, imdbId, season })
      
      // Return default season info if metadata is not available
      return {
        data: { episode_count: 24 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '', method: 'GET' }
      }
    }
  }

  // Batch operations for efficiency
  async batchGetStreams(requests: {
    addonUrl: string
    mediaType: 'movie' | 'series'
    imdbId: string
    season?: number
    episode?: number
  }[]): Promise<{ 
    request: typeof requests[0]
    result: ApiResponse<any> | { error: string }
  }[]> {
    this.logger.debug('Batch fetching streams', { requestCount: requests.length })
    
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          let response: ApiResponse<any>
          
          if (request.mediaType === 'movie') {
            response = await this.getStreamsForMovie(request.addonUrl, request.imdbId)
          } else {
            if (request.season === undefined || request.episode === undefined) {
              throw new Error('Season and episode required for TV series streams')
            }
            response = await this.getStreamsForTVSeries(
              request.addonUrl, 
              request.imdbId, 
              request.season, 
              request.episode
            )
          }
          
          return { request, result: response }
        } catch (error) {
          const errorInstance = error instanceof Error ? error : new Error(String(error))
          return { 
            request, 
            result: { error: errorInstance.message }
          }
        }
      })
    )
    
    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          request: {} as any, // This shouldn't happen with Promise.allSettled
          result: { error: result.reason?.message || 'Unknown error' }
        }
      }
    })
  }
}