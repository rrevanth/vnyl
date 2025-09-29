/**
 * CatalogItem Serialization Utilities
 * 
 * Handles serialization and deserialization of CatalogItem objects for navigation
 * Manages Date objects, Maps, and complex nested structures properly
 */

import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Serializable version of CatalogItem with Date objects converted to strings
 */
export interface SerializableCatalogItem {
  readonly id: string
  readonly mediaType: MediaType
  readonly title: string
  readonly originalTitle?: string
  readonly overview?: string
  readonly releaseDate?: string // ISO string instead of Date
  readonly posterUrl?: string
  readonly backdropUrl?: string
  readonly voteAverage?: number
  readonly voteCount?: number
  readonly popularity?: number
  readonly originalLanguage?: string
  readonly originCountries?: string[]
  readonly contentRating?: string
  readonly status?: string
  readonly genres?: string[]
  readonly originalMediaType: string
  readonly hasDetailedInfo: boolean
  readonly isAdult?: boolean
  readonly createdAt: string // ISO string instead of Date
  readonly updatedAt: string // ISO string instead of Date
  
  readonly contentContext: {
    readonly catalogContext: any
    readonly originalMediaType: string
    readonly originalMediaId: string | number
    readonly providerId: string
    readonly providerName: string
    readonly positionInCatalog: number
    readonly fetchedAt: string // ISO string instead of Date
    readonly requestId: string
    readonly originalData?: Record<string, unknown>
  }
  
  readonly externalIds: Record<string, string | number>
  
  readonly enrichedData?: {
    readonly originalData: unknown
    readonly enrichments: Record<string, any> // Converted from Map
    readonly enrichedAt: string // ISO string instead of Date
    readonly enrichmentSources: string[]
  }
  
  // Media-specific fields (conditionally present)
  readonly runtime?: number
  readonly budget?: number
  readonly revenue?: number
  readonly tagline?: string
  readonly productionCompanies?: any[]
  readonly collection?: any
  readonly firstAirDate?: string
  readonly lastAirDate?: string
  readonly numberOfSeasons?: number
  readonly numberOfEpisodes?: number
  readonly episodeRuntime?: number[]
  readonly type?: string
  readonly networks?: any[]
  readonly inProduction?: boolean
  readonly nextEpisodeToAir?: any
  readonly lastEpisodeToAir?: any
  readonly profileUrl?: string
  readonly knownForDepartment?: string
  readonly birthday?: string
  readonly deathday?: string
  readonly placeOfBirth?: string
  readonly gender?: number
  readonly knownFor?: any[]
  readonly partsCount?: number
  readonly totalRuntime?: number
}

/**
 * Serializes a CatalogItem for navigation parameters
 * Handles Date objects, Maps, and complex nested structures
 */
export function serializeCatalogItem(item: CatalogItem): SerializableCatalogItem {
  // Build base object with all common fields
  const baseSerialized: Partial<SerializableCatalogItem> = {
    id: item.id,
    mediaType: item.mediaType,
    title: item.title,
    originalTitle: item.originalTitle,
    overview: item.overview,
    // Convert Date to ISO string for serialization
    releaseDate: item.releaseDate?.toISOString(),
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    voteAverage: item.voteAverage,
    voteCount: item.voteCount,
    popularity: item.popularity,
    originalLanguage: item.originalLanguage,
    originCountries: item.originCountries,
    contentRating: item.contentRating,
    status: item.status,
    genres: item.genres,
    originalMediaType: item.originalMediaType,
    hasDetailedInfo: item.hasDetailedInfo,
    isAdult: item.isAdult,
    // Convert Date to ISO string for serialization
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    
    // Serialize contentContext
    contentContext: {
      catalogContext: item.contentContext.catalogContext,
      originalMediaType: item.contentContext.originalMediaType,
      originalMediaId: item.contentContext.originalMediaId,
      providerId: item.contentContext.providerId,
      providerName: item.contentContext.providerName,
      positionInCatalog: item.contentContext.positionInCatalog,
      fetchedAt: item.contentContext.fetchedAt.toISOString(),
      requestId: item.contentContext.requestId,
      originalData: item.contentContext.originalData
    },
    
    // Serialize externalIds (including dynamic provider IDs)
    externalIds: { ...item.externalIds }
  }
  
  // Handle enrichedData if present (Map serialization)
  let enrichedDataSerialized = undefined
  if (item.enrichedData) {
    enrichedDataSerialized = {
      originalData: item.enrichedData.originalData,
      // Convert Map to object for serialization
      enrichments: Object.fromEntries(item.enrichedData.enrichments.entries()),
      enrichedAt: item.enrichedData.enrichedAt.toISOString(),
      enrichmentSources: item.enrichedData.enrichmentSources
    }
  }
  
  // Handle media-specific fields
  const mediaSpecificFields: Record<string, any> = {}
  
  if (item.mediaType === MediaType.MOVIE) {
    const movieItem = item as any // Type assertion for movie-specific fields
    if (movieItem.runtime !== undefined) mediaSpecificFields.runtime = movieItem.runtime
    if (movieItem.budget !== undefined) mediaSpecificFields.budget = movieItem.budget
    if (movieItem.revenue !== undefined) mediaSpecificFields.revenue = movieItem.revenue
    if (movieItem.tagline !== undefined) mediaSpecificFields.tagline = movieItem.tagline
    if (movieItem.productionCompanies !== undefined) mediaSpecificFields.productionCompanies = movieItem.productionCompanies
    if (movieItem.collection !== undefined) mediaSpecificFields.collection = movieItem.collection
  } else if (item.mediaType === MediaType.TV_SERIES) {
    const tvItem = item as any // Type assertion for TV-specific fields
    if (tvItem.firstAirDate !== undefined) mediaSpecificFields.firstAirDate = tvItem.firstAirDate?.toISOString()
    if (tvItem.lastAirDate !== undefined) mediaSpecificFields.lastAirDate = tvItem.lastAirDate?.toISOString()
    if (tvItem.numberOfSeasons !== undefined) mediaSpecificFields.numberOfSeasons = tvItem.numberOfSeasons
    if (tvItem.numberOfEpisodes !== undefined) mediaSpecificFields.numberOfEpisodes = tvItem.numberOfEpisodes
    if (tvItem.episodeRuntime !== undefined) mediaSpecificFields.episodeRuntime = tvItem.episodeRuntime
    if (tvItem.type !== undefined) mediaSpecificFields.type = tvItem.type
    if (tvItem.networks !== undefined) mediaSpecificFields.networks = tvItem.networks
    if (tvItem.inProduction !== undefined) mediaSpecificFields.inProduction = tvItem.inProduction
    if (tvItem.nextEpisodeToAir !== undefined) mediaSpecificFields.nextEpisodeToAir = tvItem.nextEpisodeToAir
    if (tvItem.lastEpisodeToAir !== undefined) mediaSpecificFields.lastEpisodeToAir = tvItem.lastEpisodeToAir
  } else if (item.mediaType === MediaType.PERSON) {
    const personItem = item as any // Type assertion for person-specific fields
    if (personItem.profileUrl !== undefined) mediaSpecificFields.profileUrl = personItem.profileUrl
    if (personItem.knownForDepartment !== undefined) mediaSpecificFields.knownForDepartment = personItem.knownForDepartment
    if (personItem.birthday !== undefined) mediaSpecificFields.birthday = personItem.birthday?.toISOString()
    if (personItem.deathday !== undefined) mediaSpecificFields.deathday = personItem.deathday?.toISOString()
    if (personItem.placeOfBirth !== undefined) mediaSpecificFields.placeOfBirth = personItem.placeOfBirth
    if (personItem.gender !== undefined) mediaSpecificFields.gender = personItem.gender
    if (personItem.knownFor !== undefined) mediaSpecificFields.knownFor = personItem.knownFor
  } else if (item.mediaType === MediaType.COLLECTION) {
    const collectionItem = item as any // Type assertion for collection-specific fields
    if (collectionItem.partsCount !== undefined) mediaSpecificFields.partsCount = collectionItem.partsCount
    if (collectionItem.totalRuntime !== undefined) mediaSpecificFields.totalRuntime = collectionItem.totalRuntime
  }
  
  // Combine base object with enriched data and media-specific fields
  return { 
    ...baseSerialized, 
    ...(enrichedDataSerialized && { enrichedData: enrichedDataSerialized }),
    ...mediaSpecificFields 
  } as SerializableCatalogItem
}

/**
 * Deserializes a SerializableCatalogItem back to a CatalogItem
 * Converts ISO strings back to Date objects and recreates Maps
 */
export function deserializeCatalogItem(serialized: SerializableCatalogItem): CatalogItem {
  // Build the base item with all common fields
  const baseItem: Partial<CatalogItem> = {
    id: serialized.id,
    mediaType: serialized.mediaType,
    title: serialized.title,
    originalTitle: serialized.originalTitle,
    overview: serialized.overview,
    // Convert ISO string back to Date
    releaseDate: serialized.releaseDate ? new Date(serialized.releaseDate) : undefined,
    posterUrl: serialized.posterUrl,
    backdropUrl: serialized.backdropUrl,
    voteAverage: serialized.voteAverage,
    voteCount: serialized.voteCount,
    popularity: serialized.popularity,
    originalLanguage: serialized.originalLanguage as any,
    originCountries: serialized.originCountries as any,
    contentRating: serialized.contentRating as any,
    status: serialized.status as any,
    genres: serialized.genres as any,
    originalMediaType: serialized.originalMediaType,
    hasDetailedInfo: serialized.hasDetailedInfo,
    isAdult: serialized.isAdult,
    // Convert ISO string back to Date
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    
    // Deserialize contentContext
    contentContext: {
      catalogContext: serialized.contentContext.catalogContext,
      originalMediaType: serialized.contentContext.originalMediaType,
      originalMediaId: serialized.contentContext.originalMediaId,
      providerId: serialized.contentContext.providerId,
      providerName: serialized.contentContext.providerName,
      positionInCatalog: serialized.contentContext.positionInCatalog,
      fetchedAt: new Date(serialized.contentContext.fetchedAt),
      requestId: serialized.contentContext.requestId,
      originalData: serialized.contentContext.originalData
    },
    
    // Deserialize externalIds
    externalIds: { ...serialized.externalIds } as any
  }
  
  // Handle enrichedData if present (recreate Map)
  let enrichedDataDeserialized: any = undefined
  if (serialized.enrichedData) {
    enrichedDataDeserialized = {
      originalData: serialized.enrichedData.originalData as CatalogItem,
      // Convert object back to Map (with type assertion for the Map key/value types)
      enrichments: new Map(Object.entries(serialized.enrichedData.enrichments)) as any,
      enrichedAt: new Date(serialized.enrichedData.enrichedAt),
      enrichmentSources: serialized.enrichedData.enrichmentSources
    }
  }
  
  // Handle media-specific fields by building the complete object
  const mediaSpecificFields: Record<string, any> = {}
  
  if (serialized.mediaType === MediaType.MOVIE) {
    if (serialized.runtime !== undefined) mediaSpecificFields.runtime = serialized.runtime
    if (serialized.budget !== undefined) mediaSpecificFields.budget = serialized.budget
    if (serialized.revenue !== undefined) mediaSpecificFields.revenue = serialized.revenue
    if (serialized.tagline !== undefined) mediaSpecificFields.tagline = serialized.tagline
    if (serialized.productionCompanies !== undefined) mediaSpecificFields.productionCompanies = serialized.productionCompanies
    if (serialized.collection !== undefined) mediaSpecificFields.collection = serialized.collection
  } else if (serialized.mediaType === MediaType.TV_SERIES) {
    if (serialized.firstAirDate !== undefined) mediaSpecificFields.firstAirDate = serialized.firstAirDate ? new Date(serialized.firstAirDate) : undefined
    if (serialized.lastAirDate !== undefined) mediaSpecificFields.lastAirDate = serialized.lastAirDate ? new Date(serialized.lastAirDate) : undefined
    if (serialized.numberOfSeasons !== undefined) mediaSpecificFields.numberOfSeasons = serialized.numberOfSeasons
    if (serialized.numberOfEpisodes !== undefined) mediaSpecificFields.numberOfEpisodes = serialized.numberOfEpisodes
    if (serialized.episodeRuntime !== undefined) mediaSpecificFields.episodeRuntime = serialized.episodeRuntime
    if (serialized.type !== undefined) mediaSpecificFields.type = serialized.type
    if (serialized.networks !== undefined) mediaSpecificFields.networks = serialized.networks
    if (serialized.inProduction !== undefined) mediaSpecificFields.inProduction = serialized.inProduction
    if (serialized.nextEpisodeToAir !== undefined) mediaSpecificFields.nextEpisodeToAir = serialized.nextEpisodeToAir
    if (serialized.lastEpisodeToAir !== undefined) mediaSpecificFields.lastEpisodeToAir = serialized.lastEpisodeToAir
  } else if (serialized.mediaType === MediaType.PERSON) {
    if (serialized.profileUrl !== undefined) mediaSpecificFields.profileUrl = serialized.profileUrl
    if (serialized.knownForDepartment !== undefined) mediaSpecificFields.knownForDepartment = serialized.knownForDepartment
    if (serialized.birthday !== undefined) mediaSpecificFields.birthday = serialized.birthday ? new Date(serialized.birthday) : undefined
    if (serialized.deathday !== undefined) mediaSpecificFields.deathday = serialized.deathday ? new Date(serialized.deathday) : undefined
    if (serialized.placeOfBirth !== undefined) mediaSpecificFields.placeOfBirth = serialized.placeOfBirth
    if (serialized.gender !== undefined) mediaSpecificFields.gender = serialized.gender
    if (serialized.knownFor !== undefined) mediaSpecificFields.knownFor = serialized.knownFor
  } else if (serialized.mediaType === MediaType.COLLECTION) {
    if (serialized.partsCount !== undefined) mediaSpecificFields.partsCount = serialized.partsCount
    if (serialized.totalRuntime !== undefined) mediaSpecificFields.totalRuntime = serialized.totalRuntime
  }
  
  // Combine base item with enriched data and media-specific fields
  return { 
    ...baseItem, 
    ...(enrichedDataDeserialized && { enrichedData: enrichedDataDeserialized }),
    ...mediaSpecificFields 
  } as CatalogItem
}

/**
 * Utility function to safely parse serialized CatalogItem from navigation params
 */
export function parseCatalogItemFromParams(itemData: string): CatalogItem | null {
  try {
    const serialized = JSON.parse(itemData) as SerializableCatalogItem
    return deserializeCatalogItem(serialized)
  } catch (error) {
    console.error('Failed to parse CatalogItem from navigation params:', error)
    return null
  }
}

/**
 * Utility function to safely stringify CatalogItem for navigation params
 */
export function stringifyCatalogItemForParams(item: CatalogItem): string {
  try {
    return JSON.stringify(serializeCatalogItem(item))
  } catch (error) {
    console.error('Failed to stringify CatalogItem for navigation params:', error)
    // Fallback to minimal data
    return JSON.stringify({
      id: item.id,
      title: item.title,
      mediaType: item.mediaType,
      posterUrl: item.posterUrl,
      releaseDate: item.releaseDate?.toISOString(),
      overview: item.overview
    })
  }
}