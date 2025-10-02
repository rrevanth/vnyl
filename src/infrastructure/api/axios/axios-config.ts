/**
 * Axios configuration and factory for API clients
 * Configures Axios with Bearer token authentication, retries, and interceptors
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry'
import { ApiRequestConfig, ApiError } from '@/src/domain/services/api.service.interface'

export interface AxiosClientConfig {
  baseURL: string
  timeout: number
  retries: number
  retryDelay: number
  bearerToken?: string
  apiKey?: string
  apiKeyHeader?: string
  enableLogging?: boolean
}

export const createAxiosInstance = (config: AxiosClientConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  // Configure axios-retry
  axiosRetry(instance, {
    retries: config.retries,
    retryDelay: (retryCount) => {
      return retryCount * config.retryDelay
    },
    retryCondition: (error) => {
      // Retry on network errors or 5xx status codes
      return isNetworkOrIdempotentRequestError(error) ||
             (error.response?.status ? error.response.status >= 500 : false)
    },
  })

  // Authentication interceptor
  instance.interceptors.request.use(
    (axiosConfig) => {
      // Add Bearer token if available
      if (config.bearerToken) {
        axiosConfig.headers = axiosConfig.headers || {}
        axiosConfig.headers.Authorization = `Bearer ${config.bearerToken}`
      }

      // Add API key if available
      if (config.apiKey && config.apiKeyHeader) {
        axiosConfig.headers = axiosConfig.headers || {}
        axiosConfig.headers[config.apiKeyHeader] = config.apiKey
      }

      // Validate Bearer token exists
      const authHeader = axiosConfig.headers?.Authorization
      const apiKeyHeader = config.apiKeyHeader ? axiosConfig.headers?.[config.apiKeyHeader] : undefined
      
      if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        if (!apiKeyHeader) {
          throw new Error('Bearer token or API key required for authentication')
        }
      }

      if (config.enableLogging && __DEV__) {
        console.log(`[API] ${axiosConfig.method?.toUpperCase()} ${axiosConfig.url}`)
      }

      return axiosConfig
    },
    (error) => {
      if (config.enableLogging && __DEV__) {
        console.error('[API] Request interceptor error:', error)
      }
      return Promise.reject(error)
    }
  )

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      if (config.enableLogging && __DEV__) {
        console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
      }
      return response
    },
    (error) => {
      if (config.enableLogging && __DEV__) {
        console.error('[API] Response error:', error.message)
      }
      return Promise.reject(enhanceAxiosError(error))
    }
  )

  return instance
}

/**
 * Convert Axios AxiosError to our ApiError interface
 */
export const enhanceAxiosError = (error: AxiosError): ApiError => {
  const apiError = new Error(error.message) as ApiError
  
  apiError.name = error.name
  apiError.config = convertAxiosConfigToApiConfig(error.config)
  apiError.code = error.code
  apiError.request = error.request
  
  if (error.response) {
    apiError.response = {
      data: error.response.data,
      status: error.response.status,
      statusText: error.response.statusText,
      headers: error.response.headers as Record<string, string>,
    }
  }

  // Determine error types
  apiError.isNetworkError = !error.response && !!error.request
  apiError.isTimeoutError = error.code === 'ECONNABORTED'
  apiError.isRetryableError = 
    apiError.isNetworkError || 
    apiError.isTimeoutError || 
    (error.response?.status ? error.response.status >= 500 : false)

  return apiError
}

/**
 * Convert Axios AxiosRequestConfig to our ApiRequestConfig
 */
export const convertAxiosConfigToApiConfig = (
  config?: AxiosRequestConfig
): ApiRequestConfig | undefined => {
  if (!config || !config.url) return undefined

  return {
    url: config.url,
    method: config.method?.toUpperCase() as any,
    headers: config.headers as Record<string, string>,
    params: config.params,
    data: config.data,
    timeout: config.timeout,
  }
}

/**
 * Convert our ApiRequestConfig to Axios AxiosRequestConfig
 */
export const convertApiConfigToAxiosConfig = (
  config: ApiRequestConfig
): AxiosRequestConfig => {
  return {
    url: config.url,
    method: config.method?.toLowerCase() as any,
    headers: config.headers,
    params: config.params,
    data: config.data,
    timeout: config.timeout,
  }
}

/**
 * Convert Axios response to our ApiResponse
 */
export const convertAxiosResponse = <T>(response: AxiosResponse<T>) => {
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers as Record<string, string>,
    config: convertAxiosConfigToApiConfig(response.config)!,
    cached: false,
    fromCache: false,
  }
}