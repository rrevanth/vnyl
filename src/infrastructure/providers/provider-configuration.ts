/**
 * Provider Configuration System - Registration-Based Configuration
 * 
 * Clean provider configuration system that eliminates boolean capability flags
 * in favor of constructor registration. Follows the principle:
 * "Registration = Capability" - if a provider registers a constructor for a
 * capability, it supports that capability.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type { ProviderCapability } from './provider-interfaces'

/**
 * Clean provider configuration without boolean capability flags
 */
export interface CleanProviderConfig {
  // Core identification
  id: string
  name: string
  displayName: string
  type: ProviderType
  
  // Status and priority
  enabled: boolean
  priority: number
  
  // Authentication and connection
  apiKey?: string
  bearerToken?: string
  username?: string
  password?: string
  accessToken?: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
  
  // Connection settings
  baseUrl?: string
  timeout?: number
  rateLimit?: number
  
  // Localization and preferences
  language?: string
  region?: string
  includeAdult?: boolean
  
  // Provider-specific settings
  customSettings?: Record<string, unknown>
  
  // Metadata for display and management
  metadata: ProviderMetadata
}

/**
 * Provider type classification
 */
export enum ProviderType {
  OFFICIAL = 'official',      // Official APIs (TMDB, Trakt, etc.)
  ADDON = 'addon',           // Stremio addons
  CUSTOM = 'custom',         // Custom user providers
  LOCAL = 'local',           // Local/offline providers
  AGGREGATOR = 'aggregator'  // Meta-providers that aggregate others
}

/**
 * Provider metadata for display and management
 */
export interface ProviderMetadata {
  description?: string
  version?: string
  author?: string
  website?: string
  iconUrl?: string
  screenshots?: string[]
  categories?: string[]
  tags?: string[]
  lastUpdated?: Date
  installDate?: Date
  isOfficial?: boolean
  supportedContentTypes?: string[]
  requiresAuth?: boolean
  rateLimited?: boolean
}

/**
 * Provider template for easy configuration creation
 */
export interface ProviderTemplate {
  id: string
  name: string
  displayName: string
  type: ProviderType
  description: string
  
  // Required settings schema
  requiredSettings: ProviderSettingSchema[]
  
  // Optional settings schema
  optionalSettings: ProviderSettingSchema[]
  
  // Default configuration values
  defaults: Partial<CleanProviderConfig>
  
  // Instructions for setup
  setupInstructions?: string
  documentationUrl?: string
  
  // Validation rules
  validation?: ProviderValidationRules
}

/**
 * Provider setting schema for dynamic form generation
 */
export interface ProviderSettingSchema {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'password' | 'url'
  description?: string
  placeholder?: string
  defaultValue?: unknown
  required?: boolean
  
  // For select type
  options?: { value: string | number; label: string }[]
  
  // Validation
  validation?: {
    min?: number
    max?: number
    pattern?: string
    customValidator?: string
  }
}

/**
 * Provider validation rules
 */
export interface ProviderValidationRules {
  apiKey?: RegExp | string
  url?: RegExp | string
  customValidators?: Record<string, (value: unknown) => boolean | string>
}

/**
 * Provider configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean
  errors: ConfigValidationError[]
  warnings: ConfigValidationWarning[]
  normalizedConfig?: CleanProviderConfig
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  field: string
  message: string
  code: string
  value?: unknown
  expectedType?: string
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  field: string
  message: string
  suggestion?: string
  impact: 'low' | 'medium' | 'high'
}

/**
 * Provider registry entry combining config and runtime info
 */
export interface ProviderRegistryEntry {
  config: CleanProviderConfig
  template?: ProviderTemplate
  registeredCapabilities: ProviderCapability[]
  registrationDate: Date
  lastHealthCheck?: Date
  healthStatus: 'healthy' | 'unhealthy' | 'unknown'
  errorCount: number
  lastError?: Error
  statistics: ProviderStatistics
}

/**
 * Provider runtime statistics
 */
export interface ProviderStatistics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastRequestTime?: Date
  cacheHits: number
  cacheMisses: number
  rateLimitHits: number
}

/**
 * Default provider configurations for common services
 */
export const DEFAULT_PROVIDER_TEMPLATES: Record<string, ProviderTemplate> = {
  tmdb: {
    id: 'tmdb',
    name: 'The Movie Database',
    displayName: 'TMDB',
    type: ProviderType.OFFICIAL,
    description: 'Official metadata provider with comprehensive movie and TV information',
    requiredSettings: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        description: 'Your TMDB API key (v3)',
        required: true,
        validation: {
          pattern: '^[a-f0-9]{32}$'
        }
      }
    ],
    optionalSettings: [
      {
        key: 'language',
        label: 'Language',
        type: 'select',
        description: 'Default language for metadata',
        defaultValue: 'en-US',
        options: [
          { value: 'en-US', label: 'English (US)' },
          { value: 'en-GB', label: 'English (UK)' },
          { value: 'es-ES', label: 'Spanish' },
          { value: 'fr-FR', label: 'French' },
          { value: 'de-DE', label: 'German' }
        ]
      },
      {
        key: 'region',
        label: 'Region',
        type: 'string',
        description: 'ISO 3166-1 country code for region-specific data',
        defaultValue: 'US',
        validation: {
          pattern: '^[A-Z]{2}$'
        }
      },
      {
        key: 'includeAdult',
        label: 'Include Adult Content',
        type: 'boolean',
        description: 'Include adult/explicit content in results',
        defaultValue: false
      }
    ],
    defaults: {
      type: ProviderType.OFFICIAL,
      enabled: true,
      priority: 10,
      baseUrl: 'https://api.themoviedb.org/3',
      timeout: 10000,
      language: 'en-US',
      region: 'US',
      includeAdult: false,
      metadata: {
        isOfficial: true,
        requiresAuth: true,
        rateLimited: true,
        supportedContentTypes: ['movie', 'tv', 'person'],
        website: 'https://www.themoviedb.org'
      }
    },
    setupInstructions: 'Get your free API key from https://www.themoviedb.org/settings/api',
    documentationUrl: 'https://developers.themoviedb.org/3'
  },
  
  trakt: {
    id: 'trakt',
    name: 'Trakt',
    displayName: 'Trakt.tv',
    type: ProviderType.OFFICIAL,
    description: 'Social movie and TV tracking with personal ratings and watchlists',
    requiredSettings: [
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'string',
        description: 'Your Trakt application client ID',
        required: true
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        description: 'Your Trakt application client secret',
        required: true
      }
    ],
    optionalSettings: [
      {
        key: 'username',
        label: 'Username',
        type: 'string',
        description: 'Your Trakt username for personalized data'
      }
    ],
    defaults: {
      type: ProviderType.OFFICIAL,
      enabled: true,
      priority: 20,
      baseUrl: 'https://api.trakt.tv',
      timeout: 15000,
      metadata: {
        isOfficial: true,
        requiresAuth: true,
        rateLimited: true,
        supportedContentTypes: ['movie', 'tv'],
        website: 'https://trakt.tv'
      }
    },
    setupInstructions: 'Create an application at https://trakt.tv/oauth/applications/new',
    documentationUrl: 'https://trakt.docs.apiary.io'
  }
}

/**
 * Default provider settings shared across all providers
 */
export const DEFAULT_PROVIDER_SETTINGS: Partial<CleanProviderConfig> = {
  enabled: true,
  priority: 999,
  timeout: 10000,
  rateLimit: 40, // requests per 10 seconds
  language: 'en-US',
  region: 'US',
  includeAdult: false,
  metadata: {
    version: '1.0.0',
    isOfficial: false,
    requiresAuth: false,
    rateLimited: false,
    installDate: new Date()
  }
}

/**
 * Provider configuration utility class
 */
export class ProviderConfigurationUtils {
  /**
   * Create configuration from template
   */
  static createFromTemplate(
    templateId: string,
    customSettings: Record<string, unknown>
  ): CleanProviderConfig {
    const template = DEFAULT_PROVIDER_TEMPLATES[templateId]
    if (!template) {
      throw new Error(`Provider template not found: ${templateId}`)
    }
    
    const config: CleanProviderConfig = {
      ...DEFAULT_PROVIDER_SETTINGS,
      ...template.defaults,
      ...customSettings,
      id: template.id,
      name: template.name,
      displayName: template.displayName,
      type: template.type
    } as CleanProviderConfig
    
    return config
  }
  
  /**
   * Validate provider configuration
   */
  static validateConfiguration(
    config: CleanProviderConfig,
    template?: ProviderTemplate
  ): ConfigValidationResult {
    const errors: ConfigValidationError[] = []
    const warnings: ConfigValidationWarning[] = []
    
    // Basic validation
    if (!config.id) {
      errors.push({
        field: 'id',
        message: 'Provider ID is required',
        code: 'REQUIRED_FIELD'
      })
    }
    
    if (!config.name) {
      errors.push({
        field: 'name',
        message: 'Provider name is required',
        code: 'REQUIRED_FIELD'
      })
    }
    
    if (!config.displayName) {
      errors.push({
        field: 'displayName',
        message: 'Provider display name is required',
        code: 'REQUIRED_FIELD'
      })
    }
    
    if (typeof config.enabled !== 'boolean') {
      errors.push({
        field: 'enabled',
        message: 'Enabled field must be boolean',
        code: 'INVALID_TYPE',
        expectedType: 'boolean'
      })
    }
    
    if (typeof config.priority !== 'number' || config.priority < 0) {
      errors.push({
        field: 'priority',
        message: 'Priority must be a non-negative number',
        code: 'INVALID_VALUE',
        expectedType: 'number'
      })
    }
    
    // Template-based validation
    if (template) {
      // Check required settings
      for (const setting of template.requiredSettings) {
        const value = config.customSettings?.[setting.key] ?? config[setting.key as keyof CleanProviderConfig]
        
        if (value === undefined || value === null || value === '') {
          errors.push({
            field: setting.key,
            message: `${setting.label} is required`,
            code: 'REQUIRED_FIELD'
          })
        } else if (setting.validation?.pattern) {
          const pattern = new RegExp(setting.validation.pattern)
          if (typeof value === 'string' && !pattern.test(value)) {
            errors.push({
              field: setting.key,
              message: `${setting.label} format is invalid`,
              code: 'INVALID_FORMAT',
              value
            })
          }
        }
      }
      
      // Check optional settings validation
      for (const setting of template.optionalSettings) {
        const value = config.customSettings?.[setting.key] ?? config[setting.key as keyof CleanProviderConfig]
        
        if (value !== undefined && setting.validation?.pattern) {
          const pattern = new RegExp(setting.validation.pattern)
          if (typeof value === 'string' && !pattern.test(value)) {
            warnings.push({
              field: setting.key,
              message: `${setting.label} format may be invalid`,
              suggestion: 'Please verify the format is correct',
              impact: 'medium'
            })
          }
        }
      }
    }
    
    // URL validation
    if (config.baseUrl) {
      try {
        new URL(config.baseUrl)
      } catch {
        errors.push({
          field: 'baseUrl',
          message: 'Base URL is not a valid URL',
          code: 'INVALID_URL',
          value: config.baseUrl
        })
      }
    }
    
    // Timeout validation
    if (config.timeout && (config.timeout < 1000 || config.timeout > 60000)) {
      warnings.push({
        field: 'timeout',
        message: 'Timeout should be between 1-60 seconds',
        suggestion: 'Consider using a value between 5000-30000ms',
        impact: 'low'
      })
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  /**
   * Normalize configuration values
   */
  static normalizeConfiguration(config: CleanProviderConfig): CleanProviderConfig {
    const normalized = { ...config }
    
    // Ensure metadata exists
    if (!normalized.metadata) {
      normalized.metadata = {}
    }
    
    // Set install date if not present
    if (!normalized.metadata.installDate) {
      normalized.metadata.installDate = new Date()
    }
    
    // Normalize priority
    if (normalized.priority < 0) {
      normalized.priority = 0
    }
    
    // Normalize timeout
    if (normalized.timeout && normalized.timeout < 1000) {
      normalized.timeout = 1000
    }
    
    return normalized
  }
  
  /**
   * Get available provider templates
   */
  static getAvailableTemplates(): ProviderTemplate[] {
    return Object.values(DEFAULT_PROVIDER_TEMPLATES)
  }
  
  /**
   * Get template by ID
   */
  static getTemplate(templateId: string): ProviderTemplate | null {
    return DEFAULT_PROVIDER_TEMPLATES[templateId] || null
  }
  
  /**
   * Export configuration for backup
   */
  static exportConfiguration(config: CleanProviderConfig): string {
    return JSON.stringify(config, null, 2)
  }
  
  /**
   * Import configuration from backup
   */
  static importConfiguration(data: string): CleanProviderConfig {
    try {
      const config = JSON.parse(data) as CleanProviderConfig
      const validation = this.validateConfiguration(config)
      
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`)
      }
      
      return this.normalizeConfiguration(config)
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}