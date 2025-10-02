/**
 * Axios implementation of IApiService
 * Provides HTTP client functionality with Bearer token authentication
 */

import axios, { AxiosInstance, CancelTokenSource } from 'axios'
import {
  IApiService,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
} from '@/src/domain/services/api.service.interface'
import {
  createAxiosInstance,
  AxiosClientConfig,
  convertApiConfigToAxiosConfig,
  convertAxiosConfigToApiConfig,
  convertAxiosResponse,
  enhanceAxiosError,
} from './axios-config'

interface CacheEntry {
  response: ApiResponse<any>
  timestamp: number
  ttl: number
}

interface RequestStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalResponseTime: number
  cacheHits: number
}

export class AxiosApiService implements IApiService {
  private instance: AxiosInstance
  private cache = new Map<string, CacheEntry>()
  private requestInterceptors = new Map<number, number>()
  private responseInterceptors = new Map<number, number>()
  private stats: RequestStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    cacheHits: 0,
  }
  private debugMode = __DEV__
  private cacheConfig = {
    enabled: false,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
    storage: 'memory' as const,
  }
  private retryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: ApiError) => error.isRetryableError,
  }
  private nextInterceptorId = 0

  constructor(config: AxiosClientConfig) {
    this.instance = createAxiosInstance(config)
  }

  // Basic HTTP methods
  async get<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', ...config })
  }

  async post<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', data, ...config })
  }

  async put<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', data, ...config })
  }

  async patch<T>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PATCH', data, ...config })
  }

  async delete<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', ...config })
  }

  async head<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'HEAD', ...config })
  }

  async options<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'OPTIONS', ...config })
  }

  // Generic request method
  async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const startTime = Date.now()
    this.stats.totalRequests++

    try {
      // Check cache first
      if (config.cache && this.cacheConfig.enabled) {
        const cached = this.getCachedResponse<T>(config)
        if (cached) {
          this.stats.cacheHits++
          return cached
        }
      }

      const axiosConfig = convertApiConfigToAxiosConfig(config)
      const response = await this.instance.request<T>(axiosConfig)
      
      const apiResponse = convertAxiosResponse(response)
      const responseTime = Date.now() - startTime
      
      this.stats.successfulRequests++
      this.stats.totalResponseTime += responseTime

      // Cache response if enabled
      if (config.cache && this.cacheConfig.enabled) {
        this.setCachedResponse(config, apiResponse, config.cacheTTL || this.cacheConfig.defaultTTL)
      }

      if (this.debugMode) {
        console.log(`[API] Success: ${config.method} ${config.url} (${responseTime}ms)`)
      }

      return apiResponse
    } catch (error) {
      this.stats.failedRequests++
      const responseTime = Date.now() - startTime
      this.stats.totalResponseTime += responseTime

      const apiError = enhanceAxiosError(error as any)
      
      if (this.debugMode) {
        console.error(`[API] Error: ${config.method} ${config.url} (${responseTime}ms)`, apiError.message)
      }

      throw apiError
    }
  }

  // Configuration management
  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL
  }

  getBaseURL(): string {
    return this.instance.defaults.baseURL || ''
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    Object.assign(this.instance.defaults.headers.common, headers)
  }

  setDefaultTimeout(timeout: number): void {
    this.instance.defaults.timeout = timeout
  }

  // Authentication
  setAuthToken(token: string, type: 'Bearer' | 'Basic' | 'Custom' = 'Bearer'): void {
    this.instance.defaults.headers.common.Authorization = `${type} ${token}`
  }

  removeAuthToken(): void {
    delete this.instance.defaults.headers.common.Authorization
  }

  setApiKey(key: string, headerName = 'X-API-Key'): void {
    this.instance.defaults.headers.common[headerName] = key
  }

  // Interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    const id = this.nextInterceptorId++
    const axiosId = this.instance.interceptors.request.use(
      interceptor.onFulfilled ? 
        (config) => {
          const apiConfig = convertAxiosConfigToApiConfig(config)
          if (apiConfig) {
            return interceptor.onFulfilled!(apiConfig) as any
          }
          return config
        } :
        undefined,
      interceptor.onRejected ?
        (error) => interceptor.onRejected!(enhanceAxiosError(error)) :
        undefined
    )
    this.requestInterceptors.set(id, axiosId)
    return id
  }

  removeRequestInterceptor(id: number): void {
    const axiosId = this.requestInterceptors.get(id)
    if (axiosId !== undefined) {
      this.instance.interceptors.request.eject(axiosId)
      this.requestInterceptors.delete(id)
    }
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    const id = this.nextInterceptorId++
    const axiosId = this.instance.interceptors.response.use(
      interceptor.onFulfilled ?
        (response) => interceptor.onFulfilled!(convertAxiosResponse(response)) as any :
        undefined,
      interceptor.onRejected ?
        (error) => interceptor.onRejected!(enhanceAxiosError(error)) :
        undefined
    )
    this.responseInterceptors.set(id, axiosId)
    return id
  }

  removeResponseInterceptor(id: number): void {
    const axiosId = this.responseInterceptors.get(id)
    if (axiosId !== undefined) {
      this.instance.interceptors.response.eject(axiosId)
      this.responseInterceptors.delete(id)
    }
  }

  clearInterceptors(): void {
    this.requestInterceptors.forEach((axiosId) => {
      this.instance.interceptors.request.eject(axiosId)
    })
    this.responseInterceptors.forEach((axiosId) => {
      this.instance.interceptors.response.eject(axiosId)
    })
    this.requestInterceptors.clear()
    this.responseInterceptors.clear()
  }

  // Cache management
  enableCache(defaultTTL = 5 * 60 * 1000): void {
    this.cacheConfig.enabled = true
    this.cacheConfig.defaultTTL = defaultTTL
  }

  disableCache(): void {
    this.cacheConfig.enabled = false
  }

  async clearCache(pattern?: RegExp): Promise<void> {
    if (pattern) {
      const keysToDelete: string[] = []
      this.cache.forEach((_, key) => {
        if (pattern.test(key)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach(key => this.cache.delete(key))
    } else {
      this.cache.clear()
    }
  }

  setCacheConfig(config: {
    enabled: boolean
    defaultTTL: number
    maxEntries: number
    storage: 'memory' | 'disk'
  }): void {
    this.cacheConfig = { ...config, storage: 'memory' } // Only memory storage supported for now
    if (!config.enabled) {
      this.cache.clear()
    }
  }

  // Error handling and retries
  setRetryConfig(config: {
    retries: number
    retryDelay: number
    retryCondition: (error: ApiError) => boolean
  }): void {
    this.retryConfig = { ...config }
  }

  // Upload and download
  async upload<T>(
    url: string,
    file: File | Blob | FormData,
    config?: Partial<ApiRequestConfig>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData()
    if (!(file instanceof FormData)) {
      formData.append('file', file)
    }

    return this.request<T>({
      url,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
  }

  async download(
    url: string,
    config?: Partial<ApiRequestConfig>,
    onProgress?: (progress: number) => void
  ): Promise<ArrayBuffer> {
    const response = await this.request<ArrayBuffer>({
      url,
      method: 'GET',
      ...config,
    })
    return response.data
  }

  // Concurrent requests
  async all<T>(requests: Promise<ApiResponse<T>>[]): Promise<ApiResponse<T>[]> {
    return Promise.all(requests)
  }

  spread<T, R>(callback: (...args: T[]) => R): (arr: T[]) => R {
    return (arr: T[]) => callback(...arr)
  }

  // Request cancellation
  createCancelToken(): { token: unknown; cancel: (message?: string) => void } {
    const source: CancelTokenSource = this.instance.defaults.adapter === undefined
      ? { token: undefined, cancel: () => {} } as any
      : axios.CancelToken.source()
    
    return {
      token: source.token,
      cancel: source.cancel,
    }
  }

  // Health and monitoring
  async ping(url = '/health'): Promise<{ online: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now()
    try {
      await this.get(url, { timeout: 5000 })
      const responseTime = Date.now() - startTime
      return { online: true, responseTime }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { online: false, responseTime, error: message }
    }
  }

  // Debugging and development
  enableDebugMode(): void {
    this.debugMode = true
  }

  disableDebugMode(): void {
    this.debugMode = false
  }

  getStats(): {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    averageResponseTime: number
    cacheHitRate: number
  } {
    const averageResponseTime = this.stats.totalRequests > 0 
      ? this.stats.totalResponseTime / this.stats.totalRequests 
      : 0
    
    const cacheHitRate = this.stats.totalRequests > 0
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100
      : 0

    return {
      ...this.stats,
      averageResponseTime,
      cacheHitRate,
    }
  }

  // Cleanup
  cleanup(): void {
    this.clearInterceptors()
    this.cache.clear()
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
    }
  }

  // Private cache methods
  private getCacheKey(config: ApiRequestConfig): string {
    const { url, method, params } = config
    const paramsStr = params ? JSON.stringify(params) : ''
    return `${method}-${url}-${paramsStr}`
  }

  private getCachedResponse<T>(config: ApiRequestConfig): ApiResponse<T> | null {
    const key = this.getCacheKey(config)
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return { ...entry.response, fromCache: true, cached: true }
  }

  private setCachedResponse<T>(config: ApiRequestConfig, response: ApiResponse<T>, ttl: number): void {
    if (this.cache.size >= this.cacheConfig.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    const key = this.getCacheKey(config)
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl,
    })
  }
}