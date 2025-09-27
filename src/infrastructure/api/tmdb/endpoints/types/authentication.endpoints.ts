/**
 * TMDB Authentication Endpoints
 * 
 * Manage authentication sessions and tokens
 */

/**
 * Request token response
 */
export interface RequestTokenResponse {
  /** Success status */
  success: boolean
  /** Expires at date */
  expires_at: string
  /** Request token */
  request_token: string
}

/**
 * Session response
 */
export interface SessionResponse {
  /** Success status */
  success: boolean
  /** Session ID */
  session_id: string
}

/**
 * Guest session response
 */
export interface GuestSessionResponse {
  /** Success status */
  success: boolean
  /** Guest session ID */
  guest_session_id: string
  /** Expires at date */
  expires_at: string
}

/**
 * Delete session response
 */
export interface DeleteSessionResponse {
  /** Success status */
  success: boolean
}

/**
 * Authentication endpoints interface
 */
export interface TMDBAuthenticationEndpoints {
  /**
   * Create a new request token
   */
  createRequestToken(): Promise<RequestTokenResponse>

  /**
   * Create a new session
   */
  createSession(params: { request_token: string }): Promise<SessionResponse>

  /**
   * Create a guest session
   */
  createGuestSession(): Promise<GuestSessionResponse>

  /**
   * Delete a session
   */
  deleteSession(params: { session_id: string }): Promise<DeleteSessionResponse>

  /**
   * Validate request token with login
   */
  validateRequestTokenWithLogin(params: {
    username: string
    password: string
    request_token: string
  }): Promise<RequestTokenResponse>
}