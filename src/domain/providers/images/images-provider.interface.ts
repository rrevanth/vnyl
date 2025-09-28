import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Image size configuration
 */
export interface ImageSize {
  width: number
  height?: number
  quality?: 'low' | 'medium' | 'high'
}

/**
 * Image variant with different sizes
 */
export interface ImageVariant {
  original: string
  thumbnail: string
  small: string
  medium: string
  large: string
  xlarge?: string
}

/**
 * Images provider interface
 * Providers with this capability can provide images for media content
 */
export interface IImagesProvider extends IProvider {
  /**
   * Get image variants for a specific media item
   */
  getMediaImages(mediaId: string, mediaType: MediaType): Promise<ImageVariant>

  /**
   * Get images for multiple media items
   */
  getBulkImages(mediaIds: string[], mediaType: MediaType): Promise<Record<string, ImageVariant>>

  /**
   * Get person/cast images
   */
  getPersonImages(personId: string): Promise<ImageVariant>

  /**
   * Generate image URL with specific size
   */
  getImageUrl(imagePath: string, size: ImageSize): string

  /**
   * Get supported image sizes for this provider
   */
  getSupportedImageSizes(): ImageSize[]

  /**
   * Get supported media types for images
   */
  getSupportedMediaTypes(): MediaType[]
}