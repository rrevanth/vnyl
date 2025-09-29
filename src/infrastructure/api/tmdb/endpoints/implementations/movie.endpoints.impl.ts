/**
 * TMDB Movie Endpoints Implementation
 * 
 * Implementation of movie endpoints with comprehensive functionality
 */

import type { LanguageCode, CountryCode, PaginatedResponse } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { 
  TMDBMovieEndpoints,
  MovieDetails,
  MovieSummary,
  MovieCreditsResponse,
  MovieImagesResponse,
  MovieVideosResponse,
  MovieExternalIdsResponse,
  MovieTranslationsResponse,
  MovieAlternativeTitlesResponse,
  MovieReleaseDatesResponse,
  MovieKeywordsResponse,
  MovieWatchProvidersResponse,
  MovieRecommendationsResponse,
  MovieSimilarResponse,
  MovieReviewsResponse,
  MovieListsResponse,
  MovieAccountStatesResponse,
  PopularMoviesParams,
  TopRatedMoviesParams,
  UpcomingMoviesParams,
  NowPlayingMoviesParams
} from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'

/**
 * Create movie endpoints implementation
 */
export const createMovieEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBMovieEndpoints => ({
  /**
   * Get the primary information about a movie
   */
  async getDetails(movieId: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<MovieDetails> {
    const appendToResponse = params?.append_to_response ? [params.append_to_response] : undefined
    return request<MovieDetails>('GET', `/movie/${movieId}`, params, undefined, { appendToResponse })
  },

  /**
   * Get the alternative titles for a movie
   */
  async getAlternativeTitles(movieId: number, params?: { country?: CountryCode }): Promise<MovieAlternativeTitlesResponse> {
    return request<MovieAlternativeTitlesResponse>('GET', `/movie/${movieId}/alternative_titles`, params)
  },

  /**
   * Get the cast and crew for a movie
   */
  async getCredits(movieId: number, params?: { language?: LanguageCode }): Promise<MovieCreditsResponse> {
    return request<MovieCreditsResponse>('GET', `/movie/${movieId}/credits`, params)
  },

  /**
   * Get the external ids for a movie
   */
  async getExternalIds(movieId: number): Promise<MovieExternalIdsResponse> {
    return request<MovieExternalIdsResponse>('GET', `/movie/${movieId}/external_ids`)
  },

  /**
   * Get the images that belong to a movie
   */
  async getImages(movieId: number, params?: { language?: LanguageCode; include_image_language?: string }): Promise<MovieImagesResponse> {
    return request<MovieImagesResponse>('GET', `/movie/${movieId}/images`, params)
  },

  /**
   * Get the keywords that have been added to a movie
   */
  async getKeywords(movieId: number): Promise<MovieKeywordsResponse> {
    return request<MovieKeywordsResponse>('GET', `/movie/${movieId}/keywords`)
  },

  /**
   * Get a list of lists that this movie belongs to
   */
  async getLists(movieId: number, params?: { page?: number; language?: LanguageCode }): Promise<MovieListsResponse> {
    return request<MovieListsResponse>('GET', `/movie/${movieId}/lists`, params)
  },

  /**
   * Get a list of recommended movies for a movie
   */
  async getRecommendations(movieId: number, params?: { page?: number; language?: LanguageCode }): Promise<MovieRecommendationsResponse> {
    return request<MovieRecommendationsResponse>('GET', `/movie/${movieId}/recommendations`, params)
  },

  /**
   * Get the release date along with the certification for a movie
   */
  async getReleaseDates(movieId: number): Promise<MovieReleaseDatesResponse> {
    return request<MovieReleaseDatesResponse>('GET', `/movie/${movieId}/release_dates`)
  },

  /**
   * Get the user reviews for a movie
   */
  async getReviews(movieId: number, params?: { page?: number; language?: LanguageCode }): Promise<MovieReviewsResponse> {
    return request<MovieReviewsResponse>('GET', `/movie/${movieId}/reviews`, params)
  },

  /**
   * Get a list of similar movies
   */
  async getSimilar(movieId: number, params?: { page?: number; language?: LanguageCode }): Promise<MovieSimilarResponse> {
    return request<MovieSimilarResponse>('GET', `/movie/${movieId}/similar`, params)
  },

  /**
   * Get a list of translations that have been created for a movie
   */
  async getTranslations(movieId: number): Promise<MovieTranslationsResponse> {
    return request<MovieTranslationsResponse>('GET', `/movie/${movieId}/translations`)
  },

  /**
   * Get the videos that have been added to a movie
   */
  async getVideos(movieId: number, params?: { language?: LanguageCode }): Promise<MovieVideosResponse> {
    return request<MovieVideosResponse>('GET', `/movie/${movieId}/videos`, params)
  },

  /**
   * Get a list of the watch provider (OTT/streaming) data we have available for a movie
   */
  async getWatchProviders(movieId: number): Promise<MovieWatchProvidersResponse> {
    return request<MovieWatchProvidersResponse>('GET', `/movie/${movieId}/watch/providers`)
  },

  /**
   * Get the most popular movies on TMDB
   */
  async getPopular(params?: PopularMoviesParams): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', '/movie/popular', params)
  },

  /**
   * Get the top rated movies on TMDB
   */
  async getTopRated(params?: TopRatedMoviesParams): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', '/movie/top_rated', params)
  },

  /**
   * Get a list of upcoming movies in theatres
   */
  async getUpcoming(params?: UpcomingMoviesParams): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', '/movie/upcoming', params)
  },

  /**
   * Get a list of movies in theatres
   */
  async getNowPlaying(params?: NowPlayingMoviesParams): Promise<PaginatedResponse<MovieSummary>> {
    return request<PaginatedResponse<MovieSummary>>('GET', '/movie/now_playing', params)
  },

  /**
   * Grab the following account states for a session (requires authentication)
   */
  async getAccountStates(movieId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<MovieAccountStatesResponse> {
    return request<MovieAccountStatesResponse>('GET', `/movie/${movieId}/account_states`, params)
  },

  /**
   * Rate a movie (requires authentication)
   */
  async addRating(movieId: number, rating: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }> {
    const data = { value: rating }
    return request('POST', `/movie/${movieId}/rating`, params, data)
  },

  /**
   * Remove your rating for a movie (requires authentication)
   */
  async deleteRating(movieId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }> {
    return request('DELETE', `/movie/${movieId}/rating`, params)
  },

  /**
   * Get the latest movie id
   */
  async getLatest(params?: { language?: LanguageCode }): Promise<MovieDetails> {
    return request<MovieDetails>('GET', '/movie/latest', params)
  }
})