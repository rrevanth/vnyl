/**
 * Stream entity representing video streams from Stremio addon protocol
 * Based on Stremio addon specifications and streaming service protocols
 */

export type StreamType = 'movie' | 'series' | 'channel' | 'tv' | 'other'

export type StreamQuality = 
  | '240p' 
  | '360p' 
  | '480p' 
  | '720p' 
  | '1080p' 
  | '1440p' 
  | '2160p' 
  | '4K' 
  | 'UHD' 
  | 'HDR' 
  | 'unknown'

export type StreamSourceType = 'http' | 'https' | 'magnet' | 'torrent' | 'local'

export type StreamProtocol = 'hls' | 'dash' | 'progressive' | 'torrent' | 'magnet'

export interface StreamSubtitle {
  id: string
  url: string
  lang: string
  label: string
  format?: 'srt' | 'vtt' | 'ass' | 'ssa'
}

export interface StreamBehaviorHints {
  not_web_ready?: boolean
  bingeGroup?: string
  country_whitelist?: string[]
  proxy_headers?: Record<string, string>
  headers?: Record<string, string>
}

export interface StreamSource {
  url: string
  type: StreamSourceType
  protocol: StreamProtocol
  quality: StreamQuality
  size_bytes?: number
  bitrate?: number
  fps?: number
  codec?: string
  language?: string
}

export interface StreamAddon {
  id: string
  name: string
  version: string
  description?: string
  logo?: string
  background?: string
  contactEmail?: string
}

export interface StreamEntity {
  // Core identification
  id: string
  addon: StreamAddon
  
  // Media reference
  media_id: string
  media_type: StreamType
  
  // Stream metadata
  title: string
  name?: string
  description?: string
  
  // Technical details
  sources: StreamSource[]
  quality: StreamQuality
  size_gb?: number
  duration_seconds?: number
  
  // Language and subtitles
  language?: string
  subtitles: StreamSubtitle[]
  
  // Behavior and configuration
  behavior_hints?: StreamBehaviorHints
  
  // Series specific
  season?: number
  episode?: number
  
  // Availability and health
  availability: number // 0-1 representing availability/health
  seeds?: number
  peers?: number
  
  // Timestamps
  published_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

/**
 * Lightweight stream reference for listings
 */
export interface StreamReference {
  id: string
  title: string
  quality: StreamQuality
  size_gb?: number
  addon_name: string
  availability: number
}

/**
 * Stream search criteria
 */
export interface StreamSearchCriteria {
  media_id: string
  media_type: StreamType
  season?: number
  episode?: number
  quality_preference?: StreamQuality[]
  language_preference?: string[]
  subtitle_language?: string[]
  exclude_cam?: boolean
  min_availability?: number
}

/**
 * Stream with playback information
 */
export interface StreamWithPlayback extends StreamEntity {
  playback_url: string
  playback_headers?: Record<string, string>
  subtitle_tracks: StreamSubtitle[]
  can_play: boolean
  error_message?: string
}

/**
 * Stream statistics for analytics
 */
export interface StreamStats {
  total_streams: number
  by_quality: Record<StreamQuality, number>
  by_addon: Record<string, number>
  average_availability: number
  total_size_gb: number
}