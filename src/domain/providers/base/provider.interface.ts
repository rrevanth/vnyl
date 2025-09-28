import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'

/**
 * Base provider interface
 * All provider implementations must implement this interface
 */
export interface IProvider {
  /** Unique provider identifier */
  readonly id: string

  /** Human-readable provider name */
  readonly name: string

  /** Capabilities this provider supports */
  readonly capabilities: ProviderCapability[]

  /** Provider priority (lower number = higher priority) */
  readonly priority: number

  /**
   * Initialize the provider
   */
  initialize(): Promise<void>
}