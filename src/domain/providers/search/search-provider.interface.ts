import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Search parameters for catalog search
 */
export interface SearchParams {
  /** Search query string */
  readonly query: string

  /** Media types to include in search (optional - defaults to all supported types) */
  readonly mediaTypes?: MediaType[]

  /** Page number for pagination (1-based, defaults to 1) */
  readonly page?: number

  /** Number of results per page (defaults to provider default) */
  readonly limit?: number

  /** Include adult content in results (defaults to false) */
  readonly includeAdult?: boolean

  /** Minimum release year filter */
  readonly minYear?: number

  /** Maximum release year filter */
  readonly maxYear?: number

  /** Language preference for results (ISO 639-1 code) */
  readonly language?: string

  /** Region preference for results (ISO 3166-1 code) */
  readonly region?: string
}

/**
 * Search result metadata
 */
export interface SearchResultMetadata {
  /** Original search query */
  readonly originalQuery: string

  /** Processed/normalized query used for search */
  readonly processedQuery: string

  /** Search execution time in milliseconds */
  readonly searchTime: number

  /** Whether results were returned from cache */
  readonly fromCache: boolean

  /** Search result relevance scoring method used */
  readonly scoringMethod?: string

  /** Additional provider-specific metadata */
  readonly providerMetadata?: Record<string, any>
}

/**
 * Search provider interface
 * Providers with this capability can search for media content across their catalogs
 * Enables unified search functionality across multiple data sources
 */
export interface ISearchProvider extends IProvider {
  /**
   * Search for media content across the provider's catalog
   * Returns a catalog containing search results with pagination support
   * 
   * @param searchParams - Search parameters including query and filters
   * @returns Promise that resolves to a catalog of search results
   * 
   * @example
   * ```typescript
   * const results = await provider.searchCatalog({
   *   query: "The Matrix",
   *   mediaTypes: [MediaType.MOVIE],
   *   page: 1,
   *   limit: 20
   * })
   * 
   * console.log(`Found ${results.items.length} results`)
   * results.items.forEach(item => console.log(item.title))
   * ```
   */
  searchCatalog(searchParams: SearchParams): Promise<Catalog>

  /**
   * Get search suggestions/autocomplete for a partial query
   * Provides quick suggestions as user types for improved UX
   * 
   * @param partialQuery - Partial search query string
   * @param limit - Maximum number of suggestions (defaults to 10)
   * @returns Promise that resolves to array of search suggestions
   * 
   * @example
   * ```typescript
   * const suggestions = await provider.getSearchSuggestions("matr", 5)
   * console.log(suggestions) // ["Matrix", "Matrix Reloaded", "Matrix Revolution"]
   * ```
   */
  getSearchSuggestions(partialQuery: string, limit?: number): Promise<string[]>

  /**
   * Get the supported media types for search
   * Allows consumers to understand what content types can be searched
   * 
   * @returns Array of supported media types for search
   * 
   * @example
   * ```typescript
   * const types = provider.getSupportedSearchMediaTypes()
   * console.log(types) // [MediaType.MOVIE, MediaType.TV_SERIES, MediaType.PERSON]
   * ```
   */
  getSupportedSearchMediaTypes(): MediaType[]

  /**
   * Check if the provider supports advanced search features
   * Determines if complex filtering and sorting options are available
   * 
   * @returns Whether advanced search features are supported
   * 
   * @example
   * ```typescript
   * if (provider.supportsAdvancedSearch()) {
   *   // Use year filters, genre filters, etc.
   *   const results = await provider.searchCatalog({
   *     query: "action",
   *     minYear: 2020,
   *     maxYear: 2023
   *   })
   * }
   * ```
   */
  supportsAdvancedSearch(): boolean

  /**
   * Get search result metadata for the last performed search
   * Provides insights into search performance and result quality
   * 
   * @returns Search result metadata or null if no recent search
   * 
   * @example
   * ```typescript
   * await provider.searchCatalog({ query: "Matrix" })
   * const metadata = provider.getLastSearchMetadata()
   * console.log(`Search took ${metadata?.searchTime}ms`)
   * ```
   */
  getLastSearchMetadata(): SearchResultMetadata | null

  /**
   * Validate if a search query is acceptable for this provider
   * Performs pre-flight validation without executing the search
   * 
   * @param query - Search query to validate
   * @returns Whether the query is valid for search
   * 
   * @example
   * ```typescript
   * if (provider.isValidSearchQuery("matrix")) {
   *   const results = await provider.searchCatalog({ query: "matrix" })
   * } else {
   *   console.log("Query too short or invalid")
   * }
   * ```
   */
  isValidSearchQuery(query: string): boolean

  /**
   * Get the minimum query length required for search
   * Helps UI determine when to enable search functionality
   * 
   * @returns Minimum number of characters required for search
   * 
   * @example
   * ```typescript
   * const minLength = provider.getMinimumQueryLength()
   * if (userInput.length >= minLength) {
   *   // Enable search button or auto-search
   * }
   * ```
   */
  getMinimumQueryLength(): number

  /**
   * Get the maximum number of results per page supported
   * Helps UI set appropriate pagination limits
   * 
   * @returns Maximum results per page
   * 
   * @example
   * ```typescript
   * const maxLimit = provider.getMaxResultsPerPage()
   * const safeLimit = Math.min(requestedLimit, maxLimit)
   * ```
   */
  getMaxResultsPerPage(): number
}