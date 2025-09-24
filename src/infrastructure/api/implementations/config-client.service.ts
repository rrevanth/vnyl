import { ApiConfig, IConfigClient, ILoggingService } from '@/src/domain/services'

export class ConfigClient implements IConfigClient {
  private config: ApiConfig

  constructor(initialConfig: ApiConfig, private readonly logger: ILoggingService) {
    this.config = { ...initialConfig }
    this.logger.info('Config client initialized', { baseURL: initialConfig.baseURL })
  }

  getApiConfig(): ApiConfig {
    this.logger.debug('Retrieved API config')
    return { ...this.config }
  }

  updateApiConfig(config: Partial<ApiConfig>): void {
    this.logger.info('Updating API config', config)
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers
      }
    }
    this.logger.debug('API config updated successfully')
  }
}