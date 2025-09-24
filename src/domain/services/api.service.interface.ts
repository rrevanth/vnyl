export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  data?: unknown
}

export interface IApiClient {
  get<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>>
  post<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>>
  put<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>>
  patch<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>>
  delete<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>>
  setDefaultConfig(config: Partial<ApiConfig>): void
  getDefaultConfig(): ApiConfig
}

export interface IConfigClient {
  getApiConfig(): ApiConfig
  updateApiConfig(config: Partial<ApiConfig>): void
}