import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, isAxiosError, InternalAxiosRequestConfig } from 'axios'
import { IApiClient, ApiConfig, ApiResponse, ApiError, ILoggingService } from '@/src/domain/services'

export interface RequestInterceptor {
  onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  onRejected?: (error: unknown) => unknown
}

export interface ResponseInterceptor {
  onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
  onRejected?: (error: unknown) => unknown
}

export interface AxiosClientOptions {
  requestInterceptors?: RequestInterceptor[]
  responseInterceptors?: ResponseInterceptor[]
  enableDefaultLogging?: boolean
}

export class AxiosApiClient implements IApiClient {
  private client: AxiosInstance
  private defaultConfig: ApiConfig
  private options: AxiosClientOptions

  constructor(
    config: ApiConfig,
    private readonly logger: ILoggingService,
    options: AxiosClientOptions = {}
  ) {
    this.defaultConfig = { ...config }
    this.options = {
      enableDefaultLogging: true,
      ...options
    }
    this.client = axios.create(config)
    this.setupInterceptors()
    this.logger.info('Generic API client initialized', {
      baseURL: config.baseURL,
      timeout: config.timeout,
      hasCustomInterceptors: (options.requestInterceptors?.length || 0) + (options.responseInterceptors?.length || 0) > 0
    })
  }

  private setupInterceptors(): void {
    // Set up default request interceptor (if logging is enabled)
    if (this.options.enableDefaultLogging) {
      this.client.interceptors.request.use(
        (config) => {
          // Log request details
          this.logger.debug(`API request: ${config.method?.toUpperCase()} ${config.url}`, undefined, {
            hasAuth: !!config.headers?.Authorization,
            headers: Object.keys(config.headers || {})
          })
          return config
        },
        (error) => {
          this.logger.error('API request interceptor error', error instanceof Error ? error : new Error(String(error)))
          return Promise.reject(this.handleError(error))
        }
      )
    }

    // Set up custom request interceptors
    if (this.options.requestInterceptors) {
      for (const interceptor of this.options.requestInterceptors) {
        this.client.interceptors.request.use(
          interceptor.onFulfilled,
          interceptor.onRejected
        )
      }
    }

    // Set up default response interceptor (if logging is enabled)
    if (this.options.enableDefaultLogging) {
      this.client.interceptors.response.use(
        (response) => {
          this.logger.debug(`API response: ${response.status} ${response.statusText}`, undefined, {
            url: response.config.url,
            status: response.status
          })
          return response
        },
        (error) => {
          const apiError = this.handleError(error)
          this.logger.error('API response error', error instanceof Error ? error : new Error(String(error)), {
            status: apiError.status,
            code: apiError.code
          })
          return Promise.reject(apiError)
        }
      )
    }

    // Set up custom response interceptors
    if (this.options.responseInterceptors) {
      for (const interceptor of this.options.responseInterceptors) {
        this.client.interceptors.response.use(
          interceptor.onFulfilled,
          interceptor.onRejected
        )
      }
    }
  }

  private handleError(error: unknown): ApiError {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError
      return {
        message: axiosError.message || 'API request failed',
        status: axiosError.response?.status,
        code: axiosError.code,
        data: axiosError.response?.data
      }
    }

    const errorInstance = error instanceof Error ? error : new Error(String(error))
    return {
      message: errorInstance.message || 'Unknown API error occurred'
    }
  }

  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>
    }
  }

  async get<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    try {
      this.logger.debug(`GET request to: ${url}`)
      const mergedConfig: AxiosRequestConfig = {
        ...config,
        headers: { ...this.defaultConfig.headers, ...config?.headers }
      }
      const response = await this.client.get<T>(url, mergedConfig)
      this.logger.debug(`GET request successful: ${url}`, undefined, { status: response.status })
      return this.transformResponse<T>(response)
    } catch (error) {
      this.logger.error(`GET request failed: ${url}`, error instanceof Error ? error : new Error(String(error)))
      throw this.handleError(error)
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    try {
      this.logger.debug(`POST request to: ${url}`, undefined, { hasData: data !== undefined })
      const mergedConfig: AxiosRequestConfig = {
        ...config,
        headers: { ...this.defaultConfig.headers, ...config?.headers }
      }
      const response = await this.client.post<T>(url, data, mergedConfig)
      this.logger.debug(`POST request successful: ${url}`, undefined, { status: response.status })
      return this.transformResponse<T>(response)
    } catch (error) {
      this.logger.error(`POST request failed: ${url}`, error instanceof Error ? error : new Error(String(error)))
      throw this.handleError(error)
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    try {
      this.logger.debug(`PUT request to: ${url}`, undefined, { hasData: data !== undefined })
      const mergedConfig: AxiosRequestConfig = {
        ...config,
        headers: { ...this.defaultConfig.headers, ...config?.headers }
      }
      const response = await this.client.put<T>(url, data, mergedConfig)
      this.logger.debug(`PUT request successful: ${url}`, undefined, { status: response.status })
      return this.transformResponse<T>(response)
    } catch (error) {
      this.logger.error(`PUT request failed: ${url}`, error instanceof Error ? error : new Error(String(error)))
      throw this.handleError(error)
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    try {
      this.logger.debug(`PATCH request to: ${url}`, undefined, { hasData: data !== undefined })
      const mergedConfig: AxiosRequestConfig = {
        ...config,
        headers: { ...this.defaultConfig.headers, ...config?.headers }
      }
      const response = await this.client.patch<T>(url, data, mergedConfig)
      this.logger.debug(`PATCH request successful: ${url}`, undefined, { status: response.status })
      return this.transformResponse<T>(response)
    } catch (error) {
      this.logger.error(`PATCH request failed: ${url}`, error instanceof Error ? error : new Error(String(error)))
      throw this.handleError(error)
    }
  }

  async delete<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    try {
      this.logger.debug(`DELETE request to: ${url}`)
      const mergedConfig: AxiosRequestConfig = {
        ...config,
        headers: { ...this.defaultConfig.headers, ...config?.headers }
      }
      const response = await this.client.delete<T>(url, mergedConfig)
      this.logger.debug(`DELETE request successful: ${url}`, undefined, { status: response.status })
      return this.transformResponse<T>(response)
    } catch (error) {
      this.logger.error(`DELETE request failed: ${url}`, error instanceof Error ? error : new Error(String(error)))
      throw this.handleError(error)
    }
  }

  setDefaultConfig(config: Partial<ApiConfig>): void {
    this.logger.info('Updating API client default config', config)
    this.defaultConfig = { ...this.defaultConfig, ...config }

    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL
    }
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout
    }
    if (config.headers) {
      this.client.defaults.headers = {
        ...this.client.defaults.headers,
        ...config.headers
      }
    }
    this.logger.debug('API client config updated successfully')
  }

  getDefaultConfig(): ApiConfig {
    return { ...this.defaultConfig }
  }
}