/**
 * Features Barrel Export
 * Centralized exports for all feature modules
 */

// Home feature
export { homeStore, homeActions, homeComputed } from './home/stores/HomeStore'
export type { HomeStore, HomeActions, HomeComputed, HomeState, CatalogSection, HeroContent } from './home/stores/HomeStore'

// Search feature
export { searchStore, searchActions, searchComputed } from './search/stores/SearchStore'
export type { 
  SearchStore, 
  SearchActions, 
  SearchComputed, 
  SearchState, 
  SearchResult, 
  SearchFilters, 
  SearchSuggestion 
} from './search/stores/SearchStore'

// Library feature
export { libraryStore, libraryActions, libraryComputed } from './library/stores/LibraryStore'
export type { 
  LibraryStore, 
  LibraryActions, 
  LibraryComputed, 
  LibraryState, 
  LibraryCollection, 
  DownloadItem, 
  WatchProgress 
} from './library/stores/LibraryStore'

// Media detail feature
export { mediaDetailStore, mediaDetailActions, mediaDetailComputed } from './media-detail/stores/MediaDetailStore'
export type { 
  MediaDetailStore, 
  MediaDetailActions, 
  MediaDetailComputed, 
  MediaDetailState, 
  MediaDetails, 
  CastMember, 
  CrewMember, 
  Season, 
  Episode 
} from './media-detail/stores/MediaDetailStore'

// Feature types
export * from './types'

// Feature constants
export * from './constants'