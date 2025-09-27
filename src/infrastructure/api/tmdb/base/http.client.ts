/**
 * Base HTTP Client Implementation
 * 
 * Axios-based HTTP client with retry logic and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry'
import type { 
  HttpClientConfig, 
  RequestOptions, 
  ResponseInterceptor,
  RequestInterceptor,
  ErrorInterceptor
} from './http.types'
import { HttpError, RequestData } from './http.types'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

export class HttpClient {
  private readonly client: AxiosInstance
  private readonly config: HttpClientConfig
  private readonly logger: ILoggingService

  constructor(config: HttpClientConfig) {
    this.config = config
    this.logger = config.logger
    this.client = this.createAxiosInstance()
    this.setupRetryLogic()
    this.setupInterceptors()
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.defaultHeaders
      }
    })
  }

  private setupRetryLogic(): void {
    axiosRetry(this.client, {
      retries: this.config.retries || 3,
      retryDelay: (retryCount) => {
        const baseDelay = this.config.retryDelay || 1000
        return baseDelay * Math.pow(2, retryCount - 1) // Exponential backoff
      },
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        return isNetworkOrIdempotentRequestError(error) ||
               (error.response?.status !== undefined && error.response.status >= 500)
      },
      onRetry: (retryCount, error) => {
        this.logger.warn(`HTTP request retry attempt ${retryCount}`, error, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          retryCount
        })
      }
    })
  }

  private setupInterceptors(): void {
    // Request interceptor for logging and headers
    this.client.interceptors.request.use(
      (config) => {
        if (__DEV__) {
          console.debug('HTTP Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            headers: config.headers
          })
        }
        return config
      },
      (error) => {
        if (__DEV__) {
          console.error('HTTP Request Error:', error)
        }
        return Promise.reject(error)
      }
    )

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.debug('HTTP Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
          })
        }
        return response
      },
      (error) => {
        const httpError = HttpError.fromAxiosError(error)
        
        if (__DEV__) {
          console.error('HTTP Response Error:', {
            status: httpError.details.status,
            url: httpError.details.url,
            message: httpError.details.message,
            isTimeout: httpError.details.isTimeout,
            isNetworkError: httpError.details.isNetworkError,
            isRateLimited: httpError.details.isRateLimited
          })
        }

        return Promise.reject(httpError)
      }
    )
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    return this.client.interceptors.request.use(interceptor)
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor<T = any>(interceptor: ResponseInterceptor<T>): number {
    return this.client.interceptors.response.use(interceptor)
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): number {
    return this.client.interceptors.response.use(undefined, interceptor)
  }

  /**
   * Remove interceptor by ID
   */
  removeInterceptor(type: 'request' | 'response', id: number): void {
    if (type === 'request') {
      this.client.interceptors.request.eject(id)
    } else {
      this.client.interceptors.response.eject(id)
    }
  }

  /**
   * Perform GET request
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<AxiosResponse<T>> {
    const config = this.buildRequestConfig('GET', url, options)
    return this.client.get<T>(url, config)
  }

  /**
   * Perform POST request
   */
  async post<T = unknown>(url: string, data?: RequestData, options?: RequestOptions): Promise<AxiosResponse<T>> {
    const config = this.buildRequestConfig('POST', url, options)
    return this.client.post<T>(url, data, config)
  }

  /**
   * Perform PUT request
   */
  async put<T = unknown>(url: string, data?: RequestData, options?: RequestOptions): Promise<AxiosResponse<T>> {
    const config = this.buildRequestConfig('PUT', url, options)
    return this.client.put<T>(url, data, config)
  }

  /**
   * Perform PATCH request
   */
  async patch<T = unknown>(url: string, data?: RequestData, options?: RequestOptions): Promise<AxiosResponse<T>> {
    const config = this.buildRequestConfig('PATCH', url, options)
    return this.client.patch<T>(url, data, config)
  }

  /**
   * Perform DELETE request
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<AxiosResponse<T>> {
    const config = this.buildRequestConfig('DELETE', url, options)
    return this.client.delete<T>(url, config)
  }

  /**
   * Perform HEAD request
   */
  async head(url: string, options?: RequestOptions): Promise<AxiosResponse> {
    const config = this.buildRequestConfig('HEAD', url, options)
    return this.client.head(url, config)
  }

  /**
   * Get the base URL
   */
  getBaseURL(): string {
    return this.config.baseURL
  }

  /**
   * Update default headers
   */
  updateDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers, headers)
  }

  /**
   * Get the underlying axios instance (for advanced usage)
   */
  getAxiosInstance(): AxiosInstance {
    return this.client
  }

  /**
   * Build request configuration
   */
  private buildRequestConfig(method: string, url: string, options?: RequestOptions): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: options?.headers,
      params: options?.params,
      timeout: options?.timeout
    }

    // Apply retry option if specified
    if (options?.retry === false) {
      config['axios-retry'] = { retries: 0 }
    }

    return config
  }
}

/**
 * Create HTTP client factory function
 */
export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  return new HttpClient(config)
}