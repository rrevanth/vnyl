import { 
  MediaEntity, 
  MediaReference, 
  MediaSearchResult, 
  MediaWithStreams,
  MediaType 
} from '@/domain/entities/media'

/**
 * Media repository interface following dependency inversion principle
 * Infrastructure layer will implement this interface
 */
export interface IMediaRepository {
  // Single media operations
  findById(id: string): Promise<MediaEntity | null>
  findByExternalId(externalId: string, source: 'tmdb' | 'imdb' | 'tvdb'): Promise<MediaEntity | null>
  findWithStreams(id: string): Promise<MediaWithStreams | null>
  
  // Search operations
  search(query: string, type?: MediaType, page?: number): Promise<{
    results: MediaSearchResult[]
    total_results: number
    total_pages: number
    page: number
  }>
  
  // Discovery operations
  getPopular(type: MediaType, page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  getTrending(timeWindow: 'day' | 'week', type?: MediaType): Promise<MediaReference[]>
  
  getTopRated(type: MediaType, page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  getNowPlaying(page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  getUpcoming(page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  // Recommendations and similar content
  getRecommendations(mediaId: string, page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  getSimilar(mediaId: string, page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  // Genre-based discovery
  getByGenre(genreId: number, type: MediaType, page?: number): Promise<{
    results: MediaReference[]
    total_pages: number
    page: number
  }>
  
  // TV Series specific operations
  getSeasonDetails(seriesId: string, seasonNumber: number): Promise<{
    id: number
    name: string
    overview: string
    air_date: string
    poster_path?: string
    season_number: number
    episodes: {
      id: number
      name: string
      overview: string
      air_date: string
      episode_number: number
      still_path?: string
      runtime?: number
      vote_average: number
    }[]
  } | null>
  
  getEpisodeDetails(seriesId: string, seasonNumber: number, episodeNumber: number): Promise<{
    id: number
    name: string
    overview: string
    air_date: string
    episode_number: number
    season_number: number
    still_path?: string
    runtime?: number
    vote_average: number
    vote_count: number
  } | null>
  
  // Collection operations
  getCollection(collectionId: number): Promise<{
    id: number
    name: string
    overview: string
    poster_path?: string
    backdrop_path?: string
    parts: MediaReference[]
  } | null>
  
  // Multi-search across different content types
  multiSearch(query: string, page?: number): Promise<{
    results: (MediaSearchResult | {
      id: string
      name: string
      profile_path?: string
      media_type: 'person'
      known_for: MediaReference[]
    })[]
    total_results: number
    total_pages: number
    page: number
  }>
  
  // Cache management
  invalidateCache(mediaId: string): Promise<void>
  preloadPopularContent(): Promise<void>
}