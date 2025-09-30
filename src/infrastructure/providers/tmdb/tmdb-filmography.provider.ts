/**
 * TMDB Filmography Provider
 * 
 * Implementation for The Movie Database (TMDB) filmography enrichment
 * Provides comprehensive filmography information for person entities
 * Organizes credits into semantic catalogs following clean architecture principles
 */

import {
  IFilmographyProvider
} from '@/src/domain/providers/filmography/filmography-provider.interface'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'
import { CatalogItem, MovieCatalogItem, TVCatalogItem, PersonCatalogItem, CatalogItemUtils } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { CatalogContext } from '@/src/domain/entities/context/catalog-context.entity'
import { ContentContext, ContentContextUtils, ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService, TMDBUtils } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { PersonCombinedCreditsResponse, CombinedCredit } from '@/src/infrastructure/api/tmdb/endpoints/types/person.endpoints'

export class TMDBFilmographyProvider implements IFilmographyProvider {
  public readonly id = 'tmdb-filmography'
  public readonly name = 'TMDB Filmography Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.FILMOGRAPHY]
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
      this.logger.info('TMDB filmography provider initialized successfully', {
        provider: 'tmdb_filmography'
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB filmography provider', errorInstance, {
        provider: 'tmdb_filmography'
      })
      throw new Error(`TMDB filmography provider initialization failed: ${errorInstance.message}`)
    }
  }

  /**
   * Get filmography for a person
   * Returns multiple catalogs organized by credit type and role
   * Implements IFilmographyProvider.getFilmography
   */
  async getFilmography(
    person: PersonCatalogItem,
    options?: PaginationOptions
  ): Promise<{ filmography: Catalog[] }> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Fetching filmography', {
        provider: 'tmdb_filmography',
        personId: person.id,
        personName: person.title
      })

      // Use the TMDB ID directly from external IDs
      const tmdbId = person.externalIds?.tmdb
      if (!tmdbId) {
        throw new Error('No TMDB ID found in person external IDs')
      }

      // Fetch combined credits from TMDB (includes both movies and TV shows)
      const creditsResponse: PersonCombinedCreditsResponse = await this.tmdbService.client.people.getCombinedCredits(tmdbId)

      const catalogs: Catalog[] = []
      const page = options?.page || 1
      const limit = options?.limit || 20

      // Process cast credits (acting roles)
      if (creditsResponse.cast.length > 0) {
        const sortedCast = this.sortCreditsByPopularityAndDate(creditsResponse.cast)
        
        // All Acting Credits
        const actingCatalog = this.createCatalog(
          `acting-${person.id}`,
          'Acting',
          sortedCast,
          page,
          limit,
          person
        )
        if (actingCatalog.items.length > 0) {
          catalogs.push(actingCatalog)
        }

        // Movies Only (Acting)
        const movieCast = sortedCast.filter(credit => credit.media_type === 'movie')
        if (movieCast.length > 0) {
          const moviesCatalog = this.createCatalog(
            `movies-acting-${person.id}`,
            'Movies',
            movieCast,
            page,
            limit,
            person
          )
          if (moviesCatalog.items.length > 0) {
            catalogs.push(moviesCatalog)
          }
        }

        // TV Shows Only (Acting)
        const tvCast = sortedCast.filter(credit => credit.media_type === 'tv')
        if (tvCast.length > 0) {
          const tvCatalog = this.createCatalog(
            `tv-acting-${person.id}`,
            'TV Shows',
            tvCast,
            page,
            limit,
            person
          )
          if (tvCatalog.items.length > 0) {
            catalogs.push(tvCatalog)
          }
        }
      }

      // Process crew credits by department
      if (creditsResponse.crew.length > 0) {
        const crewByDepartment = this.groupCrewByDepartment(creditsResponse.crew)

        // Create catalogs for each department
        Object.entries(crewByDepartment).forEach(([department, credits]) => {
          if (credits.length > 0) {
            const sortedCredits = this.sortCreditsByPopularityAndDate(credits)
            const catalogName = this.getDepartmentDisplayName(department)
            const catalogId = `${department.toLowerCase()}-${person.id}`
            
            const departmentCatalog = this.createCatalog(
              catalogId,
              catalogName,
              sortedCredits,
              page,
              limit,
              person
            )
            
            if (departmentCatalog.items.length > 0) {
              catalogs.push(departmentCatalog)
            }
          }
        })
      }

      // Create "All Credits" catalog combining everything
      const allCredits = [...creditsResponse.cast, ...creditsResponse.crew]
      if (allCredits.length > 0) {
        const sortedAllCredits = this.sortCreditsByPopularityAndDate(allCredits)
        const allCreditsCatalog = this.createCatalog(
          `all-${person.id}`,
          'All Credits',
          sortedAllCredits,
          page,
          limit,
          person
        )
        if (allCreditsCatalog.items.length > 0) {
          // Insert at the beginning for prominence
          catalogs.unshift(allCreditsCatalog)
        }
      }

      this.logger.info('Successfully fetched filmography', {
        provider: 'tmdb_filmography',
        personId: person.id,
        catalogCount: catalogs.length,
        totalCredits: allCredits.length,
        generationTime: Date.now() - startTime
      })

      return { filmography: catalogs }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch filmography', errorInstance, {
        provider: 'tmdb_filmography',
        personId: person.id
      })
      throw errorInstance
    }
  }

  /**
   * Load more items for a specific filmography catalog (pagination)
   * For TMDB, all credits are returned in a single call, so this handles client-side pagination
   */
  async loadMoreItems(
    catalog: Catalog,
    originalPerson: PersonCatalogItem,
    page: number,
    limit?: number
  ): Promise<CatalogItem[]> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Loading more filmography items', {
        provider: 'tmdb_filmography',
        catalogId: catalog.id,
        page,
        limit
      })

      // Since TMDB returns all credits in one call, we need to fetch again and slice appropriately
      const tmdbId = originalPerson.externalIds?.tmdb
      if (!tmdbId) {
        throw new Error('No TMDB ID found in original person external IDs')
      }

      const creditsResponse: PersonCombinedCreditsResponse = await this.tmdbService.client.people.getCombinedCredits(tmdbId)
      
      // Determine which credits to return based on catalog ID
      let credits: CombinedCredit[] = []
      
      if (catalog.id.startsWith('all-')) {
        credits = [...creditsResponse.cast, ...creditsResponse.crew]
      } else if (catalog.id.startsWith('acting-')) {
        credits = creditsResponse.cast
      } else if (catalog.id.startsWith('movies-acting-')) {
        credits = creditsResponse.cast.filter(credit => credit.media_type === 'movie')
      } else if (catalog.id.startsWith('tv-acting-')) {
        credits = creditsResponse.cast.filter(credit => credit.media_type === 'tv')
      } else {
        // Department-specific crew credits
        const department = this.extractDepartmentFromCatalogId(catalog.id)
        credits = creditsResponse.crew.filter(credit => 
          credit.department?.toLowerCase() === department.toLowerCase()
        )
      }

      // Sort and paginate
      const sortedCredits = this.sortCreditsByPopularityAndDate(credits)
      const itemsPerPage = limit || 20
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedCredits = sortedCredits.slice(startIndex, endIndex)

      // Transform to catalog items
      const items = this.transformToCatalogItems(paginatedCredits, originalPerson)
      
      this.logger.info('Successfully loaded more filmography items', {
        provider: 'tmdb_filmography',
        catalogId: catalog.id,
        page,
        itemCount: items.length,
        loadTime: Date.now() - startTime
      })
      
      return items

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to load more filmography items', errorInstance, {
        provider: 'tmdb_filmography',
        catalogId: catalog.id,
        page
      })
      throw errorInstance
    }
  }

  /**
   * Create a catalog from credits
   */
  private createCatalog(
    id: string,
    name: string,
    credits: CombinedCredit[],
    page: number,
    limit: number,
    person: PersonCatalogItem
  ): Catalog {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCredits = credits.slice(startIndex, endIndex)
    const items = this.transformToCatalogItems(paginatedCredits, person)
    
    const hasMore = credits.length > endIndex
    const totalPages = Math.ceil(credits.length / limit)

    return {
      id,
      name,
      mediaType: MediaType.PERSON, // Base type for filmography
      items,
      pagination: {
        page,
        totalPages,
        totalItems: credits.length,
        hasMore
      },
      catalogContext: {
        catalogId: id,
        catalogName: name,
        catalogType: 'filmography',
        providerId: this.id,
        providerName: this.name,
        pageInfo: {
          currentPage: page,
          pageSize: items.length,
          hasMorePages: hasMore
        },
        lastFetchAt: new Date(),
        requestId: `filmography-${Date.now()}`
      },
      metadata: {
        fetchTime: Date.now(),
        cacheHit: false,
        itemCount: items.length
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Sort credits by popularity and release date
   */
  private sortCreditsByPopularityAndDate(credits: CombinedCredit[]): CombinedCredit[] {
    return [...credits].sort((a, b) => {
      // First sort by popularity (higher is better)
      if (a.popularity !== b.popularity) {
        return b.popularity - a.popularity
      }
      
      // Then by release/air date (newer is better)
      const dateA = a.release_date || a.first_air_date || '0000-00-00'
      const dateB = b.release_date || b.first_air_date || '0000-00-00'
      
      return dateB.localeCompare(dateA)
    })
  }

  /**
   * Group crew credits by department
   */
  private groupCrewByDepartment(crewCredits: CombinedCredit[]): Record<string, CombinedCredit[]> {
    const grouped: Record<string, CombinedCredit[]> = {}
    
    crewCredits.forEach(credit => {
      const department = credit.department || 'Other'
      if (!grouped[department]) {
        grouped[department] = []
      }
      grouped[department].push(credit)
    })
    
    return grouped
  }

  /**
   * Get display name for department
   */
  private getDepartmentDisplayName(department: string): string {
    const departmentNames: Record<string, string> = {
      'Directing': 'As Director',
      'Production': 'As Producer',
      'Writing': 'As Writer',
      'Camera': 'Cinematography',
      'Editing': 'As Editor',
      'Sound': 'Sound Department',
      'Art': 'Art Department',
      'Costume & Make-Up': 'Costume & Make-Up',
      'Visual Effects': 'Visual Effects',
      'Crew': 'Crew',
      'Other': 'Other Credits'
    }
    
    return departmentNames[department] || department
  }

  /**
   * Extract department from catalog ID
   */
  private extractDepartmentFromCatalogId(catalogId: string): string {
    const parts = catalogId.split('-')
    if (parts.length > 0) {
      const department = parts[0]
      // Convert back to TMDB department format
      const departmentMap: Record<string, string> = {
        'directing': 'Directing',
        'production': 'Production',
        'writing': 'Writing',
        'camera': 'Camera',
        'editing': 'Editing',
        'sound': 'Sound',
        'art': 'Art',
        'costume': 'Costume & Make-Up',
        'visual': 'Visual Effects',
        'crew': 'Crew',
        'other': 'Other'
      }
      return departmentMap[department.toLowerCase()] || department
    }
    return 'Other'
  }

  /**
   * Transform TMDB credits to CatalogItems
   */
  private transformToCatalogItems(credits: CombinedCredit[], person: PersonCatalogItem): CatalogItem[] {
    return credits.map((credit, index) => {
      // Create proper catalogContext first (following catalog provider pattern)
      const catalogContext: CatalogContext = {
        providerId: this.id,
        providerName: this.name,
        catalogId: 'filmography',
        catalogName: 'Filmography',
        catalogType: 'filmography',
        pageInfo: {
          currentPage: 1,
          pageSize: 20,
          hasMorePages: false
        },
        lastFetchAt: new Date(),
        requestId: `filmography-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Use ContentContextUtils (exactly like catalog provider)
      const contentContext: ContentContext = ContentContextUtils.createContentContext(
        catalogContext,
        credit.media_type === 'movie' ? MediaType.MOVIE : MediaType.TV_SERIES,
        credit.id,
        index,
        credit as unknown as Record<string, unknown>
      )

      if (credit.media_type === 'movie') {
        return {
          id: CatalogItemUtils.createCatalogItemId(MediaType.MOVIE, credit.id, 'tmdb'),
          mediaType: MediaType.MOVIE,
          title: credit.title || '',
          originalTitle: credit.original_title,
          overview: credit.overview,
          releaseDate: credit.release_date ? new Date(credit.release_date) : undefined,
          posterUrl: this.getImageUrl(credit.poster_path, 'poster'),
          backdropUrl: this.getImageUrl(credit.backdrop_path, 'backdrop'),
          voteAverage: credit.vote_average,
          voteCount: credit.vote_count,
          popularity: credit.popularity,
          originalLanguage: credit.original_language,
          genres: [],
          originalMediaType: MediaType.MOVIE,
          contentContext,
          externalIds: { tmdb: credit.id },
          hasDetailedInfo: false,
          isAdult: credit.adult,
          // Filmography-specific fields
          character: credit.character,
          job: credit.job,
          department: credit.department,
          creditId: credit.credit_id,
          order: credit.order,
          createdAt: new Date(),
          updatedAt: new Date()
        } as MovieCatalogItem & {
          character?: string
          job?: string
          department?: string
          creditId: string
          order?: number
        }
      } else {
        return {
          id: CatalogItemUtils.createCatalogItemId(MediaType.TV_SERIES, credit.id, 'tmdb'),
          mediaType: MediaType.TV_SERIES,
          title: credit.name || '',
          originalTitle: credit.original_name,
          overview: credit.overview,
          releaseDate: credit.first_air_date ? new Date(credit.first_air_date) : undefined,
          firstAirDate: credit.first_air_date ? new Date(credit.first_air_date) : undefined,
          posterUrl: this.getImageUrl(credit.poster_path, 'poster'),
          backdropUrl: this.getImageUrl(credit.backdrop_path, 'backdrop'),
          voteAverage: credit.vote_average,
          voteCount: credit.vote_count,
          popularity: credit.popularity,
          originalLanguage: credit.original_language,
          originCountries: credit.origin_country,
          genres: [],
          originalMediaType: MediaType.TV_SERIES,
          contentContext,
          externalIds: { tmdb: credit.id },
          hasDetailedInfo: false,
          isAdult: credit.adult,
          // Filmography-specific fields
          character: credit.character,
          job: credit.job,
          department: credit.department,
          creditId: credit.credit_id,
          order: credit.order,
          episodeCount: credit.episode_count,
          createdAt: new Date(),
          updatedAt: new Date()
        } as TVCatalogItem & {
          character?: string
          job?: string
          department?: string
          creditId: string
          order?: number
          episodeCount?: number
        }
      }
    })
  }

  /**
   * Get properly formatted image URL using TMDB service configuration
   */
  private getImageUrl(path: string | null, type: 'poster' | 'backdrop' | 'profile'): string | null {
    return TMDBUtils.getImageUrl(this.tmdbService.config, path, type)
  }
}