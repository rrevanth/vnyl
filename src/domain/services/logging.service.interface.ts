/**
 * Logging service interface for structured application logging
 * Infrastructure layer will implement this interface
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
  function?: string
  mediaId?: string
  playlistId?: string
  streamId?: string
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string | number
  }
  metadata?: Record<string, unknown>
}

export interface ILoggingService {
  // Basic logging methods
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
  fatal(message: string, error?: Error, context?: LogContext): void
  
  // Structured logging with metadata
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>, context?: LogContext): void
  
  // Performance logging
  startTimer(name: string, context?: LogContext): () => void
  logPerformance(name: string, durationMs: number, context?: LogContext): void
  
  // User activity logging
  logUserAction(action: string, userId: string, details?: Record<string, unknown>): void
  logMediaInteraction(action: 'play' | 'pause' | 'stop' | 'seek' | 'complete', mediaId: string, userId: string, details?: Record<string, unknown>): void
  logSearchActivity(query: string, userId?: string, results?: number): void
  
  // Stream and playback logging
  logStreamEvent(event: 'start' | 'buffer' | 'error' | 'complete', streamId: string, userId: string, details?: Record<string, unknown>): void
  logPlaybackEvent(event: 'start' | 'pause' | 'resume' | 'stop' | 'error', mediaId: string, userId: string, position?: number, details?: Record<string, unknown>): void
  
  // API and network logging
  logApiRequest(method: string, url: string, statusCode: number, durationMs: number, context?: LogContext): void
  logApiError(method: string, url: string, error: Error, context?: LogContext): void
  
  // Security and authentication logging
  logAuthEvent(event: 'login' | 'logout' | 'token_refresh' | 'auth_failure', userId?: string, details?: Record<string, unknown>): void
  logSecurityEvent(event: string, userId?: string, ipAddress?: string, details?: Record<string, unknown>): void
  
  // Error tracking and analytics
  logBusinessError(errorType: string, message: string, context?: LogContext, metadata?: Record<string, unknown>): void
  logTechnicalError(error: Error, context?: LogContext, metadata?: Record<string, unknown>): void
  
  // Configuration and debugging
  setLogLevel(level: LogLevel): void
  getLogLevel(): LogLevel
  addContext(context: LogContext): void
  removeContext(keys: string[]): void
  clearContext(): void
  
  // Log management
  flush(): Promise<void>
  exportLogs(startDate: Date, endDate: Date, levels?: LogLevel[]): Promise<LogEntry[]>
}