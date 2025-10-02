/**
 * API service interface for HTTP client operations
 * Infrastructure layer will implement this interface using Axios or similar
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface ApiRequestConfig {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, unknown>
  data?: unknown
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: boolean
  cacheTTL?: number
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: ApiRequestConfig
  cached?: boolean
  fromCache?: boolean
}

export interface ApiError extends Error {
  config?: ApiRequestConfig
  code?: string
  request?: unknown
  response?: {
    data: unknown
    status: number
    statusText: string
    headers: Record<string, string>
  }
  isNetworkError: boolean
  isTimeoutError: boolean
  isRetryableError: boolean
}

export interface RequestInterceptor {
  onFulfilled?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
  onRejected?: (error: ApiError) => Promise<ApiError>
}

export interface ResponseInterceptor {
  onFulfilled?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>
  onRejected?: (error: ApiError) => Promise<ApiError>
}

export interface IApiService {
  // Basic HTTP methods
  get<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  post<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  put<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  patch<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  delete<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  head<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  options<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  
  // Generic request method
  request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>>
  
  // Configuration management
  setBaseURL(baseURL: string): void
  getBaseURL(): string
  setDefaultHeaders(headers: Record<string, string>): void
  setDefaultTimeout(timeout: number): void
  
  // Authentication
  setAuthToken(token: string, type?: 'Bearer' | 'Basic' | 'Custom'): void
  removeAuthToken(): void
  setApiKey(key: string, headerName?: string): void
  
  // Interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): number
  removeRequestInterceptor(id: number): void
  addResponseInterceptor(interceptor: ResponseInterceptor): number
  removeResponseInterceptor(id: number): void
  clearInterceptors(): void
  
  // Cache management
  enableCache(defaultTTL?: number): void
  disableCache(): void
  clearCache(pattern?: RegExp): Promise<void>
  setCacheConfig(config: {
    enabled: boolean
    defaultTTL: number
    maxEntries: number
    storage: 'memory' | 'disk'
  }): void
  
  // Error handling and retries
  setRetryConfig(config: {
    retries: number
    retryDelay: number
    retryCondition: (error: ApiError) => boolean
  }): void
  
  // Upload and download
  upload<T>(
    url: string, 
    file: File | Blob | FormData, 
    config?: Partial<ApiRequestConfig>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>>
  
  download(
    url: string, 
    config?: Partial<ApiRequestConfig>,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer>
  
  // Concurrent requests
  all<T>(requests: Promise<ApiResponse<T>>[]): Promise<ApiResponse<T>[]>
  spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R
  
  // Request cancellation
  createCancelToken(): {
    token: unknown
    cancel: (message?: string) => void
  }
  
  // Health and monitoring
  ping(url?: string): Promise<{
    online: boolean
    responseTime: number
    error?: string
  }>
  
  // Debugging and development
  enableDebugMode(): void
  disableDebugMode(): void
  getStats(): {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    cacheHitRate: number
  }
  
  // Cleanup
  cleanup(): void
}