/**
 * TMDB Seasons Provider
 * 
 * Implementation for The Movie Database (TMDB) seasons and episodes enrichment
 * Provides season and episode metadata for TV series following clean architecture principles
 */

import { 
  ISeasonsProvider,
  Season 
} from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'
import { EpisodeInfo, CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'

export class TMDBSeasonsProvider implements ISeasonsProvider {
  public readonly id = 'tmdb-seasons'
  public readonly name = 'TMDB Seasons & Episodes Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.SEASONS_EPISODES]
  public readonly priority = 10

  constructor(
    private readonly tmdbService: ITMDBService,
    private readonly logger: ILoggingService,
    sourceId: string
  ) {
    this.sourceId = sourceId
  }

  async initialize(): Promise<void> {
    try {
      await this.tmdbService.initialize()
      this.logger.info('TMDB seasons provider initialized successfully', {
        provider: 'tmdb_seasons'
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB seasons provider', errorInstance, {
        provider: 'tmdb_seasons'
      })
      throw new Error(`TMDB seasons provider initialization failed: ${errorInstance.message}`)
    }
  }

  /**
   * Get seasons for a TV series
   * Returns seasons with embedded episodes
   * Implements ISeasonsProvider.getSeasons
   */
  async getSeasons(catalogItem: CatalogItem): Promise<{ seasons: Season[] }> {
    try {
      this.logger.info('Fetching seasons with episodes', {
        provider: 'tmdb_seasons',
        tvId: catalogItem.id
      })

      const tmdbId = this.extractTmdbId(catalogItem.id)
      
      // First, get TV details to know how many seasons exist
      const tvDetails = await this.tmdbService.client.tv.getDetails(tmdbId)
      
      if (!tvDetails.seasons || tvDetails.seasons.length === 0) {
        this.logger.info('No seasons found for TV series', {
          provider: 'tmdb_seasons',
          tvId: catalogItem.id
        })
        return { seasons: [] }
      }

      // Fetch detailed data for each season (including episodes)
      const seasons: Season[] = []
      
      for (const season of tvDetails.seasons) {
        try {
          // Skip season 0 (specials) by default
          if (season.season_number === 0) {
            continue
          }

          // Fetch detailed season data including episodes
          const seasonDetails = await this.tmdbService.client.tv.getSeasonDetails(
            tmdbId, 
            season.season_number
          )

          const seasonInfo = this.transformSeasonToSeason(seasonDetails)
          seasons.push(seasonInfo)

          this.logger.debug('Fetched season details', undefined, {
            provider: 'tmdb_seasons',
            tvId: catalogItem.id,
            seasonNumber: season.season_number,
            episodeCount: seasonInfo.episodes.length
          })

        } catch (seasonError) {
          // Log error but continue with other seasons
          this.logger.warn('Failed to fetch season details', seasonError instanceof Error ? seasonError : new Error(String(seasonError)), {
            provider: 'tmdb_seasons',
            tvId: catalogItem.id,
            seasonNumber: season.season_number
          })

          // Add basic season info even if detailed fetch failed
          const basicSeasonInfo: Season = {
            id: `tmdb_season_${season.id}`,
            seasonNumber: season.season_number,
            name: season.name,
            overview: season.overview,
            episodeCount: season.episode_count || 0,
            airDate: season.air_date ? new Date(season.air_date) : undefined,
            episodes: []
          }
          seasons.push(basicSeasonInfo)
        }
      }

      // Sort seasons by season number
      seasons.sort((a, b) => a.seasonNumber - b.seasonNumber)

      this.logger.info('Successfully fetched seasons with episodes', {
        provider: 'tmdb_seasons',
        tvId: catalogItem.id,
        totalSeasons: seasons.length,
        totalEpisodes: seasons.reduce((sum, season) => sum + season.episodes.length, 0)
      })

      return { seasons }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch seasons with episodes', errorInstance, {
        provider: 'tmdb_seasons',
        tvId: catalogItem.id
      })
      
      // Return empty seasons to allow graceful degradation
      return { seasons: [] }
    }
  }

  /**
   * Alternative method name for backward compatibility
   * Calls the standard getSeasons method
   */
  async getAllSeasons(catalogItem: CatalogItem): Promise<{ seasons: Season[] }> {
    return this.getSeasons(catalogItem)
  }








  /**
   * Transform TMDB season details to domain Season
   */
  private transformSeasonToSeason(seasonDetails: any): Season {
    return {
      id: `tmdb_season_${seasonDetails.id}`,
      seasonNumber: seasonDetails.season_number,
      name: seasonDetails.name,
      overview: seasonDetails.overview,
      episodeCount: seasonDetails.episodes?.length || 0,
      airDate: seasonDetails.air_date ? new Date(seasonDetails.air_date) : undefined,
      voteAverage: seasonDetails.vote_average,
      episodes: this.transformEpisodes(seasonDetails.episodes || []),
      images: seasonDetails.poster_path ? {
        thumbnail: `https://image.tmdb.org/t/p/w185${seasonDetails.poster_path}`,
        small: `https://image.tmdb.org/t/p/w300${seasonDetails.poster_path}`,
        medium: `https://image.tmdb.org/t/p/w500${seasonDetails.poster_path}`,
        large: `https://image.tmdb.org/t/p/w780${seasonDetails.poster_path}`,
        original: `https://image.tmdb.org/t/p/original${seasonDetails.poster_path}`
      } : undefined
    }
  }

  /**
   * Transform TMDB episode data to domain EpisodeInfo array
   */
  private transformEpisodes(episodes: any[]): EpisodeInfo[] {
    return episodes.map(episode => ({
      id: episode.id,
      episodeNumber: episode.episode_number,
      seasonNumber: episode.season_number,
      name: episode.name,
      overview: episode.overview,
      airDate: episode.air_date ? new Date(episode.air_date) : undefined,
      runtime: episode.runtime || undefined,
      voteAverage: episode.vote_average,
      voteCount: episode.vote_count,
      images: episode.still_path ? {
        thumbnail: `https://image.tmdb.org/t/p/w185${episode.still_path}`,
        small: `https://image.tmdb.org/t/p/w300${episode.still_path}`,
        medium: `https://image.tmdb.org/t/p/w500${episode.still_path}`,
        large: `https://image.tmdb.org/t/p/w1280${episode.still_path}`,
        original: `https://image.tmdb.org/t/p/original${episode.still_path}`
      } : undefined
    }))
  }

  /**
   * Check if TMDB ID can be extracted from catalog item ID
   */
  private canExtractTmdbId(catalogItemId: string): boolean {
    try {
      this.extractTmdbId(catalogItemId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Extract TMDB ID from catalog item ID
   */
  private extractTmdbId(catalogItemId: string): number {
    const parts = catalogItemId.split('_')
    const tmdbId = parseInt(parts[parts.length - 1], 10)
    if (isNaN(tmdbId)) {
      throw new Error(`Invalid TMDB ID in catalog item: ${catalogItemId}`)
    }
    return tmdbId
  }
}