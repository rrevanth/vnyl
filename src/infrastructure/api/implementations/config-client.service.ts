import { ApiConfig, IConfigClient, ILoggingService, IUserPreferenceService } from '@/src/domain/services'

export class ConfigClient implements IConfigClient {
  private config: ApiConfig

  constructor(
    initialConfig: ApiConfig,
    private readonly logger: ILoggingService,
    private readonly userPreferenceService: IUserPreferenceService
  ) {
    this.config = { ...initialConfig }
    this.logger.info('Config client initialized', {
      baseURL: initialConfig.baseURL,
      hasPreferenceService: !!userPreferenceService
    })
  }

  getApiConfig(): ApiConfig {
    this.logger.debug('Retrieved base API config')
    return { ...this.config }
  }

  updateApiConfig(config: Partial<ApiConfig>): void {
    this.logger.info('Updating base API config', config)
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers
      }
    }
    this.logger.debug('Base API config updated successfully')
  }
}