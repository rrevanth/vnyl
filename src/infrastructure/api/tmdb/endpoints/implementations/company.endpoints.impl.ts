/**
 * TMDB Company Endpoints Implementation
 * 
 * Implementation of company endpoints for production company data
 */

import type { 
  TMDBCompanyEndpoints,
  CompanyDetails,
  CompanyAlternativeNamesResponse,
  CompanyImagesResponse
} from '../types/company.endpoints'

/**
 * Create company endpoints implementation
 */
export const createCompanyEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBCompanyEndpoints => ({
  /**
   * Get company details
   */
  async getDetails(companyId: number): Promise<CompanyDetails> {
    return request<CompanyDetails>('GET', `/company/${companyId}`)
  },

  /**
   * Get the alternative names for a company
   */
  async getAlternativeNames(companyId: number): Promise<CompanyAlternativeNamesResponse> {
    return request<CompanyAlternativeNamesResponse>('GET', `/company/${companyId}/alternative_names`)
  },

  /**
   * Get the company logos
   */
  async getImages(companyId: number): Promise<CompanyImagesResponse> {
    return request<CompanyImagesResponse>('GET', `/company/${companyId}/images`)
  }
})