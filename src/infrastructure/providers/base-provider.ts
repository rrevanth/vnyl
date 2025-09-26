/**
 * Base Provider - Abstract Foundation for All Providers
 * 
 * Provides common functionality for all provider implementations including
 * error handling, logging, configuration validation, health checks, and DI support.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type { 
  IBaseProvider, 
  BaseProviderConfig, 
  ProviderHealthResult, 
  ProviderValidationResult 
} from './provider-interfaces'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

/**
 * Provider-specific error class
 */
export class ProviderError extends Error {
  public readonly code: string
  public readonly provider: string
  public readonly retryable: boolean
  public readonly context?: Record<string, unknown>
  public readonly timestamp: Date

  constructor(
    message: string,
    code: string,
    provider: string,
    retryable: boolean = false,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ProviderError'
    this.code = code
    this.provider = provider
    this.retryable = retryable
    this.context = context
    this.timestamp = new Date()
  }
}

/**
 * Abstract base provider with DI support and common functionality
 */
export abstract class BaseProvider implements IBaseProvider {
  protected readonly config: BaseProviderConfig
  protected readonly logger: ILoggingService
  private lastHealthCheck?: ProviderHealthResult

  constructor(config: BaseProviderConfig, logger: ILoggingService) {
    this.config = config
    this.logger = logger
    this.validateBaseConfiguration()
  }

  // ============================================================================
  // ABSTRACT MEMBERS - Must be implemented by subclasses
  // ============================================================================

  abstract get id(): string
  abstract get name(): string
  abstract get type(): string

  // ============================================================================
  // CONCRETE IMPLEMENTATIONS - Common functionality
  // ============================================================================

  /**
   * Get provider configuration
   */
  getConfig(): BaseProviderConfig {
    return { ...this.config }
  }

  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * Get provider priority (lower = higher priority)
   */
  getPriority(): number {
    return this.config.priority
  }

  /**
   * Perform health check with timing and error handling
   */
  async healthCheck(): Promise<ProviderHealthResult> {
    const startTime = Date.now()
    
    try {
      await this.performHealthCheck()
      const responseTime = Date.now() - startTime
      
      this.lastHealthCheck = {
        healthy: true,
        latency: responseTime,
        responseTime,
        lastCheck: new Date()
      }
      
      this.logger.debug(`Health check passed for provider ${this.name}`, undefined, {
        provider: this.id,
        responseTime
      })
      
      return this.lastHealthCheck
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.lastHealthCheck = {
        healthy: false,
        error: errorMessage,
        responseTime,
        lastCheck: new Date()
      }
      
      this.logger.warn(`Health check failed for provider ${this.name}`, undefined, {
        provider: this.id,
        error: errorMessage,
        responseTime
      })
      
      return this.lastHealthCheck
    }
  }

  /**
   * Validate provider configuration
   */
  async validateConfig(): Promise<ProviderValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Base validation
      this.validateBaseConfiguration()
      
      // Subclass-specific validation
      const customValidation = await this.performCustomValidation()
      errors.push(...customValidation.errors)
      warnings.push(...customValidation.warnings)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown validation error'
      errors.push(message)
    }

    const result = {
      valid: errors.length === 0,
      errors,
      warnings
    }
    
    if (!result.valid) {
      this.logger.error(`Configuration validation failed for provider ${this.name}`, undefined, {
        provider: this.id,
        errors,
        warnings
      })
    }
    
    return result
  }

  // ============================================================================
  // PROTECTED HELPER METHODS - Available to subclasses
  // ============================================================================

  /**
   * Create standardized provider error
   */
  protected createError(
    message: string,
    code: string,
    retryable: boolean = false,
    context?: Record<string, unknown>
  ): ProviderError {
    return new ProviderError(message, code, this.id, retryable, {
      ...context,
      provider: this.id,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Execute operation with error handling and logging
   */
  protected async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      this.logger.debug(`Starting ${operation}`, undefined, {
        provider: this.id,
        operation,
        ...context
      })
      
      const result = await fn()
      const duration = Date.now() - startTime
      
      this.logger.debug(`Completed ${operation}`, undefined, {
        provider: this.id,
        operation,
        duration,
        ...context
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      const providerError = this.createError(
        `${operation} failed: ${errorMessage}`,
        'OPERATION_FAILED',
        true,
        { operation, duration, originalError: errorMessage, ...context }
      )
      
      this.logger.error(`Operation failed for provider ${this.name}`, undefined, {
        provider: this.id,
        operation,
        error: errorMessage,
        duration,
        ...context
      })
      
      throw providerError
    }
  }

  /**
   * Execute operation with timeout
   */
  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 30000,
    errorMessage: string = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(this.createError(errorMessage, 'TIMEOUT', true)), timeoutMs)
      )
    ])
  }

  /**
   * Log provider events with consistent format
   */
  protected log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): void {
    const logContext = {
      provider: this.id,
      providerName: this.name,
      ...context
    }
    
    this.logger[level](`[${this.name}] ${message}`, undefined, logContext)
  }

  /**
   * Handle API errors with standard patterns
   */
  protected handleApiError(
    error: unknown,
    operation: string,
    context?: Record<string, unknown>
  ): ProviderError {
    if (error instanceof ProviderError) {
      return error
    }
    
    let message = 'Unknown API error'
    let code = 'API_ERROR'
    let retryable = false
    
    if (error instanceof Error) {
      message = error.message
      
      // Analyze error type and determine retry strategy
      if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
        code = 'TIMEOUT'
        retryable = true
      } else if (message.includes('network') || message.includes('ECONNREFUSED')) {
        code = 'NETWORK_ERROR'
        retryable = true
      } else if (message.includes('401') || message.includes('unauthorized')) {
        code = 'UNAUTHORIZED'
        retryable = false
      } else if (message.includes('403') || message.includes('forbidden')) {
        code = 'FORBIDDEN'
        retryable = false
      } else if (message.includes('404') || message.includes('not found')) {
        code = 'NOT_FOUND'
        retryable = false
      } else if (message.includes('429') || message.includes('rate limit')) {
        code = 'RATE_LIMITED'
        retryable = true
      } else if (message.includes('5') && (message.includes('500') || message.includes('502') || message.includes('503'))) {
        code = 'SERVER_ERROR'
        retryable = true
      }
    }
    
    return this.createError(
      `${operation} failed: ${message}`,
      code,
      retryable,
      { operation, originalError: String(error), ...context }
    )
  }

  /**
   * Validate required configuration fields
   */
  protected validateRequiredFields(fields: string[]): void {
    const missingFields = fields.filter(field => {
      const value = this.config[field as keyof BaseProviderConfig]
      return value === undefined || value === null || value === ''
    })
    
    if (missingFields.length > 0) {
      throw this.createError(
        `Missing required configuration fields: ${missingFields.join(', ')}`,
        'MISSING_CONFIG',
        false,
        { missingFields }
      )
    }
  }

  /**
   * Get configuration value with type safety
   */
  protected getConfigValue<T>(key: string, defaultValue?: T): T {
    const value = this.config.settings?.[key] ?? this.config[key as keyof BaseProviderConfig] ?? defaultValue
    return value as T
  }

  /**
   * Check if configuration has specific setting
   */
  protected hasConfigSetting(key: string): boolean {
    return (this.config.settings?.[key] !== undefined) || 
           (this.config[key as keyof BaseProviderConfig] !== undefined)
  }

  // ============================================================================
  // OVERRIDABLE METHODS - Can be customized by subclasses
  // ============================================================================

  /**
   * Override for provider-specific health checks
   */
  protected async performHealthCheck(): Promise<void> {
    // Default implementation just validates configuration
    this.validateBaseConfiguration()
  }

  /**
   * Override for provider-specific configuration validation
   */
  protected async performCustomValidation(): Promise<{ errors: string[]; warnings: string[] }> {
    return { errors: [], warnings: [] }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Validate base configuration requirements
   */
  private validateBaseConfiguration(): void {
    if (!this.config.id) {
      throw new Error('Provider configuration missing required "id" field')
    }
    if (!this.config.name) {
      throw new Error('Provider configuration missing required "name" field')
    }
    if (!this.config.type) {
      throw new Error('Provider configuration missing required "type" field')
    }
    if (typeof this.config.enabled !== 'boolean') {
      throw new Error('Provider configuration "enabled" field must be boolean')
    }
    if (typeof this.config.priority !== 'number' || this.config.priority < 0) {
      throw new Error('Provider configuration "priority" field must be a non-negative number')
    }
  }
}