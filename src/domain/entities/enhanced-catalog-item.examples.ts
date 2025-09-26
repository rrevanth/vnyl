/**
 * Enhanced Catalog Item System - Usage Examples
 * 
 * Demonstrates the progressive enhancement pattern and universal context passing
 * throughout the VNYL app using the EnhancedCatalogItem interface.
 * 
 * @example
 */

import type {
  EnhancedCatalogItem,
  MediaDetail,
  ProviderInfo,
  BasicCatalogItem,
  DetailedCatalogItem
} from './enhanced-catalog-item.entity'
import {
  hasMediaDetail,
  isFullyEnhanced
} from './enhanced-catalog-item.entity'

/**
 * EXAMPLE 1: Creating a lightweight catalog item for home screen lists
 */
const createBasicMovieItem = (): BasicCatalogItem => {
  const providerInfo: ProviderInfo = {
    providerId: 'tmdb',
    providerMediaId: 550,
    mediaType: 'movie',
    lastUpdated: new Date(),
    confidence: 0.95
  }

  return {
    id: 'tmdb-550',
    mediaType: 'movie',
    name: 'Fight Club',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    background: 'https://image.tmdb.org/t/p/w1280/52AfXWuXCHn3UjD17rBruA9f5qb.jpg',
    year: 1999,
    releaseDate: '1999-10-15',
    description: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression.',
    popularity: 85.4,
    genres: [
      { name: 'Drama', id: 18 },
      { name: 'Thriller', id: 53 }
    ],
    ratings: [
      { source: 'tmdb', value: 8.4, maxValue: 10, count: 25847 }
    ],
    providerInfo,
    externalIds: {
      tmdb: 550,
      imdb: 'tt0137523'
    },
    enhancementLevel: 'basic',
    sourceInformation: {
      retrievedAt: new Date(),
      cacheExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      dataVersion: 1
    }
  }
}

/**
 * EXAMPLE 2: Progressive enhancement for detail page
 */
const enhanceWithDetailedInformation = (basicItem: BasicCatalogItem): DetailedCatalogItem => {
  const mediaDetail: MediaDetail = {
    originalTitle: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    status: 'released',
    runtime: 139,
    originalLanguage: 'en',
    budget: 63000000,
    revenue: 100853753,
    
    // Cast and crew
    cast: [
      {
        id: 287,
        name: 'Brad Pitt',
        character: 'Tyler Durden',
        order: 1,
        profilePath: '/cckcYc2v0yh1tc9QjRelptcOBko.jpg'
      },
      {
        id: 819,
        name: 'Edward Norton',
        character: 'The Narrator',
        order: 2,
        profilePath: '/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg'
      }
    ],
    
    directors: [
      {
        id: 7467,
        name: 'David Fincher',
        profilePath: '/tpEczFclQZeKAiCeKZZ0adRvtfz.jpg'
      }
    ],
    
    // Videos
    videos: [
      {
        id: 'SUXWAEX2jlg',
        type: 'trailer',
        name: 'Official Trailer',
        key: 'SUXWAEX2jlg',
        site: 'youtube',
        official: true,
        publishedAt: new Date('1999-09-15')
      }
    ],
    
    // Reviews
    reviews: [
      {
        id: 'review-1',
        author: 'John Doe',
        content: 'An absolutely incredible film that redefined cinema...',
        createdAt: new Date('2020-01-15'),
        source: 'tmdb',
        rating: 9
      }
    ],
    
    // Streaming availability
    streamingProviders: [
      {
        providerId: 'netflix',
        providerName: 'Netflix',
        type: 'subscription',
        region: 'US',
        quality: ['HD', '4K'],
        audio: ['English', 'Spanish'],
        subtitles: ['English', 'Spanish', 'French']
      }
    ],
    
    lastUpdated: new Date(),
    completenessScore: 0.92,
    sourceProviders: ['tmdb', 'trakt']
  }

  return {
    ...basicItem,
    mediaDetail,
    enhancementLevel: 'complete',
    lastEnhanced: new Date()
  }
}

/**
 * EXAMPLE 3: TV Show with seasons and episodes
 */
const createTVShowItem = (): EnhancedCatalogItem => {
  const providerInfo: ProviderInfo = {
    providerId: 'tmdb',
    providerMediaId: 1396,
    mediaType: 'tv',
    lastUpdated: new Date()
  }

  const mediaDetail: MediaDetail = {
    numberOfSeasons: 5,
    numberOfEpisodes: 62,
    status: 'ended',
    
    seasons: [
      {
        id: 3572,
        seasonNumber: 1,
        name: 'Season 1',
        overview: 'Walter White, a struggling high school chemistry teacher...',
        airDate: '2008-01-20',
        episodeCount: 7,
        posterPath: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
        episodes: [
          {
            id: 62085,
            episodeNumber: 1,
            seasonNumber: 1,
            name: 'Pilot',
            overview: 'Walter White, a struggling high school chemistry teacher, is diagnosed with inoperable lung cancer.',
            airDate: '2008-01-20',
            runtime: 58,
            stillPath: '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
            voteAverage: 7.7,
            voteCount: 117
          }
        ]
      }
    ],
    
    networks: [
      {
        id: 174,
        name: 'AMC',
        logoPath: '/pmvRmATOCaDykE6JrVoeYxlFHw3.png',
        originCountry: 'US'
      }
    ],
    
    // Watch progress from Trakt
    watchProgress: {
      watched: false,
      progress: 0.0,
      playCount: 0,
      source: 'trakt'
    }
  }

  return {
    id: 'tmdb-1396',
    mediaType: 'tv',
    name: 'Breaking Bad',
    poster: '/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
    background: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
    year: 2008,
    genres: [
      { name: 'Drama', id: 18 },
      { name: 'Crime', id: 80 }
    ],
    providerInfo,
    mediaDetail,
    enhancementLevel: 'complete'
  }
}

/**
 * EXAMPLE 4: Progressive loading strategy implementation
 */
class CatalogItemProgressiveLoader {
  /**
   * Determines if an item should be enhanced based on context
   */
  shouldEnhance(item: EnhancedCatalogItem, context: 'list' | 'card' | 'detail'): boolean {
    switch (context) {
      case 'list':
        return false // Lists use basic information only
      case 'card':
        return !item.mediaDetail // Cards might need some extra info
      case 'detail':
        return !hasMediaDetail(item) || !isFullyEnhanced(item)
      default:
        return false
    }
  }

  /**
   * Gets required fields for each context
   */
  getRequiredFields(context: 'list' | 'card' | 'detail'): string[] {
    switch (context) {
      case 'list':
        return ['id', 'name', 'poster', 'year', 'genres']
      case 'card':
        return ['id', 'name', 'poster', 'background', 'year', 'genres', 'description', 'ratings']
      case 'detail':
        return ['*'] // All fields
      default:
        return []
    }
  }

  /**
   * Enhanced loading with context awareness
   */
  async loadItemForContext(
    itemId: string,
    context: 'list' | 'card' | 'detail'
  ): Promise<EnhancedCatalogItem> {
    // Start with basic item (fast load for lists)
    let item = await this.loadBasicItem(itemId)

    // Progressive enhancement based on context
    if (this.shouldEnhance(item, context)) {
      item = await this.enhanceItem(item, context)
    }

    return item
  }

  private async loadBasicItem(itemId: string): Promise<EnhancedCatalogItem> {
    // Simulate API call for basic item
    return createBasicMovieItem()
  }

  private async enhanceItem(
    item: EnhancedCatalogItem,
    context: 'list' | 'card' | 'detail'
  ): Promise<EnhancedCatalogItem> {
    // Simulate enhancement based on context needs
    if (context === 'detail') {
      return enhanceWithDetailedInformation(item as BasicCatalogItem)
    }
    return item
  }
}

/**
 * EXAMPLE 5: Provider context tracking
 */
const trackProviderOperations = (item: EnhancedCatalogItem) => {
  console.log(`Processing item from provider: ${item.providerInfo.providerId}`)
  console.log(`Provider media ID: ${item.providerInfo.providerMediaId}`)
  console.log(`Media type: ${item.providerInfo.mediaType}`)
  console.log(`Enhancement level: ${item.enhancementLevel}`)
  
  if (hasMediaDetail(item)) {
    console.log(`Data sources: ${item.mediaDetail.sourceProviders?.join(', ')}`)
    console.log(`Completeness: ${(item.mediaDetail.completenessScore ?? 0) * 100}%`)
  }
}

/**
 * EXAMPLE 6: Type-safe usage patterns
 */
const useEnhancedCatalogItem = (item: EnhancedCatalogItem) => {
  // Basic usage - always available
  console.log(`Displaying: ${item.name} (${item.year})`)
  
  // Type-safe enhanced usage
  if (hasMediaDetail(item)) {
    // TypeScript knows item.mediaDetail is available
    console.log(`Runtime: ${item.mediaDetail.runtime} minutes`)
    console.log(`Cast: ${item.mediaDetail.cast?.map(c => c.name).join(', ')}`)
    
    // TV-specific information
    if (item.mediaType === 'tv' && item.mediaDetail.numberOfSeasons) {
      console.log(`Seasons: ${item.mediaDetail.numberOfSeasons}`)
    }
  }
  
  // Provider context is always available
  console.log(`Source: ${item.providerInfo.providerId}`)
}

// Export usage examples for documentation
export {
  createBasicMovieItem,
  enhanceWithDetailedInformation,
  createTVShowItem,
  CatalogItemProgressiveLoader,
  trackProviderOperations,
  useEnhancedCatalogItem
}