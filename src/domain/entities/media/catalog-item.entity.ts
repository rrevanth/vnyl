/**
 * Catalog item entity for basic media information
 * Lightweight entity for fast rendering in lists and grids
 */

import { MediaType, Genre, LanguageCode, CountryCode, ContentRating, MediaStatus } from '@/src/domain/entities/media/content-types'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'

/**
 * Catalog item entity
 * Contains essential media information for list rendering
 * MediaDetail is loaded separately for performance
 */
export interface CatalogItem {
  /** Unique identifier for the catalog item */
  readonly id: string

  /** Media type (movie, tv, person, collection) */
  readonly mediaType: MediaType

  /** Primary title */
  readonly title: string

  /** Original title in original language */
  readonly originalTitle?: string

  /** Brief overview/description */
  readonly overview?: string

  /** Primary release date */
  readonly releaseDate?: Date

  /** Poster image URL */
  readonly posterUrl?: string

  /** Backdrop image URL */
  readonly backdropUrl?: string

  /** Average rating (0-10) */
  readonly voteAverage?: number

  /** Total number of votes */
  readonly voteCount?: number

  /** Popularity score */
  readonly popularity?: number

  /** Primary language */
  readonly originalLanguage?: LanguageCode

  /** Origin country codes */
  readonly originCountries?: CountryCode[]

  /** Content rating */
  readonly contentRating?: ContentRating

  /** Media status */
  readonly status?: MediaStatus

  /** Primary genres */
  readonly genres?: Genre[]

  /** External service identifiers */
  readonly externalIds: ExternalIds


  /** Whether detailed information has been loaded */
  readonly hasDetailedInfo: boolean

  /** Adult content flag */
  readonly isAdult?: boolean

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date
}

/**
 * Movie-specific catalog item
 */
export interface MovieCatalogItem extends CatalogItem {
  readonly mediaType: MediaType.MOVIE

  /** Movie runtime in minutes */
  readonly runtime?: number

  /** Movie budget */
  readonly budget?: number

  /** Movie revenue */
  readonly revenue?: number

  /** Tagline */
  readonly tagline?: string

  /** Production companies */
  readonly productionCompanies?: ProductionCompany[]

  /** Collection information if part of a collection */
  readonly collection?: {
    readonly id: number
    readonly name: string
    readonly posterUrl?: string
    readonly backdropUrl?: string
  }
}

/**
 * TV series catalog item
 */
export interface TVCatalogItem extends CatalogItem {
  readonly mediaType: MediaType.TV_SERIES

  /** First air date */
  readonly firstAirDate?: Date

  /** Last air date */
  readonly lastAirDate?: Date

  /** Number of seasons */
  readonly numberOfSeasons?: number

  /** Number of episodes */
  readonly numberOfEpisodes?: number

  /** Episode runtime (array for varying lengths) */
  readonly episodeRuntime?: number[]

  /** TV series type */
  readonly type?: TVSeriesType

  /** Networks */
  readonly networks?: Network[]

  /** In production status */
  readonly inProduction?: boolean

  /** Next episode to air */
  readonly nextEpisodeToAir?: EpisodeInfo

  /** Last episode to air */
  readonly lastEpisodeToAir?: EpisodeInfo
}

/**
 * Person catalog item
 */
export interface PersonCatalogItem extends CatalogItem {
  readonly mediaType: MediaType.PERSON

  /** Profile image URL */
  readonly profileUrl?: string

  /** Known for department */
  readonly knownForDepartment?: string

  /** Birthday */
  readonly birthday?: Date

  /** Death day if applicable */
  readonly deathday?: Date

  /** Place of birth */
  readonly placeOfBirth?: string

  /** Gender */
  readonly gender?: PersonGender

  /** Known for (sample works) */
  readonly knownFor?: KnownForItem[]
}

/**
 * Collection catalog item
 */
export interface CollectionCatalogItem extends CatalogItem {
  readonly mediaType: MediaType.COLLECTION

  /** Collection parts count */
  readonly partsCount?: number

  /** Total runtime of all parts */
  readonly totalRuntime?: number
}

/**
 * Production company information
 */
export interface ProductionCompany {
  /** Company ID */
  readonly id: number

  /** Company name */
  readonly name: string

  /** Company logo URL */
  readonly logoUrl?: string

  /** Origin country */
  readonly originCountry?: CountryCode
}

/**
 * Network information for TV series
 */
export interface Network {
  /** Network ID */
  readonly id: number

  /** Network name */
  readonly name: string

  /** Network logo URL */
  readonly logoUrl?: string

  /** Origin country */
  readonly originCountry?: CountryCode
}

/**
 * Episode information
 */
export interface EpisodeInfo {
  /** Episode ID */
  readonly id: number

  /** Episode name */
  readonly name: string

  /** Air date */
  readonly airDate?: Date

  /** Episode number */
  readonly episodeNumber?: number

  /** Season number */
  readonly seasonNumber?: number

  /** Episode overview */
  readonly overview?: string

  /** Episode runtime */
  readonly runtime?: number

  /** Still image URL */
  readonly stillUrl?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Vote count */
  readonly voteCount?: number
}

/**
 * Known for item (for person entities)
 */
export interface KnownForItem {
  /** Media ID */
  readonly id: number

  /** Media type */
  readonly mediaType: MediaType

  /** Title */
  readonly title: string

  /** Original title */
  readonly originalTitle?: string

  /** Release date */
  readonly releaseDate?: Date

  /** Poster URL */
  readonly posterUrl?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Overview */
  readonly overview?: string
}

/**
 * TV series types
 */
export enum TVSeriesType {
  SCRIPTED = 'Scripted',
  REALITY = 'Reality',
  DOCUMENTARY = 'Documentary',
  NEWS = 'News',
  TALK_SHOW = 'Talk Show',
  MINISERIES = 'Miniseries',
  VIDEO = 'Video'
}

/**
 * Person gender enumeration
 */
export enum PersonGender {
  NOT_SPECIFIED = 0,
  FEMALE = 1,
  MALE = 2,
  NON_BINARY = 3
}

/**
 * Catalog item search criteria
 */
export interface CatalogItemSearchCriteria {
  /** Search query */
  readonly query?: string

  /** Media types to include */
  readonly mediaTypes?: MediaType[]

  /** Genres to include */
  readonly genres?: Genre[]

  /** Minimum vote average */
  readonly minVoteAverage?: number

  /** Maximum vote average */
  readonly maxVoteAverage?: number

  /** Release date range */
  readonly releaseDateRange?: {
    readonly from?: Date
    readonly to?: Date
  }

  /** Languages to include */
  readonly languages?: LanguageCode[]

  /** Countries to include */
  readonly countries?: CountryCode[]

  /** Include adult content */
  readonly includeAdult?: boolean

  /** Provider filters */
  readonly providerFilters?: {
    readonly providerIds?: string[]
    readonly catalogTypes?: string[]
  }
}

/**
 * Catalog item utilities
 */
export class CatalogItemUtils {
  /**
   * Creates a unique catalog item ID
   * @param mediaType - Media type
   * @param externalId - External ID from provider
   * @param providerId - Provider identifier
   * @returns Unique catalog item ID
   */
  static createCatalogItemId(
    mediaType: MediaType,
    externalId: string | number,
    providerId: string
  ): string {
    return `${mediaType}_${providerId}_${externalId}`
  }

  /**
   * Extracts the display title for a catalog item
   * @param item - Catalog item
   * @returns Display title
   */
  static getDisplayTitle(item: CatalogItem): string {
    return item.title || item.originalTitle || 'Untitled'
  }

  /**
   * Gets the primary poster URL with fallback
   * @param item - Catalog item
   * @returns Poster URL or null
   */
  static getPosterUrl(item: CatalogItem): string | null {
    return item.posterUrl || item.backdropUrl || null
  }

  /**
   * Formats the release date for display
   * @param item - Catalog item
   * @returns Formatted release date or null
   */
  static getFormattedReleaseDate(item: CatalogItem): string | null {
    if (!item.releaseDate) {
      return null
    }

    return item.releaseDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Gets the release year
   * @param item - Catalog item
   * @returns Release year or null
   */
  static getReleaseYear(item: CatalogItem): number | null {
    return item.releaseDate?.getFullYear() ?? null
  }

  /**
   * Checks if the item has sufficient data for display
   * @param item - Catalog item
   * @returns Whether item has minimum required data
   */
  static hasMinimumDisplayData(item: CatalogItem): boolean {
    return !!(item.title || item.originalTitle) && !!item.id
  }

  /**
   * Gets formatted vote average
   * @param item - Catalog item
   * @returns Formatted vote average (e.g., "8.5") or null
   */
  static getFormattedVoteAverage(item: CatalogItem): string | null {
    if (item.voteAverage == null) {
      return null
    }

    return item.voteAverage.toFixed(1)
  }

  /**
   * Determines if content is recent (released within last year)
   * @param item - Catalog item
   * @returns Whether content is recent
   */
  static isRecentContent(item: CatalogItem): boolean {
    if (!item.releaseDate) {
      return false
    }

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    return item.releaseDate >= oneYearAgo
  }

  /**
   * Gets the primary genre for display
   * @param item - Catalog item
   * @returns Primary genre or null
   */
  static getPrimaryGenre(item: CatalogItem): Genre | null {
    return item.genres?.[0] ?? null
  }

  /**
   * Type guard for movie catalog item
   * @param item - Catalog item
   * @returns Whether item is a movie
   */
  static isMovieItem(item: CatalogItem): item is MovieCatalogItem {
    return item.mediaType === MediaType.MOVIE
  }

  /**
   * Type guard for TV catalog item
   * @param item - Catalog item
   * @returns Whether item is a TV series
   */
  static isTVItem(item: CatalogItem): item is TVCatalogItem {
    return item.mediaType === MediaType.TV_SERIES
  }

  /**
   * Type guard for person catalog item
   * @param item - Catalog item
   * @returns Whether item is a person
   */
  static isPersonItem(item: CatalogItem): item is PersonCatalogItem {
    return item.mediaType === MediaType.PERSON
  }

  /**
   * Type guard for collection catalog item
   * @param item - Catalog item
   * @returns Whether item is a collection
   */
  static isCollectionItem(item: CatalogItem): item is CollectionCatalogItem {
    return item.mediaType === MediaType.COLLECTION
  }
}