/**
 * TMDB Review Endpoints
 * 
 * Get user review information
 */

/**
 * Review author details
 */
export interface ReviewAuthorDetails {
  /** Author name */
  name: string
  /** Author username */
  username: string
  /** Avatar path */
  avatar_path: string | null
  /** Author rating */
  rating: number | null
}

/**
 * Review details
 */
export interface ReviewDetails {
  /** Review ID */
  id: string
  /** Review author */
  author: string
  /** Author details */
  author_details: ReviewAuthorDetails
  /** Review content */
  content: string
  /** Creation date */
  created_at: string
  /** ISO 639-1 language code */
  iso_639_1: string
  /** Media ID */
  media_id: number
  /** Media title */
  media_title: string
  /** Media type */
  media_type: 'movie' | 'tv'
  /** Updated date */
  updated_at: string
  /** Review URL */
  url: string
}

/**
 * Review endpoints interface
 */
export interface TMDBReviewEndpoints {
  /**
   * Get review details
   */
  getDetails(reviewId: string): Promise<ReviewDetails>
}