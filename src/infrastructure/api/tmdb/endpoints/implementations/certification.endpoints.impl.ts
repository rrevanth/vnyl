/**
 * TMDB Certification Endpoints Implementation
 * 
 * Implementation of certification endpoints for content rating data
 */

import type { 
  TMDBCertificationEndpoints,
  MovieCertificationsResponse,
  TVCertificationsResponse
} from '../types/certification.endpoints'

/**
 * Create certification endpoints implementation
 */
export const createCertificationEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBCertificationEndpoints => ({
  /**
   * Get an up to date list of the officially supported movie certifications on TMDB
   */
  async getMovieCertifications(): Promise<MovieCertificationsResponse> {
    return request<MovieCertificationsResponse>('GET', '/certification/movie/list')
  },

  /**
   * Get an up to date list of the officially supported TV show certifications on TMDB
   */
  async getTVCertifications(): Promise<TVCertificationsResponse> {
    return request<TVCertificationsResponse>('GET', '/certification/tv/list')
  }
})