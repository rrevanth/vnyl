/**
 * External IDs entity for provider-agnostic media identification
 * Manages external service identifiers for cross-platform media tracking
 */

/**
 * External service identifier entity
 * Maps content across different providers and platforms
 */
export interface ExternalIds {
  /** TMDB (The Movie Database) identifier */
  readonly tmdb?: number

  /** IMDb identifier */
  readonly imdb?: string

  /** TVDb (TheTVDB) identifier */
  readonly tvdb?: number

  /** Wikidata identifier */
  readonly wikidata?: string

  /** Facebook page identifier */
  readonly facebook?: string

  /** Instagram profile identifier */
  readonly instagram?: string

  /** Twitter handle identifier */
  readonly twitter?: string

  /** YouTube channel identifier */
  readonly youtube?: string

  /** Homepage URL */
  readonly homepage?: string

  /** Justwatch provider identifier */
  readonly justwatch?: string

  /** Netflix identifier */
  readonly netflix?: string

  /** Amazon Prime Video identifier */
  readonly amazon?: string

  /** Disney+ identifier */
  readonly disney?: string

  /** Hulu identifier */
  readonly hulu?: string

  /** HBO Max identifier */
  readonly hbo?: string

  /** Apple TV+ identifier */
  readonly apple?: string

  /** Paramount+ identifier */
  readonly paramount?: string

  /** Peacock identifier */
  readonly peacock?: string

  /** Crunchyroll identifier */
  readonly crunchyroll?: string

  /** Funimation identifier */
  readonly funimation?: string
}

/**
 * External ID search criteria
 * Used for cross-platform content discovery
 */
export interface ExternalIdSearchCriteria {
  /** Primary external ID to search by */
  readonly externalId: string

  /** Source platform for the external ID */
  readonly externalSource: ExternalIdSource

  /** Target media type for search */
  readonly mediaType?: string
}

/**
 * Supported external ID sources
 */
export enum ExternalIdSource {
  TMDB = 'tmdb',
  IMDB = 'imdb',
  TVDB = 'tvdb',
  WIKIDATA = 'wikidata',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  YOUTUBE = 'youtube',
  JUSTWATCH = 'justwatch',
  NETFLIX = 'netflix',
  AMAZON = 'amazon',
  DISNEY = 'disney',
  HULU = 'hulu',
  HBO = 'hbo',
  APPLE = 'apple',
  PARAMOUNT = 'paramount',
  PEACOCK = 'peacock',
  CRUNCHYROLL = 'crunchyroll',
  FUNIMATION = 'funimation'
}

/**
 * External ID validation result
 */
export interface ExternalIdValidation {
  /** Whether the external ID is valid */
  readonly isValid: boolean

  /** Validation error message if invalid */
  readonly error?: string

  /** Normalized external ID if valid */
  readonly normalizedId?: string
}

/**
 * External ID utility functions
 */
export class ExternalIdUtils {
  /**
   * Validates an external ID for a specific source
   * @param externalId - The external ID to validate
   * @param source - The source platform
   * @returns Validation result
   */
  static validateExternalId(
    externalId: string,
    source: ExternalIdSource
  ): ExternalIdValidation {
    if (!externalId || externalId.trim().length === 0) {
      return {
        isValid: false,
        error: 'External ID cannot be empty'
      }
    }

    const trimmedId = externalId.trim()

    switch (source) {
      case ExternalIdSource.TMDB:
        return this.validateNumericId(trimmedId, 'TMDB ID must be a positive number')

      case ExternalIdSource.IMDB:
        return this.validateImdbId(trimmedId)

      case ExternalIdSource.TVDB:
        return this.validateNumericId(trimmedId, 'TVDB ID must be a positive number')

      case ExternalIdSource.WIKIDATA:
        return this.validateWikidataId(trimmedId)

      default:
        return {
          isValid: true,
          normalizedId: trimmedId
        }
    }
  }

  /**
   * Validates a numeric external ID
   * @param id - The ID to validate
   * @param errorMessage - Error message for invalid IDs
   * @returns Validation result
   */
  private static validateNumericId(id: string, errorMessage: string): ExternalIdValidation {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId) || numericId <= 0) {
      return {
        isValid: false,
        error: errorMessage
      }
    }

    return {
      isValid: true,
      normalizedId: numericId.toString()
    }
  }

  /**
   * Validates an IMDb ID
   * @param id - The IMDb ID to validate
   * @returns Validation result
   */
  private static validateImdbId(id: string): ExternalIdValidation {
    // IMDb IDs start with 'tt' followed by 7+ digits
    const imdbPattern = /^tt\d{7,}$/
    
    if (!imdbPattern.test(id)) {
      return {
        isValid: false,
        error: 'IMDb ID must start with "tt" followed by at least 7 digits'
      }
    }

    return {
      isValid: true,
      normalizedId: id
    }
  }

  /**
   * Validates a Wikidata ID
   * @param id - The Wikidata ID to validate
   * @returns Validation result
   */
  private static validateWikidataId(id: string): ExternalIdValidation {
    // Wikidata IDs start with 'Q' followed by digits
    const wikidataPattern = /^Q\d+$/
    
    if (!wikidataPattern.test(id)) {
      return {
        isValid: false,
        error: 'Wikidata ID must start with "Q" followed by digits'
      }
    }

    return {
      isValid: true,
      normalizedId: id
    }
  }

  /**
   * Extracts all non-empty external IDs
   * @param externalIds - External IDs object
   * @returns Array of external ID entries
   */
  static getValidExternalIds(externalIds: ExternalIds): {
    source: ExternalIdSource
    id: string | number
  }[] {
    const validIds: { source: ExternalIdSource; id: string | number }[] = []

    Object.entries(externalIds).forEach(([key, value]) => {
      if (value != null && value !== '') {
        const source = key as ExternalIdSource
        if (Object.values(ExternalIdSource).includes(source)) {
          validIds.push({ source, id: value })
        }
      }
    })

    return validIds
  }

  /**
   * Merges two external ID objects, preferring non-empty values
   * @param primary - Primary external IDs
   * @param secondary - Secondary external IDs to merge
   * @returns Merged external IDs
   */
  static mergeExternalIds(
    primary: ExternalIds,
    secondary: ExternalIds
  ): ExternalIds {
    return {
      tmdb: primary.tmdb ?? secondary.tmdb,
      imdb: primary.imdb ?? secondary.imdb,
      tvdb: primary.tvdb ?? secondary.tvdb,
      wikidata: primary.wikidata ?? secondary.wikidata,
      facebook: primary.facebook ?? secondary.facebook,
      instagram: primary.instagram ?? secondary.instagram,
      twitter: primary.twitter ?? secondary.twitter,
      youtube: primary.youtube ?? secondary.youtube,
      homepage: primary.homepage ?? secondary.homepage,
      justwatch: primary.justwatch ?? secondary.justwatch,
      netflix: primary.netflix ?? secondary.netflix,
      amazon: primary.amazon ?? secondary.amazon,
      disney: primary.disney ?? secondary.disney,
      hulu: primary.hulu ?? secondary.hulu,
      hbo: primary.hbo ?? secondary.hbo,
      apple: primary.apple ?? secondary.apple,
      paramount: primary.paramount ?? secondary.paramount,
      peacock: primary.peacock ?? secondary.peacock,
      crunchyroll: primary.crunchyroll ?? secondary.crunchyroll,
      funimation: primary.funimation ?? secondary.funimation
    }
  }
}