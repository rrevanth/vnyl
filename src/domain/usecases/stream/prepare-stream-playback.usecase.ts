import { StreamWithPlayback } from '@/domain/entities/stream'
import { IStreamRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface PrepareStreamPlaybackRequest {
  streamId: string
  userId?: string
}

export interface PrepareStreamPlaybackResponse {
  stream: StreamWithPlayback
  preparationTime: number
}

/**
 * Use case for preparing a stream for playback
 * Handles URL validation, subtitle loading, and playback readiness
 */
export class PrepareStreamPlaybackUseCase {
  constructor(
    private readonly streamRepository: IStreamRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: PrepareStreamPlaybackRequest): Promise<PrepareStreamPlaybackResponse> {
    const { streamId, userId } = request

    // Validate input
    if (!streamId.trim()) {
      throw new Error('Stream ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log stream preparation
      this.loggingService.logStreamEvent('start', streamId, userId || 'anonymous', {
        action: 'prepare_playback'
      })

      const stream = await this.streamRepository.prepareStreamForPlayback(streamId)

      // Handle not found
      if (!stream) {
        this.loggingService.warn('Stream not found for playback preparation', {
          streamId,
          userId
        })
        throw new Error(`Stream with ID ${streamId} not found`)
      }

      // Validate stream can be played
      if (!stream.can_play) {
        this.loggingService.warn('Stream cannot be played', {
          streamId,
          userId,
          error: stream.error_message
        })
        throw new Error(stream.error_message || 'Stream is not available for playback')
      }

      // Validate playback URL
      const urlValidation = await this.streamRepository.validateStreamUrl(stream.playback_url)
      if (!urlValidation.valid) {
        this.loggingService.error('Stream URL validation failed', new Error(urlValidation.error || 'Invalid URL'), {
          streamId,
          playbackUrl: stream.playback_url,
          userId
        })
        throw new Error(`Stream URL is not valid: ${urlValidation.error}`)
      }

      // Log successful preparation
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('prepare_stream_playback', duration, {
        streamId,
        mediaId: stream.media_id,
        quality: stream.quality,
        subtitleTracks: stream.subtitle_tracks.length,
        userId
      })

      this.loggingService.info('Stream prepared for playback successfully', {
        streamId,
        mediaId: stream.media_id,
        quality: stream.quality,
        subtitleTracks: stream.subtitle_tracks.length,
        userId,
        duration_ms: duration
      })

      return {
        stream,
        preparationTime: duration
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to prepare stream for playback',
        error instanceof Error ? error : new Error(String(error)),
        {
          streamId,
          userId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}