/**
 * TMDB Network Endpoints Implementation
 * 
 * Implementation of network endpoints for TV network data
 */

import type { 
  TMDBNetworkEndpoints,
  NetworkDetails,
  NetworkAlternativeNamesResponse,
  NetworkImagesResponse
} from '../types/network.endpoints'

/**
 * Create network endpoints implementation
 */
export const createNetworkEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBNetworkEndpoints => ({
  /**
   * Get network details
   */
  async getDetails(networkId: number): Promise<NetworkDetails> {
    return request<NetworkDetails>('GET', `/network/${networkId}`)
  },

  /**
   * Get the alternative names for a network
   */
  async getAlternativeNames(networkId: number): Promise<NetworkAlternativeNamesResponse> {
    return request<NetworkAlternativeNamesResponse>('GET', `/network/${networkId}/alternative_names`)
  },

  /**
   * Get the network logos
   */
  async getImages(networkId: number): Promise<NetworkImagesResponse> {
    return request<NetworkImagesResponse>('GET', `/network/${networkId}/images`)
  }
})