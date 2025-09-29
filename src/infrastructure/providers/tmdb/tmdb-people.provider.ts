/**
 * TMDB People Provider
 * 
 * Implementation for The Movie Database (TMDB) people enrichment
 * Provides cast and crew information following clean architecture principles
 */

import { IPeopleProvider, PeopleSearchParams, PeopleSearchResult, PeopleResultMetadata } from '@/src/domain/providers/people/people-provider.interface'
import { CatalogItem, PersonCatalogItem, CatalogItemUtils, PersonGender } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { TMDBMovieDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TMDBTVShowDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

export class TMDBPeopleProvider implements IPeopleProvider {
  public readonly id = 'tmdb-people'
  public readonly name = 'TMDB People Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.PEOPLE]
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
      this.logger.info('TMDB people provider initialized successfully', {
        provider: 'tmdb_people'
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB people provider', errorInstance, {
        provider: 'tmdb_people'
      })
      throw new Error(`TMDB people provider initialization failed: ${errorInstance.message}`)
    }
  }

  /**
   * Search for people by name or query
   * Implements IPeopleProvider.getPeople
   */
  async getPeople(searchParams: PeopleSearchParams): Promise<PeopleSearchResult> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Searching for people', {
        provider: 'tmdb_people',
        query: searchParams.query,
        page: searchParams.page || 1
      })

      // Use TMDB search people endpoint
      const searchResponse = await this.tmdbService.client.search.searchPeople(searchParams.query, {
        page: searchParams.page || 1,
        include_adult: searchParams.includeAdult || false,
        language: searchParams.language
      })

      // Transform results to PersonCatalogItems
      const peopleItems: PersonCatalogItem[] = searchResponse.results.map(person => 
        this.transformPersonToCatalogItem(person)
      )

      // Create catalog
      const catalog: Catalog = {
        id: `people-search-${searchParams.query}-${Date.now()}`,
        name: `People Search: "${searchParams.query}"`,
        mediaType: MediaType.PERSON,
        items: peopleItems,
        pagination: {
          page: searchResponse.page,
          totalItems: searchResponse.total_results,
          hasMore: searchResponse.page < searchResponse.total_pages
        },
        catalogContext: {
          catalogId: `people-search-${searchParams.query}`,
          catalogName: `People Search: "${searchParams.query}"`,
          catalogType: 'people-search',
          providerId: this.id,
          providerName: this.name,
          pageInfo: {
            currentPage: searchResponse.page,
            pageSize: searchResponse.results.length,
            hasMorePages: searchResponse.page < searchResponse.total_pages
          },
          lastFetchAt: new Date(),
          requestId: `people-search-${Date.now()}`
        },
        metadata: {
          fetchTime: Date.now() - startTime,
          cacheHit: false,
          itemCount: peopleItems.length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create metadata
      const metadata: PeopleResultMetadata = {
        originalQuery: searchParams.query,
        searchTime: Date.now() - startTime,
        fromCache: false,
        qualityScore: this.calculateQualityScore(peopleItems),
        providerMetadata: {
          tmdb_page: searchResponse.page,
          tmdb_total_pages: searchResponse.total_pages,
          tmdb_total_results: searchResponse.total_results,
          provider: 'tmdb'
        }
      }

      const result: PeopleSearchResult = {
        catalog,
        metadata,
        searchedAt: new Date()
      }

      this.logger.info('Successfully searched for people', {
        provider: 'tmdb_people',
        query: searchParams.query,
        resultCount: peopleItems.length,
        totalResults: searchResponse.total_results,
        searchTime: metadata.searchTime
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to search for people', errorInstance, {
        provider: 'tmdb_people',
        query: searchParams.query
      })
      throw errorInstance
    }
  }

  /**
   * Get detailed information for a specific person
   * Implements IPeopleProvider.getPersonDetails
   */
  async getPersonDetails(personItem: PersonCatalogItem): Promise<PersonCatalogItem> {
    try {
      this.logger.info('Fetching person details', {
        provider: 'tmdb_people',
        personId: personItem.id
      })

      const tmdbId = this.extractTmdbId(personItem.id)
      
      // Fetch detailed person data
      const personDetails = await this.tmdbService.client.people.getDetails(tmdbId)

      // Transform to detailed PersonCatalogItem
      const detailedPerson: PersonCatalogItem = {
        ...personItem,
        title: personDetails.name,
        originalTitle: personDetails.name,
        overview: personDetails.biography || personItem.overview,
        profileUrl: personDetails.profile_path 
          ? `https://image.tmdb.org/t/p/w500${personDetails.profile_path}` 
          : personItem.profileUrl,
        popularity: personDetails.popularity,
        knownForDepartment: personDetails.known_for_department || undefined,
        gender: this.convertTmdbGenderToPersonGender(personDetails.gender),
        birthday: personDetails.birthday ? new Date(personDetails.birthday) : undefined,
        deathday: personDetails.deathday ? new Date(personDetails.deathday) : undefined,
        placeOfBirth: personDetails.place_of_birth || undefined,
        hasDetailedInfo: true,
        externalIds: {
          ...personItem.externalIds,
          tmdb: tmdbId,
          ...(personDetails.imdb_id && { imdb: personDetails.imdb_id })
        },
        updatedAt: new Date()
      }

      this.logger.info('Successfully fetched person details', {
        provider: 'tmdb_people',
        personId: personItem.id,
        hasDetailedBio: !!personDetails.biography
      })

      return detailedPerson

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch person details', errorInstance, {
        provider: 'tmdb_people',
        personId: personItem.id
      })
      throw errorInstance
    }
  }

  /**
   * Get people associated with a specific media item
   * Implements IPeopleProvider.getPeopleForMedia
   */
  async getPeopleForMedia(mediaItem: CatalogItem): Promise<PeopleSearchResult> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Fetching people for media', {
        provider: 'tmdb_people',
        mediaId: mediaItem.id,
        mediaType: mediaItem.mediaType
      })

      const tmdbId = this.extractTmdbId(mediaItem.id)
      let credits: { cast: any[]; crew: any[] } | undefined

      // Fetch credits based on media type
      if (mediaItem.mediaType === MediaType.MOVIE) {
        const response: TMDBMovieDetails = await this.tmdbService.client.movies.getDetails(tmdbId, {
          append_to_response: 'credits'
        })
        credits = response.credits
      } else if (mediaItem.mediaType === MediaType.TV_SERIES) {
        const response: TMDBTVShowDetails = await this.tmdbService.client.tv.getDetails(tmdbId, {
          append_to_response: 'credits'
        })
        credits = response.credits
      } else {
        throw new Error(`Unsupported media type for people: ${mediaItem.mediaType}`)
      }

      if (!credits) {
        throw new Error('No credits data available')
      }

      // Combine cast and crew, prioritizing cast
      const allPeople = [
        ...credits.cast.map(person => ({ ...person, role_type: 'cast', role: person.character })),
        ...credits.crew.map(person => ({ ...person, role_type: 'crew', role: person.job }))
      ]

      // Transform to PersonCatalogItems
      const peopleItems: PersonCatalogItem[] = allPeople
        .slice(0, 50) // Limit results
        .map(person => this.transformPersonToCatalogItem(person))

      // Create catalog
      const catalog: Catalog = {
        id: `people-media-${mediaItem.id}-${Date.now()}`,
        name: `People in "${mediaItem.title}"`,
        mediaType: MediaType.PERSON,
        items: peopleItems,
        pagination: {
          page: 1,
          totalItems: peopleItems.length,
          hasMore: false
        },
        catalogContext: {
          catalogId: `people-media-${mediaItem.id}`,
          catalogName: `People in "${mediaItem.title}"`,
          catalogType: 'people-media',
          providerId: this.id,
          providerName: this.name,
          pageInfo: {
            currentPage: 1,
            pageSize: peopleItems.length,
            hasMorePages: false
          },
          lastFetchAt: new Date(),
          requestId: `people-media-${Date.now()}`
        },
        metadata: {
          fetchTime: Date.now() - startTime,
          cacheHit: false,
          itemCount: peopleItems.length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create metadata
      const metadata: PeopleResultMetadata = {
        originalQuery: `People in "${mediaItem.title}"`,
        searchTime: Date.now() - startTime,
        fromCache: false,
        qualityScore: this.calculateQualityScore(peopleItems),
        providerMetadata: {
          media_tmdb_id: tmdbId,
          cast_count: credits.cast.length,
          crew_count: credits.crew.length,
          provider: 'tmdb'
        }
      }

      const result: PeopleSearchResult = {
        catalog,
        metadata,
        searchedAt: new Date()
      }

      this.logger.info('Successfully fetched people for media', {
        provider: 'tmdb_people',
        mediaId: mediaItem.id,
        peopleCount: peopleItems.length,
        castCount: credits.cast.length,
        crewCount: credits.crew.length
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch people for media', errorInstance, {
        provider: 'tmdb_people',
        mediaId: mediaItem.id
      })
      throw errorInstance
    }
  }

  /**
   * Get popular people
   * Implements IPeopleProvider.getPopularPeople
   */
  async getPopularPeople(page: number = 1, limit: number = 20): Promise<PeopleSearchResult> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Fetching popular people', {
        provider: 'tmdb_people',
        page,
        limit
      })

      // Use TMDB popular people endpoint
      const popularResponse = await this.tmdbService.client.people.getPopular({
        page
      })

      // Limit results to requested limit
      const limitedResults = popularResponse.results.slice(0, limit)

      // Transform results to PersonCatalogItems
      const peopleItems: PersonCatalogItem[] = limitedResults.map(person => 
        this.transformPersonToCatalogItem(person)
      )

      // Create catalog
      const catalog: Catalog = {
        id: `popular-people-${page}-${Date.now()}`,
        name: 'Popular People',
        mediaType: MediaType.PERSON,
        items: peopleItems,
        pagination: {
          page,
          totalItems: popularResponse.total_results,
          hasMore: page < popularResponse.total_pages
        },
        catalogContext: {
          catalogId: 'popular-people',
          catalogName: 'Popular People',
          catalogType: 'people-popular',
          providerId: this.id,
          providerName: this.name,
          pageInfo: {
            currentPage: page,
            pageSize: peopleItems.length,
            hasMorePages: page < popularResponse.total_pages
          },
          lastFetchAt: new Date(),
          requestId: `popular-people-${Date.now()}`
        },
        metadata: {
          fetchTime: Date.now() - startTime,
          cacheHit: false,
          itemCount: peopleItems.length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create metadata
      const metadata: PeopleResultMetadata = {
        originalQuery: 'Popular People',
        searchTime: Date.now() - startTime,
        fromCache: false,
        qualityScore: this.calculateQualityScore(peopleItems),
        providerMetadata: {
          tmdb_page: page,
          tmdb_total_pages: popularResponse.total_pages,
          tmdb_total_results: popularResponse.total_results,
          provider: 'tmdb'
        }
      }

      const result: PeopleSearchResult = {
        catalog,
        metadata,
        searchedAt: new Date()
      }

      this.logger.info('Successfully fetched popular people', {
        provider: 'tmdb_people',
        page,
        resultCount: peopleItems.length,
        totalResults: popularResponse.total_results
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch popular people', errorInstance, {
        provider: 'tmdb_people',
        page
      })
      throw errorInstance
    }
  }

  /**
   * Check if people data is supported for a given media type
   * Implements IPeopleProvider.supportsPeopleForMediaType
   */
  supportsPeopleForMediaType(mediaType: string): boolean {
    return mediaType === MediaType.MOVIE || mediaType === MediaType.TV_SERIES
  }

  /**
   * Validate if a people search query is acceptable for this provider
   * Implements IPeopleProvider.isValidPeopleQuery
   */
  isValidPeopleQuery(query: string): boolean {
    return query.length >= this.getMinimumPeopleQueryLength()
  }

  /**
   * Get the minimum query length required for people search
   * Implements IPeopleProvider.getMinimumPeopleQueryLength
   */
  getMinimumPeopleQueryLength(): number {
    return 2 // TMDB accepts 2+ character searches
  }

  /**
   * Get search suggestions for people names
   * Implements IPeopleProvider.getPeopleSuggestions
   */
  async getPeopleSuggestions(partialQuery: string, limit: number = 10): Promise<string[]> {
    try {
      if (partialQuery.length < this.getMinimumPeopleQueryLength()) {
        return []
      }

      // Use search to get suggestions
      const searchResponse = await this.tmdbService.client.search.searchPeople(partialQuery, {
        page: 1
      })

      // Extract names and limit results
      return searchResponse.results
        .slice(0, limit)
        .map(person => person.name)
        .filter(name => name.toLowerCase().includes(partialQuery.toLowerCase()))

    } catch (error) {
      this.logger.warn('Failed to get people suggestions', error instanceof Error ? error : new Error(String(error)), {
        provider: 'tmdb_people',
        partialQuery
      })
      return []
    }
  }

  /**
   * Check if detailed person information is supported
   * Implements IPeopleProvider.supportsDetailedPersonInfo
   */
  supportsDetailedPersonInfo(): boolean {
    return true
  }

  /**
   * Check if popular people feature is supported
   * Implements IPeopleProvider.supportsPopularPeople
   */
  supportsPopularPeople(): boolean {
    return true
  }

  /**
   * Transform TMDB person data to PersonCatalogItem
   */
  private transformPersonToCatalogItem(person: any): PersonCatalogItem {
    return {
      id: CatalogItemUtils.createCatalogItemId(MediaType.PERSON, person.id, 'tmdb'),
      mediaType: MediaType.PERSON,
      title: person.name,
      originalTitle: person.name,
      overview: person.character || person.job || `Known for ${person.known_for_department}`,
      profileUrl: person.profile_path 
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}` 
        : undefined,
      popularity: person.popularity,
      knownForDepartment: person.known_for_department || 'Acting',
      gender: this.convertTmdbGenderToPersonGender(person.gender),
      originalMediaType: MediaType.PERSON,
      contentContext: this.createContentContext(person.id),
      externalIds: { tmdb_id: person.id },
      hasDetailedInfo: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Create content context for a person
   */
  private createContentContext(personId: number): any {
    return {
      catalogContext: {
        catalogId: 'people',
        catalogName: 'People',
        catalogType: 'people',
        providerId: this.id,
        providerName: this.name,
        pageInfo: {
          currentPage: 1,
          pageSize: 1,
          hasMorePages: false
        },
        lastFetchAt: new Date(),
        requestId: `person-${personId}-${Date.now()}`
      },
      originalMediaType: MediaType.PERSON,
      originalMediaId: personId,
      providerId: this.id,
      providerName: this.name,
      positionInCatalog: 0,
      fetchedAt: new Date(),
      requestId: `person-${personId}-${Date.now()}`
    }
  }

  /**
   * Calculate quality score for people results
   */
  private calculateQualityScore(peopleItems: PersonCatalogItem[]): number {
    if (peopleItems.length === 0) return 0

    let totalScore = 0
    for (const person of peopleItems) {
      let score = 0.5 // Base score
      
      if (person.profileUrl) score += 0.2
      if (person.popularity && person.popularity > 1) score += 0.2
      if (person.overview && person.overview.length > 10) score += 0.1
      
      totalScore += Math.min(score, 1.0)
    }

    return totalScore / peopleItems.length
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

  /**
   * Convert TMDB gender number to PersonGender enum
   */
  private convertTmdbGenderToPersonGender(tmdbGender: number): PersonGender | undefined {
    switch (tmdbGender) {
      case 0:
        return PersonGender.NOT_SPECIFIED
      case 1:
        return PersonGender.FEMALE
      case 2:
        return PersonGender.MALE
      case 3:
        return PersonGender.NON_BINARY
      default:
        return PersonGender.NOT_SPECIFIED
    }
  }
}