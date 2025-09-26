/**
 * External IDs Entity - Cross-Provider Identification System
 * 
 * Defines external identifier types and utilities for cross-provider
 * content resolution and data aggregation.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

/**
 * External identifiers for cross-provider content resolution
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
  
  // Additional services
  anidb?: number
  anilist?: number
  myanimelist?: number
  goodreads?: string
  slug?: string
  
  // Provider-specific IDs (extensible)
  [key: string]: string | number | undefined
}

/**
 * Provider information object for future extensibility
 */
export interface ProviderInfo {
  id: string
  name: string
  priority?: number
  lastUpdated?: Date
  confidence?: number
  dataQuality?: 'low' | 'medium' | 'high'
  [key: string]: unknown // Allow custom provider-specific metadata
}

/**
 * Source information for tracking data origins
 */
export interface SourceInformation {
  provider: ProviderInfo
  retrievedAt: Date
  cacheExpiresAt?: Date
  version?: string
}

/**
 * External ID source configuration
 */
export interface ExternalIdSource {
  key: string
  name: string
  type: 'string' | 'number'
  urlPattern?: string
  category: 'database' | 'social' | 'streaming' | 'review' | 'custom'
  priority: number
}

/**
 * External ID resolution result
 */
export interface ExternalIdResolution {
  source: string
  targetId: string | number
  confidence: number
  lastUpdated: Date
  provider: string
}

/**
 * Predefined external ID sources
 */
export const EXTERNAL_ID_SOURCES: Record<string, ExternalIdSource> = {
  imdb: {
    key: 'imdb',
    name: 'IMDb',
    type: 'string',
    urlPattern: 'https://www.imdb.com/title/{id}/',
    category: 'database',
    priority: 1
  },
  tmdb: {
    key: 'tmdb',
    name: 'The Movie Database',
    type: 'number',
    urlPattern: 'https://www.themoviedb.org/movie/{id}',
    category: 'database',
    priority: 2
  },
  tvdb: {
    key: 'tvdb',
    name: 'TheTVDB',
    type: 'number',
    urlPattern: 'https://www.thetvdb.com/dereferrer/series/{id}',
    category: 'database',
    priority: 3
  },
  trakt: {
    key: 'trakt',
    name: 'Trakt',
    type: 'number',
    urlPattern: 'https://trakt.tv/movies/{id}',
    category: 'database',
    priority: 4
  },
  justwatch: {
    key: 'justwatch',
    name: 'JustWatch',
    type: 'string',
    urlPattern: 'https://www.justwatch.com/us/movie/{id}',
    category: 'streaming',
    priority: 5
  },
  letterboxd: {
    key: 'letterboxd',
    name: 'Letterboxd',
    type: 'string',
    urlPattern: 'https://letterboxd.com/film/{id}/',
    category: 'review',
    priority: 6
  },
  metacritic: {
    key: 'metacritic',
    name: 'Metacritic',
    type: 'string',
    urlPattern: 'https://www.metacritic.com/movie/{id}',
    category: 'review',
    priority: 7
  },
  rottenTomatoes: {
    key: 'rottenTomatoes',
    name: 'Rotten Tomatoes',
    type: 'string',
    urlPattern: 'https://www.rottentomatoes.com/m/{id}',
    category: 'review',
    priority: 8
  },
  facebook: {
    key: 'facebook',
    name: 'Facebook',
    type: 'string',
    urlPattern: 'https://www.facebook.com/{id}',
    category: 'social',
    priority: 9
  },
  instagram: {
    key: 'instagram',
    name: 'Instagram',
    type: 'string',
    urlPattern: 'https://www.instagram.com/{id}/',
    category: 'social',
    priority: 10
  },
  twitter: {
    key: 'twitter',
    name: 'Twitter',
    type: 'string',
    urlPattern: 'https://twitter.com/{id}',
    category: 'social',
    priority: 11
  },
  wikipedia: {
    key: 'wikipedia',
    name: 'Wikipedia',
    type: 'string',
    urlPattern: 'https://en.wikipedia.org/wiki/{id}',
    category: 'database',
    priority: 12
  },
  wikidata: {
    key: 'wikidata',
    name: 'Wikidata',
    type: 'string',
    urlPattern: 'https://www.wikidata.org/wiki/{id}',
    category: 'database',
    priority: 13
  }
}

/**
 * Utility functions for external ID handling
 */
export class ExternalIdUtils {
  /**
   * Validate external ID format
   */
  static isValidId(key: string, value: string | number): boolean {
    const source = EXTERNAL_ID_SOURCES[key]
    if (!source) return true // Allow unknown sources
    
    if (source.type === 'number') {
      return typeof value === 'number' && value > 0
    } else {
      return typeof value === 'string' && value.length > 0
    }
  }

  /**
   * Generate URL from external ID
   */
  static generateUrl(key: string, value: string | number): string | null {
    const source = EXTERNAL_ID_SOURCES[key]
    if (!source?.urlPattern) return null
    
    return source.urlPattern.replace('{id}', String(value))
  }

  /**
   * Get external ID sources by category
   */
  static getSourcesByCategory(category: ExternalIdSource['category']): ExternalIdSource[] {
    return Object.values(EXTERNAL_ID_SOURCES)
      .filter(source => source.category === category)
      .sort((a, b) => a.priority - b.priority)
  }

  /**
   * Get high-priority external IDs
   */
  static getHighPriorityIds(externalIds: ExternalIds): Partial<ExternalIds> {
    const highPriority: (keyof ExternalIds)[] = ['imdb', 'tmdb', 'tvdb', 'trakt']
    
    return Object.fromEntries(
      Object.entries(externalIds)
        .filter(([key]) => highPriority.includes(key as keyof ExternalIds))
    ) as Partial<ExternalIds>
  }

  /**
   * Merge external IDs from multiple sources
   */
  static mergeExternalIds(...sources: (ExternalIds | undefined)[]): ExternalIds {
    const merged: ExternalIds = {}
    
    for (const source of sources) {
      if (!source) continue
      
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined && value !== null) {
          // Prefer existing values unless the new one is from a higher priority source
          if (!merged[key] || this.shouldPreferValue(key, value, merged[key])) {
            merged[key] = value
          }
        }
      }
    }
    
    return merged
  }

  /**
   * Check if a new value should be preferred over existing one
   */
  private static shouldPreferValue(
    key: string, 
    newValue: string | number, 
    existingValue: string | number | undefined
  ): boolean {
    if (!existingValue) return true
    
    const source = EXTERNAL_ID_SOURCES[key]
    if (!source) return false
    
    // For now, prefer lower priority values (primary sources)
    // This could be enhanced with timestamp-based logic
    return false
  }

  /**
   * Clean and normalize external IDs
   */
  static normalizeExternalIds(externalIds: ExternalIds): ExternalIds {
    const normalized: ExternalIds = {}
    
    for (const [key, value] of Object.entries(externalIds)) {
      if (value !== undefined && value !== null && this.isValidId(key, value)) {
        normalized[key] = value
      }
    }
    
    return normalized
  }

  /**
   * Get external ID display name
   */
  static getDisplayName(key: string): string {
    return EXTERNAL_ID_SOURCES[key]?.name || key.toUpperCase()
  }

  /**
   * Check if external IDs are equivalent
   */
  static areEquivalent(ids1: ExternalIds, ids2: ExternalIds): boolean {
    const normalizedIds1 = this.getHighPriorityIds(ids1)
    const normalizedIds2 = this.getHighPriorityIds(ids2)
    
    const keys1 = Object.keys(normalizedIds1)
    const keys2 = Object.keys(normalizedIds2)
    
    // Must have at least one common high-priority ID
    const commonKeys = keys1.filter(key => keys2.includes(key))
    if (commonKeys.length === 0) return false
    
    // All common keys must have matching values
    return commonKeys.every(key => normalizedIds1[key] === normalizedIds2[key])
  }
}