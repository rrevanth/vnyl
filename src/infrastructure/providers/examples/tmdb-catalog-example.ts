/**
 * TMDB Catalog Provider Usage Example
 * 
 * Demonstrates how to use the TMDB catalog provider with the DI container
 */

import { container } from '@/src/infrastructure/di'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import type { ITMDBCatalogProvider } from '@/src/infrastructure/providers/tmdb-catalog.provider'
import { TMDB_CATALOG_TYPES } from '@/src/infrastructure/providers/tmdb-catalog.provider'

/**
 * Example usage of TMDB catalog provider
 */
export async function exampleUsage() {
  try {
    // Get provider from DI container
    const tmdbCatalogProvider = container.resolve<ITMDBCatalogProvider>(TOKENS.TMDB_CATALOG_PROVIDER)
    
    // Initialize the provider
    await tmdbCatalogProvider.initialize()
    
    // Get popular movies catalog
    const popularMoviesCatalog = await tmdbCatalogProvider.getCatalog(
      TMDB_CATALOG_TYPES.POPULAR_MOVIES,
      1, // page
      10 // limit
    )
    
    console.log('Popular Movies Catalog:', {
      id: popularMoviesCatalog.id,
      name: popularMoviesCatalog.name,
      mediaType: popularMoviesCatalog.mediaType,
      itemCount: popularMoviesCatalog.items.length,
      pagination: popularMoviesCatalog.pagination,
      provider: popularMoviesCatalog.catalogContext.providerName
    })
    
    // Get all available catalogs
    const allCatalogs = await tmdbCatalogProvider.getAllCatalogs()
    console.log('Available Catalogs:', allCatalogs.map(catalog => ({
      id: catalog.id,
      name: catalog.name,
      mediaType: catalog.mediaType,
      itemCount: catalog.items.length
    })))
    
    // Load more items for pagination
    const moreItems = await tmdbCatalogProvider.loadMoreItems(
      TMDB_CATALOG_TYPES.POPULAR_MOVIES,
      2, // page 2
      10 // limit
    )
    
    console.log('More Popular Movies:', moreItems.length)
    
    // Check supported capabilities
    console.log('Supported Media Types:', tmdbCatalogProvider.getSupportedMediaTypes())
    console.log('Supported Catalog Types:', tmdbCatalogProvider.getSupportedCatalogTypes())
    
  } catch (error) {
    console.error('Error using TMDB catalog provider:', error)
  }
}

/**
 * Example of working with catalog items
 */
export function exampleCatalogItemUsage() {
  // This would typically be called after getting a catalog
  // const catalog = await tmdbCatalogProvider.getCatalog(...)
  
  // Example of processing catalog items
  const processCatalogItems = (items: any[]) => {
    items.forEach(item => {
      console.log('Catalog Item:', {
        id: item.id,
        title: item.title,
        mediaType: item.mediaType,
        releaseDate: item.releaseDate,
        voteAverage: item.voteAverage,
        posterUrl: item.posterUrl,
        provider: item.contentContext.providerName,
        originalId: item.contentContext.originalMediaId
      })
    })
  }
  
  return processCatalogItems
}