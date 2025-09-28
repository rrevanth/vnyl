/**
 * TMDB Credit Endpoints Implementation
 * 
 * Implementation of credit endpoints for cast/crew credit data
 */

import type { 
  TMDBCreditEndpoints,
  CreditDetails
} from '@/src/infrastructure/api/tmdb/endpoints/types/credit.endpoints'

/**
 * Create credit endpoints implementation
 */
export const createCreditEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBCreditEndpoints => ({
  /**
   * Get credit details
   */
  async getDetails(creditId: string): Promise<CreditDetails> {
    return request<CreditDetails>('GET', `/credit/${creditId}`)
  }
})