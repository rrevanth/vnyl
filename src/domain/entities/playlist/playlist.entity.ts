/**
 * Playlist entity representing user-created collections of media
 * Supports both public and private playlists with sharing capabilities
 */

export type PlaylistVisibility = 'private' | 'public' | 'unlisted' | 'friends_only'

export type PlaylistSortOrder = 'manual' | 'date_added' | 'alphabetical' | 'release_date' | 'rating'

export interface PlaylistItem {
  id: string
  media_id: string
  media_type: 'movie' | 'series'
  media_title: string
  poster_path?: string
  release_date?: string
  runtime?: number
  genres: string[]
  rating?: number
  position: number
  added_at: string
  added_by_user_id: string
  notes?: string
}

export interface PlaylistCollaborator {
  user_id: string
  username: string
  avatar_url?: string
  role: 'owner' | 'editor' | 'viewer'
  added_at: string
  can_add_items: boolean
  can_remove_items: boolean
  can_reorder_items: boolean
  can_edit_playlist: boolean
  can_invite_others: boolean
}

export interface PlaylistStats {
  total_items: number
  total_runtime_minutes: number
  average_rating: number
  genre_distribution: Record<string, number>
  decade_distribution: Record<string, number>
  content_type_distribution: {
    movies: number
    series: number
  }
}

export interface PlaylistTag {
  id: string
  name: string
  color?: string
}

export interface PlaylistEntity {
  // Core identification
  id: string
  name: string
  description?: string
  
  // Ownership and sharing
  owner_user_id: string
  owner_username: string
  visibility: PlaylistVisibility
  collaborators: PlaylistCollaborator[]
  
  // Content organization
  items: PlaylistItem[]
  sort_order: PlaylistSortOrder
  tags: PlaylistTag[]
  
  // Visual customization
  cover_image_url?: string
  banner_image_url?: string
  color_theme?: string
  
  // Interaction data
  like_count: number
  view_count: number
  share_count: number
  fork_count: number
  
  // Settings
  allow_duplicates: boolean
  auto_remove_unavailable: boolean
  notify_on_new_items: boolean
  
  // Statistics (computed)
  stats: PlaylistStats
  
  // Timestamps
  created_at: string
  updated_at: string
  last_activity_at: string
}

/**
 * Lightweight playlist reference for listings
 */
export interface PlaylistReference {
  id: string
  name: string
  owner_username: string
  item_count: number
  cover_image_url?: string
  visibility: PlaylistVisibility
  created_at: string
  updated_at: string
}

/**
 * Playlist with user interaction data
 */
export interface PlaylistWithUserData extends PlaylistEntity {
  user_role?: 'owner' | 'editor' | 'viewer' | null
  is_liked_by_user: boolean
  is_followed_by_user: boolean
  user_progress?: {
    media_id: string
    watched: boolean
    progress_percentage: number
  }[]
}

/**
 * Playlist creation/update payload
 */
export interface PlaylistCreateUpdate {
  name: string
  description?: string
  visibility: PlaylistVisibility
  cover_image_url?: string
  banner_image_url?: string
  color_theme?: string
  tags?: string[]
  allow_duplicates?: boolean
  auto_remove_unavailable?: boolean
}

/**
 * Playlist item addition payload
 */
export interface PlaylistItemAdd {
  media_id: string
  media_type: 'movie' | 'series'
  position?: number
  notes?: string
}

/**
 * Playlist search and discovery
 */
export interface PlaylistSearchCriteria {
  query?: string
  visibility?: PlaylistVisibility[]
  tags?: string[]
  min_items?: number
  max_items?: number
  owner_user_id?: string
  sort_by?: 'popularity' | 'recent' | 'alphabetical' | 'item_count'
  genre_filter?: string[]
}

/**
 * Playlist activity for feeds
 */
export interface PlaylistActivity {
  id: string
  playlist_id: string
  playlist_name: string
  user_id: string
  username: string
  action: 'created' | 'updated' | 'added_item' | 'removed_item' | 'liked' | 'shared'
  details?: {
    media_title?: string
    item_count?: number
    collaborator_added?: string
  }
  timestamp: string
}