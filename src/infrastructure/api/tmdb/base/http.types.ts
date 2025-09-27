/**
 * Base HTTP Client Types
 * 
 * Type definitions for the base HTTP client with axios and retry logic
 */

import type { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

/**
 * Type for request data that can be sent in HTTP requests
 */
export type RequestData = Record<string, unknown> | FormData | string | null | undefined

/**
 * Configuration for HTTP client
 */
export interface HttpClientConfig {
  /** Base URL for all requests */
  baseURL: string
  /** Request timeout in milliseconds */
  timeout?: number
  /** Number of retry attempts */
  retries?: number
  /** Delay between retries (exponential backoff) */
  retryDelay?: number
  /** Additional headers to include in all requests */
  defaultHeaders?: Record<string, string>
  /** Logger instance for structured logging */
  logger: ILoggingService
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  /** Custom headers for this request */
  headers?: Record<string, string>
  /** Query parameters */
  params?: Record<string, any>
  /** Request timeout override */
  timeout?: number
  /** Whether to retry this request */
  retry?: boolean
}

/**
 * HTTP error details
 */
export interface HttpErrorDetails {
  status?: number
  statusText?: string
  url?: string
  method?: string
  message: string
  retryAttempt?: number
  isTimeout?: boolean
  isNetworkError?: boolean
  isRateLimited?: boolean
}

/**
 * Custom HTTP error class
 */
export class HttpError extends Error {
  public readonly details: HttpErrorDetails

  constructor(message: string, details: Partial<HttpErrorDetails> = {}) {
    super(message)
    this.name = 'HttpError'
    this.details = {
      message,
      ...details
    }
  }

  static fromAxiosError(error: AxiosError): HttpError {
    const details: HttpErrorDetails = {
      message: error.message || 'Unknown HTTP error',
      isTimeout: error.code === 'ECONNABORTED',
      isNetworkError: !error.response && !!error.request
    }

    if (error.response) {
      details.status = error.response.status
      details.statusText = error.response.statusText
      details.url = error.response.config?.url
      details.method = error.response.config?.method?.toUpperCase()
      details.isRateLimited = error.response.status === 429
    }

    if (error.config) {
      details.url = details.url || error.config.url
      details.method = details.method || error.config.method?.toUpperCase()
    }

    return new HttpError(details.message, details)
  }
}

/**
 * Response interceptor function type
 */
export type ResponseInterceptor<T = any> = (response: AxiosResponse<T>) => AxiosResponse<T> | Promise<AxiosResponse<T>>

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: unknown) => unknown