/**
 * Unified image structure for all media content
 *
 * Supports multiple image types and provides comprehensive
 * metadata for each image including dimensions and quality metrics
 */
export interface ImageItem {
  url: string
  aspectRatio: number
  width: number
  height: number
  language?: string
  voteAverage?: number
  voteCount?: number
  fileSize?: number
  format?: 'jpg' | 'png' | 'webp' | 'svg'
}

/**
 * Comprehensive image collection for media content
 */
export interface Images {
  posters?: ImageItem[]
  backdrops?: ImageItem[]
  logos?: ImageItem[]
  stills?: ImageItem[]
  clearart?: ImageItem[]
  banners?: ImageItem[]
  thumbs?: ImageItem[]
  [key: string]: ImageItem[] | undefined // Allow custom image types
}