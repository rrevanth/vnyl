/**
 * TMDB People Provider
 * 
 * Implementation for The Movie Database (TMDB) people enrichment
 * Provides cast and crew information following clean architecture principles
 */

import { IPeopleProvider } from '@/src/domain/providers/people/people-provider.interface'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'
import { CatalogItem, PersonCatalogItem, PersonGender } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService, TMDBUtils } from '@/src/infrastructure/api/tmdb/tmdb.service'
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
   * Get people associated with a specific media item
   * Returns multiple catalogs containing different types of people (cast, crew)
   * Implements IPeopleProvider.getPeople
   */
  async getPeople(
    mediaItem: CatalogItem, 
    options?: PaginationOptions
  ): Promise<{ people: Catalog[] }> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Fetching people for media', {
        provider: 'tmdb_people',
        mediaId: mediaItem.id,
        mediaType: mediaItem.mediaType
      })

      // Use the TMDB ID directly from external IDs
      const tmdbId = mediaItem.externalIds?.tmdb
      if (!tmdbId) {
        throw new Error('No TMDB ID found in media item external IDs')
      }
      
      const page = options?.page || 1
      const limit = options?.limit || 20
      
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

      const catalogs: Catalog[] = []

      // Create Cast catalog
      if (credits.cast && credits.cast.length > 0) {
        // For pagination, we simulate it by slicing the cast array
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedCast = credits.cast.slice(startIndex, endIndex)
        
        const castItems: PersonCatalogItem[] = paginatedCast
          .map(person => this.transformPersonToCatalogItem({ ...person, role_type: 'cast', role: person.character }))
        
        // Calculate pagination info
        const totalCastItems = credits.cast.length
        const totalPages = Math.ceil(totalCastItems / limit)
        const hasMore = page < totalPages

        const castCatalog: Catalog = {
          id: `cast-${mediaItem.id}`,
          name: 'Cast',
          mediaType: MediaType.PERSON,
          items: castItems,
          pagination: {
            page: page,
            totalPages: totalPages,
            totalItems: totalCastItems,
            hasMore: hasMore
          },
          catalogContext: {
            catalogId: `cast-${mediaItem.id}`,
            catalogName: 'Cast',
            catalogType: 'people',
            providerId: this.id,
            providerName: this.name,
            pageInfo: {
              currentPage: page,
              pageSize: castItems.length,
              hasMorePages: hasMore
            },
            lastFetchAt: new Date(),
            requestId: `cast-${Date.now()}`
          },
          metadata: {
            fetchTime: Date.now() - startTime,
            cacheHit: false,
            itemCount: castItems.length
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        catalogs.push(castCatalog)
      }

      // Create Crew catalog
      if (credits.crew && credits.crew.length > 0) {
        // For pagination, we simulate it by slicing the crew array
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedCrew = credits.crew.slice(startIndex, endIndex)
        
        const crewItems: PersonCatalogItem[] = paginatedCrew
          .map(person => this.transformPersonToCatalogItem({ ...person, role_type: 'crew', role: person.job }))
        
        // Calculate pagination info
        const totalCrewItems = credits.crew.length
        const totalPages = Math.ceil(totalCrewItems / limit)
        const hasMore = page < totalPages

        const crewCatalog: Catalog = {
          id: `crew-${mediaItem.id}`,
          name: 'Crew',
          mediaType: MediaType.PERSON,
          items: crewItems,
          pagination: {
            page: page,
            totalPages: totalPages,
            totalItems: totalCrewItems,
            hasMore: hasMore
          },
          catalogContext: {
            catalogId: `crew-${mediaItem.id}`,
            catalogName: 'Crew',
            catalogType: 'people',
            providerId: this.id,
            providerName: this.name,
            pageInfo: {
              currentPage: page,
              pageSize: crewItems.length,
              hasMorePages: hasMore
            },
            lastFetchAt: new Date(),
            requestId: `crew-${Date.now()}`
          },
          metadata: {
            fetchTime: Date.now() - startTime,
            cacheHit: false,
            itemCount: crewItems.length
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        catalogs.push(crewCatalog)
      }

      this.logger.info('Successfully fetched people for media', {
        provider: 'tmdb_people',
        mediaId: mediaItem.id,
        catalogCount: catalogs.length,
        castCount: credits.cast?.length || 0,
        crewCount: credits.crew?.length || 0
      })

      return { people: catalogs }

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
   * Alternative method name for backward compatibility
   * Calls the standard getPeople method
   */
  async getPeopleForMedia(
    mediaItem: CatalogItem,
    options?: PaginationOptions
  ): Promise<Catalog[]> {
    const result = await this.getPeople(mediaItem, options)
    return result.people
  }


  /**
   * Load more items for a specific catalog (pagination)
   * Uses the catalog object to access context and metadata for proper pagination
   * Includes the original media item context for API calls that require it
   * Follows the ICatalogProvider.loadMoreItems pattern for consistency
   */
  async loadMoreItems(
    catalog: Catalog,
    originalMediaItem: CatalogItem,
    page: number,
    limit?: number
  ): Promise<CatalogItem[]> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Loading more items for catalog using loadMoreItems method', {
        provider: 'tmdb_people',
        catalogId: catalog.id,
        catalogType: catalog.catalogContext?.catalogType,
        page,
        limit
      })

      // Use the TMDB ID directly from external IDs
      const tmdbId = originalMediaItem.externalIds?.tmdb
      if (!tmdbId) {
        throw new Error('No TMDB ID found in original media item external IDs')
      }
      
      // Determine which catalog type we're loading more for using catalog ID prefix
      const isCast = catalog.id.startsWith('cast-')
      const isCrew = catalog.id.startsWith('crew-')
      
      if (!isCast && !isCrew) {
        throw new Error(`Unknown catalog type for ID: ${catalog.id}`)
      }

      let credits: { cast: any[]; crew: any[] } | undefined

      // Fetch credits based on media type
      if (originalMediaItem.mediaType === MediaType.MOVIE) {
        const response: TMDBMovieDetails = await this.tmdbService.client.movies.getDetails(tmdbId, {
          append_to_response: 'credits'
        })
        credits = response.credits
      } else if (originalMediaItem.mediaType === MediaType.TV_SERIES) {
        const response: TMDBTVShowDetails = await this.tmdbService.client.tv.getDetails(tmdbId, {
          append_to_response: 'credits'
        })
        credits = response.credits
      } else {
        throw new Error(`Unsupported media type for people: ${originalMediaItem.mediaType}`)
      }

      if (!credits) {
        throw new Error('No credits data available')
      }

      const itemsLimit = limit || 20
      let items: PersonCatalogItem[] = []

      if (isCast && credits.cast) {
        const startIndex = (page - 1) * itemsLimit
        const endIndex = startIndex + itemsLimit
        const paginatedCast = credits.cast.slice(startIndex, endIndex)
        
        items = paginatedCast.map(person => 
          this.transformPersonToCatalogItem({ ...person, role_type: 'cast', role: person.character })
        )
      } else if (isCrew && credits.crew) {
        const startIndex = (page - 1) * itemsLimit
        const endIndex = startIndex + itemsLimit
        const paginatedCrew = credits.crew.slice(startIndex, endIndex)
        
        items = paginatedCrew.map(person => 
          this.transformPersonToCatalogItem({ ...person, role_type: 'crew', role: person.job })
        )
      }
      
      this.logger.info('Successfully loaded more items for catalog', {
        provider: 'tmdb_people',
        catalogId: catalog.id,
        page,
        itemCount: items.length,
        loadTime: Date.now() - startTime
      })
      
      return items

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to load more items for catalog', errorInstance, {
        provider: 'tmdb_people',
        catalogId: catalog.id,
        page
      })
      throw errorInstance
    }
  }


  /**
   * Transform TMDB person data to PersonCatalogItem
   */
  private transformPersonToCatalogItem(person: any): PersonCatalogItem {
    // Create unique ID that includes role type and specific role to prevent duplicates
    const roleType = person.role_type || 'unknown'
    const specificRole = person.role || person.character || person.job || 'unknown'
    // Sanitize the specific role to make it safe for IDs
    const sanitizedRole = specificRole.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const uniqueId = `${MediaType.PERSON}_tmdb_${person.id}_${roleType}_${sanitizedRole}`
    
    // Get the profile image URL once for consistency
    const profileImageUrl = this.getImageUrl(person.profile_path, 'profile') ?? undefined
    
    return {
      id: uniqueId,
      mediaType: MediaType.PERSON,
      title: person.name,
      originalTitle: person.name,
      overview: person.character || person.job || `Known for ${person.known_for_department}`,
      profileUrl: profileImageUrl,
      posterUrl: profileImageUrl, // UI component expects posterUrl field for image display
      popularity: person.popularity,
      knownForDepartment: person.known_for_department || 'Acting',
      gender: this.convertTmdbGenderToPersonGender(person.gender),
      originalMediaType: MediaType.PERSON,
      contentContext: this.createContentContext(person.id),
      externalIds: { tmdb: person.id },
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
   * Extract TMDB ID from catalog item ID
   */
  private extractTmdbId(catalogItemId: string): number {
    const parts = catalogItemId.split('_')
    const tmdbId = parseInt(parts[1], 10)
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

  /**
   * Get properly formatted image URL using TMDB service configuration
   */
  private getImageUrl(path: string | null, type: 'poster' | 'backdrop' | 'profile'): string | null {
    return TMDBUtils.getImageUrl(this.tmdbService.config, path, type)
  }
}