/**
 * TMDB Certification Endpoints
 * 
 * Get content rating certifications for movies and TV shows
 */

/**
 * Content rating certification
 */
export interface Certification {
  /** Certification code */
  certification: string
  /** Certification meaning */
  meaning: string
  /** Order priority */
  order: number
}

/**
 * Movie certifications by country
 */
export interface MovieCertificationsResponse {
  /** Certifications by country code */
  certifications: Record<string, Certification[]>
}

/**
 * TV certifications by country
 */
export interface TVCertificationsResponse {
  /** Certifications by country code */
  certifications: Record<string, Certification[]>
}

/**
 * Certification endpoints interface
 */
export interface TMDBCertificationEndpoints {
  /**
   * Get an up to date list of the officially supported movie certifications on TMDB
   */
  getMovieCertifications(): Promise<MovieCertificationsResponse>

  /**
   * Get an up to date list of the officially supported TV show certifications on TMDB
   */
  getTVCertifications(): Promise<TVCertificationsResponse>
}