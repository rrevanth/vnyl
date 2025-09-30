/**
 * Get Selected Person Use Case Implementation
 *
 * CLEAN architecture implementation for retrieving selected person from navigation context.
 * Abstracts store access and provides proper error handling.
 */

import type {
  GetSelectedPersonUseCase,
  GetSelectedPersonRequest,
  GetSelectedPersonResult
} from '@/src/domain/usecases/person/get-selected-person.usecase'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { ILoggingService } from '@/src/domain/services'
import { homescreenSelectors } from '@/src/presentation/shared/stores/homescreen-store'

/**
 * Implementation of GetSelectedPersonUseCase
 */
export class GetSelectedPersonUseCaseImpl implements GetSelectedPersonUseCase {
  constructor(
    private readonly logger: ILoggingService
  ) {}

  /**
   * Execute the get selected person operation
   */
  async execute(request: GetSelectedPersonRequest): Promise<GetSelectedPersonResult> {
    this.logger.info('Getting selected person', {
      context: 'get_selected_person_usecase',
      hasPersonId: !!request.personId,
      hasPersonParam: !!request.personParam
    })

    try {
      // Try parameter first if provided
      if (request.personParam) {
        const paramPerson = this.parsePersonFromParam(request.personParam)
        if (paramPerson) {
          this.logger.info('Using person from route parameter', {
            context: 'get_selected_person_usecase',
            personId: paramPerson.id,
            personTitle: paramPerson.title
          })

          return {
            person: paramPerson,
            source: 'parameter',
            found: true
          }
        }
      }

      // Fall back to store selection
      const selectedItem = homescreenSelectors.selectedItem.get()
      if (selectedItem && selectedItem.mediaType === 'person') {
        const storePerson = selectedItem as PersonCatalogItem

        this.logger.info('Using person from store selection', {
          context: 'get_selected_person_usecase',
          personId: storePerson.id,
          personTitle: storePerson.title
        })

        return {
          person: storePerson,
          source: 'store',
          found: true
        }
      }

      // No person found
      this.logger.warn('No selected person found', new Error('Missing person context'), {
        context: 'get_selected_person_usecase',
        routePersonId: request.personId,
        hasParam: !!request.personParam,
        hasStoreSelection: !!selectedItem
      })

      return {
        person: null,
        source: 'none',
        found: false
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get selected person', errorInstance, {
        context: 'get_selected_person_usecase',
        personId: request.personId
      })

      return {
        person: null,
        source: 'none',
        found: false
      }
    }
  }

  /**
   * Parse person from route parameter
   */
  private parsePersonFromParam(personParam: any): PersonCatalogItem | null {
    try {
      if (personParam && typeof personParam === 'object' && personParam.mediaType === 'person') {
        return personParam as PersonCatalogItem
      }
      return null
    } catch (error) {
      this.logger.warn('Failed to parse person parameter', error instanceof Error ? error : new Error(String(error)), {
        context: 'get_selected_person_usecase',
        paramType: typeof personParam
      })
      return null
    }
  }
}