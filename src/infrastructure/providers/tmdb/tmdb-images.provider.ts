/**
 * TMDB Images Provider
 * 
 * Implementation of IImagesProvider for The Movie Database (TMDB)
 * Provides comprehensive image functionality using TMDB's image configuration and endpoints
 */

import { IImagesProvider, ImageSize, ImageVariant } from '@/src/domain/providers/images/images-provider.interface'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'

/**
 * TMDB image type mappings
 */
export const TMDB_IMAGE_TYPES = {
  POSTER: 'poster',
  BACKDROP: 'backdrop',
  PROFILE: 'profile',
  LOGO: 'logo',
  STILL: 'still'
} as const

export type TMDBImageType = typeof TMDB_IMAGE_TYPES[keyof typeof TMDB_IMAGE_TYPES]

/**
 * Standard image sizes supported by TMDB
 */
export const TMDB_IMAGE_SIZES: Record<string, ImageSize[]> = {
  poster: [
    { width: 92, height: 138, quality: 'low' },
    { width: 154, height: 231, quality: 'low' },
    { width: 185, height: 278, quality: 'medium' },
    { width: 342, height: 513, quality: 'medium' },
    { width: 500, height: 750, quality: 'high' },
    { width: 780, height: 1170, quality: 'high' }
  ],
  backdrop: [
    { width: 300, height: 169, quality: 'low' },
    { width: 780, height: 439, quality: 'medium' },
    { width: 1280, height: 720, quality: 'high' }
  ],
  profile: [
    { width: 45, height: 68, quality: 'low' },
    { width: 185, height: 278, quality: 'medium' },
    { width: 632, height: 948, quality: 'high' }
  ],
  logo: [
    { width: 45, height: 45, quality: 'low' },
    { width: 92, height: 92, quality: 'medium' },
    { width: 154, height: 154, quality: 'medium' },
    { width: 185, height: 185, quality: 'high' },
    { width: 300, height: 300, quality: 'high' },
    { width: 500, height: 500, quality: 'high' }
  ],
  still: [
    { width: 92, height: 52, quality: 'low' },
    { width: 185, height: 104, quality: 'medium' },
    { width: 300, height: 169, quality: 'high' }
  ]
}

/**
 * TMDB Images Provider - Implementation of IImagesProvider
 */
export class TMDBImagesProvider implements IImagesProvider {
  public readonly id = 'tmdb-images'
  public readonly name = 'TMDB Images Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.IMAGES]
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
      this.logger.info('TMDB images provider initialized successfully', { 
        context: 'tmdb_images_provider' 
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB images provider', errorInstance, { 
        context: 'tmdb_images_provider' 
      })
      throw new Error(`TMDB images provider initialization failed: ${errorInstance.message}`)
    }
  }

  async getMediaImages(mediaId: string, mediaType: MediaType): Promise<ImageVariant> {
    try {
      this.logger.info('Fetching TMDB media images', {
        context: 'tmdb_images_provider',
        mediaId,
        mediaType
      })

      const startTime = performance.now()
      const tmdbId = parseInt(mediaId, 10)
      
      if (isNaN(tmdbId)) {
        throw new Error(`Invalid TMDB ID: ${mediaId}`)
      }

      let imageVariant: ImageVariant

      if (mediaType === MediaType.MOVIE) {
        const movieImages = await this.tmdbService.client.movies.getImages(tmdbId)
        imageVariant = this.createImageVariantFromMovieImages(movieImages)
      } else if (mediaType === MediaType.TV_SERIES) {
        const tvImages = await this.tmdbService.client.tv.getImages(tmdbId)
        imageVariant = this.createImageVariantFromTVImages(tvImages)
      } else {
        throw new Error(`Unsupported media type for images: ${mediaType}`)
      }

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched TMDB media images', {
        context: 'tmdb_images_provider',
        mediaId,
        mediaType,
        fetchTime: Math.round(fetchTime),
        hasImages: !!(imageVariant.original || imageVariant.large)
      })

      return imageVariant
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TMDB media images', errorInstance, {
        context: 'tmdb_images_provider',
        mediaId,
        mediaType
      })
      throw new Error(`Failed to fetch TMDB images for ${mediaType} ${mediaId}: ${errorInstance.message}`)
    }
  }

  async getBulkImages(mediaIds: string[], mediaType: MediaType): Promise<Record<string, ImageVariant>> {
    try {
      this.logger.info('Fetching bulk TMDB images', {
        context: 'tmdb_images_provider',
        mediaType,
        count: mediaIds.length
      })

      const startTime = performance.now()
      
      // Process in parallel with proper error handling
      const imagePromises = mediaIds.map(async (mediaId) => {
        try {
          const imageVariant = await this.getMediaImages(mediaId, mediaType)
          return { mediaId, imageVariant }
        } catch (error) {
          this.logger.warn('Failed to fetch individual media images', error instanceof Error ? error : new Error(String(error)), {
            context: 'tmdb_images_provider',
            mediaId,
            mediaType
          })
          return { mediaId, imageVariant: null }
        }
      })

      const results = await Promise.allSettled(imagePromises)
      
      const imageMap: Record<string, ImageVariant> = {}
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.imageVariant) {
          imageMap[result.value.mediaId] = result.value.imageVariant
        }
      })

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched bulk TMDB images', {
        context: 'tmdb_images_provider',
        mediaType,
        requestedCount: mediaIds.length,
        successfulCount: Object.keys(imageMap).length,
        fetchTime: Math.round(fetchTime)
      })

      return imageMap
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch bulk TMDB images', errorInstance, {
        context: 'tmdb_images_provider',
        mediaType,
        count: mediaIds.length
      })
      throw new Error(`Failed to fetch bulk TMDB images: ${errorInstance.message}`)
    }
  }

  async getPersonImages(personId: string): Promise<ImageVariant> {
    try {
      this.logger.info('Fetching TMDB person images', {
        context: 'tmdb_images_provider',
        personId
      })

      const startTime = performance.now()
      const tmdbId = parseInt(personId, 10)
      
      if (isNaN(tmdbId)) {
        throw new Error(`Invalid TMDB person ID: ${personId}`)
      }

      const personImages = await this.tmdbService.client.people.getImages(tmdbId)
      const imageVariant = this.createImageVariantFromPersonImages(personImages)

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched TMDB person images', {
        context: 'tmdb_images_provider',
        personId,
        fetchTime: Math.round(fetchTime),
        hasImages: !!(imageVariant.original || imageVariant.large)
      })

      return imageVariant
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TMDB person images', errorInstance, {
        context: 'tmdb_images_provider',
        personId
      })
      throw new Error(`Failed to fetch TMDB person images for ${personId}: ${errorInstance.message}`)
    }
  }

  getImageUrl(imagePath: string, size: ImageSize): string {
    try {
      // Determine the closest available size based on width
      const imageType = this.determineImageTypeFromPath(imagePath)
      const availableSizes = TMDB_IMAGE_SIZES[imageType] || TMDB_IMAGE_SIZES.poster
      
      // Find the closest size match
      const closestSize = availableSizes.reduce((closest, current) => {
        const currentDiff = Math.abs(current.width - size.width)
        const closestDiff = Math.abs(closest.width - size.width)
        return currentDiff < closestDiff ? current : closest
      })

      // Use TMDB's size naming convention
      const sizeString = `w${closestSize.width}`
      return this.tmdbService.config.getImageUrl(imagePath, imageType as any, sizeString)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.warn('Failed to generate TMDB image URL', errorInstance, {
        context: 'tmdb_images_provider',
        imagePath,
        size
      })
      // Fallback to original size
      return this.tmdbService.config.getImageUrl(imagePath, 'poster', 'original')
    }
  }

  getSupportedImageSizes(): ImageSize[] {
    // Return all supported sizes across all image types
    const allSizes: ImageSize[] = []
    
    Object.values(TMDB_IMAGE_SIZES).forEach(sizes => {
      sizes.forEach(size => {
        // Only add unique sizes
        if (!allSizes.some(existing => existing.width === size.width && existing.height === size.height)) {
          allSizes.push(size)
        }
      })
    })

    return allSizes.sort((a, b) => a.width - b.width)
  }

  getSupportedMediaTypes(): MediaType[] {
    return [MediaType.MOVIE, MediaType.TV_SERIES, MediaType.PERSON]
  }

  private createImageVariantFromMovieImages(movieImages: any): ImageVariant {
    // Get the best poster and backdrop images
    const posterImage = movieImages.posters?.[0]
    const backdropImage = movieImages.backdrops?.[0]

    return this.createImageVariant(posterImage, backdropImage, 'poster')
  }

  private createImageVariantFromTVImages(tvImages: any): ImageVariant {
    // Get the best poster and backdrop images
    const posterImage = tvImages.posters?.[0]
    const backdropImage = tvImages.backdrops?.[0]

    return this.createImageVariant(posterImage, backdropImage, 'poster')
  }

  private createImageVariantFromPersonImages(personImages: any): ImageVariant {
    // Get the best profile image
    const profileImage = personImages.profiles?.[0]

    return this.createImageVariant(profileImage, null, 'profile')
  }

  private createImageVariant(
    primaryImage: any, 
    secondaryImage: any, 
    imageType: TMDBImageType
  ): ImageVariant {
    const primaryPath = primaryImage?.file_path
    const secondaryPath = secondaryImage?.file_path

    if (!primaryPath && !secondaryPath) {
      // Return empty variant if no images available
      return {
        original: '',
        thumbnail: '',
        small: '',
        medium: '',
        large: '',
        xlarge: ''
      }
    }

    const basePath = primaryPath || secondaryPath

    return {
      original: this.tmdbService.config.getImageUrl(basePath, imageType, 'original'),
      thumbnail: this.tmdbService.config.getImageUrl(basePath, imageType, this.getSizeForVariant(imageType, 'thumbnail')),
      small: this.tmdbService.config.getImageUrl(basePath, imageType, this.getSizeForVariant(imageType, 'small')),
      medium: this.tmdbService.config.getImageUrl(basePath, imageType, this.getSizeForVariant(imageType, 'medium')),
      large: this.tmdbService.config.getImageUrl(basePath, imageType, this.getSizeForVariant(imageType, 'large')),
      xlarge: this.tmdbService.config.getImageUrl(basePath, imageType, this.getSizeForVariant(imageType, 'xlarge'))
    }
  }

  private getSizeForVariant(imageType: TMDBImageType, variant: keyof ImageVariant): string {
    const sizes = TMDB_IMAGE_SIZES[imageType] || TMDB_IMAGE_SIZES.poster

    switch (variant) {
      case 'thumbnail':
        return `w${sizes[0]?.width || 92}`
      case 'small':
        return `w${sizes[1]?.width || 154}`
      case 'medium':
        return `w${sizes[2]?.width || 300}`
      case 'large':
        return `w${sizes[3]?.width || 500}`
      case 'xlarge':
        return `w${sizes[4]?.width || 780}`
      default:
        return 'original'
    }
  }

  private determineImageTypeFromPath(imagePath: string): TMDBImageType {
    // Simple heuristic based on common path patterns
    // This could be enhanced with more sophisticated logic
    const lowerPath = imagePath.toLowerCase()
    
    if (lowerPath.includes('poster')) return TMDB_IMAGE_TYPES.POSTER
    if (lowerPath.includes('backdrop')) return TMDB_IMAGE_TYPES.BACKDROP
    if (lowerPath.includes('profile')) return TMDB_IMAGE_TYPES.PROFILE
    if (lowerPath.includes('logo')) return TMDB_IMAGE_TYPES.LOGO
    if (lowerPath.includes('still')) return TMDB_IMAGE_TYPES.STILL
    
    // Default to poster for unknown paths
    return TMDB_IMAGE_TYPES.POSTER
  }
}

/**
 * Factory function to create the TMDB images provider
 */
export const createTMDBImagesProvider = (
  tmdbService: ITMDBService,
  logger: ILoggingService,
  sourceId: string
): TMDBImagesProvider => {
  return new TMDBImagesProvider(tmdbService, logger, sourceId)
}