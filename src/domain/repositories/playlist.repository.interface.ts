import { 
  PlaylistEntity, 
  PlaylistReference, 
  PlaylistWithUserData,
  PlaylistCreateUpdate,
  PlaylistItemAdd,
  PlaylistSearchCriteria,
  PlaylistActivity,
  PlaylistCollaborator 
} from '@/domain/entities/playlist'

/**
 * Playlist repository interface following dependency inversion principle
 * Infrastructure layer will implement this interface
 */
export interface IPlaylistRepository {
  // Playlist CRUD operations
  findById(id: string, userId?: string): Promise<PlaylistEntity | null>
  findByIdWithUserData(id: string, userId: string): Promise<PlaylistWithUserData | null>
  create(userId: string, playlist: PlaylistCreateUpdate): Promise<PlaylistEntity>
  update(id: string, userId: string, updates: Partial<PlaylistCreateUpdate>): Promise<PlaylistEntity | null>
  delete(id: string, userId: string): Promise<boolean>
  
  // User playlist operations
  getUserPlaylists(userId: string, includeCollaborative?: boolean): Promise<PlaylistReference[]>
  getUserOwnedPlaylists(userId: string): Promise<PlaylistReference[]>
  getUserCollaborativePlaylists(userId: string): Promise<PlaylistReference[]>
  
  // Playlist item management
  addItem(playlistId: string, userId: string, item: PlaylistItemAdd): Promise<boolean>
  removeItem(playlistId: string, userId: string, mediaId: string): Promise<boolean>
  reorderItems(playlistId: string, userId: string, itemOrders: { mediaId: string; position: number }[]): Promise<boolean>
  updateItemNotes(playlistId: string, userId: string, mediaId: string, notes: string): Promise<boolean>
  getPlaylistItems(playlistId: string, offset?: number, limit?: number): Promise<{
    items: PlaylistEntity['items']
    total: number
  }>
  
  // Collaboration management
  addCollaborator(playlistId: string, ownerId: string, collaborator: Omit<PlaylistCollaborator, 'added_at'>): Promise<boolean>
  removeCollaborator(playlistId: string, ownerId: string, userId: string): Promise<boolean>
  updateCollaboratorRole(
    playlistId: string, 
    ownerId: string, 
    userId: string, 
    role: 'editor' | 'viewer',
    permissions?: Partial<Pick<PlaylistCollaborator, 'can_add_items' | 'can_remove_items' | 'can_reorder_items' | 'can_edit_playlist' | 'can_invite_others'>>
  ): Promise<boolean>
  getCollaborators(playlistId: string): Promise<PlaylistCollaborator[]>
  
  // Search and discovery
  search(criteria: PlaylistSearchCriteria, userId?: string): Promise<{
    results: PlaylistReference[]
    total_results: number
    page: number
    total_pages: number
  }>
  
  getPublicPlaylists(sortBy?: 'popularity' | 'recent' | 'alphabetical', page?: number): Promise<{
    results: PlaylistReference[]
    total_pages: number
    page: number
  }>
  
  getTrendingPlaylists(timeWindow?: 'day' | 'week' | 'month'): Promise<PlaylistReference[]>
  
  getPlaylistsByTag(tag: string, page?: number): Promise<{
    results: PlaylistReference[]
    total_pages: number
    page: number
  }>
  
  // Social features
  likePlaylist(playlistId: string, userId: string): Promise<boolean>
  unlikePlaylist(playlistId: string, userId: string): Promise<boolean>
  isPlaylistLiked(playlistId: string, userId: string): Promise<boolean>
  
  followPlaylist(playlistId: string, userId: string): Promise<boolean>
  unfollowPlaylist(playlistId: string, userId: string): Promise<boolean>
  isPlaylistFollowed(playlistId: string, userId: string): Promise<boolean>
  
  sharePlaylist(playlistId: string, userId: string): Promise<string> // Returns share URL
  forkPlaylist(playlistId: string, userId: string, newName?: string): Promise<PlaylistEntity>
  
  // Statistics and analytics
  incrementViewCount(playlistId: string): Promise<boolean>
  getPlaylistStats(playlistId: string): Promise<{
    view_count: number
    like_count: number
    share_count: number
    fork_count: number
    unique_viewers_last_30_days: number
  }>
  
  // Activity and feeds
  getPlaylistActivity(playlistId: string, limit?: number): Promise<PlaylistActivity[]>
  getUserPlaylistActivity(userId: string, limit?: number): Promise<PlaylistActivity[]>
  addActivity(activity: Omit<PlaylistActivity, 'id' | 'timestamp'>): Promise<PlaylistActivity>
  
  // Bulk operations
  bulkAddItems(playlistId: string, userId: string, items: PlaylistItemAdd[]): Promise<{
    added: number
    failed: number
    errors: string[]
  }>
  
  bulkRemoveItems(playlistId: string, userId: string, mediaIds: string[]): Promise<{
    removed: number
    failed: number
    errors: string[]
  }>
  
  // Import/Export
  exportPlaylist(playlistId: string, format: 'json' | 'csv' | 'm3u'): Promise<string>
  importPlaylist(userId: string, data: string, format: 'json' | 'csv' | 'm3u'): Promise<PlaylistEntity>
  
  // Maintenance
  removeUnavailableItems(playlistId: string): Promise<number>
  updatePlaylistStats(playlistId: string): Promise<boolean>
  cleanupOrphanedPlaylists(): Promise<number>
}