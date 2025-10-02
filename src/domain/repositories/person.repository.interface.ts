import { 
  PersonEntity, 
  PersonReference, 
  PersonSearchResult, 
  PersonFilmography,
  PersonCreditSummary 
} from '@/domain/entities/person'

/**
 * Person repository interface following dependency inversion principle
 * Infrastructure layer will implement this interface
 */
export interface IPersonRepository {
  // Single person operations
  findById(id: string): Promise<PersonEntity | null>
  findByExternalId(externalId: string, source: 'imdb' | 'facebook' | 'twitter' | 'instagram'): Promise<PersonEntity | null>
  
  // Search operations
  search(query: string, page?: number): Promise<{
    results: PersonSearchResult[]
    total_results: number
    total_pages: number
    page: number
  }>
  
  // Filmography operations
  getFilmography(personId: string): Promise<PersonFilmography | null>
  getCombinedCredits(personId: string): Promise<{
    cast: {
      id: string
      media_type: 'movie' | 'tv'
      title: string
      character: string
      credit_id: string
      order?: number
      poster_path?: string
      release_date?: string
      vote_average: number
    }[]
    crew: {
      id: string
      media_type: 'movie' | 'tv'
      title: string
      job: string
      department: string
      credit_id: string
      poster_path?: string
      release_date?: string
      vote_average: number
    }[]
  } | null>
  
  getMovieCredits(personId: string): Promise<{
    cast: {
      id: string
      title: string
      character: string
      credit_id: string
      order?: number
      poster_path?: string
      release_date?: string
      vote_average: number
    }[]
    crew: {
      id: string
      title: string
      job: string
      department: string
      credit_id: string
      poster_path?: string
      release_date?: string
      vote_average: number
    }[]
  } | null>
  
  getTVCredits(personId: string): Promise<{
    cast: {
      id: string
      name: string
      character: string
      credit_id: string
      episode_count: number
      poster_path?: string
      first_air_date?: string
      vote_average: number
    }[]
    crew: {
      id: string
      name: string
      job: string
      department: string
      credit_id: string
      episode_count: number
      poster_path?: string
      first_air_date?: string
      vote_average: number
    }[]
  } | null>
  
  // Discovery operations
  getPopular(page?: number): Promise<{
    results: PersonReference[]
    total_pages: number
    page: number
  }>
  
  getTrending(timeWindow: 'day' | 'week'): Promise<PersonReference[]>
  
  // Media-specific operations
  getMediaCredits(mediaId: string): Promise<{
    cast: PersonCreditSummary[]
    crew: PersonCreditSummary[]
  }>
  
  getMediaCast(mediaId: string): Promise<PersonCreditSummary[]>
  getMediaCrew(mediaId: string): Promise<PersonCreditSummary[]>
  
  // Images and media
  getImages(personId: string): Promise<{
    profiles: {
      file_path: string
      aspect_ratio: number
      height: number
      width: number
      vote_average: number
      vote_count: number
    }[]
  } | null>
  
  // Translation and localization
  getTranslations(personId: string): Promise<{
    translations: {
      iso_3166_1: string
      iso_639_1: string
      name: string
      data: {
        biography: string
      }
    }[]
  } | null>
  
  // Cache management
  invalidateCache(personId: string): Promise<void>
  preloadPopularPeople(): Promise<void>
}