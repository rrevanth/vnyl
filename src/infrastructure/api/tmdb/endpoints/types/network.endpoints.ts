/**
 * TMDB Network Endpoints
 * 
 * Get TV network information and details
 */

import type { Image } from './base.types'

/**
 * Network details
 */
export interface NetworkDetails {
  /** Network ID */
  id: number
  /** Network name */
  name: string
  /** Network headquarters */
  headquarters: string
  /** Network homepage */
  homepage: string
  /** Logo path */
  logo_path: string | null
  /** Origin country */
  origin_country: string
}

/**
 * Network alternative names response
 */
export interface NetworkAlternativeNamesResponse {
  /** Network ID */
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
 * Network images response
 */
export interface NetworkImagesResponse {
  /** Network ID */
  id: number
  /** Logo images */
  logos: Image[]
}

/**
 * Network endpoints interface
 */
export interface TMDBNetworkEndpoints {
  /**
   * Get network details
   */
  getDetails(networkId: number): Promise<NetworkDetails>

  /**
   * Get the alternative names for a network
   */
  getAlternativeNames(networkId: number): Promise<NetworkAlternativeNamesResponse>

  /**
   * Get the network logos
   */
  getImages(networkId: number): Promise<NetworkImagesResponse>
}