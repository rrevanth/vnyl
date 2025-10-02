/**
 * Axios API client barrel exports
 */

export { AxiosApiService } from './axios-client.service'
export { createAxiosInstance, type AxiosClientConfig } from './axios-config'
export type {
  createAxiosInstance as CreateAxiosInstance,
  enhanceAxiosError as EnhanceAxiosError,
  convertAxiosConfigToApiConfig as ConvertAxiosConfigToApiConfig,
  convertApiConfigToAxiosConfig as ConvertApiConfigToAxiosConfig,
  convertAxiosResponse as ConvertAxiosResponse,
} from './axios-config'