import { ILoggingService, LogLevel, LogContext } from '@/src/domain/services'

export class ConsoleLoggingService implements ILoggingService {
  private formatMessage(level: LogLevel, message: string, error?: Error, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    const errorStr = error ? ` | Error: ${error.message}` : ''

    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}${errorStr}`
  }

  debug(message: string, error?: Error, context?: LogContext): void {
    if (__DEV__) {
      console.debug(this.formatMessage('debug', message, error, context))
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, undefined, context))
  }

  warn(message: string, error?: Error, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, error, context))
  }

  error(message: string, error?: Error, context?: LogContext): void {
    console.error(this.formatMessage('error', message, error, context))
  }
}