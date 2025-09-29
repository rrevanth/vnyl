/**
 * TMDB Credit Endpoints
 * 
 * Get cast and crew credit information
 */

import type { PersonSummary } from './person.endpoints'
import type { MovieSummary } from './movie.endpoints'
import type { TVShowSummary } from './tv.endpoints'

/**
 * Credit details
 */
export interface CreditDetails {
  /** Credit ID */
  id: string
  /** Credit type */
  credit_type: 'cast' | 'crew'
  /** Department */
  department: string
  /** Job */
  job: string
  /** Media type */
  media_type: 'movie' | 'tv'
  /** Media data */
  media: MovieSummary | TVShowSummary
  /** Person data */
  person: PersonSummary
}

/**
 * Credit endpoints interface
 */
export interface TMDBCreditEndpoints {
  /**
   * Get credit details
   */
  getDetails(creditId: string): Promise<CreditDetails>
}