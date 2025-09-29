/**
 * TMDB TV Endpoints Implementation
 * 
 * Implementation of TV endpoints with comprehensive functionality
 */

import type { LanguageCode, PaginatedResponse } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'
import type { 
  TMDBTVEndpoints,
  TMDBTVShowDetails,
  TVShowSummary,
  TMDBTVSeasonDetails,
  TVEpisodeDetails,
  TVCreditsResponse,
  TVImagesResponse,
  TVVideosResponse,
  TVExternalIdsResponse,
  TVTranslationsResponse,
  TVAlternativeTitlesResponse,
  TVContentRatingsResponse,
  TVKeywordsResponse,
  TVWatchProvidersResponse,
  TVRecommendationsResponse,
  TVSimilarResponse,
  TVReviewsResponse,
  TVAccountStatesResponse,
  TVEpisodeAccountStatesResponse,
  TVEpisodeGroupDetails,
  TVSeasonCreditsResponse,
  TVSeasonImagesResponse,
  TVSeasonVideosResponse,
  TVSeasonExternalIdsResponse,
  TVSeasonTranslationsResponse,
  TVEpisodeCreditsResponse,
  TVEpisodeImagesResponse,
  TVEpisodeVideosResponse,
  TVEpisodeExternalIdsResponse,
  TVEpisodeTranslationsResponse,
  PopularTVParams,
  TopRatedTVParams,
  AiringTodayTVParams,
  OnTheAirTVParams
} from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

/**
 * Create TV endpoints implementation
 */
export const createTVEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBTVEndpoints => ({
  /**
   * Get the primary TV show details by id
   */
  async getDetails(tvId: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<TMDBTVShowDetails> {
    const appendToResponse = params?.append_to_response ? [params.append_to_response] : undefined
    return request<TMDBTVShowDetails>('GET', `/tv/${tvId}`, params, undefined, { appendToResponse })
  },

  /**
   * Get the alternative titles for a TV show
   */
  async getAlternativeTitles(tvId: number): Promise<TVAlternativeTitlesResponse> {
    return request<TVAlternativeTitlesResponse>('GET', `/tv/${tvId}/alternative_titles`)
  },

  /**
   * Get the credits (cast and crew) that have been added to a TV show
   */
  async getCredits(tvId: number, params?: { language?: LanguageCode }): Promise<TVCreditsResponse> {
    return request<TVCreditsResponse>('GET', `/tv/${tvId}/credits`, params)
  },

  /**
   * Get the external ids for a TV show
   */
  async getExternalIds(tvId: number): Promise<TVExternalIdsResponse> {
    return request<TVExternalIdsResponse>('GET', `/tv/${tvId}/external_ids`)
  },

  /**
   * Get the images that belong to a TV show
   */
  async getImages(tvId: number, params?: { language?: LanguageCode; include_image_language?: string }): Promise<TVImagesResponse> {
    return request<TVImagesResponse>('GET', `/tv/${tvId}/images`, params)
  },

  /**
   * Get the keywords that have been added to a TV show
   */
  async getKeywords(tvId: number): Promise<TVKeywordsResponse> {
    return request<TVKeywordsResponse>('GET', `/tv/${tvId}/keywords`)
  },

  /**
   * Get a list of recommended TV shows for a show
   */
  async getRecommendations(tvId: number, params?: { page?: number; language?: LanguageCode }): Promise<TVRecommendationsResponse> {
    return request<TVRecommendationsResponse>('GET', `/tv/${tvId}/recommendations`, params)
  },

  /**
   * Get the user reviews for a TV show
   */
  async getReviews(tvId: number, params?: { page?: number; language?: LanguageCode }): Promise<TVReviewsResponse> {
    return request<TVReviewsResponse>('GET', `/tv/${tvId}/reviews`, params)
  },

  /**
   * Get a list of similar TV shows
   */
  async getSimilar(tvId: number, params?: { page?: number; language?: LanguageCode }): Promise<TVSimilarResponse> {
    return request<TVSimilarResponse>('GET', `/tv/${tvId}/similar`, params)
  },

  /**
   * Get a list of the translations that exist for a TV show
   */
  async getTranslations(tvId: number): Promise<TVTranslationsResponse> {
    return request<TVTranslationsResponse>('GET', `/tv/${tvId}/translations`)
  },

  /**
   * Get the videos that have been added to a TV show
   */
  async getVideos(tvId: number, params?: { language?: LanguageCode }): Promise<TVVideosResponse> {
    return request<TVVideosResponse>('GET', `/tv/${tvId}/videos`, params)
  },

  /**
   * Get a list of the watch provider (OTT/streaming) data we have available for a TV series
   */
  async getWatchProviders(tvId: number): Promise<TVWatchProvidersResponse> {
    return request<TVWatchProvidersResponse>('GET', `/tv/${tvId}/watch/providers`)
  },

  /**
   * Get the content ratings for a TV show
   */
  async getContentRatings(tvId: number): Promise<TVContentRatingsResponse> {
    return request<TVContentRatingsResponse>('GET', `/tv/${tvId}/content_ratings`)
  },

  /**
   * Get a list of TV shows that are airing today
   */
  async getAiringToday(params?: AiringTodayTVParams): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', '/tv/airing_today', params)
  },

  /**
   * Get a list of shows that are currently on the air
   */
  async getOnTheAir(params?: OnTheAirTVParams): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', '/tv/on_the_air', params)
  },

  /**
   * Get a list of the current popular TV shows on TMDB
   */
  async getPopular(params?: PopularTVParams): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', '/tv/popular', params)
  },

  /**
   * Get a list of the top rated TV shows on TMDB
   */
  async getTopRated(params?: TopRatedTVParams): Promise<PaginatedResponse<TVShowSummary>> {
    return request<PaginatedResponse<TVShowSummary>>('GET', '/tv/top_rated', params)
  },

  /**
   * Get the details of a TV season
   */
  async getSeasonDetails(tvId: number, seasonNumber: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<TMDBTVSeasonDetails> {
    const appendToResponse = params?.append_to_response ? [params.append_to_response] : undefined
    return request<TMDBTVSeasonDetails>('GET', `/tv/${tvId}/season/${seasonNumber}`, params, undefined, { appendToResponse })
  },

  /**
   * Get the credits for TV season
   */
  async getSeasonCredits(tvId: number, seasonNumber: number, params?: { language?: LanguageCode }): Promise<TVSeasonCreditsResponse> {
    return request<TVSeasonCreditsResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/credits`, params)
  },

  /**
   * Get the external ids for a TV season
   */
  async getSeasonExternalIds(tvId: number, seasonNumber: number): Promise<TVSeasonExternalIdsResponse> {
    return request<TVSeasonExternalIdsResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/external_ids`)
  },

  /**
   * Get the images that belong to a TV season
   */
  async getSeasonImages(tvId: number, seasonNumber: number, params?: { language?: LanguageCode; include_image_language?: string }): Promise<TVSeasonImagesResponse> {
    return request<TVSeasonImagesResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/images`, params)
  },

  /**
   * Get the translations for a TV season
   */
  async getSeasonTranslations(tvId: number, seasonNumber: number): Promise<TVSeasonTranslationsResponse> {
    return request<TVSeasonTranslationsResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/translations`)
  },

  /**
   * Get the videos that have been added to a TV season
   */
  async getSeasonVideos(tvId: number, seasonNumber: number, params?: { language?: LanguageCode }): Promise<TVSeasonVideosResponse> {
    return request<TVSeasonVideosResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/videos`, params)
  },

  /**
   * Get the TV episode details by id
   */
  async getEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number, params?: { language?: LanguageCode; append_to_response?: string }): Promise<TVEpisodeDetails> {
    const appendToResponse = params?.append_to_response ? [params.append_to_response] : undefined
    return request<TVEpisodeDetails>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, params, undefined, { appendToResponse })
  },

  /**
   * Get the credits (cast, crew and guest stars) for a TV episode
   */
  async getEpisodeCredits(tvId: number, seasonNumber: number, episodeNumber: number, params?: { language?: LanguageCode }): Promise<TVEpisodeCreditsResponse> {
    return request<TVEpisodeCreditsResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/credits`, params)
  },

  /**
   * Get the external ids for a TV episode
   */
  async getEpisodeExternalIds(tvId: number, seasonNumber: number, episodeNumber: number): Promise<TVEpisodeExternalIdsResponse> {
    return request<TVEpisodeExternalIdsResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/external_ids`)
  },

  /**
   * Get the images that belong to a TV episode
   */
  async getEpisodeImages(tvId: number, seasonNumber: number, episodeNumber: number): Promise<TVEpisodeImagesResponse> {
    return request<TVEpisodeImagesResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/images`)
  },

  /**
   * Get the translations for a TV episode
   */
  async getEpisodeTranslations(tvId: number, seasonNumber: number, episodeNumber: number): Promise<TVEpisodeTranslationsResponse> {
    return request<TVEpisodeTranslationsResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/translations`)
  },

  /**
   * Get the videos that have been added to a TV episode
   */
  async getEpisodeVideos(tvId: number, seasonNumber: number, episodeNumber: number, params?: { language?: LanguageCode }): Promise<TVEpisodeVideosResponse> {
    return request<TVEpisodeVideosResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/videos`, params)
  },

  /**
   * Get the episode group details by id
   */
  async getEpisodeGroupDetails(episodeGroupId: string): Promise<TVEpisodeGroupDetails> {
    return request<TVEpisodeGroupDetails>('GET', `/tv/episode_group/${episodeGroupId}`)
  },

  /**
   * Grab the following account states for a session (requires authentication)
   */
  async getAccountStates(tvId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<TVAccountStatesResponse> {
    return request<TVAccountStatesResponse>('GET', `/tv/${tvId}/account_states`, params)
  },

  /**
   * Rate a TV show (requires authentication)
   */
  async addRating(tvId: number, rating: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }> {
    const data = { value: rating }
    return request('POST', `/tv/${tvId}/rating`, params, data)
  },

  /**
   * Remove your rating for a TV show (requires authentication)
   */
  async deleteRating(tvId: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }> {
    return request('DELETE', `/tv/${tvId}/rating`, params)
  },

  /**
   * Get the account states for a TV episode (requires authentication)
   */
  async getEpisodeAccountStates(tvId: number, seasonNumber: number, episodeNumber: number, params?: { session_id?: string; guest_session_id?: string }): Promise<TVEpisodeAccountStatesResponse> {
    return request<TVEpisodeAccountStatesResponse>('GET', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/account_states`, params)
  },

  /**
   * Rate a TV episode (requires authentication)
   */
  async addEpisodeRating(tvId: number, seasonNumber: number, episodeNumber: number, rating: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }> {
    const data = { value: rating }
    return request('POST', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/rating`, params, data)
  },

  /**
   * Remove your rating for a TV episode (requires authentication)
   */
  async deleteEpisodeRating(tvId: number, seasonNumber: number, episodeNumber: number, params?: { session_id?: string; guest_session_id?: string }): Promise<{ success: boolean; status_code: number; status_message: string }> {
    return request('DELETE', `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/rating`, params)
  },

  /**
   * Get the most newly created TV show
   */
  async getLatest(params?: { language?: LanguageCode }): Promise<TMDBTVShowDetails> {
    return request<TMDBTVShowDetails>('GET', '/tv/latest', params)
  }
})