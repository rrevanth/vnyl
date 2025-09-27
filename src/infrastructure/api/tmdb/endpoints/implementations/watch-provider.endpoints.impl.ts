/**
 * TMDB Watch Provider Endpoints Implementation
 * 
 * Implementation of watch provider endpoints for streaming service data
 */

import type { LanguageCode } from '../types/base.types'
import type { 
  TMDBWatchProviderEndpoints,
  WatchProviderRegionsResponse,
  GlobalMovieWatchProvidersResponse,
  GlobalTVWatchProvidersResponse
} from '../types/watch-provider.endpoints'

/**
 * Create watch provider endpoints implementation
 */
export const createWatchProviderEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBWatchProviderEndpoints => ({
  /**
   * Get the list of streaming/watch provider regions
   */
  async getAvailableRegions(params?: { language?: LanguageCode }): Promise<WatchProviderRegionsResponse> {
    return request<WatchProviderRegionsResponse>('GET', '/watch/providers/regions', params)
  },

  /**
   * Get movie watch providers
   */
  async getMovieProviders(params?: { language?: LanguageCode }): Promise<GlobalMovieWatchProvidersResponse> {
    return request<GlobalMovieWatchProvidersResponse>('GET', '/watch/providers/movie', params)
  },

  /**
   * Get TV watch providers
   */
  async getTVProviders(params?: { language?: LanguageCode }): Promise<GlobalTVWatchProvidersResponse> {
    return request<GlobalTVWatchProvidersResponse>('GET', '/watch/providers/tv', params)
  }
})