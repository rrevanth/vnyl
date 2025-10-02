// Custom DI container pattern
import { 
  IStorageService, 
  ILoggingService 
} from '@/src/domain/services'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import {
  PlaylistEntity,
  PlaylistReference,
  PlaylistWithUserData,
  PlaylistActivity,
  PlaylistCollaborator
} from '@/src/domain/entities/playlist'

/**
 * Local data source for playlist data persistence
 * Handles all playlist-related storage operations
 */
export class PlaylistLocalDataSource {
  constructor(
    private readonly storage: IStorageService,
    private readonly logger: ILoggingService
  ) {}

  // Playlist CRUD operations
  async getPlaylist(playlistId: string): Promise<PlaylistEntity | null> {
    try {
      const playlist = await this.storage.getJson<PlaylistEntity>(`playlist:${playlistId}`)
      return playlist
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get playlist', errorInstance, { playlistId })
      return null
    }
  }

  async savePlaylist(playlist: PlaylistEntity): Promise<boolean> {
    try {
      await this.storage.setJson(`playlist:${playlist.id}`, playlist)
      
      // Update user playlists index
      await this.updateUserPlaylistsIndex(playlist.owner_user_id, playlist.id, 'add')
      
      // Update collaborator indexes
      if (playlist.collaborators) {
        await Promise.all(
          playlist.collaborators.map(collaborator =>
            this.updateUserPlaylistsIndex(collaborator.user_id, playlist.id, 'add')
          )
        )
      }
      
      this.logger.debug('Playlist saved successfully', { playlistId: playlist.id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to save playlist', errorInstance, { playlistId: playlist.id })
      return false
    }
  }

  async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      const playlist = await this.getPlaylist(playlistId)
      if (!playlist) return false
      
      // Remove playlist data
      await this.storage.remove(`playlist:${playlistId}`)
      
      // Update user playlists index
      await this.updateUserPlaylistsIndex(playlist.owner_user_id, playlistId, 'remove')
      
      // Update collaborator indexes
      if (playlist.collaborators) {
        await Promise.all(
          playlist.collaborators.map(collaborator =>
            this.updateUserPlaylistsIndex(collaborator.user_id, playlistId, 'remove')
          )
        )
      }
      
      // Clean up related data
      await this.cleanupPlaylistData(playlistId)
      
      this.logger.debug('Playlist deleted successfully', { playlistId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to delete playlist', errorInstance, { playlistId })
      return false
    }
  }

  // User playlist operations
  async getUserPlaylists(userId: string, includeCollaborative = true): Promise<string[]> {
    try {
      const ownedPlaylists = await this.storage.getJson<string[]>(`user:${userId}:playlists:owned`) || []
      
      if (!includeCollaborative) {
        return ownedPlaylists
      }
      
      const collaborativePlaylists = await this.storage.getJson<string[]>(`user:${userId}:playlists:collaborative`) || []
      
      // Combine and deduplicate
      const allPlaylists = [...new Set([...ownedPlaylists, ...collaborativePlaylists])]
      return allPlaylists
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user playlists', errorInstance, { userId })
      return []
    }
  }

  async getUserOwnedPlaylists(userId: string): Promise<string[]> {
    try {
      const playlists = await this.storage.getJson<string[]>(`user:${userId}:playlists:owned`) || []
      return playlists
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user owned playlists', errorInstance, { userId })
      return []
    }
  }

  async getUserCollaborativePlaylists(userId: string): Promise<string[]> {
    try {
      const playlists = await this.storage.getJson<string[]>(`user:${userId}:playlists:collaborative`) || []
      return playlists
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user collaborative playlists', errorInstance, { userId })
      return []
    }
  }

  // Playlist collaboration
  async addCollaborator(playlistId: string, collaborator: PlaylistCollaborator): Promise<boolean> {
    try {
      const playlist = await this.getPlaylist(playlistId)
      if (!playlist) return false
      
      // Check if collaborator already exists
      const existingIndex = playlist.collaborators?.findIndex(c => c.user_id === collaborator.user_id) ?? -1
      
      if (existingIndex >= 0 && playlist.collaborators) {
        // Update existing collaborator
        playlist.collaborators[existingIndex] = collaborator
      } else {
        // Add new collaborator
        if (!playlist.collaborators) {
          playlist.collaborators = []
        }
        playlist.collaborators.push(collaborator)
      }
      
      await this.savePlaylist(playlist)
      
      // Update collaborator's playlist index
      await this.updateUserPlaylistsIndex(collaborator.user_id, playlistId, 'add')
      
      this.logger.debug('Collaborator added', { playlistId, userId: collaborator.user_id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add collaborator', errorInstance, { playlistId, userId: collaborator.user_id })
      return false
    }
  }

  async removeCollaborator(playlistId: string, userId: string): Promise<boolean> {
    try {
      const playlist = await this.getPlaylist(playlistId)
      if (!playlist || !playlist.collaborators) return false
      
      playlist.collaborators = playlist.collaborators.filter(c => c.user_id !== userId)
      
      await this.savePlaylist(playlist)
      
      // Update collaborator's playlist index
      await this.updateUserPlaylistsIndex(userId, playlistId, 'remove')
      
      this.logger.debug('Collaborator removed', { playlistId, userId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove collaborator', errorInstance, { playlistId, userId })
      return false
    }
  }

  // Social features
  async getPlaylistLikes(playlistId: string): Promise<string[]> {
    try {
      const likes = await this.storage.getJson<string[]>(`playlist:${playlistId}:likes`) || []
      return likes
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get playlist likes', errorInstance, { playlistId })
      return []
    }
  }

  async likePlaylist(playlistId: string, userId: string): Promise<boolean> {
    try {
      const likes = await this.getPlaylistLikes(playlistId)
      
      if (!likes.includes(userId)) {
        likes.push(userId)
        await this.storage.setJson(`playlist:${playlistId}:likes`, likes)
        
        // Update user's liked playlists
        const userLikes = await this.storage.getJson<string[]>(`user:${userId}:liked_playlists`) || []
        if (!userLikes.includes(playlistId)) {
          userLikes.push(playlistId)
          await this.storage.setJson(`user:${userId}:liked_playlists`, userLikes)
        }
        
        this.logger.debug('Playlist liked', { playlistId, userId })
      }
      
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to like playlist', errorInstance, { playlistId, userId })
      return false
    }
  }

  async unlikePlaylist(playlistId: string, userId: string): Promise<boolean> {
    try {
      const likes = await this.getPlaylistLikes(playlistId)
      const filteredLikes = likes.filter(id => id !== userId)
      
      await this.storage.setJson(`playlist:${playlistId}:likes`, filteredLikes)
      
      // Update user's liked playlists
      const userLikes = await this.storage.getJson<string[]>(`user:${userId}:liked_playlists`) || []
      const filteredUserLikes = userLikes.filter(id => id !== playlistId)
      await this.storage.setJson(`user:${userId}:liked_playlists`, filteredUserLikes)
      
      this.logger.debug('Playlist unliked', { playlistId, userId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to unlike playlist', errorInstance, { playlistId, userId })
      return false
    }
  }

  async getPlaylistFollowers(playlistId: string): Promise<string[]> {
    try {
      const followers = await this.storage.getJson<string[]>(`playlist:${playlistId}:followers`) || []
      return followers
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get playlist followers', errorInstance, { playlistId })
      return []
    }
  }

  async followPlaylist(playlistId: string, userId: string): Promise<boolean> {
    try {
      const followers = await this.getPlaylistFollowers(playlistId)
      
      if (!followers.includes(userId)) {
        followers.push(userId)
        await this.storage.setJson(`playlist:${playlistId}:followers`, followers)
        
        // Update user's followed playlists
        const userFollows = await this.storage.getJson<string[]>(`user:${userId}:followed_playlists`) || []
        if (!userFollows.includes(playlistId)) {
          userFollows.push(playlistId)
          await this.storage.setJson(`user:${userId}:followed_playlists`, userFollows)
        }
        
        this.logger.debug('Playlist followed', { playlistId, userId })
      }
      
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to follow playlist', errorInstance, { playlistId, userId })
      return false
    }
  }

  async unfollowPlaylist(playlistId: string, userId: string): Promise<boolean> {
    try {
      const followers = await this.getPlaylistFollowers(playlistId)
      const filteredFollowers = followers.filter(id => id !== userId)
      
      await this.storage.setJson(`playlist:${playlistId}:followers`, filteredFollowers)
      
      // Update user's followed playlists
      const userFollows = await this.storage.getJson<string[]>(`user:${userId}:followed_playlists`) || []
      const filteredUserFollows = userFollows.filter(id => id !== playlistId)
      await this.storage.setJson(`user:${userId}:followed_playlists`, filteredUserFollows)
      
      this.logger.debug('Playlist unfollowed', { playlistId, userId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to unfollow playlist', errorInstance, { playlistId, userId })
      return false
    }
  }

  // Activity tracking
  async getPlaylistActivity(playlistId: string, limit = 50): Promise<PlaylistActivity[]> {
    try {
      const activities = await this.storage.getJson<PlaylistActivity[]>(`playlist:${playlistId}:activity`) || []
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get playlist activity', errorInstance, { playlistId })
      return []
    }
  }

  async addPlaylistActivity(activity: PlaylistActivity): Promise<boolean> {
    try {
      const activities = await this.storage.getJson<PlaylistActivity[]>(`playlist:${activity.playlist_id}:activity`) || []
      
      activities.unshift(activity) // Add to beginning
      
      // Keep only last 100 activities
      const limitedActivities = activities.slice(0, 100)
      
      await this.storage.setJson(`playlist:${activity.playlist_id}:activity`, limitedActivities)
      this.logger.debug('Playlist activity added', { playlistId: activity.playlist_id, type: activity.action })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add playlist activity', errorInstance, { 
        playlistId: activity.playlist_id, 
        type: activity.action 
      })
      return false
    }
  }

  async getUserPlaylistActivity(userId: string, limit = 50): Promise<PlaylistActivity[]> {
    try {
      const playlistIds = await this.getUserPlaylists(userId, true)
      
      const allActivities: PlaylistActivity[] = []
      
      await Promise.all(
        playlistIds.map(async (playlistId) => {
          const activities = await this.getPlaylistActivity(playlistId, limit)
          allActivities.push(...activities)
        })
      )
      
      // Sort by timestamp and limit
      return allActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user playlist activity', errorInstance, { userId })
      return []
    }
  }

  // Statistics
  async getPlaylistStats(playlistId: string): Promise<{
    view_count: number
    like_count: number
    share_count: number
    fork_count: number
  }> {
    try {
      const stats = await this.storage.getJson<{
        view_count: number
        like_count: number
        share_count: number
        fork_count: number
      }>(`playlist:${playlistId}:stats`)
      
      if (!stats) {
        return {
          view_count: 0,
          like_count: 0,
          share_count: 0,
          fork_count: 0
        }
      }
      
      return stats
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get playlist stats', errorInstance, { playlistId })
      return {
        view_count: 0,
        like_count: 0,
        share_count: 0,
        fork_count: 0
      }
    }
  }

  async updatePlaylistStats(playlistId: string, updates: Partial<{
    view_count: number
    like_count: number
    share_count: number
    fork_count: number
  }>): Promise<boolean> {
    try {
      const currentStats = await this.getPlaylistStats(playlistId)
      const newStats = { ...currentStats, ...updates }
      
      await this.storage.setJson(`playlist:${playlistId}:stats`, newStats)
      this.logger.debug('Playlist stats updated', { playlistId, updates })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update playlist stats', errorInstance, { playlistId })
      return false
    }
  }

  async incrementViewCount(playlistId: string): Promise<boolean> {
    try {
      const stats = await this.getPlaylistStats(playlistId)
      return await this.updatePlaylistStats(playlistId, {
        view_count: stats.view_count + 1
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to increment view count', errorInstance, { playlistId })
      return false
    }
  }

  // Search and discovery operations
  async getAllPublicPlaylists(): Promise<string[]> {
    try {
      const publicPlaylists = await this.storage.getJson<string[]>('public_playlists') || []
      return publicPlaylists
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get public playlists', errorInstance)
      return []
    }
  }

  async addToPublicPlaylists(playlistId: string): Promise<boolean> {
    try {
      const publicPlaylists = await this.getAllPublicPlaylists()
      
      if (!publicPlaylists.includes(playlistId)) {
        publicPlaylists.push(playlistId)
        await this.storage.setJson('public_playlists', publicPlaylists)
        this.logger.debug('Added to public playlists', { playlistId })
      }
      
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add to public playlists', errorInstance, { playlistId })
      return false
    }
  }

  async removeFromPublicPlaylists(playlistId: string): Promise<boolean> {
    try {
      const publicPlaylists = await this.getAllPublicPlaylists()
      const filteredPlaylists = publicPlaylists.filter(id => id !== playlistId)
      
      await this.storage.setJson('public_playlists', filteredPlaylists)
      this.logger.debug('Removed from public playlists', { playlistId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove from public playlists', errorInstance, { playlistId })
      return false
    }
  }

  // Helper methods
  private async updateUserPlaylistsIndex(
    userId: string, 
    playlistId: string, 
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylist(playlistId)
      if (!playlist) return
      
      const isOwner = playlist.owner_user_id === userId
      const isCollaborator = playlist.collaborators?.some(c => c.user_id === userId) || false
      
      if (isOwner) {
        const ownedPlaylists = await this.storage.getJson<string[]>(`user:${userId}:playlists:owned`) || []
        
        if (action === 'add' && !ownedPlaylists.includes(playlistId)) {
          ownedPlaylists.push(playlistId)
          await this.storage.setJson(`user:${userId}:playlists:owned`, ownedPlaylists)
        } else if (action === 'remove') {
          const filteredPlaylists = ownedPlaylists.filter(id => id !== playlistId)
          await this.storage.setJson(`user:${userId}:playlists:owned`, filteredPlaylists)
        }
      }
      
      if (isCollaborator) {
        const collaborativePlaylists = await this.storage.getJson<string[]>(`user:${userId}:playlists:collaborative`) || []
        
        if (action === 'add' && !collaborativePlaylists.includes(playlistId)) {
          collaborativePlaylists.push(playlistId)
          await this.storage.setJson(`user:${userId}:playlists:collaborative`, collaborativePlaylists)
        } else if (action === 'remove') {
          const filteredPlaylists = collaborativePlaylists.filter(id => id !== playlistId)
          await this.storage.setJson(`user:${userId}:playlists:collaborative`, filteredPlaylists)
        }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update user playlists index', errorInstance, { userId, playlistId, action })
    }
  }

  private async cleanupPlaylistData(playlistId: string): Promise<void> {
    try {
      const keysToRemove = [
        `playlist:${playlistId}:likes`,
        `playlist:${playlistId}:followers`,
        `playlist:${playlistId}:activity`,
        `playlist:${playlistId}:stats`
      ]
      
      await Promise.all(keysToRemove.map(key => this.storage.remove(key)))
      
      this.logger.debug('Playlist data cleaned up', { playlistId })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to cleanup playlist data', errorInstance, { playlistId })
    }
  }
}