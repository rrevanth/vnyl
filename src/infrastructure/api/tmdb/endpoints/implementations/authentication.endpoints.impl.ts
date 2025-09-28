/**
 * TMDB Authentication Endpoints Implementation
 * 
 * Implementation of authentication endpoints for session management
 */

import type { 
  TMDBAuthenticationEndpoints,
  RequestTokenResponse,
  SessionResponse,
  GuestSessionResponse,
  DeleteSessionResponse
} from '@/src/infrastructure/api/tmdb/endpoints/types/authentication.endpoints'

/**
 * Create authentication endpoints implementation
 */
export const createAuthenticationEndpoints = (
  request: <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    params?: Record<string, any>, 
    data?: any,
    options?: { appendToResponse?: string[] }
  ) => Promise<T>
): TMDBAuthenticationEndpoints => ({
  /**
   * Create a new request token
   */
  async createRequestToken(): Promise<RequestTokenResponse> {
    return request<RequestTokenResponse>('GET', '/authentication/token/new')
  },

  /**
   * Create a new session
   */
  async createSession(params: { request_token: string }): Promise<SessionResponse> {
    return request<SessionResponse>('POST', '/authentication/session/new', undefined, params)
  },

  /**
   * Create a guest session
   */
  async createGuestSession(): Promise<GuestSessionResponse> {
    return request<GuestSessionResponse>('GET', '/authentication/guest_session/new')
  },

  /**
   * Delete a session
   */
  async deleteSession(params: { session_id: string }): Promise<DeleteSessionResponse> {
    return request<DeleteSessionResponse>('DELETE', '/authentication/session', undefined, params)
  },

  /**
   * Validate request token with login
   */
  async validateRequestTokenWithLogin(params: {
    username: string
    password: string
    request_token: string
  }): Promise<RequestTokenResponse> {
    return request<RequestTokenResponse>('POST', '/authentication/token/validate_with_login', undefined, params)
  }
})