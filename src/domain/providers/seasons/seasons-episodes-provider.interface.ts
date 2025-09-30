import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem, EpisodeInfo } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Season information with episodes
 */
export interface Season {
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

  /** Episodes in this season */
  readonly episodes: EpisodeInfo[]

  /** Season vote average */
  readonly voteAverage?: number

  /** Season vote count */
  readonly voteCount?: number
}

/**
 * Season metadata without episodes for progressive loading
 * Contains all season information except the episodes array to minimize initial data transfer
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SeasonMetadata extends Omit<Season, 'episodes'> {
  /** 
   * This interface intentionally omits the episodes array from Season
   * to enable efficient progressive loading strategies where season metadata
   * is loaded first, followed by individual season episodes on demand
   */
}

/**
 * Seasons provider interface
 * Providers with this capability can retrieve season and episode information for TV series
 * Supports both comprehensive and progressive loading strategies for optimal performance
 */
export interface ISeasonsProvider extends IProvider {
  /**
   * Get seasons and episodes for a TV series catalog item
   * Returns seasons with their episodes for comprehensive TV content browsing
   * 
   * @param catalogItem - The TV series catalog item to get seasons for
   * @returns Promise that resolves to seasons result with seasons array
   * 
   * @example
   * ```typescript
   * const result = await provider.getSeasons(tvSeriesItem)
   * result.seasons.forEach(season => {
   *   console.log(`Season ${season.seasonNumber}: ${season.episodes.length} episodes`)
   * })
   * ```
   */
  getSeasons(catalogItem: CatalogItem): Promise<{ seasons: Season[] }>

  /**
   * Get season metadata without episodes for progressive loading
   * Returns season information excluding episodes array to minimize initial data transfer
   * Use this method for initial UI rendering, then load individual seasons as needed
   * 
   * @param catalogItem - The TV series catalog item to get season metadata for
   * @returns Promise that resolves to season metadata result without episodes
   * 
   * @example
   * ```typescript
   * // Initial load with season metadata only
   * const metadata = await provider.getSeasonsMetadata(tvSeriesItem)
   * metadata.seasons.forEach(season => {
   *   console.log(`Season ${season.seasonNumber}: ${season.episodeCount} episodes`)
   * })
   * ```
   */
  getSeasonsMetadata(catalogItem: CatalogItem): Promise<{ seasons: SeasonMetadata[] }>

  /**
   * Get a single season with all its episodes for progressive loading
   * Returns complete season data including episodes for on-demand loading
   * Use this method to load individual seasons after displaying metadata
   * 
   * @param catalogItem - The TV series catalog item to get the season for
   * @param seasonNumber - The season number to retrieve with episodes
   * @returns Promise that resolves to complete season with episodes
   * 
   * @example
   * ```typescript
   * // Load specific season when user expands it
   * const season = await provider.getSeasonWithEpisodes(tvSeriesItem, 1)
   * console.log(`Season ${season.seasonNumber} has ${season.episodes.length} episodes`)
   * season.episodes.forEach(episode => {
   *   console.log(`Episode ${episode.episodeNumber}: ${episode.name}`)
   * })
   * ```
   */
  getSeasonWithEpisodes(catalogItem: CatalogItem, seasonNumber: number): Promise<Season>
}