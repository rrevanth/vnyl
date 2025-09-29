/**
 * TMDB Seasons Provider
 * 
 * Implementation for The Movie Database (TMDB) seasons and episodes enrichment
 * Provides season and episode metadata for TV series following clean architecture principles
 */

import { ISeasonsEpisodesProvider, SeasonInfo, SeasonsEpisodesResult, SingleSeasonResult, DetailedEpisodeInfo } from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'
import { TVCatalogItem, EpisodeInfo } from '@/src/domain/entities/media/catalog-item.entity'
import { ImageVariant } from '@/src/domain/providers/images/images-provider.interface'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { TMDBTVSeasonDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

export class TMDBSeasonsProvider implements ISeasonsEpisodesProvider {
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
   * Get all seasons and episodes for a TV series
   * Implements ISeasonsEpisodesProvider.getAllSeasons
   */
  async getAllSeasons(tvSeriesItem: TVCatalogItem): Promise<SeasonsEpisodesResult> {
    try {
      this.logger.info('Fetching all seasons with episodes', {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id
      })

      const tmdbId = this.extractTmdbId(tvSeriesItem.id)
      
      // First, get TV details to know how many seasons exist
      const tvDetails = await this.tmdbService.client.tv.getDetails(tmdbId)
      
      if (!tvDetails.seasons || tvDetails.seasons.length === 0) {
        this.logger.info('No seasons found for TV series', {
          provider: 'tmdb_seasons',
          tvId: tvSeriesItem.id
        })
        return {
          tvSeries: tvSeriesItem,
          seasons: [],
          fetchedAt: new Date(),
          fromCache: false,
          completenessScore: 1.0,
          providerMetadata: {
            tmdb_id: tmdbId,
            total_seasons: 0,
            provider: 'tmdb'
          }
        }
      }

      // Fetch detailed data for each season (including episodes)
      const seasons: SeasonInfo[] = []
      let completedSeasons = 0
      
      for (const season of tvDetails.seasons) {
        try {
          // Skip season 0 (specials) by default
          if (season.season_number === 0) {
            continue
          }

          // Fetch detailed season data including episodes
          const seasonDetails: TMDBTVSeasonDetails = await this.tmdbService.client.tv.getSeasonDetails(
            tmdbId, 
            season.season_number
          )

          const seasonInfo = this.transformSeasonToSeasonInfo(seasonDetails)
          seasons.push(seasonInfo)
          completedSeasons++

          this.logger.debug('Fetched season details', undefined, {
            provider: 'tmdb_seasons',
            tvId: tvSeriesItem.id,
            seasonNumber: season.season_number,
            episodeCount: seasonInfo.episodeCount
          })

        } catch (seasonError) {
          // Log error but continue with other seasons
          this.logger.warn('Failed to fetch season details', seasonError instanceof Error ? seasonError : new Error(String(seasonError)), {
            provider: 'tmdb_seasons',
            tvId: tvSeriesItem.id,
            seasonNumber: season.season_number
          })

          // Add basic season info even if detailed fetch failed
          const basicSeasonInfo: SeasonInfo = {
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

      const completenessScore = completedSeasons / Math.max(1, tvDetails.seasons.filter(s => s.season_number > 0).length)

      const result: SeasonsEpisodesResult = {
        tvSeries: tvSeriesItem,
        seasons,
        fetchedAt: new Date(),
        fromCache: false,
        completenessScore,
        providerMetadata: {
          tmdb_id: tmdbId,
          total_seasons: seasons.length,
          completed_seasons: completedSeasons,
          total_episodes: seasons.reduce((sum, season) => sum + season.episodeCount, 0),
          provider: 'tmdb'
        }
      }

      this.logger.info('Successfully fetched all seasons with episodes', {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        totalSeasons: seasons.length,
        totalEpisodes: result.providerMetadata?.total_episodes || 0,
        completenessScore
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch all seasons with episodes', errorInstance, {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id
      })
      
      // Return empty result to allow graceful degradation
      return {
        tvSeries: tvSeriesItem,
        seasons: [],
        fetchedAt: new Date(),
        fromCache: false,
        completenessScore: 0.0,
        providerMetadata: {
          error: errorInstance.message,
          provider: 'tmdb'
        }
      }
    }
  }

  /**
   * Get a specific season with all its episodes
   * Implements ISeasonsEpisodesProvider.getSeason
   */
  async getSeason(tvSeriesItem: TVCatalogItem, seasonNumber: number): Promise<SingleSeasonResult> {
    try {
      this.logger.info('Fetching specific season', {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber
      })

      const tmdbId = this.extractTmdbId(tvSeriesItem.id)
      
      // Fetch detailed season data including episodes
      const seasonDetails: TMDBTVSeasonDetails = await this.tmdbService.client.tv.getSeasonDetails(
        tmdbId, 
        seasonNumber
      )

      const seasonInfo = this.transformSeasonToSeasonInfo(seasonDetails)

      const result: SingleSeasonResult = {
        tvSeries: tvSeriesItem,
        season: seasonInfo,
        fetchedAt: new Date(),
        fromCache: false
      }

      this.logger.info('Successfully fetched season', {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber,
        episodeCount: seasonInfo.episodeCount
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch specific season', errorInstance, {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber
      })
      throw errorInstance
    }
  }

  /**
   * Get detailed information for a specific episode
   * Implements ISeasonsEpisodesProvider.getEpisodeDetails
   */
  async getEpisodeDetails(
    tvSeriesItem: TVCatalogItem,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<DetailedEpisodeInfo> {
    try {
      this.logger.info('Fetching episode details', {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber,
        episodeNumber
      })

      const tmdbId = this.extractTmdbId(tvSeriesItem.id)
      
      // Fetch detailed episode data
      const episodeDetails = await this.tmdbService.client.tv.getEpisodeDetails(
        tmdbId, 
        seasonNumber, 
        episodeNumber
      )

      const detailedEpisodeInfo: DetailedEpisodeInfo = {
        id: episodeDetails.id,
        episodeNumber: episodeDetails.episode_number,
        seasonNumber: episodeDetails.season_number,
        name: episodeDetails.name,
        overview: episodeDetails.overview,
        airDate: episodeDetails.air_date ? new Date(episodeDetails.air_date) : undefined,
        runtime: episodeDetails.runtime || undefined,
        voteAverage: episodeDetails.vote_average,
        voteCount: episodeDetails.vote_count,
        productionCode: episodeDetails.production_code || undefined,
        crew: episodeDetails.crew?.map(member => ({
          id: member.id,
          name: member.name,
          department: member.department,
          job: member.job,
          profileUrl: member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : undefined
        })),
        guestStars: episodeDetails.guest_stars?.map((star, index) => ({
          id: star.id,
          name: star.name,
          character: star.character || '',
          profileUrl: star.profile_path ? `https://image.tmdb.org/t/p/w185${star.profile_path}` : undefined,
          order: star.order || index
        }))
      }

      this.logger.info('Successfully fetched episode details', {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber,
        episodeNumber,
        crewCount: detailedEpisodeInfo.crew?.length || 0,
        guestStarsCount: detailedEpisodeInfo.guestStars?.length || 0
      })

      return detailedEpisodeInfo

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch episode details', errorInstance, {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber,
        episodeNumber
      })
      throw errorInstance
    }
  }

  /**
   * Get episode images (stills) for a specific episode
   * Implements ISeasonsEpisodesProvider.getEpisodeImages
   */
  async getEpisodeImages(
    tvSeriesItem: TVCatalogItem,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<ImageVariant> {
    try {
      const tmdbId = this.extractTmdbId(tvSeriesItem.id)
      
      const episodeImages = await this.tmdbService.client.tv.getEpisodeImages(
        tmdbId, 
        seasonNumber, 
        episodeNumber
      )

      // Transform to ImageVariant format
      if (episodeImages.stills && episodeImages.stills.length > 0) {
        const firstStill = episodeImages.stills[0]
        return {
          thumbnail: `https://image.tmdb.org/t/p/w185${firstStill.file_path}`,
          small: `https://image.tmdb.org/t/p/w300${firstStill.file_path}`,
          medium: `https://image.tmdb.org/t/p/w500${firstStill.file_path}`,
          large: `https://image.tmdb.org/t/p/w1280${firstStill.file_path}`,
          original: `https://image.tmdb.org/t/p/original${firstStill.file_path}`
        }
      }

      // Return empty ImageVariant with required fields
      return {
        thumbnail: '',
        small: '',
        medium: '',
        large: '',
        original: ''
      }
    } catch (error) {
      this.logger.warn('Failed to fetch episode images', error instanceof Error ? error : new Error(String(error)), {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id,
        seasonNumber,
        episodeNumber
      })
      return {
        thumbnail: '',
        small: '',
        medium: '',
        large: '',
        original: ''
      }
    }
  }

  /**
   * Check if seasons/episodes data is available for a TV series
   * Implements ISeasonsEpisodesProvider.hasSeasonsData
   */
  hasSeasonsData(tvSeriesItem: TVCatalogItem): boolean {
    // Check if it's a valid TV series with TMDB ID
    return tvSeriesItem.mediaType === MediaType.TV_SERIES && 
           tvSeriesItem.id.includes('tmdb') &&
           this.canExtractTmdbId(tvSeriesItem.id)
  }

  /**
   * Get the total number of seasons available for a TV series
   * Implements ISeasonsEpisodesProvider.getSeasonCount
   */
  async getSeasonCount(tvSeriesItem: TVCatalogItem): Promise<number> {
    try {
      const tmdbId = this.extractTmdbId(tvSeriesItem.id)
      const tvDetails = await this.tmdbService.client.tv.getDetails(tmdbId)
      
      // Count non-special seasons (season_number > 0)
      return tvDetails.seasons?.filter(s => s.season_number > 0).length || 0
    } catch (error) {
      this.logger.warn('Failed to get season count', error instanceof Error ? error : new Error(String(error)), {
        provider: 'tmdb_seasons',
        tvId: tvSeriesItem.id
      })
      return 0
    }
  }

  /**
   * Check if detailed episode information is supported
   * Implements ISeasonsEpisodesProvider.supportsDetailedEpisodes
   */
  supportsDetailedEpisodes(): boolean {
    return true
  }

  /**
   * Check if episode images are supported
   * Implements ISeasonsEpisodesProvider.supportsEpisodeImages
   */
  supportsEpisodeImages(): boolean {
    return true
  }

  /**
   * Transform TMDB season details to domain SeasonInfo
   */
  private transformSeasonToSeasonInfo(seasonDetails: TMDBTVSeasonDetails): SeasonInfo {
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