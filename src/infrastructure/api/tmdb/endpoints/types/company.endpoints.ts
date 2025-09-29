/**
 * TMDB Company Endpoints
 * 
 * Get company information and details
 */

import type { Image } from './base.types'

/**
 * Company details
 */
export interface CompanyDetails {
  /** Company ID */
  id: number
  /** Company name */
  name: string
  /** Company description */
  description: string
  /** Company headquarters */
  headquarters: string
  /** Company homepage */
  homepage: string
  /** Logo path */
  logo_path: string | null
  /** Origin country */
  origin_country: string
  /** Parent company */
  parent_company: CompanyDetails | null
}

/**
 * Company alternative names response
 */
export interface CompanyAlternativeNamesResponse {
  /** Company ID */
  id: number
  /** Alternative names */
  results: {
    /** Alternative name */
    name: string
    /** Name type */
    type: string
  }[]
}

/**
 * Company images response
 */
export interface CompanyImagesResponse {
  /** Company ID */
  id: number
  /** Logo images */
  logos: Image[]
}

/**
 * Company endpoints interface
 */
export interface TMDBCompanyEndpoints {
  /**
   * Get company details
   */
  getDetails(companyId: number): Promise<CompanyDetails>

  /**
   * Get the alternative names for a company
   */
  getAlternativeNames(companyId: number): Promise<CompanyAlternativeNamesResponse>

  /**
   * Get the company logos
   */
  getImages(companyId: number): Promise<CompanyImagesResponse>
}