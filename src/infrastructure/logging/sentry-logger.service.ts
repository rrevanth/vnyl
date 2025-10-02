/**
 * Sentry logger implementation for production
 * Provides error tracking and performance monitoring through Sentry
 */

import * as Sentry from '@sentry/react-native'
import {
  ILoggingService,
  LogLevel,
  LogContext,
  LogEntry,
} from '@/src/domain/services/logging.service.interface'

export interface SentryLoggerConfig {
  dsn: string
  environment: 'development' | 'staging' | 'production'
  enableConsoleLogging?: boolean
  enablePerformanceMonitoring?: boolean
  enableAutoInstrumentation?: boolean
  sampleRate?: number
  tracesSampleRate?: number
  debug?: boolean
}

export class SentryLoggerService implements ILoggingService {
  private globalContext: LogContext = {}
  private currentLogLevel: LogLevel = 'info'
  private enableConsoleLogging: boolean
  private performanceTimers = new Map<string, number>()

  private readonly logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  }

  constructor(config: SentryLoggerConfig) {
    this.enableConsoleLogging = config.enableConsoleLogging ?? __DEV__

    // Initialize Sentry
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      debug: config.debug ?? __DEV__,
      sampleRate: config.sampleRate ?? 1.0,
      tracesSampleRate: config.tracesSampleRate ?? (__DEV__ ? 1.0 : 0.1),
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      beforeSend: (event) => {
        // Filter out development errors in production
        if (config.environment === 'production' && event.tags?.environment === 'development') {
          return null
        }
        return event
      },
      beforeSendTransaction: (transaction) => {
        // Filter out noisy transactions
        if (transaction.transaction?.includes('__DEV__') || 
            transaction.transaction?.includes('[HMR]')) {
          return null
        }
        return transaction
      },
    })

    // Set up global tags
    Sentry.setTag('platform', 'react-native')
    Sentry.setTag('app', 'vnyl')
  }

  // Basic logging methods
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, undefined, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const metadata = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    } : undefined

    this.log('error', message, metadata, context)

    // Send to Sentry for error tracking
    if (error) {
      Sentry.captureException(error)
    } else {
      Sentry.captureMessage(message, 'error')
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const metadata = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    } : undefined

    this.log('fatal', message, metadata, context)

    // Send to Sentry as fatal error
    if (error) {
      Sentry.captureException(error)
    } else {
      Sentry.captureMessage(message, 'fatal')
    }
  }

  // Structured logging with metadata
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>, context?: LogContext): void {
    if (this.logLevels[level] < this.logLevels[this.currentLogLevel]) {
      return
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.globalContext, ...context },
      metadata,
    }

    if (metadata?.errorName || metadata?.errorMessage) {
      logEntry.error = {
        name: metadata.errorName as string || 'Error',
        message: metadata.errorMessage as string || message,
        stack: metadata.errorStack as string,
        code: metadata.errorCode as string | number,
      }
    }

    // Send to Sentry based on log level
    if (level === 'error' || level === 'fatal') {
      Sentry.captureMessage(message, level)
    } else if (level === 'warn') {
      Sentry.captureMessage(message, 'warning')
    }

    // Console logging if enabled
    if (this.enableConsoleLogging) {
      this.outputToConsole(logEntry)
    }
  }

  // Performance logging
  startTimer(name: string, context?: LogContext): () => void {
    const startTime = Date.now()
    this.performanceTimers.set(name, startTime)

    this.debug(`Timer started: ${name}`, context)

    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      this.performanceTimers.delete(name)
      
      this.logPerformance(name, duration, context)
    }
  }

  logPerformance(name: string, durationMs: number, context?: LogContext): void {
    const level = durationMs > 1000 ? 'warn' : durationMs > 500 ? 'info' : 'debug'
    
    // Add performance breadcrumb
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name}: ${durationMs}ms`,
      level: level === 'warn' ? 'warning' : 'info',
      data: {
        duration: durationMs,
        ...context,
      },
    })
    
    this.log(level, `Performance: ${name}`, {
      duration: durationMs,
      durationFormatted: this.formatDuration(durationMs),
    }, {
      ...context,
      component: 'performance',
    })
  }

  // User activity logging
  logUserAction(action: string, userId: string, details?: Record<string, unknown>): void {
    // Set user in Sentry scope
    Sentry.setUser({ id: userId })

    Sentry.addBreadcrumb({
      category: 'user.action',
      message: action,
      level: 'info',
      data: {
        userId,
        ...details,
      },
    })

    this.info(`User action: ${action}`, {
      userId,
      component: 'user-activity',
      function: action,
      ...details,
    })
  }

  logMediaInteraction(
    action: 'play' | 'pause' | 'stop' | 'seek' | 'complete',
    mediaId: string,
    userId: string,
    details?: Record<string, unknown>
  ): void {
    Sentry.addBreadcrumb({
      category: 'media.interaction',
      message: `Media ${action}`,
      level: 'info',
      data: {
        action,
        mediaId,
        userId,
        ...details,
      },
    })

    this.info(`Media ${action}`, {
      userId,
      mediaId,
      component: 'media-player',
      function: `media-${action}`,
      ...details,
    })
  }

  logSearchActivity(query: string, userId?: string, results?: number): void {
    Sentry.addBreadcrumb({
      category: 'search',
      message: `Search: "${query}"`,
      level: 'info',
      data: {
        query,
        userId,
        resultCount: results,
      },
    })

    this.info(`Search: "${query}"`, {
      userId,
      component: 'search',
      function: 'search-query',
      searchQuery: query,
      resultCount: results,
    })
  }

  // Stream and playback logging
  logStreamEvent(
    event: 'start' | 'buffer' | 'error' | 'complete',
    streamId: string,
    userId: string,
    details?: Record<string, unknown>
  ): void {
    const level = event === 'error' ? 'error' : 'info'
    
    Sentry.addBreadcrumb({
      category: 'stream',
      message: `Stream ${event}`,
      level: event === 'error' ? 'error' : 'info',
      data: {
        event,
        streamId,
        userId,
        ...details,
      },
    })
    
    this.log(level, `Stream ${event}`, details, {
      userId,
      streamId,
      component: 'streaming',
      function: `stream-${event}`,
    })
  }

  logPlaybackEvent(
    event: 'start' | 'pause' | 'resume' | 'stop' | 'error',
    mediaId: string,
    userId: string,
    position?: number,
    details?: Record<string, unknown>
  ): void {
    const level = event === 'error' ? 'error' : 'info'
    
    Sentry.addBreadcrumb({
      category: 'playback',
      message: `Playback ${event}`,
      level: event === 'error' ? 'error' : 'info',
      data: {
        event,
        mediaId,
        userId,
        position,
        ...details,
      },
    })
    
    this.log(level, `Playback ${event}`, {
      position,
      positionFormatted: position ? this.formatDuration(position * 1000) : undefined,
      ...details,
    }, {
      userId,
      mediaId,
      component: 'playback',
      function: `playback-${event}`,
    })
  }

  // API and network logging
  logApiRequest(method: string, url: string, statusCode: number, durationMs: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info'
    
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: statusCode >= 400 ? 'error' : 'info',
      data: {
        method,
        url,
        statusCode,
        duration: durationMs,
        ...context,
      },
    })
    
    this.log(level, `API ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration: durationMs,
      durationFormatted: this.formatDuration(durationMs),
    }, {
      ...context,
      component: 'api',
      function: 'api-request',
    })
  }

  logApiError(method: string, url: string, error: Error, context?: LogContext): void {
    Sentry.captureException(error)

    this.error(`API ${method} ${url} failed`, error, {
      ...context,
      component: 'api',
      function: 'api-error',
      method,
      url,
    })
  }

  // Security and authentication logging
  logAuthEvent(
    event: 'login' | 'logout' | 'token_refresh' | 'auth_failure',
    userId?: string,
    details?: Record<string, unknown>
  ): void {
    const level = event === 'auth_failure' ? 'warn' : 'info'
    
    // Set or clear user in Sentry
    if (event === 'login' && userId) {
      Sentry.setUser({ id: userId })
    } else if (event === 'logout') {
      Sentry.setUser(null)
    }

    Sentry.addBreadcrumb({
      category: 'auth',
      message: `Auth: ${event}`,
      level: event === 'auth_failure' ? 'warning' : 'info',
      data: {
        event,
        userId,
        ...details,
      },
    })
    
    this.log(level, `Auth: ${event}`, details, {
      userId,
      component: 'authentication',
      function: `auth-${event}`,
    })
  }

  logSecurityEvent(event: string, userId?: string, ipAddress?: string, details?: Record<string, unknown>): void {
    Sentry.captureMessage(`Security event: ${event}`, 'warning')

    this.warn(`Security event: ${event}`, {
      userId,
      ipAddress,
      component: 'security',
      function: 'security-event',
      ...details,
    })
  }

  // Error tracking and analytics
  logBusinessError(errorType: string, message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    Sentry.captureMessage(`Business error [${errorType}]: ${message}`, 'error')

    this.error(`Business error [${errorType}]: ${message}`, undefined, {
      ...context,
      component: 'business-logic',
      errorType,
    })
  }

  logTechnicalError(error: Error, context?: LogContext, metadata?: Record<string, unknown>): void {
    Sentry.captureException(error)

    this.error(`Technical error: ${error.message}`, error, {
      ...context,
      component: 'technical',
      function: 'technical-error',
    })
  }

  // Configuration and debugging
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level
    Sentry.setTag('log.level', level)
    this.info(`Log level set to: ${level}`)
  }

  getLogLevel(): LogLevel {
    return this.currentLogLevel
  }

  addContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context }
    
    // Add to Sentry scope
    try {
      Object.entries(context).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          Sentry.setTag(key, value.toString())
        } else {
          Sentry.setContext(key, value as any)
        }
      })
    } catch (error) {
      console.warn('Failed to set Sentry context:', error)
    }
  }

  removeContext(keys: string[]): void {
    const newContext = { ...this.globalContext }
    keys.forEach(key => delete newContext[key])
    this.globalContext = newContext
  }

  clearContext(): void {
    this.globalContext = {}
  }

  // Log management
  async flush(): Promise<void> {
    try {
      await Sentry.flush()
      this.debug('Sentry logs flushed')
    } catch (error) {
      console.warn('Failed to flush Sentry logs:', error)
    }
  }

  async exportLogs(startDate: Date, endDate: Date, levels?: LogLevel[]): Promise<LogEntry[]> {
    this.warn('Sentry logger does not support log export - use Sentry dashboard')
    return []
  }

  // Private utility methods
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const component = entry.context?.component ? `[${entry.context.component}]` : ''
    const userId = entry.context?.userId ? `(${entry.context.userId})` : ''
    
    const logMessage = `${timestamp} ${component}${userId} ${entry.message}`

    switch (entry.level) {
      case 'debug':
        console.debug(logMessage, entry.metadata || '')
        break
      case 'info':
        console.info(logMessage, entry.metadata || '')
        break
      case 'warn':
        console.warn(logMessage, entry.metadata || '')
        break
      case 'error':
      case 'fatal':
        console.error(logMessage, entry.error || entry.metadata || '')
        break
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(1)
      return `${minutes}m ${seconds}s`
    }
  }
}