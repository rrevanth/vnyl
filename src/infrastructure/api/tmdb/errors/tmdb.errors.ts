/**
 * TMDB API Error Handling
 * 
 * Comprehensive error types and handlers for TMDB API interactions
 */

import type { HttpError } from '../base/http.types'

/**
 * TMDB specific error codes
 */
export enum TMDBErrorCode {
  // Authentication errors
  INVALID_API_KEY = 7,
  INVALID_SESSION = 3,
  INVALID_GUEST_SESSION = 14,
  
  // Authorization errors  
  UNAUTHORIZED = 30,
  PERMISSION_DENIED = 32,
  
  // Resource errors
  RESOURCE_NOT_FOUND = 34,
  INVALID_ID = 22,
  
  // Request errors
  INVALID_REQUEST = 400,
  VALIDATION_FAILED = 422,
  
  // Rate limiting
  RATE_LIMITED = 25,
  
  // Server errors
  INTERNAL_ERROR = 11,
  SERVICE_OFFLINE = 503,
  
  // Network errors
  NETWORK_ERROR = 0,
  TIMEOUT_ERROR = 1,
  
  // Configuration errors
  INVALID_CONFIG = 6
}

/**
 * TMDB API error response structure
 */
export interface TMDBErrorResponse {
  /** Error status code */
  status_code: number
  /** Error message */
  status_message: string
  /** Success flag (always false for errors) */
  success: false
}

/**
 * Custom TMDB error class
 */
export class TMDBError extends Error {
  public readonly code: TMDBErrorCode
  public readonly statusCode: number
  public readonly originalError?: Error
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: TMDBErrorCode,
    statusCode: number,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'TMDBError'
    this.code = code
    this.statusCode = statusCode
    this.originalError = originalError
    this.context = context
  }

  /**
   * Create TMDB error from HTTP error
   */
  static fromHttpError(httpError: HttpError): TMDBError {
    const statusCode = httpError.details.status || 0
    let code = TMDBErrorCode.NETWORK_ERROR
    let message = httpError.details.message

    // Map HTTP status codes to TMDB error codes
    switch (statusCode) {
      case 401:
        code = TMDBErrorCode.INVALID_API_KEY
        message = 'Invalid API key or authentication failed'
        break
      case 403:
        code = TMDBErrorCode.PERMISSION_DENIED
        message = 'Permission denied or unauthorized access'
        break
      case 404:
        code = TMDBErrorCode.RESOURCE_NOT_FOUND
        message = 'The requested resource was not found'
        break
      case 422:
        code = TMDBErrorCode.VALIDATION_FAILED
        message = 'Request validation failed'
        break
      case 429:
        code = TMDBErrorCode.RATE_LIMITED
        message = 'Rate limit exceeded, please try again later'
        break
      case 500:
        code = TMDBErrorCode.INTERNAL_ERROR
        message = 'Internal server error'
        break
      case 503:
        code = TMDBErrorCode.SERVICE_OFFLINE
        message = 'Service temporarily unavailable'
        break
      default:
        if (httpError.details.isTimeout) {
          code = TMDBErrorCode.TIMEOUT_ERROR
          message = 'Request timeout'
        } else if (httpError.details.isNetworkError) {
          code = TMDBErrorCode.NETWORK_ERROR
          message = 'Network connection error'
        }
    }

    return new TMDBError(
      message,
      code,
      statusCode,
      httpError,
      {
        url: httpError.details.url,
        method: httpError.details.method,
        isTimeout: httpError.details.isTimeout,
        isNetworkError: httpError.details.isNetworkError,
        isRateLimited: httpError.details.isRateLimited
      }
    )
  }

  /**
   * Create TMDB error from API response
   */
  static fromApiResponse(response: TMDBErrorResponse, context?: Record<string, any>): TMDBError {
    const code = response.status_code as TMDBErrorCode || TMDBErrorCode.INVALID_REQUEST

    return new TMDBError(
      response.status_message,
      code,
      response.status_code,
      undefined,
      context
    )
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return [
      TMDBErrorCode.RATE_LIMITED,
      TMDBErrorCode.INTERNAL_ERROR,
      TMDBErrorCode.SERVICE_OFFLINE,
      TMDBErrorCode.NETWORK_ERROR,
      TMDBErrorCode.TIMEOUT_ERROR
    ].includes(this.code)
  }

  /**
   * Check if error is authentication related
   */
  isAuthenticationError(): boolean {
    return [
      TMDBErrorCode.INVALID_API_KEY,
      TMDBErrorCode.INVALID_SESSION,
      TMDBErrorCode.INVALID_GUEST_SESSION,
      TMDBErrorCode.UNAUTHORIZED
    ].includes(this.code)
  }

  /**
   * Check if error is rate limiting
   */
  isRateLimited(): boolean {
    return this.code === TMDBErrorCode.RATE_LIMITED
  }

  /**
   * Get retry delay suggestion in milliseconds
   */
  getRetryDelay(): number {
    switch (this.code) {
      case TMDBErrorCode.RATE_LIMITED:
        return 60000 // 1 minute for rate limiting
      case TMDBErrorCode.INTERNAL_ERROR:
      case TMDBErrorCode.SERVICE_OFFLINE:
        return 5000 // 5 seconds for server errors
      case TMDBErrorCode.NETWORK_ERROR:
      case TMDBErrorCode.TIMEOUT_ERROR:
        return 2000 // 2 seconds for network errors
      default:
        return 1000 // 1 second default
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message
      } : undefined
    }
  }
}

/**
 * TMDB error handler utility
 */
export class TMDBErrorHandler {
  /**
   * Handle and transform errors from TMDB API
   */
  static handle(error: unknown, context?: Record<string, any>): TMDBError {
    // Already a TMDB error
    if (error instanceof TMDBError) {
      return error
    }

    // HTTP error from our client
    if (error instanceof Error && error.name === 'HttpError') {
      return TMDBError.fromHttpError(error as HttpError)
    }

    // Generic error
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    
    return new TMDBError(
      `TMDB API error: ${errorInstance.message}`,
      TMDBErrorCode.INVALID_REQUEST,
      0,
      errorInstance,
      context
    )
  }

  /**
   * Check if response is a TMDB error response
   */
  static isErrorResponse(response: any): response is TMDBErrorResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      typeof response.status_code === 'number' &&
      typeof response.status_message === 'string' &&
      response.success === false
    )
  }

  /**
   * Extract user-friendly error message
   */
  static getUserMessage(error: TMDBError): string {
    switch (error.code) {
      case TMDBErrorCode.INVALID_API_KEY:
        return 'Authentication failed. Please check your API configuration.'
      
      case TMDBErrorCode.RESOURCE_NOT_FOUND:
        return 'The requested content was not found.'
      
      case TMDBErrorCode.RATE_LIMITED:
        return 'Too many requests. Please try again in a moment.'
      
      case TMDBErrorCode.NETWORK_ERROR:
        return 'Network connection error. Please check your internet connection.'
      
      case TMDBErrorCode.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.'
      
      case TMDBErrorCode.SERVICE_OFFLINE:
        return 'Service is temporarily unavailable. Please try again later.'
      
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: TMDBError, logger: { error: (msg: string, error?: Error, context?: any) => void }): void {
    const logContext = {
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      isRetryable: error.isRetryable(),
      isAuthError: error.isAuthenticationError(),
      isRateLimited: error.isRateLimited()
    }

    logger.error('TMDB API Error', error, logContext)
  }
}