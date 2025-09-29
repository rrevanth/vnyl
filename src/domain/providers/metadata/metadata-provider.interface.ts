import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Metadata provider interface
 * Providers with this capability can provide detailed metadata for media content
 */
export interface IMetadataProvider extends IProvider {
  /**
   * Get detailed metadata for a specific media item
   */
  getMediaMetadata(mediaId: string, mediaType: MediaType): Promise<CatalogItem>

  /**
   * Get metadata for multiple media items
   */
  getBulkMetadata(mediaIds: string[], mediaType: MediaType): Promise<CatalogItem[]>

  /**
   * Get enhanced metadata with additional details (cast, crew, reviews, etc.)
   */
  getEnhancedMetadata(mediaId: string, mediaType: MediaType, includeExtras?: string[]): Promise<CatalogItem>

  /**
   * Get supported metadata fields for this provider
   */
  getSupportedMetadataFields(): string[]

  /**
   * Get supported media types for metadata
   */
  getSupportedMediaTypes(): MediaType[]
}