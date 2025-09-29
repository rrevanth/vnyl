import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem, PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'

/**
 * People search parameters
 */
export interface PeopleSearchParams {
  /** Search query for person name */
  readonly query: string

  /** Page number for pagination (1-based, defaults to 1) */
  readonly page?: number

  /** Number of results per page (defaults to provider default) */
  readonly limit?: number

  /** Include adult content in results (defaults to false) */
  readonly includeAdult?: boolean

  /** Language preference for results (ISO 639-1 code) */
  readonly language?: string

  /** Region preference for results (ISO 3166-1 code) */
  readonly region?: string
}

/**
 * People result metadata
 */
export interface PeopleResultMetadata {
  /** Original search query */
  readonly originalQuery: string

  /** Search execution time in milliseconds */
  readonly searchTime: number

  /** Whether results were returned from cache */
  readonly fromCache: boolean

  /** Data quality score (0-1) indicating completeness */
  readonly qualityScore: number

  /** Provider-specific metadata */
  readonly providerMetadata?: Record<string, any>
}

/**
 * People search result
 */
export interface PeopleSearchResult {
  /** Catalog containing people search results */
  readonly catalog: Catalog

  /** Search result metadata */
  readonly metadata: PeopleResultMetadata

  /** Timestamp when search was performed */
  readonly searchedAt: Date
}

/**
 * People provider interface
 * Providers with this capability can search for and retrieve information about people (actors, directors, crew)
 * Enables comprehensive people-based content discovery and exploration
 */
export interface IPeopleProvider extends IProvider {
  /**
   * Search for people by name or query
   * Returns a catalog of people matching the search criteria
   * 
   * @param searchParams - Search parameters including query and filters
   * @returns Promise that resolves to people search results
   * 
   * @example
   * ```typescript
   * const result = await provider.getPeople({
   *   query: "Tom Hanks",
   *   page: 1,
   *   limit: 20
   * })
   * 
   * console.log(`Found ${result.catalog.items.length} people`)
   * result.catalog.items.forEach(person => {
   *   if (person.mediaType === MediaType.PERSON) {
   *     const personItem = person as PersonCatalogItem
   *     console.log(`${personItem.title} - ${personItem.knownForDepartment}`)
   *   }
   * })
   * ```
   */
  getPeople(searchParams: PeopleSearchParams): Promise<PeopleSearchResult>

  /**
   * Get detailed information for a specific person
   * Fetches comprehensive person data including biography, filmography context
   * 
   * @param personItem - The person catalog item to get details for
   * @returns Promise that resolves to detailed person information
   * 
   * @example
   * ```typescript
   * const detailedPerson = await provider.getPersonDetails(personItem)
   * console.log(`Biography: ${detailedPerson.overview}`)
   * console.log(`Known for: ${detailedPerson.knownForDepartment}`)
   * ```
   */
  getPersonDetails(personItem: PersonCatalogItem): Promise<PersonCatalogItem>

  /**
   * Get people associated with a specific media item
   * Fetches cast, crew, and other people related to movies, TV shows, etc.
   * 
   * @param mediaItem - The media catalog item to get people for
   * @returns Promise that resolves to catalog of associated people
   * 
   * @example
   * ```typescript
   * const peopleResult = await provider.getPeopleForMedia(movieItem)
   * console.log(`Found ${peopleResult.catalog.items.length} people`)
   * 
   * // Filter by role type
   * const actors = peopleResult.catalog.items.filter(person => 
   *   (person as PersonCatalogItem).knownForDepartment === 'Acting'
   * )
   * ```
   */
  getPeopleForMedia(mediaItem: CatalogItem): Promise<PeopleSearchResult>

  /**
   * Get popular people
   * Fetches currently popular/trending people based on provider algorithms
   * 
   * @param page - Page number for pagination (1-based, defaults to 1)
   * @param limit - Number of results per page (defaults to provider default)
   * @returns Promise that resolves to catalog of popular people
   * 
   * @example
   * ```typescript
   * const popularResult = await provider.getPopularPeople(1, 20)
   * console.log(`Popular people: ${popularResult.catalog.items.length}`)
   * ```
   */
  getPopularPeople(page?: number, limit?: number): Promise<PeopleSearchResult>

  /**
   * Check if people data is supported for a given media type
   * Determines if the provider can fetch people information for specific content types
   * 
   * @param mediaType - The media type to check support for
   * @returns Whether people data is supported for this media type
   * 
   * @example
   * ```typescript
   * if (provider.supportsPeopleForMediaType(MediaType.MOVIE)) {
   *   const people = await provider.getPeopleForMedia(movieItem)
   * }
   * ```
   */
  supportsPeopleForMediaType(mediaType: string): boolean

  /**
   * Validate if a people search query is acceptable for this provider
   * Performs pre-flight validation without executing the search
   * 
   * @param query - Search query to validate
   * @returns Whether the query is valid for people search
   * 
   * @example
   * ```typescript
   * if (provider.isValidPeopleQuery("Tom")) {
   *   const results = await provider.getPeople({ query: "Tom" })
   * } else {
   *   console.log("Query too short for people search")
   * }
   * ```
   */
  isValidPeopleQuery(query: string): boolean

  /**
   * Get the minimum query length required for people search
   * Helps UI determine when to enable people search functionality
   * 
   * @returns Minimum number of characters required for people search
   * 
   * @example
   * ```typescript
   * const minLength = provider.getMinimumPeopleQueryLength()
   * if (userInput.length >= minLength) {
   *   // Enable people search
   * }
   * ```
   */
  getMinimumPeopleQueryLength(): number

  /**
   * Get search suggestions for people names
   * Provides autocomplete suggestions for people search
   * 
   * @param partialQuery - Partial search query string
   * @param limit - Maximum number of suggestions (defaults to 10)
   * @returns Promise that resolves to array of people name suggestions
   * 
   * @example
   * ```typescript
   * const suggestions = await provider.getPeopleSuggestions("Tom H", 5)
   * console.log(suggestions) // ["Tom Hanks", "Tom Hardy", "Tom Holland"]
   * ```
   */
  getPeopleSuggestions(partialQuery: string, limit?: number): Promise<string[]>

  /**
   * Check if detailed person information is supported
   * Determines if the provider can fetch comprehensive person details
   * 
   * @returns Whether detailed person information is available
   * 
   * @example
   * ```typescript
   * if (provider.supportsDetailedPersonInfo()) {
   *   const details = await provider.getPersonDetails(personItem)
   *   // Access detailed biography, filmography, etc.
   * }
   * ```
   */
  supportsDetailedPersonInfo(): boolean

  /**
   * Check if popular people feature is supported
   * Determines if the provider can fetch trending/popular people lists
   * 
   * @returns Whether popular people feature is available
   * 
   * @example
   * ```typescript
   * if (provider.supportsPopularPeople()) {
   *   const popular = await provider.getPopularPeople()
   * }
   * ```
   */
  supportsPopularPeople(): boolean
}