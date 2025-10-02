/**
 * Feature Constants
 * Shared constants across features
 */

// Search constants
export const SEARCH_DEBOUNCE_DELAY = 300 // ms
export const MAX_SEARCH_RESULTS = 100
export const MIN_SEARCH_QUERY_LENGTH = 2
export const MAX_SEARCH_HISTORY = 50
export const SEARCH_SUGGESTIONS_LIMIT = 10

// Media constants
export const DEFAULT_POSTER_ASPECT_RATIO = 2 / 3 // 2:3 (width:height)
export const DEFAULT_BACKDROP_ASPECT_RATIO = 16 / 9 // 16:9
export const MIN_RATING = 0
export const MAX_RATING = 10
export const DEFAULT_ITEMS_PER_PAGE = 20

// Video player constants
export const DEFAULT_VIDEO_QUALITY = '1080p'
export const PLAYER_CONTROLS_TIMEOUT = 3000 // ms
export const SEEK_INTERVAL = 10 // seconds
export const VOLUME_STEP = 0.1
export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const

// Download constants
export const MAX_CONCURRENT_DOWNLOADS = 3
export const DEFAULT_DOWNLOAD_QUALITY = '1080p'
export const DOWNLOAD_RETRY_LIMIT = 3
export const DOWNLOAD_TIMEOUT = 30000 // ms

// Cache constants
export const DEFAULT_CACHE_TTL = 300000 // 5 minutes
export const HERO_CACHE_TTL = 600000 // 10 minutes
export const SEARCH_CACHE_TTL = 180000 // 3 minutes
export const MEDIA_DETAIL_CACHE_TTL = 900000 // 15 minutes

// UI constants
export const DEFAULT_GRID_COLUMNS = 2
export const MAX_GRID_COLUMNS = 4
export const HERO_AUTO_ROTATE_INTERVAL = 10000 // ms
export const TOAST_DURATION = 3000 // ms
export const ANIMATION_DURATION = 300 // ms

// Library constants
export const MAX_WATCHLISTS = 20
export const MAX_WATCHLIST_ITEMS = 1000
export const CONTINUE_WATCHING_LIMIT = 20
export const RECENTLY_ADDED_LIMIT = 50

// Image sizes
export const IMAGE_SIZES = {
  poster: {
    small: 'w154',
    medium: 'w342',
    large: 'w500',
    xlarge: 'w780',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    xlarge: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    xlarge: 'original',
  },
  still: {
    small: 'w92',
    medium: 'w185',
    large: 'w300',
    xlarge: 'original',
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  SEARCH_FAILED: 'Search request failed. Please try again.',
  MEDIA_NOT_FOUND: 'Media content not found.',
  STREAM_NOT_AVAILABLE: 'Stream not available for this content.',
  DOWNLOAD_FAILED: 'Download failed. Please try again.',
  PLAYBACK_ERROR: 'Playback error occurred. Please try again.',
  AUTH_REQUIRED: 'Authentication required to access this content.',
  SUBSCRIPTION_REQUIRED: 'Subscription required to access this content.',
  REGION_BLOCKED: 'This content is not available in your region.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const

// Content ratings
export const CONTENT_RATINGS = {
  MOVIE: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
  TV: ['TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'],
} as const

// Genres
export const MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western',
] as const

export const TV_GENRES = [
  'Action & Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Kids',
  'Mystery',
  'News',
  'Reality',
  'Sci-Fi & Fantasy',
  'Soap',
  'Talk',
  'War & Politics',
  'Western',
] as const

// Sort options
export const SORT_OPTIONS = {
  POPULARITY: 'popularity',
  RATING: 'rating',
  RELEASE_DATE: 'release_date',
  ALPHABETICAL: 'alphabetical',
  RECENTLY_ADDED: 'recently_added',
  RECENTLY_WATCHED: 'recently_watched',
  WATCH_TIME: 'watch_time',
} as const

// Filter options
export const AVAILABILITY_OPTIONS = {
  ALL: 'all',
  FREE: 'free',
  SUBSCRIPTION: 'subscription',
  RENTAL: 'rental',
  PURCHASE: 'purchase',
} as const

export const QUALITY_OPTIONS = {
  AUTO: 'auto',
  SD: '480p',
  HD: '720p',
  FULL_HD: '1080p',
  UHD: '4K',
} as const

// Status options
export const MEDIA_STATUS = {
  RELEASED: 'released',
  IN_PRODUCTION: 'in_production',
  PLANNED: 'planned',
  CANCELLED: 'cancelled',
  RUMORED: 'rumored',
} as const

export const WATCH_STATUS = {
  UNWATCHED: 'unwatched',
  WATCHING: 'watching',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  DROPPED: 'dropped',
} as const

// Theme options
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Language options
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
] as const

// Region options
export const SUPPORTED_REGIONS = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
] as const

// API endpoints patterns
export const API_ENDPOINTS = {
  SEARCH: '/search',
  MEDIA: '/media',
  PERSON: '/person',
  TRENDING: '/trending',
  DISCOVER: '/discover',
  RECOMMENDATIONS: '/recommendations',
  WATCHLIST: '/watchlist',
  DOWNLOADS: '/downloads',
  USER: '/user',
  AUTH: '/auth',
} as const

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  DOWNLOAD_QUEUE: 'download_queue',
  WATCH_PROGRESS: 'watch_progress',
  APP_SETTINGS: 'app_settings',
  CACHE_DATA: 'cache_data',
  AUTH_TOKENS: 'auth_tokens',
} as const

// Event names
export const EVENT_NAMES = {
  MEDIA_PLAY: 'media_play',
  MEDIA_PAUSE: 'media_pause',
  MEDIA_COMPLETE: 'media_complete',
  SEARCH_PERFORMED: 'search_performed',
  ITEM_ADDED_TO_WATCHLIST: 'item_added_to_watchlist',
  DOWNLOAD_STARTED: 'download_started',
  SETTINGS_CHANGED: 'settings_changed',
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
} as const

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SMALL: 320,
  MEDIUM: 768,
  LARGE: 1024,
  EXTRA_LARGE: 1280,
} as const

// Animation timing
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const

// Z-index layers
export const Z_INDEX = {
  BACKGROUND: -1,
  NORMAL: 0,
  TOOLTIP: 10,
  DROPDOWN: 100,
  MODAL: 1000,
  TOAST: 2000,
  LOADING: 3000,
} as const