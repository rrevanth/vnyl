/**
 * TMDB Trending Endpoints
 * 
 * Get trending movies, TV shows, and people
 */

import type { 
  PaginatedResponse, 
  TimeWindow,
  LanguageCode
} from './base.types'
import type { MovieSummary } from './movie.endpoints'
import type { TVShowSummary } from './tv.endpoints'
import type { PersonSummary } from './person.endpoints'

/**
 * Trending all results - union of movie, TV, and person
 */
export type TrendingAllResult = (MovieSummary | TVShowSummary | PersonSummary) & {
  media_type: 'movie' | 'tv' | 'person'
}

/**
 * Trending endpoints interface
 */
export interface TMDBTrendingEndpoints {
  /**
   * Get the daily or weekly trending items (movies, TV shows and people)
   */
  getTrendingAll(timeWindow: TimeWindow, params?: { language?: LanguageCode }): Promise<PaginatedResponse<TrendingAllResult>>

  /**
   * Get the daily or weekly trending movies
   */
  getTrendingMovies(timeWindow: TimeWindow, params?: { language?: LanguageCode; page?: number }): Promise<PaginatedResponse<MovieSummary>>

  /**
   * Get the daily or weekly trending TV shows
   */
  getTrendingTV(timeWindow: TimeWindow, params?: { language?: LanguageCode; page?: number }): Promise<PaginatedResponse<TVShowSummary>>

  /**
   * Get the daily or weekly trending people
   */
  getTrendingPeople(timeWindow: TimeWindow, params?: { language?: LanguageCode }): Promise<PaginatedResponse<PersonSummary>>
}