import { 
  StreamEntity, 
  StreamSearchCriteria, 
  StreamWithPlayback,
  StreamStats 
} from '@/domain/entities/stream'

/**
 * Stream repository interface following dependency inversion principle
 * Infrastructure layer will implement this interface via Stremio addons
 */
export interface IStreamRepository {
  // Stream discovery and search
  findStreamsForMedia(criteria: StreamSearchCriteria): Promise<StreamEntity[]>
  findStreamById(id: string): Promise<StreamEntity | null>
  
  // Quality and availability filtering
  findStreamsByQuality(
    mediaId: string, 
    quality: string[], 
    mediaType: 'movie' | 'series',
    season?: number,
    episode?: number
  ): Promise<StreamEntity[]>
  
  findHighestQualityStream(
    mediaId: string, 
    mediaType: 'movie' | 'series',
    season?: number,
    episode?: number
  ): Promise<StreamEntity | null>
  
  findStreamsByAvailability(
    mediaId: string,
    minAvailability: number,
    mediaType: 'movie' | 'series',
    season?: number,
    episode?: number
  ): Promise<StreamEntity[]>
  
  // Addon management
  getAvailableAddons(): Promise<{
    id: string
    name: string
    version: string
    description?: string
    logo?: string
    types: string[]
    resources: string[]
  }[]>
  
  getAddonStreams(
    addonId: string, 
    mediaId: string, 
    mediaType: 'movie' | 'series',
    season?: number,
    episode?: number
  ): Promise<StreamEntity[]>
  
  // Playback preparation
  prepareStreamForPlayback(streamId: string): Promise<StreamWithPlayback | null>
  validateStreamUrl(url: string): Promise<{
    valid: boolean
    error?: string
    redirectUrl?: string
  }>
  
  // Series specific operations
  getSeriesStreams(
    seriesId: string,
    season: number,
    episode?: number
  ): Promise<{
    season: number
    episode?: number
    streams: StreamEntity[]
  }>
  
  getSeasonStreams(seriesId: string, season: number): Promise<{
    [episode: number]: StreamEntity[]
  }>
  
  // Subtitle operations
  getSubtitlesForStream(streamId: string): Promise<{
    id: string
    url: string
    lang: string
    label: string
    format: 'srt' | 'vtt' | 'ass' | 'ssa'
  }[]>
  
  findSubtitlesForMedia(
    mediaId: string,
    language: string[],
    season?: number,
    episode?: number
  ): Promise<{
    id: string
    url: string
    lang: string
    label: string
    format: 'srt' | 'vtt' | 'ass' | 'ssa'
  }[]>
  
  // Statistics and analytics
  getStreamStats(mediaId: string): Promise<StreamStats>
  getAddonStats(addonId: string): Promise<{
    total_streams: number
    average_availability: number
    supported_types: string[]
    last_updated: string
  }>
  
  // Health and monitoring
  checkStreamHealth(streamId: string): Promise<{
    available: boolean
    response_time_ms: number
    error?: string
  }>
  
  checkAddonHealth(addonId: string): Promise<{
    online: boolean
    response_time_ms: number
    last_checked: string
    error?: string
  }>
  
  // Cache and optimization
  invalidateStreamCache(mediaId: string): Promise<void>
  preloadPopularStreams(): Promise<void>
  cleanupExpiredStreams(): Promise<void>
}