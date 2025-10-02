/**
 * Dependency injection layer barrel exports
 */

export {
  DIContainer,
  createContainer,
  getContainer,
  buildContainer,
  resolve,
  tryResolve,
  getApiService,
  getStorageService,
  getLoggingService,
  getI18nService,
  getThemeService,
  useService,
  useServices,
  disposeContainer,
  type ContainerConfig,
  type AppConfiguration,
} from './container'

export {
  ServiceRegistry,
  type ServiceDescriptor,
  type ServiceLifetime,
  type ServiceRegistrationOptions,
} from './service-registry'

export {
  TOKENS,
  TOKEN_CATEGORIES,
  getTokensInCategory,
  isTokenInCategory,
  getTokenName,
  type ServiceToken,
} from './tokens'