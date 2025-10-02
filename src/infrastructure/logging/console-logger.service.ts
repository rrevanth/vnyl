/**
 * Console logger implementation for development
 * Provides structured logging to console with color coding and formatting
 */

import {
  ILoggingService,
  LogLevel,
  LogContext,
  LogEntry,
} from '@/src/domain/services/logging.service.interface'

export class ConsoleLoggerService implements ILoggingService {
  private globalContext: LogContext = {}
  private currentLogLevel: LogLevel = __DEV__ ? 'debug' : 'info'
  private performanceTimers = new Map<string, number>()

  private readonly logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  }

  private readonly logColors: Record<LogLevel, string> = {
    debug: '#8E8E93', // Gray
    info: '#007AFF',  // Blue
    warn: '#FF9500',  // Orange
    error: '#FF3B30', // Red
    fatal: '#FF2D92', // Pink
  }

  private readonly logEmojis: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    fatal: '💀',
  }

  constructor(initialLogLevel: LogLevel = __DEV__ ? 'debug' : 'info') {
    this.currentLogLevel = initialLogLevel
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
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const metadata = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    } : undefined

    this.log('fatal', message, metadata, context)
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

    this.outputLog(logEntry)
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
    this.info(`Media ${action}`, {
      userId,
      mediaId,
      component: 'media-player',
      function: `media-${action}`,
      ...details,
    })
  }

  logSearchActivity(query: string, userId?: string, results?: number): void {
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
    
    this.log(level, `Auth: ${event}`, details, {
      userId,
      component: 'authentication',
      function: `auth-${event}`,
    })
  }

  logSecurityEvent(event: string, userId?: string, ipAddress?: string, details?: Record<string, unknown>): void {
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
    this.error(`Business error [${errorType}]: ${message}`, undefined, {
      ...context,
      component: 'business-logic',
      errorType,
    })
  }

  logTechnicalError(error: Error, context?: LogContext, metadata?: Record<string, unknown>): void {
    this.error(`Technical error: ${error.message}`, error, {
      ...context,
      component: 'technical',
      function: 'technical-error',
    })
  }

  // Configuration and debugging
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level
    this.info(`Log level set to: ${level}`)
  }

  getLogLevel(): LogLevel {
    return this.currentLogLevel
  }

  addContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context }
  }

  removeContext(keys: string[]): void {
    const newContext = { ...this.globalContext }
    keys.forEach(key => delete newContext[key])
    this.globalContext = newContext
  }

  clearContext(): void {
    this.globalContext = {}
  }

  // Log management (Console logger doesn't persist logs)
  async flush(): Promise<void> {
    // Console logs are immediately flushed, no action needed
    this.debug('Logger flushed')
  }

  async exportLogs(startDate: Date, endDate: Date, levels?: LogLevel[]): Promise<LogEntry[]> {
    this.warn('Console logger does not support log export')
    return []
  }

  // Private utility methods
  private outputLog(entry: LogEntry): void {
    const emoji = this.logEmojis[entry.level]
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const component = entry.context?.component ? `[${entry.context.component}]` : ''
    const userId = entry.context?.userId ? `(${entry.context.userId})` : ''
    
    let logMessage = `${emoji} ${timestamp} ${component}${userId} ${entry.message}`

    // Add metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      logMessage += `\n  📋 Metadata: ${JSON.stringify(entry.metadata, null, 2)}`
    }

    // Add context if present and not just userId/component
    const contextToShow = { ...entry.context }
    delete contextToShow.userId
    delete contextToShow.component
    if (Object.keys(contextToShow).length > 0) {
      logMessage += `\n  🏷️  Context: ${JSON.stringify(contextToShow, null, 2)}`
    }

    // Add error details if present
    if (entry.error) {
      logMessage += `\n  🚨 Error: ${entry.error.name}: ${entry.error.message}`
      if (entry.error.stack && __DEV__) {
        logMessage += `\n  📚 Stack: ${entry.error.stack}`
      }
    }

    // Output using appropriate console method
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage)
        break
      case 'info':
        console.info(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      case 'error':
      case 'fatal':
        console.error(logMessage)
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