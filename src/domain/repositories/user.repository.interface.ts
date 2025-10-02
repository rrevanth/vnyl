import { 
  UserEntity, 
  UserSession, 
  UserPreferencesUpdate, 
  UserWatchHistoryEntry,
  UserFavorite,
  UserWatchlist,
  UserRating,
  UserDownload,
  UserProfile,
  UserStats 
} from '@/domain/entities/user'

/**
 * User repository interface following dependency inversion principle
 * Infrastructure layer will implement this interface
 */
export interface IUserRepository {
  // User management
  findById(id: string): Promise<UserEntity | null>
  findByEmail(email: string): Promise<UserEntity | null>
  findByUsername(username: string): Promise<UserEntity | null>
  create(user: Omit<UserEntity, 'id' | 'created_at' | 'updated_at'>): Promise<UserEntity>
  update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null>
  delete(id: string): Promise<boolean>
  
  // Profile management
  createProfile(userId: string, profile: Omit<UserProfile, 'id'>): Promise<UserProfile>
  updateProfile(userId: string, profileId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>
  deleteProfile(userId: string, profileId: string): Promise<boolean>
  setActiveProfile(userId: string, profileId: string): Promise<boolean>
  
  // Preferences management
  updatePreferences(userId: string, preferences: UserPreferencesUpdate): Promise<UserEntity | null>
  getPreferences(userId: string): Promise<{
    display_preferences: UserEntity['display_preferences']
    streaming_preferences: UserEntity['streaming_preferences']
    content_preferences: UserEntity['content_preferences']
    notification_settings: UserEntity['notification_settings']
  } | null>
  
  // Watch history operations
  addToWatchHistory(userId: string, entry: Omit<UserWatchHistoryEntry, 'id'>): Promise<UserWatchHistoryEntry>
  updateWatchProgress(userId: string, mediaId: string, progressSeconds: number, season?: number, episode?: number): Promise<UserWatchHistoryEntry | null>
  removeFromWatchHistory(userId: string, entryId: string): Promise<boolean>
  clearWatchHistory(userId: string): Promise<boolean>
  getWatchHistory(userId: string, limit?: number, offset?: number): Promise<{
    entries: UserWatchHistoryEntry[]
    total: number
  }>
  getContinueWatching(userId: string, limit?: number): Promise<UserWatchHistoryEntry[]>
  
  // Favorites operations
  addToFavorites(userId: string, favorite: Omit<UserFavorite, 'id' | 'added_at'>): Promise<UserFavorite>
  removeFromFavorites(userId: string, mediaId: string): Promise<boolean>
  getFavorites(userId: string, mediaType?: 'movie' | 'series'): Promise<UserFavorite[]>
  isFavorite(userId: string, mediaId: string): Promise<boolean>
  
  // Watchlist operations
  addToWatchlist(userId: string, item: Omit<UserWatchlist, 'id' | 'added_at'>): Promise<UserWatchlist>
  removeFromWatchlist(userId: string, mediaId: string): Promise<boolean>
  updateWatchlistPriority(userId: string, mediaId: string, priority: 'low' | 'medium' | 'high'): Promise<UserWatchlist | null>
  getWatchlist(userId: string, priority?: 'low' | 'medium' | 'high'): Promise<UserWatchlist[]>
  isInWatchlist(userId: string, mediaId: string): Promise<boolean>
  
  // Ratings operations
  addRating(userId: string, rating: Omit<UserRating, 'id' | 'rated_at'>): Promise<UserRating>
  updateRating(userId: string, mediaId: string, rating: number, review?: string): Promise<UserRating | null>
  removeRating(userId: string, mediaId: string): Promise<boolean>
  getUserRating(userId: string, mediaId: string): Promise<UserRating | null>
  getUserRatings(userId: string, mediaType?: 'movie' | 'series'): Promise<UserRating[]>
  
  // Downloads operations
  addDownload(userId: string, download: Omit<UserDownload, 'id' | 'downloaded_at'>): Promise<UserDownload>
  removeDownload(userId: string, downloadId: string): Promise<boolean>
  getDownloads(userId: string): Promise<UserDownload[]>
  updateDownloadExpiry(userId: string, downloadId: string, expiresAt: string): Promise<UserDownload | null>
  cleanupExpiredDownloads(userId: string): Promise<number>
  
  // Session management
  createSession(session: Omit<UserSession, 'id' | 'created_at' | 'last_activity_at'>): Promise<UserSession>
  updateSessionActivity(sessionId: string): Promise<UserSession | null>
  findSessionById(sessionId: string): Promise<UserSession | null>
  getUserSessions(userId: string): Promise<UserSession[]>
  revokeSession(sessionId: string): Promise<boolean>
  revokeAllSessions(userId: string): Promise<number>
  cleanupExpiredSessions(): Promise<number>
  
  // Statistics and analytics
  getUserStats(userId: string): Promise<UserStats>
  updateStorageUsage(userId: string, sizeBytes: number): Promise<boolean>
  
  // Search and discovery
  findUsersByUsername(query: string, limit?: number): Promise<{
    id: string
    username: string
    avatar_url?: string
  }[]>
  
  // Admin operations
  getUserCount(): Promise<number>
  getPremiumUserCount(): Promise<number>
  getStorageStats(): Promise<{
    total_users: number
    total_storage_used_gb: number
    average_storage_per_user_gb: number
    premium_users: number
  }>
}