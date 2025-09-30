/**
 * Get Selected Person Use Case
 *
 * CLEAN architecture use case for retrieving the currently selected person
 * from navigation context. Abstracts store access from presentation layer.
 */

import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Request for getting selected person
 */
export interface GetSelectedPersonRequest {
  /**
   * Optional person ID from route parameters
   */
  personId?: string

  /**
   * Optional person object from route parameters
   */
  personParam?: any
}

/**
 * Result of getting selected person
 */
export interface GetSelectedPersonResult {
  /**
   * The selected person, if found
   */
  person: PersonCatalogItem | null

  /**
   * Source of the person data
   */
  source: 'parameter' | 'store' | 'none'

  /**
   * Whether the person was found
   */
  found: boolean
}

/**
 * Use case interface for getting selected person
 */
export interface GetSelectedPersonUseCase {
  /**
   * Execute the get selected person operation
   *
   * @param request - The request parameters
   * @returns Promise resolving to the result
   */
  execute(request: GetSelectedPersonRequest): Promise<GetSelectedPersonResult>
}