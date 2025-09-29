import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { TVCatalogItem, EpisodeInfo } from '@/src/domain/entities/media/catalog-item.entity'
import { ImageVariant } from '@/src/domain/providers/images/images-provider.interface'

/**
 * Season information with episodes and metadata
 */
export interface SeasonInfo {
  /** Season ID */
  readonly id: string

  /** Season number */
  readonly seasonNumber: number

  /** Season name/title */
  readonly name: string

  /** Season overview/description */
  readonly overview?: string

  /** Season air date */
  readonly airDate?: Date

  /** Number of episodes in this season */
  readonly episodeCount: number

  /** Season poster images */
  readonly images?: ImageVariant

  /** Episodes in this season */
  readonly episodes: EpisodeInfo[]

  /** Season vote average */
  readonly voteAverage?: number

  /** Season vote count */
  readonly voteCount?: number

  /** Production code */
  readonly productionCode?: string

  /** Season type (e.g., regular, special, miniseries) */
  readonly seasonType?: string
}

/**
 * Enhanced episode information with additional details
 */
export interface DetailedEpisodeInfo extends EpisodeInfo {
  /** Episode images (stills) */
  readonly images?: ImageVariant

  /** Episode production code */
  readonly productionCode?: string

  /** Episode crew information */
  readonly crew?: EpisodeCrew[]

  /** Episode guest stars */
  readonly guestStars?: EpisodeGuest[]

  /** Episode video content */
  readonly videos?: EpisodeVideo[]
}

/**
 * Episode crew member
 */
export interface EpisodeCrew {
  /** Crew member ID */
  readonly id: number

  /** Crew member name */
  readonly name: string

  /** Department */
  readonly department: string

  /** Job title */
  readonly job: string

  /** Profile image URL */
  readonly profileUrl?: string
}

/**
 * Episode guest star
 */
export interface EpisodeGuest {
  /** Guest star ID */
  readonly id: number

  /** Guest star name */
  readonly name: string

  /** Character name */
  readonly character: string

  /** Profile image URL */
  readonly profileUrl?: string

  /** Display order */
  readonly order: number
}

/**
 * Episode video content
 */
export interface EpisodeVideo {
  /** Video ID */
  readonly id: string

  /** Video key/identifier */
  readonly key: string

  /** Video name/title */
  readonly name: string

  /** Video site (YouTube, Vimeo, etc.) */
  readonly site: string

  /** Video type (Trailer, Clip, etc.) */
  readonly type: string

  /** Is official video */
  readonly official: boolean
}

/**
 * Seasons and episodes result with metadata
 */
export interface SeasonsEpisodesResult {
  /** TV series context */
  readonly tvSeries: TVCatalogItem

  /** All seasons with episodes */
  readonly seasons: SeasonInfo[]

  /** Timestamp when data was fetched */
  readonly fetchedAt: Date

  /** Whether result was from cache */
  readonly fromCache: boolean

  /** Data completeness score (0-1) */
  readonly completenessScore: number

  /** Provider-specific metadata */
  readonly providerMetadata?: Record<string, any>
}

/**
 * Single season result for specific season requests
 */
export interface SingleSeasonResult {
  /** TV series context */
  readonly tvSeries: TVCatalogItem

  /** The requested season */
  readonly season: SeasonInfo

  /** Timestamp when data was fetched */
  readonly fetchedAt: Date

  /** Whether result was from cache */
  readonly fromCache: boolean
}

/**
 * Seasons and episodes provider interface
 * Providers with this capability can fetch detailed season and episode information for TV series
 * Enables comprehensive TV content browsing and navigation
 */
export interface ISeasonsEpisodesProvider extends IProvider {
  /**
   * Get all seasons and episodes for a TV series
   * Fetches comprehensive season/episode data including metadata and images
   * 
   * @param tvSeriesItem - The TV series catalog item to get seasons for
   * @returns Promise that resolves to complete seasons and episodes data
   * 
   * @example
   * ```typescript
   * const result = await provider.getAllSeasons(tvSeriesItem)
   * result.seasons.forEach(season => {
   *   console.log(`Season ${season.seasonNumber}: ${season.episodes.length} episodes`)
   * })
   * ```
   */
  getAllSeasons(tvSeriesItem: TVCatalogItem): Promise<SeasonsEpisodesResult>

  /**
   * Get a specific season with all its episodes
   * Fetches detailed information for a single season
   * 
   * @param tvSeriesItem - The TV series catalog item
   * @param seasonNumber - The season number to fetch (1-based)
   * @returns Promise that resolves to the season data
   * 
   * @example
   * ```typescript
   * const result = await provider.getSeason(tvSeriesItem, 1)
   * console.log(`Season 1 has ${result.season.episodes.length} episodes`)
   * ```
   */
  getSeason(tvSeriesItem: TVCatalogItem, seasonNumber: number): Promise<SingleSeasonResult>

  /**
   * Get detailed information for a specific episode
   * Fetches comprehensive episode data including crew, guests, and videos
   * 
   * @param tvSeriesItem - The TV series catalog item
   * @param seasonNumber - The season number (1-based)
   * @param episodeNumber - The episode number (1-based)
   * @returns Promise that resolves to detailed episode information
   * 
   * @example
   * ```typescript
   * const episode = await provider.getEpisodeDetails(tvSeriesItem, 1, 1)
   * console.log(`Episode: ${episode.name}`)
   * console.log(`Crew: ${episode.crew?.length || 0} members`)
   * ```
   */
  getEpisodeDetails(
    tvSeriesItem: TVCatalogItem,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<DetailedEpisodeInfo>

  /**
   * Get episode images (stills) for a specific episode
   * Fetches image variants for episode stills and promotional images
   * 
   * @param tvSeriesItem - The TV series catalog item
   * @param seasonNumber - The season number (1-based)
   * @param episodeNumber - The episode number (1-based)
   * @returns Promise that resolves to episode image variants
   * 
   * @example
   * ```typescript
   * const images = await provider.getEpisodeImages(tvSeriesItem, 1, 1)
   * console.log(`Still URL: ${images.large}`)
   * ```
   */
  getEpisodeImages(
    tvSeriesItem: TVCatalogItem,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<ImageVariant>

  /**
   * Check if seasons/episodes data is available for a TV series
   * Validates if the provider can fetch season data for the given series
   * 
   * @param tvSeriesItem - The TV series catalog item to check
   * @returns Whether seasons/episodes data is available
   * 
   * @example
   * ```typescript
   * if (provider.hasSeasonsData(tvSeriesItem)) {
   *   const seasons = await provider.getAllSeasons(tvSeriesItem)
   * }
   * ```
   */
  hasSeasonsData(tvSeriesItem: TVCatalogItem): boolean

  /**
   * Get the total number of seasons available for a TV series
   * Provides quick access to season count without fetching full data
   * 
   * @param tvSeriesItem - The TV series catalog item
   * @returns Promise that resolves to the number of seasons
   * 
   * @example
   * ```typescript
   * const seasonCount = await provider.getSeasonCount(tvSeriesItem)
   * console.log(`This series has ${seasonCount} seasons`)
   * ```
   */
  getSeasonCount(tvSeriesItem: TVCatalogItem): Promise<number>

  /**
   * Check if detailed episode information is supported
   * Determines if the provider can fetch crew, guest stars, and video data
   * 
   * @returns Whether detailed episode information is available
   * 
   * @example
   * ```typescript
   * if (provider.supportsDetailedEpisodes()) {
   *   const details = await provider.getEpisodeDetails(series, 1, 1)
   *   console.log(`Guest stars: ${details.guestStars?.length || 0}`)
   * }
   * ```
   */
  supportsDetailedEpisodes(): boolean

  /**
   * Check if episode images are supported
   * Determines if the provider can fetch episode stills and promotional images
   * 
   * @returns Whether episode images are available
   * 
   * @example
   * ```typescript
   * if (provider.supportsEpisodeImages()) {
   *   const images = await provider.getEpisodeImages(series, 1, 1)
   * }
   * ```
   */
  supportsEpisodeImages(): boolean
}