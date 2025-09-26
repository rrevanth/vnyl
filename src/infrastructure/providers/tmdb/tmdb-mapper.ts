/**
 * TMDB Response Mappers
 * 
 * Mappers to convert TMDB API responses to our EnhancedCatalogItem structure
 * with progressive enhancement support and proper type safety.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0
 */

import type {
  EnhancedCatalogItem,
  MediaDetail,
  Genre,
  ProviderInfo,
  Person,
  CastMember,
  CrewMember,
  Season,
  Episode,
  Collection,
  Network,
  ProductionCompany,
  VideoContent
} from '@/src/domain/entities/enhanced-catalog-item.entity'

import type { ExternalIds } from '@/src/domain/entities/external-ids.entity'
import type { Images } from '@/src/domain/entities/images.entity'
import type { Rating } from '@/src/domain/entities/genre-rating.entity'

import type {
  TMDBMediaResult,
  TMDBDetailedMedia,
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBGenre,
  TMDBCastMember,
  TMDBCrewMember,
  TMDBSeason,
  TMDBEpisode,
  TMDBCollection,
  TMDBNetwork,
  TMDBProductionCompany,
  TMDBVideo,
  TMDBImages,
  TMDBExternalIds
} from './tmdb-types'

import {
  isTMDBMovie,
  isTMDBTVShow,
  isTMDBMovieDetails,
  isTMDBTVShowDetails
} from './tmdb-types'

/**
 * TMDB configuration for URL building
 */
export interface TMDBImageConfig {
  baseUrl: string
  secureBaseUrl: string
  posterSizes: string[]
  backdropSizes: string[]
  logoSizes: string[]
  profileSizes: string[]
}

/**
 * Default TMDB image configuration
 */
const DEFAULT_IMAGE_CONFIG: TMDBImageConfig = {
  baseUrl: 'http://image.tmdb.org/t/p/',
  secureBaseUrl: 'https://image.tmdb.org/t/p/',
  posterSizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  backdropSizes: ['w300', 'w780', 'w1280', 'original'],
  logoSizes: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
  profileSizes: ['w45', 'w185', 'h632', 'original']
}

/**
 * TMDB Mapper class with image configuration support
 */
export class TMDBMapper {
  private imageConfig: TMDBImageConfig

  constructor(imageConfig?: TMDBImageConfig) {
    this.imageConfig = imageConfig || DEFAULT_IMAGE_CONFIG
  }

  // ============================================================================
  // CORE MAPPING FUNCTIONS
  // ============================================================================

  /**
   * Map TMDB media result to basic EnhancedCatalogItem (for catalog listings)
   */
  mapToEnhancedCatalogItem(
    tmdbMedia: TMDBMediaResult,
    catalogId?: string,
    confidence: number = 0.9
  ): EnhancedCatalogItem {
    const isMovie = isTMDBMovie(tmdbMedia)
    const mediaType = isMovie ? 'movie' : 'series'
    
    // Extract basic information
    const name = isMovie ? tmdbMedia.title : tmdbMedia.name
    const originalTitle = isMovie ? tmdbMedia.original_title : tmdbMedia.original_name
    const releaseDate = isMovie ? tmdbMedia.release_date : tmdbMedia.first_air_date
    
    // Create provider info
    const providerInfo: ProviderInfo = {
      providerId: 'tmdb',
      catalogId: catalogId || 'discover',
      providerMediaId: tmdbMedia.id,
      mediaType,
      lastUpdated: new Date(),
      confidence,
      sourceMetadata: {
        originalLanguage: tmdbMedia.original_language,
        popularity: tmdbMedia.popularity,
        voteAverage: tmdbMedia.vote_average,
        voteCount: tmdbMedia.vote_count,
        adult: tmdbMedia.adult
      }
    }

    // Map genres
    const genres = tmdbMedia.genre_ids?.map(genreId => ({
      id: genreId,
      name: this.getGenreNameById(genreId) || `Genre ${genreId}`,
      providerSpecific: { tmdbId: genreId }
    })) || []

    // Create ratings
    const ratings: Rating[] = []
    if (tmdbMedia.vote_average && tmdbMedia.vote_count) {
      ratings.push({
        source: 'tmdb',
        value: tmdbMedia.vote_average,
        maxValue: 10,
        count: tmdbMedia.vote_count
      })
    }

    // Extract year from release date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined

    // Create basic catalog item
    const catalogItem: EnhancedCatalogItem = {
      id: `tmdb:${mediaType}:${tmdbMedia.id}`,
      mediaType,
      name,
      poster: this.buildImageUrl(tmdbMedia.poster_path, 'poster', 'w500'),
      background: this.buildImageUrl(tmdbMedia.backdrop_path, 'backdrop', 'w1280'),
      genres,
      ratings,
      year,
      releaseDate,
      description: tmdbMedia.overview,
      popularity: tmdbMedia.popularity,
      providerInfo,
      enhancementLevel: 'basic',
      lastEnhanced: new Date(),
      sourceInformation: {
        retrievedAt: new Date(),
        dataVersion: 1,
        providerVersion: 'tmdb-v3'
      }
    }

    // Add external IDs if available
    if (tmdbMedia.id) {
      catalogItem.externalIds = {
        tmdb: tmdbMedia.id
      }
    }

    return catalogItem
  }

  /**
   * Enhance catalog item with detailed information
   */
  enhanceWithDetailedData(
    catalogItem: EnhancedCatalogItem,
    detailedMedia: TMDBDetailedMedia,
    credits?: { cast: TMDBCastMember[]; crew: TMDBCrewMember[] },
    images?: TMDBImages,
    videos?: TMDBVideo[],
    externalIds?: TMDBExternalIds
  ): EnhancedCatalogItem {
    const isMovie = isTMDBMovieDetails(detailedMedia)

    // Create enhanced media detail
    const mediaDetail: MediaDetail = {
      originalTitle: isMovie ? detailedMedia.original_title : detailedMedia.original_name,
      tagline: detailedMedia.tagline || undefined,
      overview: detailedMedia.overview,
      status: detailedMedia.status,
      originalLanguage: detailedMedia.original_language,
      spokenLanguages: detailedMedia.spoken_languages.map(lang => ({
        englishName: lang.english_name,
        iso6391: lang.iso_639_1,
        name: lang.name
      })),
      productionCompanies: detailedMedia.production_companies.map(this.mapProductionCompany.bind(this)),
      productionCountries: detailedMedia.production_countries.map(country => ({
        iso31661: country.iso_3166_1,
        name: country.name
      }))
    }

    // Add movie-specific details
    if (isMovie) {
      mediaDetail.runtime = detailedMedia.runtime || undefined
      mediaDetail.budget = detailedMedia.budget || undefined
      mediaDetail.revenue = detailedMedia.revenue || undefined
      
      // Note: belongs_to_collection would be added to MediaDetail interface later
      // if (detailedMedia.belongs_to_collection) {
      //   mediaDetail.belongsToCollection = this.mapCollection(detailedMedia.belongs_to_collection)
      // }
    }

    // Add TV show-specific details
    if (isTMDBTVShowDetails(detailedMedia)) {
      mediaDetail.episodeRunTime = detailedMedia.episode_run_time
      mediaDetail.numberOfEpisodes = detailedMedia.number_of_episodes
      mediaDetail.numberOfSeasons = detailedMedia.number_of_seasons
      mediaDetail.networks = detailedMedia.networks.map(this.mapNetwork.bind(this))
      mediaDetail.seasons = detailedMedia.seasons.map(this.mapSeason.bind(this))
      
      if (detailedMedia.created_by && detailedMedia.created_by.length > 0) {
        mediaDetail.creators = detailedMedia.created_by.map(creator => ({
          id: creator.id,
          name: creator.name,
          profilePath: this.buildImageUrl(creator.profile_path, 'profile', 'w185')
        }))
      }
    }

    // Add credits if available
    if (credits) {
      if (credits.cast && credits.cast.length > 0) {
        mediaDetail.cast = credits.cast.slice(0, 20).map(this.mapCastMember.bind(this))
      }
      if (credits.crew && credits.crew.length > 0) {
        mediaDetail.crew = credits.crew.slice(0, 30).map(this.mapCrewMember.bind(this))
      }
    }

    // Add videos if available
    if (videos && videos.length > 0) {
      mediaDetail.videos = videos.map(this.mapVideo.bind(this))
    }

    // Update catalog item with enhanced data
    const enhancedItem: EnhancedCatalogItem = {
      ...catalogItem,
      mediaDetail,
      enhancementLevel: 'complete',
      lastEnhanced: new Date()
    }

    // Update external IDs
    if (externalIds) {
      enhancedItem.externalIds = {
        ...enhancedItem.externalIds,
        ...this.mapExternalIds(externalIds)
      }
    }

    // Update images
    if (images) {
      enhancedItem.images = this.mapImages(images)
    }

    // Update genres with detailed information
    if (detailedMedia.genres && detailedMedia.genres.length > 0) {
      enhancedItem.genres = detailedMedia.genres.map(this.mapGenre.bind(this))
    }

    // Update source information
    enhancedItem.sourceInformation = {
      ...enhancedItem.sourceInformation,
      retrievedAt: new Date(),
      dataVersion: 2
    }

    return enhancedItem
  }

  // ============================================================================
  // HELPER MAPPING FUNCTIONS
  // ============================================================================

  /**
   * Map TMDB genre to our Genre format
   */
  private mapGenre(tmdbGenre: TMDBGenre): Genre {
    return {
      id: tmdbGenre.id,
      name: tmdbGenre.name,
      providerSpecific: {
        tmdbId: tmdbGenre.id
      }
    }
  }

  /**
   * Map TMDB cast member
   */
  private mapCastMember(tmdbCast: TMDBCastMember): CastMember {
    return {
      id: tmdbCast.id,
      name: tmdbCast.name,
      originalName: tmdbCast.original_name,
      profilePath: this.buildImageUrl(tmdbCast.profile_path, 'profile', 'w185'),
      character: tmdbCast.character,
      order: tmdbCast.order,
      knownForDepartment: tmdbCast.known_for_department,
      popularity: tmdbCast.popularity,
      adult: tmdbCast.adult
    }
  }

  /**
   * Map TMDB crew member
   */
  private mapCrewMember(tmdbCrew: TMDBCrewMember): CrewMember {
    return {
      id: tmdbCrew.id,
      name: tmdbCrew.name,
      originalName: tmdbCrew.original_name,
      profilePath: this.buildImageUrl(tmdbCrew.profile_path, 'profile', 'w185'),
      job: tmdbCrew.job,
      department: tmdbCrew.department,
      knownForDepartment: tmdbCrew.known_for_department,
      popularity: tmdbCrew.popularity,
      adult: tmdbCrew.adult
    }
  }

  /**
   * Map TMDB season
   */
  private mapSeason(tmdbSeason: TMDBSeason): Season {
    return {
      id: tmdbSeason.id,
      seasonNumber: tmdbSeason.season_number,
      name: tmdbSeason.name,
      overview: tmdbSeason.overview,
      airDate: tmdbSeason.air_date || undefined,
      episodeCount: tmdbSeason.episode_count,
      posterPath: this.buildImageUrl(tmdbSeason.poster_path, 'poster', 'w500')
    }
  }

  /**
   * Map TMDB collection
   */
  private mapCollection(tmdbCollection: TMDBCollection): Collection {
    return {
      id: tmdbCollection.id,
      name: tmdbCollection.name,
      overview: tmdbCollection.overview,
      posterPath: this.buildImageUrl(tmdbCollection.poster_path, 'poster', 'w500'),
      backdropPath: this.buildImageUrl(tmdbCollection.backdrop_path, 'backdrop', 'w1280'),
      parts: tmdbCollection.parts?.map(part => ({
        id: part.id,
        title: part.title,
        releaseDate: part.release_date,
        posterPath: this.buildImageUrl(part.poster_path, 'poster', 'w500')
      }))
    }
  }

  /**
   * Map TMDB network
   */
  private mapNetwork(tmdbNetwork: TMDBNetwork): Network {
    return {
      id: tmdbNetwork.id,
      name: tmdbNetwork.name,
      logoPath: this.buildImageUrl(tmdbNetwork.logo_path, 'logo', 'w185'),
      originCountry: tmdbNetwork.origin_country
    }
  }

  /**
   * Map TMDB production company
   */
  private mapProductionCompany(tmdbCompany: TMDBProductionCompany): ProductionCompany {
    return {
      id: tmdbCompany.id,
      name: tmdbCompany.name,
      logoPath: this.buildImageUrl(tmdbCompany.logo_path, 'logo', 'w185'),
      originCountry: tmdbCompany.origin_country
    }
  }

  /**
   * Map TMDB video
   */
  private mapVideo(tmdbVideo: TMDBVideo): VideoContent {
    return {
      id: tmdbVideo.id,
      type: this.mapVideoType(tmdbVideo.type),
      name: tmdbVideo.name,
      key: tmdbVideo.key,
      site: tmdbVideo.site.toLowerCase(),
      language: tmdbVideo.iso_639_1,
      country: tmdbVideo.iso_3166_1,
      publishedAt: tmdbVideo.published_at ? new Date(tmdbVideo.published_at) : undefined,
      official: tmdbVideo.official,
      size: tmdbVideo.size
    }
  }

  /**
   * Map TMDB video type to our VideoContent type
   */
  private mapVideoType(tmdbType: string): VideoContent['type'] {
    const typeMap: Record<string, VideoContent['type']> = {
      'Trailer': 'trailer',
      'Teaser': 'teaser',
      'Clip': 'clip',
      'Featurette': 'featurette',
      'Behind the Scenes': 'behind_scenes',
      'Bloopers': 'bloopers'
    }
    
    return typeMap[tmdbType] || 'other'
  }

  /**
   * Map TMDB external IDs
   */
  private mapExternalIds(tmdbExternalIds: TMDBExternalIds): ExternalIds {
    const externalIds: ExternalIds = {
      tmdb: tmdbExternalIds.id
    }

    if (tmdbExternalIds.imdb_id) {
      externalIds.imdb = tmdbExternalIds.imdb_id
    }
    if (tmdbExternalIds.tvdb_id) {
      externalIds.tvdb = tmdbExternalIds.tvdb_id
    }
    if (tmdbExternalIds.wikidata_id) {
      externalIds.wikidata = tmdbExternalIds.wikidata_id
    }

    return externalIds
  }

  /**
   * Map TMDB images
   */
  private mapImages(tmdbImages: TMDBImages): Images {
    return {
      backdrops: tmdbImages.backdrops.map(img => ({
        url: this.buildImageUrl(img.file_path, 'backdrop', 'original') || '',
        width: img.width,
        height: img.height,
        aspectRatio: img.aspect_ratio,
        voteAverage: img.vote_average,
        voteCount: img.vote_count,
        language: img.iso_639_1 || undefined
      })),
      posters: tmdbImages.posters.map(img => ({
        url: this.buildImageUrl(img.file_path, 'poster', 'original') || '',
        width: img.width,
        height: img.height,
        aspectRatio: img.aspect_ratio,
        voteAverage: img.vote_average,
        voteCount: img.vote_count,
        language: img.iso_639_1 || undefined
      })),
      logos: tmdbImages.logos.map(img => ({
        url: this.buildImageUrl(img.file_path, 'logo', 'original') || '',
        width: img.width,
        height: img.height,
        aspectRatio: img.aspect_ratio,
        voteAverage: img.vote_average,
        voteCount: img.vote_count,
        language: img.iso_639_1 || undefined
      }))
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Build full image URL from TMDB path
   */
  private buildImageUrl(
    path: string | null | undefined,
    type: 'poster' | 'backdrop' | 'logo' | 'profile',
    size: string
  ): string | undefined {
    if (!path) return undefined

    const baseUrl = this.imageConfig.secureBaseUrl
    return `${baseUrl}${size}${path}`
  }

  /**
   * Get genre name by ID (basic mapping for genre_ids)
   */
  private getGenreNameById(genreId: number): string | undefined {
    // Basic genre mapping - in a real implementation, this should be loaded from TMDB configuration
    const genreMap: Record<number, string> = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western',
      // TV Show genres
      10759: 'Action & Adventure',
      10762: 'Kids',
      10763: 'News',
      10764: 'Reality',
      10765: 'Sci-Fi & Fantasy',
      10766: 'Soap',
      10767: 'Talk',
      10768: 'War & Politics'
    }

    return genreMap[genreId]
  }

  /**
   * Update image configuration
   */
  updateImageConfig(config: Partial<TMDBImageConfig>): void {
    this.imageConfig = { ...this.imageConfig, ...config }
  }

  /**
   * Get current image configuration
   */
  getImageConfig(): TMDBImageConfig {
    return { ...this.imageConfig }
  }
}