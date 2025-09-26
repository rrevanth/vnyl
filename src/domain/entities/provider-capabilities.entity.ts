/**
 * Provider Capabilities Entity - Detailed Capability Definitions
 * 
 * Defines the detailed interfaces and types for each provider capability,
 * providing structured contracts for provider implementations.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type { ContentType, MediaContext, PaginationResponse } from './provider.entity'

/**
 * ===============================
 * CATALOG CAPABILITY
 * ===============================
 */

export interface CatalogItem {
  id: string
  type: ContentType
  title: string
  originalTitle?: string
  description?: string
  year?: number
  releaseDate?: string
  posterUrl?: string
  backdropUrl?: string
  rating?: number
  genres?: string[]
  duration?: number // in minutes
  status?: string
  language?: string
  externalIds?: Record<string, string | number>
  providerInfo: {
    sourceProvider: string
    sourceId: string | number
    sourceType?: string
    catalogId?: string
    lastUpdated?: Date
  }
}

export interface Catalog {
  id: string
  title: string
  description?: string
  type: ContentType
  imageUrl?: string
  totalItems?: number
  pagination: {
    currentPage: number
    totalPages?: number
    hasMore: boolean
  }
  items: CatalogItem[]
  providerInfo: {
    sourceProvider: string
    sourceId: string | number
    catalogType?: string
    lastUpdated?: Date
  }
  filters?: CatalogFilters
}

export interface CatalogFilters {
  genre?: string[]
  year?: number
  rating?: { min?: number; max?: number }
  language?: string
  region?: string
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title' | 'vote_count'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * ===============================
 * METADATA CAPABILITY
 * ===============================
 */

export interface MediaMetadata {
  // Core identification
  id: string
  type: ContentType
  title: string
  originalTitle?: string
  description?: string
  tagline?: string
  
  // Dates and timing
  releaseDate?: string
  year?: number
  runtime?: number // in minutes
  status?: string
  
  // Visual assets
  posterUrl?: string
  backdropUrl?: string
  logoUrl?: string
  
  // Classification
  genres?: string[]
  keywords?: string[]
  languages?: string[]
  originCountries?: string[]
  certification?: string
  contentRating?: string
  
  // Ratings and popularity
  rating?: number
  voteCount?: number
  popularity?: number
  
  // TV-specific
  numberOfSeasons?: number
  numberOfEpisodes?: number
  seasons?: Season[]
  networks?: Network[]
  
  // Movie-specific
  budget?: number
  revenue?: number
  productionCompanies?: ProductionCompany[]
  
  // People
  cast?: Person[]
  crew?: Person[]
  directors?: Person[]
  writers?: Person[]
  producers?: Person[]
  
  // External references
  externalIds?: Record<string, string | number>
  homepage?: string
  trailerUrl?: string
  
  // Provider metadata
  providerInfo: {
    sourceProvider: string
    sourceId: string | number
    sourceType?: string
    lastUpdated?: Date
  }
  mediaContext?: MediaContext
}

export interface Season {
  id: string
  seasonNumber: number
  name: string
  description?: string
  posterUrl?: string
  airDate?: string
  episodeCount: number
  episodes?: Episode[]
}

export interface Episode {
  id: string
  episodeNumber: number
  seasonNumber: number
  name: string
  description?: string
  stillUrl?: string
  airDate?: string
  runtime?: number
  rating?: number
  voteCount?: number
}

export interface Network {
  id: string
  name: string
  logoUrl?: string
  originCountry?: string
}

export interface ProductionCompany {
  id: string
  name: string
  logoUrl?: string
  originCountry?: string
}

/**
 * ===============================
 * PERSON CAPABILITY
 * ===============================
 */

export interface Person {
  id: string
  name: string
  biography?: string
  birthday?: string
  deathday?: string
  placeOfBirth?: string
  profileUrl?: string
  gender?: number
  popularity?: number
  knownForDepartment?: string
  alsoKnownAs?: string[]
  
  // Credits
  movieCredits?: PersonCredit[]
  tvCredits?: PersonCredit[]
  
  // External references
  externalIds?: Record<string, string | number>
  homepage?: string
  
  // Provider metadata
  providerInfo: {
    sourceProvider: string
    sourceId: string | number
    lastUpdated?: Date
  }
}

export interface PersonCredit {
  id: string
  title: string
  originalTitle?: string
  type: ContentType
  character?: string
  job?: string
  department?: string
  releaseDate?: string
  posterUrl?: string
  rating?: number
  popularity?: number
}

/**
 * ===============================
 * SEARCH CAPABILITY
 * ===============================
 */

export interface SearchFilters {
  type?: ContentType[]
  year?: number
  genre?: string[]
  language?: string
  region?: string
  includeAdult?: boolean
  page?: number
  limit?: number
}

export interface SearchResult {
  query: string
  totalResults: number
  page: number
  totalPages: number
  results: CatalogItem[]
  searchTime?: number
  providerInfo: {
    sourceProvider: string
    searchId?: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * RECOMMENDATIONS CAPABILITY
 * ===============================
 */

export interface RecommendationRequest {
  context: MediaContext
  type: 'similar' | 'recommendations' | 'trending' | 'popular'
  filters?: RecommendationFilters
}

export interface RecommendationFilters {
  limit?: number
  minRating?: number
  maxAge?: number // in days
  excludeGenres?: string[]
  includeGenres?: string[]
  language?: string
}

export interface RecommendationResult {
  type: 'similar' | 'recommendations' | 'trending' | 'popular'
  results: CatalogItem[]
  confidence?: number
  reasonType?: 'genre' | 'cast' | 'director' | 'popularity' | 'rating'
  reason?: string
  providerInfo: {
    sourceProvider: string
    algorithm?: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * EXTERNAL IDS CAPABILITY
 * ===============================
 */

export interface ExternalIds {
  // Primary databases
  imdb?: string
  tmdb?: number
  tvdb?: number
  trakt?: number
  
  // Social and official
  facebook?: string
  instagram?: string
  twitter?: string
  homepage?: string
  wikipedia?: string
  wikidata?: string
  
  // Streaming and reviews
  justwatch?: string
  letterboxd?: string
  metacritic?: string
  rottenTomatoes?: string
  
  // Provider-specific
  [key: string]: string | number | undefined
}

/**
 * ===============================
 * RATINGS CAPABILITY
 * ===============================
 */

export interface RatingSource {
  source: string
  value: number
  scale: number // e.g., 10 for 1-10 scale, 5 for 1-5 scale
  votes?: number
  url?: string
  lastUpdated?: Date
}

export interface RatingsData {
  ratings: RatingSource[]
  aggregatedRating?: number
  aggregatedScale?: number
  totalVotes?: number
  providerInfo: {
    sourceProvider: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * COMMENTS CAPABILITY
 * ===============================
 */

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
    verified?: boolean
    rating?: number
  }
  createdAt: Date
  updatedAt?: Date
  rating?: number
  likes?: number
  replies?: Comment[]
  language?: string
  spoiler?: boolean
  providerInfo: {
    sourceProvider: string
    sourceId: string
    sourceUrl?: string
  }
}

export interface CommentsData {
  comments: Comment[]
  totalCount: number
  averageRating?: number
  pagination?: {
    page: number
    totalPages: number
    hasMore: boolean
  }
  providerInfo: {
    sourceProvider: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * TRACKING CAPABILITY
 * ===============================
 */

export interface WatchProgress {
  mediaId: string
  type: ContentType
  progress: number // 0-100 percentage
  runtime?: number // total runtime in minutes
  watchedAt?: Date
  season?: number
  episode?: number
  paused?: boolean
  completed?: boolean
}

export interface WatchlistItem {
  mediaId: string
  type: ContentType
  addedAt: Date
  priority?: 'low' | 'medium' | 'high'
  notes?: string
  progress?: WatchProgress
}

export interface TrackingData {
  watchlist: WatchlistItem[]
  watchedItems: WatchProgress[]
  favorites: string[]
  ratings: Record<string, number>
  providerInfo: {
    sourceProvider: string
    userId?: string
    lastSynced?: Date
  }
}

/**
 * ===============================
 * ADDON CATALOG CAPABILITY
 * ===============================
 */

export interface AddonCatalogItem {
  id: string
  name: string
  description?: string
  version: string
  author?: string
  iconUrl?: string
  bannerUrl?: string
  manifestUrl: string
  installUrl?: string
  
  // Capabilities
  types: ContentType[]
  capabilities: string[]
  
  // Metadata
  tags?: string[]
  language?: string
  region?: string
  rating?: number
  downloads?: number
  lastUpdated?: Date
  
  // Installation status
  installed?: boolean
  installDate?: Date
  enabled?: boolean
}

export interface AddonCatalog {
  id: string
  name: string
  description?: string
  addons: AddonCatalogItem[]
  categories?: string[]
  totalCount: number
  providerInfo: {
    sourceProvider: string
    catalogUrl?: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * IMAGES CAPABILITY
 * ===============================
 */

export interface MediaImage {
  type: 'poster' | 'backdrop' | 'logo' | 'profile' | 'still' | 'screenshot'
  url: string
  width?: number
  height?: number
  aspectRatio?: number
  language?: string
  voteAverage?: number
  voteCount?: number
}

export interface ImagesData {
  posters: MediaImage[]
  backdrops: MediaImage[]
  logos: MediaImage[]
  profiles?: MediaImage[]
  stills?: MediaImage[]
  screenshots?: MediaImage[]
  providerInfo: {
    sourceProvider: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * STREAMS CAPABILITY
 * ===============================
 */

export interface StreamSource {
  id: string
  name: string
  url: string
  type: 'direct' | 'torrent' | 'external_player' | 'web_player'
  quality: string // e.g., '1080p', '720p', '4K'
  size?: number // in bytes
  language?: string
  subtitles?: StreamSubtitle[]
  headers?: Record<string, string>
  behaviorHints?: {
    notWebReady?: boolean
    bingeGroup?: string
    countryWhitelist?: string[]
    proxyHeaders?: Record<string, string>
  }
}

export interface StreamSubtitle {
  id: string
  url: string
  language: string
  format: 'srt' | 'vtt' | 'ass' | 'ssa'
  autoselect?: boolean
}

export interface StreamsData {
  streams: StreamSource[]
  providerInfo: {
    sourceProvider: string
    addonId?: string
    lastUpdated?: Date
  }
}

/**
 * ===============================
 * SUBTITLES CAPABILITY
 * ===============================
 */

export interface SubtitleFile {
  id: string
  url: string
  language: string
  languageName: string
  format: 'srt' | 'vtt' | 'ass' | 'ssa'
  encoding?: string
  autoTranslated?: boolean
  hearingImpaired?: boolean
  fps?: number
  downloads?: number
  rating?: number
  uploader?: string
  uploadDate?: Date
}

export interface SubtitlesData {
  subtitles: SubtitleFile[]
  providerInfo: {
    sourceProvider: string
    searchId?: string
    lastUpdated?: Date
  }
}