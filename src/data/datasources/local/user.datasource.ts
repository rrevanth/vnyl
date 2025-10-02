// Custom DI container pattern
import { 
  IStorageService, 
  ILoggingService 
} from '@/src/domain/services'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import {
  UserEntity,
  UserSession,
  UserWatchHistoryEntry,
  UserFavorite,
  UserWatchlist,
  UserRating,
  UserDownload,
  UserProfile,
  UserStats
} from '@/src/domain/entities/user'

/**
 * Local data source for user data persistence
 * Handles all user-related storage operations
 */
export class UserLocalDataSource {
  constructor(
    private readonly storage: IStorageService,
    private readonly logger: ILoggingService
  ) {}

  // User management
  async getUser(userId: string): Promise<UserEntity | null> {
    try {
      const userData = await this.storage.getJson<UserEntity>(`user:${userId}`)
      return userData
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user', errorInstance, { userId })
      return null
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      // Get email-to-userId mapping
      const userId = await this.storage.get<string>(`email:${email}`)
      if (!userId) return null
      
      return await this.getUser(userId)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user by email', errorInstance, { email })
      return null
    }
  }

  async getUserByUsername(username: string): Promise<UserEntity | null> {
    try {
      // Get username-to-userId mapping
      const userId = await this.storage.get<string>(`username:${username}`)
      if (!userId) return null
      
      return await this.getUser(userId)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user by username', errorInstance, { username })
      return null
    }
  }

  async saveUser(user: UserEntity): Promise<boolean> {
    try {
      // Save user data
      await this.storage.setJson(`user:${user.id}`, user)
      
      // Create email mapping
      await this.storage.set(`email:${user.email}`, user.id)
      
      // Create username mapping
      await this.storage.set(`username:${user.username}`, user.id)
      
      this.logger.debug('User saved successfully', { userId: user.id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to save user', errorInstance, { userId: user.id })
      return false
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.getUser(userId)
      if (!user) return false
      
      // Remove user data
      await this.storage.remove(`user:${userId}`)
      
      // Remove email mapping
      await this.storage.remove(`email:${user.email}`)
      
      // Remove username mapping
      await this.storage.remove(`username:${user.username}`)
      
      // Clean up related data
      await this.cleanupUserData(userId)
      
      this.logger.debug('User deleted successfully', { userId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to delete user', errorInstance, { userId })
      return false
    }
  }

  // User profiles
  async getUserProfiles(userId: string): Promise<UserProfile[]> {
    try {
      const profiles = await this.storage.getJson<UserProfile[]>(`user:${userId}:profiles`) || []
      return profiles
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user profiles', errorInstance, { userId })
      return []
    }
  }

  async saveUserProfile(userId: string, profile: UserProfile): Promise<boolean> {
    try {
      const profiles = await this.getUserProfiles(userId)
      const existingIndex = profiles.findIndex(p => p.id === profile.id)
      
      if (existingIndex >= 0) {
        profiles[existingIndex] = profile
      } else {
        profiles.push(profile)
      }
      
      await this.storage.setJson(`user:${userId}:profiles`, profiles)
      this.logger.debug('User profile saved', { userId, profileId: profile.id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to save user profile', errorInstance, { userId, profileId: profile.id })
      return false
    }
  }

  async deleteUserProfile(userId: string, profileId: string): Promise<boolean> {
    try {
      const profiles = await this.getUserProfiles(userId)
      const filteredProfiles = profiles.filter(p => p.id !== profileId)
      
      await this.storage.setJson(`user:${userId}:profiles`, filteredProfiles)
      this.logger.debug('User profile deleted', { userId, profileId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to delete user profile', errorInstance, { userId, profileId })
      return false
    }
  }

  // Watch history
  async getWatchHistory(userId: string, limit?: number, offset = 0): Promise<{ entries: UserWatchHistoryEntry[], total: number }> {
    try {
      const allEntries = await this.storage.getJson<UserWatchHistoryEntry[]>(`user:${userId}:watchHistory`) || []
      const sortedEntries = allEntries.sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())
      
      const total = sortedEntries.length
      const entries = limit ? sortedEntries.slice(offset, offset + limit) : sortedEntries.slice(offset)
      
      return { entries, total }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get watch history', errorInstance, { userId })
      return { entries: [], total: 0 }
    }
  }

  async addToWatchHistory(userId: string, entry: UserWatchHistoryEntry): Promise<boolean> {
    try {
      const history = await this.storage.getJson<UserWatchHistoryEntry[]>(`user:${userId}:watchHistory`) || []
      
      // Remove existing entry for same media/episode if exists
      const filteredHistory = history.filter(h => {
        if (h.media_id !== entry.media_id) return true
        if (entry.season && entry.episode) {
          return !(h.season === entry.season && h.episode === entry.episode)
        }
        return false
      })
      
      filteredHistory.unshift(entry) // Add to beginning
      
      // Keep only last 1000 entries
      const limitedHistory = filteredHistory.slice(0, 1000)
      
      await this.storage.setJson(`user:${userId}:watchHistory`, limitedHistory)
      this.logger.debug('Added to watch history', { userId, mediaId: entry.media_id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add to watch history', errorInstance, { userId, mediaId: entry.media_id })
      return false
    }
  }

  async updateWatchProgress(userId: string, entryId: string, progressSeconds: number): Promise<UserWatchHistoryEntry | null> {
    try {
      const history = await this.storage.getJson<UserWatchHistoryEntry[]>(`user:${userId}:watchHistory`) || []
      const entryIndex = history.findIndex(h => h.id === entryId)
      
      if (entryIndex === -1) return null
      
      history[entryIndex].progress_seconds = progressSeconds
      history[entryIndex].last_watched_at = new Date().toISOString()
      
      await this.storage.setJson(`user:${userId}:watchHistory`, history)
      return history[entryIndex]
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update watch progress', errorInstance, { userId, entryId })
      return null
    }
  }

  async clearWatchHistory(userId: string): Promise<boolean> {
    try {
      await this.storage.remove(`user:${userId}:watchHistory`)
      this.logger.debug('Watch history cleared', { userId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to clear watch history', errorInstance, { userId })
      return false
    }
  }

  // Favorites
  async getFavorites(userId: string): Promise<UserFavorite[]> {
    try {
      const favorites = await this.storage.getJson<UserFavorite[]>(`user:${userId}:favorites`) || []
      return favorites.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get favorites', errorInstance, { userId })
      return []
    }
  }

  async addToFavorites(userId: string, favorite: UserFavorite): Promise<boolean> {
    try {
      const favorites = await this.getFavorites(userId)
      
      // Check if already exists
      const existingIndex = favorites.findIndex(f => f.media_id === favorite.media_id)
      if (existingIndex >= 0) return true // Already exists
      
      favorites.unshift(favorite) // Add to beginning
      
      await this.storage.setJson(`user:${userId}:favorites`, favorites)
      this.logger.debug('Added to favorites', { userId, mediaId: favorite.media_id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add to favorites', errorInstance, { userId, mediaId: favorite.media_id })
      return false
    }
  }

  async removeFromFavorites(userId: string, mediaId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites(userId)
      const filteredFavorites = favorites.filter(f => f.media_id !== mediaId)
      
      await this.storage.setJson(`user:${userId}:favorites`, filteredFavorites)
      this.logger.debug('Removed from favorites', { userId, mediaId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove from favorites', errorInstance, { userId, mediaId })
      return false
    }
  }

  // Watchlist
  async getWatchlist(userId: string): Promise<UserWatchlist[]> {
    try {
      const watchlist = await this.storage.getJson<UserWatchlist[]>(`user:${userId}:watchlist`) || []
      return watchlist.sort((a, b) => {
        // Sort by priority first, then by added date
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const aPriority = priorityOrder[a.priority] || 1
        const bPriority = priorityOrder[b.priority] || 1
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get watchlist', errorInstance, { userId })
      return []
    }
  }

  async addToWatchlist(userId: string, item: UserWatchlist): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist(userId)
      
      // Check if already exists
      const existingIndex = watchlist.findIndex(w => w.media_id === item.media_id)
      if (existingIndex >= 0) return true // Already exists
      
      watchlist.push(item)
      
      await this.storage.setJson(`user:${userId}:watchlist`, watchlist)
      this.logger.debug('Added to watchlist', { userId, mediaId: item.media_id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add to watchlist', errorInstance, { userId, mediaId: item.media_id })
      return false
    }
  }

  async removeFromWatchlist(userId: string, mediaId: string): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist(userId)
      const filteredWatchlist = watchlist.filter(w => w.media_id !== mediaId)
      
      await this.storage.setJson(`user:${userId}:watchlist`, filteredWatchlist)
      this.logger.debug('Removed from watchlist', { userId, mediaId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove from watchlist', errorInstance, { userId, mediaId })
      return false
    }
  }

  async updateWatchlistPriority(userId: string, mediaId: string, priority: 'low' | 'medium' | 'high'): Promise<UserWatchlist | null> {
    try {
      const watchlist = await this.getWatchlist(userId)
      const itemIndex = watchlist.findIndex(w => w.media_id === mediaId)
      
      if (itemIndex === -1) return null
      
      watchlist[itemIndex].priority = priority
      
      await this.storage.setJson(`user:${userId}:watchlist`, watchlist)
      return watchlist[itemIndex]
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update watchlist priority', errorInstance, { userId, mediaId })
      return null
    }
  }

  // Ratings
  async getUserRatings(userId: string): Promise<UserRating[]> {
    try {
      const ratings = await this.storage.getJson<UserRating[]>(`user:${userId}:ratings`) || []
      return ratings.sort((a, b) => new Date(b.rated_at).getTime() - new Date(a.rated_at).getTime())
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user ratings', errorInstance, { userId })
      return []
    }
  }

  async addRating(userId: string, rating: UserRating): Promise<boolean> {
    try {
      const ratings = await this.getUserRatings(userId)
      
      // Remove existing rating for same media
      const filteredRatings = ratings.filter(r => r.media_id !== rating.media_id)
      filteredRatings.unshift(rating) // Add to beginning
      
      await this.storage.setJson(`user:${userId}:ratings`, filteredRatings)
      this.logger.debug('Rating added', { userId, mediaId: rating.media_id, rating: rating.rating })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add rating', errorInstance, { userId, mediaId: rating.media_id })
      return false
    }
  }

  async removeRating(userId: string, mediaId: string): Promise<boolean> {
    try {
      const ratings = await this.getUserRatings(userId)
      const filteredRatings = ratings.filter(r => r.media_id !== mediaId)
      
      await this.storage.setJson(`user:${userId}:ratings`, filteredRatings)
      this.logger.debug('Rating removed', { userId, mediaId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove rating', errorInstance, { userId, mediaId })
      return false
    }
  }

  // Downloads
  async getDownloads(userId: string): Promise<UserDownload[]> {
    try {
      const downloads = await this.storage.getJson<UserDownload[]>(`user:${userId}:downloads`) || []
      return downloads.sort((a, b) => new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime())
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get downloads', errorInstance, { userId })
      return []
    }
  }

  async addDownload(userId: string, download: UserDownload): Promise<boolean> {
    try {
      const downloads = await this.getDownloads(userId)
      downloads.unshift(download) // Add to beginning
      
      await this.storage.setJson(`user:${userId}:downloads`, downloads)
      this.logger.debug('Download added', { userId, downloadId: download.id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to add download', errorInstance, { userId, downloadId: download.id })
      return false
    }
  }

  async removeDownload(userId: string, downloadId: string): Promise<boolean> {
    try {
      const downloads = await this.getDownloads(userId)
      const filteredDownloads = downloads.filter(d => d.id !== downloadId)
      
      await this.storage.setJson(`user:${userId}:downloads`, filteredDownloads)
      this.logger.debug('Download removed', { userId, downloadId })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove download', errorInstance, { userId, downloadId })
      return false
    }
  }

  // Sessions
  async saveSession(session: UserSession): Promise<boolean> {
    try {
      await this.storage.setJson(`session:${session.id}`, session)
      
      // Add to user sessions list
      const userSessions = await this.storage.getJson<string[]>(`user:${session.user_id}:sessions`) || []
      if (!userSessions.includes(session.id)) {
        userSessions.push(session.id)
        await this.storage.setJson(`user:${session.user_id}:sessions`, userSessions)
      }
      
      this.logger.debug('Session saved', { sessionId: session.id, userId: session.user_id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to save session', errorInstance, { sessionId: session.id })
      return false
    }
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      const session = await this.storage.getJson<UserSession>(`session:${sessionId}`)
      return session
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get session', errorInstance, { sessionId })
      return null
    }
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const sessionIds = await this.storage.getJson<string[]>(`user:${userId}:sessions`) || []
      const sessions = await Promise.all(
        sessionIds.map(id => this.getSession(id))
      )
      
      return sessions.filter(Boolean) as UserSession[]
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get user sessions', errorInstance, { userId })
      return []
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId)
      if (!session) return false
      
      // Remove session
      await this.storage.remove(`session:${sessionId}`)
      
      // Remove from user sessions list
      const userSessions = await this.storage.getJson<string[]>(`user:${session.user_id}:sessions`) || []
      const filteredSessions = userSessions.filter(id => id !== sessionId)
      await this.storage.setJson(`user:${session.user_id}:sessions`, filteredSessions)
      
      this.logger.debug('Session deleted', { sessionId, userId: session.user_id })
      return true
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to delete session', errorInstance, { sessionId })
      return false
    }
  }

  // Helper methods
  private async cleanupUserData(userId: string): Promise<void> {
    try {
      const keysToRemove = [
        `user:${userId}:profiles`,
        `user:${userId}:watchHistory`,
        `user:${userId}:favorites`,
        `user:${userId}:watchlist`,
        `user:${userId}:ratings`,
        `user:${userId}:downloads`,
        `user:${userId}:sessions`
      ]
      
      await Promise.all(keysToRemove.map(key => this.storage.remove(key)))
      
      // Clean up sessions
      const sessionIds = await this.storage.getJson<string[]>(`user:${userId}:sessions`) || []
      await Promise.all(sessionIds.map(id => this.storage.remove(`session:${id}`)))
      
      this.logger.debug('User data cleaned up', { userId })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to cleanup user data', errorInstance, { userId })
    }
  }
}