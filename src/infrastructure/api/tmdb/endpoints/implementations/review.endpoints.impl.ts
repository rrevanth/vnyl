/**
 * TMDB Review Endpoints Implementation
 * 
 * Implementation of review endpoints for user review data
 */

import type { 
  TMDBReviewEndpoints,
  ReviewDetails
} from '../types/review.endpoints'

/**
 * Create review endpoints implementation
 */
export const createReviewEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBReviewEndpoints => ({
  /**
   * Get review details
   */
  async getDetails(reviewId: string): Promise<ReviewDetails> {
    return request<ReviewDetails>('GET', `/review/${reviewId}`)
  }
})