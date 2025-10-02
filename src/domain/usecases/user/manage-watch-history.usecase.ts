import { UserWatchHistoryEntry } from '@/domain/entities/user'
import { IUserRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface AddToWatchHistoryRequest {
  userId: string
  mediaId: string
  mediaType: 'movie' | 'series'
  mediaTitle: string
  season?: number
  episode?: number
  progressSeconds: number
  durationSeconds: number
}

export interface UpdateWatchProgressRequest {
  userId: string
  mediaId: string
  progressSeconds: number
  season?: number
  episode?: number
}

export interface GetWatchHistoryRequest {
  userId: string
  limit?: number
  offset?: number
}

export interface GetWatchHistoryResponse {
  entries: UserWatchHistoryEntry[]
  total: number
  hasMore: boolean
}

/**
 * Use case for managing user watch history
 * Handles adding, updating, and retrieving watch progress
 */
export class ManageWatchHistoryUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async addToWatchHistory(request: AddToWatchHistoryRequest): Promise<UserWatchHistoryEntry> {
    const { userId, mediaId, mediaType, mediaTitle, season, episode, progressSeconds, durationSeconds } = request

    // Validate input
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (!mediaId.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    if (progressSeconds < 0 || durationSeconds <= 0) {
      throw new Error('Invalid progress or duration values')
    }

    if (progressSeconds > durationSeconds) {
      throw new Error('Progress cannot exceed duration')
    }

    const startTime = Date.now()

    try {
      // Log watch activity
      this.loggingService.logMediaInteraction('play', mediaId, userId, {
        mediaType,
        mediaTitle,
        season,
        episode,
        progressSeconds,
        durationSeconds,
        progressPercentage: (progressSeconds / durationSeconds) * 100
      })

      const completed = progressSeconds >= durationSeconds * 0.9 // 90% completion threshold

      const watchEntry = await this.userRepository.addToWatchHistory(userId, {
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        season,
        episode,
        progress_seconds: progressSeconds,
        duration_seconds: durationSeconds,
        last_watched_at: new Date().toISOString(),
        completed
      })

      // Log successful addition
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('add_to_watch_history', duration, {
        userId,
        mediaId,
        mediaType,
        completed
      })

      this.loggingService.info('Added to watch history successfully', {
        userId,
        mediaId,
        mediaTitle,
        progressPercentage: (progressSeconds / durationSeconds) * 100,
        completed,
        duration_ms: duration
      })

      return watchEntry
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to add to watch history',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          mediaId,
          mediaType,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  async updateWatchProgress(request: UpdateWatchProgressRequest): Promise<UserWatchHistoryEntry | null> {
    const { userId, mediaId, progressSeconds, season, episode } = request

    // Validate input
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (!mediaId.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    if (progressSeconds < 0) {
      throw new Error('Progress cannot be negative')
    }

    const startTime = Date.now()

    try {
      // Log progress update
      this.loggingService.logMediaInteraction('seek', mediaId, userId, {
        progressSeconds,
        season,
        episode
      })

      const updatedEntry = await this.userRepository.updateWatchProgress(
        userId,
        mediaId,
        progressSeconds,
        season,
        episode
      )

      if (!updatedEntry) {
        this.loggingService.warn('Watch history entry not found for progress update', {
          userId,
          mediaId,
          season,
          episode
        })
        return null
      }

      // Log successful update
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('update_watch_progress', duration, {
        userId,
        mediaId,
        progressSeconds
      })

      this.loggingService.info('Watch progress updated successfully', {
        userId,
        mediaId,
        progressSeconds,
        progressPercentage: (progressSeconds / updatedEntry.duration_seconds) * 100,
        duration_ms: duration
      })

      return updatedEntry
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to update watch progress',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          mediaId,
          progressSeconds,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  async getWatchHistory(request: GetWatchHistoryRequest): Promise<GetWatchHistoryResponse> {
    const { userId, limit = 20, offset = 0 } = request

    // Validate input
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (limit <= 0 || limit > 100) {
      throw new Error('Limit must be between 1 and 100')
    }

    if (offset < 0) {
      throw new Error('Offset cannot be negative')
    }

    const startTime = Date.now()

    try {
      // Log watch history access
      this.loggingService.logUserAction('view_watch_history', userId, {
        limit,
        offset
      })

      const result = await this.userRepository.getWatchHistory(userId, limit, offset)

      const hasMore = offset + result.entries.length < result.total

      // Log successful retrieval
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('get_watch_history', duration, {
        userId,
        entriesReturned: result.entries.length,
        totalEntries: result.total
      })

      this.loggingService.info('Watch history retrieved successfully', {
        userId,
        entriesReturned: result.entries.length,
        totalEntries: result.total,
        hasMore,
        duration_ms: duration
      })

      return {
        entries: result.entries,
        total: result.total,
        hasMore
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to get watch history',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          limit,
          offset,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  async getContinueWatching(userId: string, limit: number = 10): Promise<UserWatchHistoryEntry[]> {
    // Validate input
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (limit <= 0 || limit > 50) {
      throw new Error('Limit must be between 1 and 50')
    }

    const startTime = Date.now()

    try {
      // Log continue watching access
      this.loggingService.logUserAction('view_continue_watching', userId, {
        limit
      })

      const entries = await this.userRepository.getContinueWatching(userId, limit)

      // Log successful retrieval
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('get_continue_watching', duration, {
        userId,
        entriesReturned: entries.length
      })

      this.loggingService.info('Continue watching retrieved successfully', {
        userId,
        entriesReturned: entries.length,
        duration_ms: duration
      })

      return entries
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to get continue watching',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          limit,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}