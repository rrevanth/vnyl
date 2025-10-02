/**
 * User entity representing application users and their preferences
 * Manages user settings, watch history, and personalization data
 */

export type UserTheme = 'light' | 'dark' | 'system'

export type UserLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh'

export type StreamQualityPreference = 'auto' | '240p' | '360p' | '480p' | '720p' | '1080p' | '2160p'

export type SubtitlePreference = 'off' | 'auto' | 'always'

export interface UserDisplayPreferences {
  theme: UserTheme
  language: UserLanguage
  font_size: 'small' | 'medium' | 'large' | 'extra_large'
  high_contrast: boolean
  reduce_motion: boolean
  show_adult_content: boolean
}

export interface UserStreamingPreferences {
  default_quality: StreamQualityPreference
  auto_play: boolean
  auto_play_trailers: boolean
  subtitles: SubtitlePreference
  subtitle_language: UserLanguage
  audio_language: UserLanguage
  skip_intro: boolean
  skip_credits: boolean
  cellular_streaming: boolean
  download_quality: StreamQualityPreference
}

export interface UserContentPreferences {
  favorite_genres: string[]
  blocked_genres: string[]
  favorite_languages: UserLanguage[]
  region: string
  mature_content: boolean
  spoiler_protection: boolean
}

export interface UserNotificationSettings {
  new_episodes: boolean
  recommendations: boolean
  system_updates: boolean
  marketing: boolean
  email_notifications: boolean
  push_notifications: boolean
}

export interface UserWatchHistoryEntry {
  id: string
  media_id: string
  media_type: 'movie' | 'series'
  media_title: string
  season?: number
  episode?: number
  progress_seconds: number
  duration_seconds: number
  last_watched_at: string
  completed: boolean
}

export interface UserFavorite {
  id: string
  media_id: string
  media_type: 'movie' | 'series'
  media_title: string
  poster_path?: string
  added_at: string
}

export interface UserWatchlist {
  id: string
  media_id: string
  media_type: 'movie' | 'series'
  media_title: string
  poster_path?: string
  priority: 'low' | 'medium' | 'high'
  added_at: string
  notes?: string
}

export interface UserRating {
  id: string
  media_id: string
  media_type: 'movie' | 'series'
  rating: number // 1-10
  review?: string
  rated_at: string
}

export interface UserDownload {
  id: string
  media_id: string
  media_type: 'movie' | 'series'
  season?: number
  episode?: number
  file_path: string
  size_bytes: number
  quality: StreamQualityPreference
  downloaded_at: string
  expires_at?: string
}

export interface UserProfile {
  id: string
  name: string
  avatar_url?: string
  is_child: boolean
  pin_required: boolean
  content_restrictions: UserContentPreferences
}

export interface UserEntity {
  // Core identification
  id: string
  email?: string
  username?: string
  
  // Profile information
  profiles: UserProfile[]
  active_profile_id: string
  
  // Preferences
  display_preferences: UserDisplayPreferences
  streaming_preferences: UserStreamingPreferences
  content_preferences: UserContentPreferences
  notification_settings: UserNotificationSettings
  
  // User data
  watch_history: UserWatchHistoryEntry[]
  favorites: UserFavorite[]
  watchlist: UserWatchlist[]
  ratings: UserRating[]
  downloads: UserDownload[]
  
  // Subscription and limits
  is_premium: boolean
  storage_limit_gb: number
  storage_used_gb: number
  
  // Privacy and security
  data_collection_consent: boolean
  analytics_consent: boolean
  last_login_at?: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * User session information
 */
export interface UserSession {
  id: string
  user_id: string
  device_id: string
  device_name: string
  platform: string
  ip_address: string
  user_agent: string
  created_at: string
  expires_at: string
  last_activity_at: string
}

/**
 * User preferences update payload
 */
export interface UserPreferencesUpdate {
  display_preferences?: Partial<UserDisplayPreferences>
  streaming_preferences?: Partial<UserStreamingPreferences>
  content_preferences?: Partial<UserContentPreferences>
  notification_settings?: Partial<UserNotificationSettings>
}

/**
 * User statistics for analytics
 */
export interface UserStats {
  total_watch_time_hours: number
  favorite_genres: string[]
  most_watched_type: 'movie' | 'series'
  average_rating: number
  total_downloads: number
  storage_usage_percentage: number
}