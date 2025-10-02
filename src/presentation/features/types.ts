/**
 * Feature Types
 * Common types shared across features
 */

// Base media types
export interface BaseMedia {
  id: string
  title: string
  type: 'movie' | 'tv' | 'episode' | 'person' | 'collection'
  posterUrl?: string
  backdropUrl?: string
  overview?: string
  releaseDate?: string
  rating?: number
  genres?: string[]
}

// Navigation types
export interface NavigationParams {
  mediaId?: string
  personId?: string
  collectionId?: string
  query?: string
  filters?: Record<string, any>
}

// User interaction types
export interface UserInteraction {
  type: 'view' | 'like' | 'share' | 'download' | 'watch' | 'rate' | 'add_to_watchlist'
  mediaId: string
  timestamp: string
  metadata?: Record<string, any>
}

// Pagination types
export interface PaginationInfo {
  page: number
  totalPages: number
  totalResults: number
  hasMore: boolean
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

// Filter types
export interface BaseFilter {
  genre?: string[]
  year?: { min: number; max: number }
  rating?: { min: number; max: number }
  availability?: 'all' | 'free' | 'subscription' | 'rental'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// UI state types
export interface BaseUIState {
  activeTab?: string
  viewMode?: 'grid' | 'list' | 'carousel'
  showFilters?: boolean
  searchQuery?: string
  selectedItems?: string[]
  multiSelectMode?: boolean
}

// Cache types
export interface CacheState {
  lastFetch: string | null
  ttl: number
  invalidationKeys: string[]
  backgroundRefresh: boolean
}

// Streaming types
export interface StreamSource {
  id: string
  name: string
  url: string
  quality: '720p' | '1080p' | '4K'
  type: 'stream' | 'download'
  isOfficial: boolean
  size?: number
  subtitles?: {
    language: string
    url: string
  }[]
}

// Download types
export interface DownloadState {
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused'
  progress: number
  downloadedSize: number
  totalSize: number
  error?: string
  retryCount: number
}

// Player types
export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  quality: string
  isFullscreen: boolean
  showControls: boolean
  isBuffering: boolean
  hasError: boolean
  errorMessage?: string
}

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  region: string
  autoplay: boolean
  skipIntro: boolean
  defaultQuality: '720p' | '1080p' | '4K' | 'auto'
  downloadOnWiFi: boolean
  notifications: boolean
  parentalControls: boolean
  maturityLevel: number
}

// Analytics types
export interface AnalyticsEvent {
  name: string
  properties: Record<string, any>
  timestamp: string
  sessionId: string
  userId?: string
}

// Error types
export interface AppError {
  id: string
  type: 'network' | 'auth' | 'validation' | 'system' | 'user'
  message: string
  details?: string
  timestamp: string
  context?: Record<string, any>
  recoverable: boolean
}

// Sync types
export interface SyncState {
  lastSyncTime: string | null
  isSyncing: boolean
  syncErrors: string[]
  autoSync: boolean
  conflictResolution: 'local' | 'remote' | 'merge'
}

// Search types
export interface SearchContext {
  query: string
  filters: BaseFilter
  results: BaseMedia[]
  suggestions: string[]
  history: string[]
  totalResults: number
  isSearching: boolean
}

// Collection types
export interface Collection {
  id: string
  name: string
  description?: string
  type: 'watchlist' | 'favorites' | 'custom' | 'smart'
  mediaIds: string[]
  isPublic: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
  coverMediaId?: string
  tags: string[]
}

// Rating types
export interface Rating {
  value: number
  maxValue: number
  count: number
  distribution?: Record<string, number>
}

// Review types
export interface Review {
  id: string
  authorId: string
  authorName: string
  content: string
  rating?: number
  isVerified: boolean
  createdAt: string
  updatedAt?: string
  likes: number
  dislikes: number
  replies?: Review[]
}

// Notification types
export interface AppNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  actionText?: string
  data?: Record<string, any>
}

// Theme types
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  warning: string
  success: string
  info: string
}

// Permission types
export interface Permission {
  type: 'camera' | 'microphone' | 'location' | 'notifications' | 'storage'
  status: 'granted' | 'denied' | 'not_determined'
  canRequest: boolean
}

// Device types
export interface DeviceInfo {
  id: string
  name: string
  type: 'mobile' | 'tablet' | 'tv' | 'desktop'
  os: string
  osVersion: string
  appVersion: string
  lastActive: string
  capabilities: {
    downloadSupport: boolean
    offlinePlayback: boolean
    hdStreaming: boolean
    airplaySupport: boolean
  }
}

// Export utility types
export type ID = string
export type Timestamp = string
export type URL = string
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export type JSONObject = { [key: string]: JSONValue }
export type JSONArray = JSONValue[]

// State update types
export type StateUpdate<T> = Partial<T> | ((prevState: T) => Partial<T>)
export type AsyncStateUpdate<T> = Promise<StateUpdate<T>>

// Event handler types
export type EventHandler<T = void> = (event: T) => void
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>

// Selector types
export type Selector<TState, TResult> = (state: TState) => TResult
export type EqualityFn<T> = (a: T, b: T) => boolean

// API response types
export interface APIResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    pagination?: PaginationInfo
    timestamp: string
    requestId: string
  }
}

// Form types
export interface FormField<T = any> {
  value: T
  error: string | null
  touched: boolean
  dirty: boolean
  valid: boolean
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> }
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  submitCount: number
  errors: Record<string, string>
}