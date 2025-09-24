export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

export interface ILoggingService {
  debug(message: string, error?: Error, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, error?: Error, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void
}