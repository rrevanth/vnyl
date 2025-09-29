import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Catalog provider interface
 * Providers with this capability can provide catalogs of media content
 */
export interface ICatalogProvider extends IProvider {
  /**
   * Get all available catalogs from this provider
   */
  getAllCatalogs(): Promise<Catalog[]>

  /**
   * Get a specific catalog with pagination
   */
  getCatalog(catalogId: string, page?: number, limit?: number): Promise<Catalog>

  /**
   * Load more items for a specific catalog (pagination)
   * Uses the catalog object to access context and metadata for proper pagination
   */
  loadMoreItems(catalog: Catalog, page: number, limit?: number): Promise<CatalogItem[]>

  /**
   * Get supported media types for this provider
   */
  getSupportedMediaTypes(): MediaType[]

  /**
   * Get supported catalog types for this provider
   */
  getSupportedCatalogTypes(): string[]
}