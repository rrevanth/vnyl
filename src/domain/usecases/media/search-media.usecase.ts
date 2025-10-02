import { MediaSearchResult, MediaType } from '@/domain/entities/media'
import { IMediaRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface SearchMediaRequest {
  query: string
  type?: MediaType
  page?: number
  userId?: string
}

export interface SearchMediaResponse {
  results: MediaSearchResult[]
  total_results: number
  total_pages: number
  page: number
  query: string
}

/**
 * Use case for searching media content across different types
 * Handles search optimization, logging, and result formatting
 */
export class SearchMediaUseCase {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: SearchMediaRequest): Promise<SearchMediaResponse> {
    const { query, type, page = 1, userId } = request

    // Validate input
    if (!query.trim()) {
      throw new Error('Search query cannot be empty')
    }

    if (query.length < 2) {
      throw new Error('Search query must be at least 2 characters long')
    }

    const startTime = Date.now()

    try {
      // Log search activity
      this.loggingService.logSearchActivity(query, userId)

      // Perform search
      const searchResult = await this.mediaRepository.search(query.trim(), type, page)

      // Log performance
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('media_search', duration, {
        query,
        type,
        page,
        results_count: searchResult.results.length,
        userId
      })

      // Log successful search
      this.loggingService.info('Media search completed successfully', {
        query,
        type,
        page,
        results_count: searchResult.results.length,
        duration_ms: duration,
        userId
      })

      return {
        ...searchResult,
        query: query.trim()
      }
    } catch (error) {
      // Log search error
      this.loggingService.error(
        'Media search failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          query,
          type,
          page,
          userId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}