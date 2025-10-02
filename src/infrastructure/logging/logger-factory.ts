/**
 * Logger factory for creating appropriate logger instances
 * Provides development and production logger configurations
 */

import { ILoggingService, LogLevel } from '@/src/domain/services/logging.service.interface'
import { ConsoleLoggerService } from './console-logger.service'
import { SentryLoggerService, SentryLoggerConfig } from './sentry-logger.service'

export type LoggerType = 'console' | 'sentry' | 'hybrid'

export interface LoggerFactoryConfig {
  type: LoggerType
  logLevel?: LogLevel
  sentry?: SentryLoggerConfig
  enableConsoleInProduction?: boolean
}

/**
 * Hybrid logger that combines console and Sentry logging
 */
class HybridLogger implements ILoggingService {
  private consoleLogger: ConsoleLoggerService
  private sentryLogger: SentryLoggerService

  constructor(sentryConfig: SentryLoggerConfig) {
    this.consoleLogger = new ConsoleLoggerService()
    this.sentryLogger = new SentryLoggerService(sentryConfig)
  }

  // Basic logging methods - delegate to both loggers
  debug(message: string, context?: any): void {
    this.consoleLogger.debug(message, context)
    // Don't send debug to Sentry to avoid noise
  }

  info(message: string, context?: any): void {
    this.consoleLogger.info(message, context)
    this.sentryLogger.info(message, context)
  }

  warn(message: string, context?: any): void {
    this.consoleLogger.warn(message, context)
    this.sentryLogger.warn(message, context)
  }

  error(message: string, error?: Error, context?: any): void {
    this.consoleLogger.error(message, error, context)
    this.sentryLogger.error(message, error, context)
  }

  fatal(message: string, error?: Error, context?: any): void {
    this.consoleLogger.fatal(message, error, context)
    this.sentryLogger.fatal(message, error, context)
  }

  // Structured logging
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>, context?: any): void {
    this.consoleLogger.log(level, message, metadata, context)
    
    // Only send warn/error/fatal to Sentry to reduce noise
    if (level === 'warn' || level === 'error' || level === 'fatal') {
      this.sentryLogger.log(level, message, metadata, context)
    }
  }

  // Performance logging
  startTimer(name: string, context?: any): () => void {
    const consoleTimer = this.consoleLogger.startTimer(name, context)
    const sentryTimer = this.sentryLogger.startTimer(name, context)

    return () => {
      consoleTimer()
      sentryTimer()
    }
  }

  logPerformance(name: string, durationMs: number, context?: any): void {
    this.consoleLogger.logPerformance(name, durationMs, context)
    this.sentryLogger.logPerformance(name, durationMs, context)
  }

  // User activity logging
  logUserAction(action: string, userId: string, details?: Record<string, unknown>): void {
    this.consoleLogger.logUserAction(action, userId, details)
    this.sentryLogger.logUserAction(action, userId, details)
  }

  logMediaInteraction(action: 'play' | 'pause' | 'stop' | 'seek' | 'complete', mediaId: string, userId: string, details?: Record<string, unknown>): void {
    this.consoleLogger.logMediaInteraction(action, mediaId, userId, details)
    this.sentryLogger.logMediaInteraction(action, mediaId, userId, details)
  }

  logSearchActivity(query: string, userId?: string, results?: number): void {
    this.consoleLogger.logSearchActivity(query, userId, results)
    this.sentryLogger.logSearchActivity(query, userId, results)
  }

  // Stream and playback logging
  logStreamEvent(event: 'start' | 'buffer' | 'error' | 'complete', streamId: string, userId: string, details?: Record<string, unknown>): void {
    this.consoleLogger.logStreamEvent(event, streamId, userId, details)
    this.sentryLogger.logStreamEvent(event, streamId, userId, details)
  }

  logPlaybackEvent(event: 'start' | 'pause' | 'resume' | 'stop' | 'error', mediaId: string, userId: string, position?: number, details?: Record<string, unknown>): void {
    this.consoleLogger.logPlaybackEvent(event, mediaId, userId, position, details)
    this.sentryLogger.logPlaybackEvent(event, mediaId, userId, position, details)
  }

  // API and network logging
  logApiRequest(method: string, url: string, statusCode: number, durationMs: number, context?: any): void {
    this.consoleLogger.logApiRequest(method, url, statusCode, durationMs, context)
    
    // Only log errors to Sentry
    if (statusCode >= 400) {
      this.sentryLogger.logApiRequest(method, url, statusCode, durationMs, context)
    }
  }

  logApiError(method: string, url: string, error: Error, context?: any): void {
    this.consoleLogger.logApiError(method, url, error, context)
    this.sentryLogger.logApiError(method, url, error, context)
  }

  // Security and authentication logging
  logAuthEvent(event: 'login' | 'logout' | 'token_refresh' | 'auth_failure', userId?: string, details?: Record<string, unknown>): void {
    this.consoleLogger.logAuthEvent(event, userId, details)
    this.sentryLogger.logAuthEvent(event, userId, details)
  }

  logSecurityEvent(event: string, userId?: string, ipAddress?: string, details?: Record<string, unknown>): void {
    this.consoleLogger.logSecurityEvent(event, userId, ipAddress, details)
    this.sentryLogger.logSecurityEvent(event, userId, ipAddress, details)
  }

  // Error tracking and analytics
  logBusinessError(errorType: string, message: string, context?: any, metadata?: Record<string, unknown>): void {
    this.consoleLogger.logBusinessError(errorType, message, context, metadata)
    this.sentryLogger.logBusinessError(errorType, message, context, metadata)
  }

  logTechnicalError(error: Error, context?: any, metadata?: Record<string, unknown>): void {
    this.consoleLogger.logTechnicalError(error, context, metadata)
    this.sentryLogger.logTechnicalError(error, context, metadata)
  }

  // Configuration and debugging
  setLogLevel(level: LogLevel): void {
    this.consoleLogger.setLogLevel(level)
    this.sentryLogger.setLogLevel(level)
  }

  getLogLevel(): LogLevel {
    return this.consoleLogger.getLogLevel()
  }

  addContext(context: any): void {
    this.consoleLogger.addContext(context)
    this.sentryLogger.addContext(context)
  }

  removeContext(keys: string[]): void {
    this.consoleLogger.removeContext(keys)
    this.sentryLogger.removeContext(keys)
  }

  clearContext(): void {
    this.consoleLogger.clearContext()
    this.sentryLogger.clearContext()
  }

  // Log management
  async flush(): Promise<void> {
    await Promise.allSettled([
      this.consoleLogger.flush(),
      this.sentryLogger.flush(),
    ])
  }

  async exportLogs(startDate: Date, endDate: Date, levels?: LogLevel[]): Promise<any[]> {
    // Only console logger supports export
    return this.consoleLogger.exportLogs(startDate, endDate, levels)
  }
}

/**
 * Factory class for creating logger instances
 */
export class LoggerFactory {
  /**
   * Create a logger instance based on configuration
   */
  static createLogger(config: LoggerFactoryConfig): ILoggingService {
    const logLevel = config.logLevel || (__DEV__ ? 'debug' : 'info')

    switch (config.type) {
      case 'console':
        return new ConsoleLoggerService(logLevel)

      case 'sentry':
        if (!config.sentry) {
          throw new Error('Sentry configuration is required when using sentry logger')
        }
        return new SentryLoggerService(config.sentry)

      case 'hybrid':
        if (!config.sentry) {
          throw new Error('Sentry configuration is required when using hybrid logger')
        }
        return new HybridLogger(config.sentry)

      default:
        throw new Error(`Unknown logger type: ${config.type}`)
    }
  }

  /**
   * Create a development logger (console only)
   */
  static createDevelopmentLogger(logLevel: LogLevel = 'debug'): ILoggingService {
    return new ConsoleLoggerService(logLevel)
  }

  /**
   * Create a production logger (Sentry with optional console)
   */
  static createProductionLogger(sentryConfig: SentryLoggerConfig): ILoggingService {
    if (sentryConfig.enableConsoleLogging) {
      return new HybridLogger(sentryConfig)
    } else {
      return new SentryLoggerService(sentryConfig)
    }
  }

  /**
   * Create logger based on environment
   */
  static createEnvironmentLogger(
    environment: 'development' | 'staging' | 'production',
    sentryDsn?: string,
    options: {
      logLevel?: LogLevel
      enableConsoleInProduction?: boolean
      enablePerformanceMonitoring?: boolean
    } = {}
  ): ILoggingService {
    const logLevel = options.logLevel || (environment === 'development' ? 'debug' : 'info')

    if (environment === 'development') {
      return LoggerFactory.createDevelopmentLogger(logLevel)
    }

    if (!sentryDsn) {
      console.warn('Sentry DSN not provided, falling back to console logger')
      return new ConsoleLoggerService(logLevel)
    }

    const sentryConfig: SentryLoggerConfig = {
      dsn: sentryDsn,
      environment,
      enableConsoleLogging: options.enableConsoleInProduction ?? false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      sampleRate: environment === 'production' ? 1.0 : 1.0,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      debug: environment !== 'production',
    }

    return LoggerFactory.createProductionLogger(sentryConfig)
  }
}

/**
 * Default logger instance factory
 */
export const createDefaultLogger = (): ILoggingService => {
  const environment = __DEV__ ? 'development' : 'production'
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN

  return LoggerFactory.createEnvironmentLogger(environment, sentryDsn, {
    enableConsoleInProduction: __DEV__,
    enablePerformanceMonitoring: true,
  })
}