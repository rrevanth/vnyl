/**
 * Domain Error Types
 * 
 * Specific error types for different failure scenarios in the VNYL application.
 * Each error type provides context-specific information for better error handling.
 */

/**
 * Base error class for all domain errors
 */
export abstract class DomainError extends Error {
  abstract readonly code: string
  abstract readonly severity: 'low' | 'medium' | 'high' | 'critical'
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends DomainError {
  readonly code = 'AUTH_ERROR'
  readonly severity = 'high' as const
}

export class AuthorizationError extends DomainError {
  readonly code = 'AUTHZ_ERROR'
  readonly severity = 'high' as const
}

/**
 * Configuration and environment errors
 */
export class ConfigurationError extends DomainError {
  readonly code = 'CONFIG_ERROR'
  readonly severity = 'critical' as const
}

export class EnvironmentError extends DomainError {
  readonly code = 'ENV_ERROR'
  readonly severity = 'critical' as const
}

/**
 * Network and API errors
 */
export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR'
  readonly severity = 'medium' as const
}

export class ApiError extends DomainError {
  readonly code = 'API_ERROR'
  readonly severity = 'medium' as const
  
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

/**
 * Data validation and parsing errors
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR'
  readonly severity = 'medium' as const
  
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

export class ParseError extends DomainError {
  readonly code = 'PARSE_ERROR'
  readonly severity = 'medium' as const
}

/**
 * Storage and persistence errors
 */
export class StorageError extends DomainError {
  readonly code = 'STORAGE_ERROR'
  readonly severity = 'medium' as const
  
  constructor(
    message: string,
    public readonly operation?: 'read' | 'write' | 'delete' | 'clear',
    public readonly key?: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

/**
 * Provider and catalog errors
 */
export class ProviderError extends DomainError {
  readonly code = 'PROVIDER_ERROR'
  readonly severity = 'medium' as const
  
  constructor(
    message: string,
    public readonly providerId?: string,
    public readonly operation?: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

export class CatalogError extends DomainError {
  readonly code = 'CATALOG_ERROR'
  readonly severity = 'medium' as const
  
  constructor(
    message: string,
    public readonly catalogId?: string,
    public readonly operation?: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

/**
 * User interface and interaction errors
 */
export class UIError extends DomainError {
  readonly code = 'UI_ERROR'
  readonly severity = 'low' as const
  
  constructor(
    message: string,
    public readonly component?: string,
    public readonly action?: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

/**
 * Internationalization errors
 */
export class I18nError extends DomainError {
  readonly code = 'I18N_ERROR'
  readonly severity = 'medium' as const
  
  constructor(
    message: string,
    public readonly locale?: string,
    public readonly key?: string,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

/**
 * Performance and resource errors
 */
export class PerformanceError extends DomainError {
  readonly code = 'PERFORMANCE_ERROR'
  readonly severity = 'low' as const
  
  constructor(
    message: string,
    public readonly metric?: string,
    public readonly threshold?: number,
    public readonly actual?: number,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message, context, originalError)
  }
}

/**
 * Utility functions for error handling
 */
export const createDomainError = (
  error: unknown,
  fallbackMessage: string,
  errorType: new (...args: any[]) => DomainError = ConfigurationError,
  context?: Record<string, unknown>
): DomainError => {
  if (error instanceof DomainError) {
    return error
  }
  
  if (error instanceof Error) {
    return new errorType(
      `${fallbackMessage}: ${error.message}`,
      context,
      error
    )
  }
  
  return new errorType(
    `${fallbackMessage}: ${String(error)}`,
    context
  )
}

export const isDomainError = (error: unknown): error is DomainError => {
  return error instanceof DomainError
}

export const getErrorCode = (error: unknown): string => {
  if (isDomainError(error)) {
    return error.code
  }
  return 'UNKNOWN_ERROR'
}

export const getErrorSeverity = (error: unknown): 'low' | 'medium' | 'high' | 'critical' => {
  if (isDomainError(error)) {
    return error.severity
  }
  return 'medium'
}