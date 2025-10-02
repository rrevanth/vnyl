import { PlaylistEntity, PlaylistCreateUpdate, PlaylistItemAdd } from '@/domain/entities/playlist'
import { IPlaylistRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface CreatePlaylistRequest {
  userId: string
  playlist: PlaylistCreateUpdate
}

export interface AddItemToPlaylistRequest {
  playlistId: string
  userId: string
  item: PlaylistItemAdd
}

export interface RemoveItemFromPlaylistRequest {
  playlistId: string
  userId: string
  mediaId: string
}

/**
 * Use case for managing playlists and their items
 * Handles playlist creation, item management, and validation
 */
export class ManagePlaylistUseCase {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async createPlaylist(request: CreatePlaylistRequest): Promise<PlaylistEntity> {
    const { userId, playlist } = request

    // Validate input
    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (!playlist.name.trim()) {
      throw new Error('Playlist name cannot be empty')
    }

    if (playlist.name.length > 100) {
      throw new Error('Playlist name cannot exceed 100 characters')
    }

    if (playlist.description && playlist.description.length > 500) {
      throw new Error('Playlist description cannot exceed 500 characters')
    }

    const startTime = Date.now()

    try {
      // Log playlist creation
      this.loggingService.logUserAction('create_playlist', userId, {
        playlistName: playlist.name,
        visibility: playlist.visibility
      })

      const createdPlaylist = await this.playlistRepository.create(userId, playlist)

      // Log successful creation
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('create_playlist', duration, {
        userId,
        playlistId: createdPlaylist.id,
        playlistName: createdPlaylist.name
      })

      this.loggingService.info('Playlist created successfully', {
        userId,
        playlistId: createdPlaylist.id,
        playlistName: createdPlaylist.name,
        visibility: createdPlaylist.visibility,
        duration_ms: duration
      })

      return createdPlaylist
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to create playlist',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          playlistName: playlist.name,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  async addItemToPlaylist(request: AddItemToPlaylistRequest): Promise<boolean> {
    const { playlistId, userId, item } = request

    // Validate input
    if (!playlistId.trim()) {
      throw new Error('Playlist ID cannot be empty')
    }

    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (!item.media_id.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log item addition
      this.loggingService.logUserAction('add_playlist_item', userId, {
        playlistId,
        mediaId: item.media_id,
        mediaType: item.media_type
      })

      // Check if playlist exists and user has permission
      const playlist = await this.playlistRepository.findById(playlistId, userId)
      if (!playlist) {
        throw new Error('Playlist not found or access denied')
      }

      // Check if item already exists (if duplicates not allowed)
      if (!playlist.allow_duplicates) {
        const existingItem = playlist.items.find(existingItem => existingItem.media_id === item.media_id)
        if (existingItem) {
          throw new Error('Item already exists in playlist and duplicates are not allowed')
        }
      }

      const success = await this.playlistRepository.addItem(playlistId, userId, item)

      if (!success) {
        throw new Error('Failed to add item to playlist')
      }

      // Log successful addition
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('add_playlist_item', duration, {
        userId,
        playlistId,
        mediaId: item.media_id
      })

      this.loggingService.info('Item added to playlist successfully', {
        userId,
        playlistId,
        mediaId: item.media_id,
        mediaType: item.media_type,
        duration_ms: duration
      })

      return true
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to add item to playlist',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          playlistId,
          mediaId: item.media_id,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  async removeItemFromPlaylist(request: RemoveItemFromPlaylistRequest): Promise<boolean> {
    const { playlistId, userId, mediaId } = request

    // Validate input
    if (!playlistId.trim()) {
      throw new Error('Playlist ID cannot be empty')
    }

    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    if (!mediaId.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log item removal
      this.loggingService.logUserAction('remove_playlist_item', userId, {
        playlistId,
        mediaId
      })

      // Check if playlist exists and user has permission
      const playlist = await this.playlistRepository.findById(playlistId, userId)
      if (!playlist) {
        throw new Error('Playlist not found or access denied')
      }

      // Check if item exists in playlist
      const existingItem = playlist.items.find(item => item.media_id === mediaId)
      if (!existingItem) {
        throw new Error('Item not found in playlist')
      }

      const success = await this.playlistRepository.removeItem(playlistId, userId, mediaId)

      if (!success) {
        throw new Error('Failed to remove item from playlist')
      }

      // Log successful removal
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('remove_playlist_item', duration, {
        userId,
        playlistId,
        mediaId
      })

      this.loggingService.info('Item removed from playlist successfully', {
        userId,
        playlistId,
        mediaId,
        duration_ms: duration
      })

      return true
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to remove item from playlist',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          playlistId,
          mediaId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  async deletePlaylist(playlistId: string, userId: string): Promise<boolean> {
    // Validate input
    if (!playlistId.trim()) {
      throw new Error('Playlist ID cannot be empty')
    }

    if (!userId.trim()) {
      throw new Error('User ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log playlist deletion
      this.loggingService.logUserAction('delete_playlist', userId, {
        playlistId
      })

      // Check if playlist exists and user is owner
      const playlist = await this.playlistRepository.findById(playlistId, userId)
      if (!playlist) {
        throw new Error('Playlist not found or access denied')
      }

      if (playlist.owner_user_id !== userId) {
        throw new Error('Only playlist owner can delete the playlist')
      }

      const success = await this.playlistRepository.delete(playlistId, userId)

      if (!success) {
        throw new Error('Failed to delete playlist')
      }

      // Log successful deletion
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('delete_playlist', duration, {
        userId,
        playlistId
      })

      this.loggingService.info('Playlist deleted successfully', {
        userId,
        playlistId,
        playlistName: playlist.name,
        duration_ms: duration
      })

      return true
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to delete playlist',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          playlistId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}