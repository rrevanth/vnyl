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
 * Seasons provider interface
 * Providers with this capability can retrieve season and episode information for TV series
 * Returns seasons containing episode data for comprehensive TV content browsing
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
}