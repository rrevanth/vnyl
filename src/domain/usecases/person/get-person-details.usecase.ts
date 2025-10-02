import { PersonEntity } from '@/domain/entities/person'
import { IPersonRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface GetPersonDetailsRequest {
  personId: string
  userId?: string
}

export interface GetPersonDetailsResponse {
  person: PersonEntity
  cached: boolean
}

/**
 * Use case for getting detailed person information
 * Handles caching and error handling for person data retrieval
 */
export class GetPersonDetailsUseCase {
  constructor(
    private readonly personRepository: IPersonRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: GetPersonDetailsRequest): Promise<GetPersonDetailsResponse> {
    const { personId, userId } = request

    // Validate input
    if (!personId.trim()) {
      throw new Error('Person ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log person access
      this.loggingService.logUserAction('view_person', userId || 'anonymous', {
        personId
      })

      const person = await this.personRepository.findById(personId)

      // Handle not found
      if (!person) {
        this.loggingService.warn('Person not found', {
          personId,
          userId
        })
        throw new Error(`Person with ID ${personId} not found`)
      }

      // Log successful retrieval
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('get_person_details', duration, {
        personId,
        userId
      })

      this.loggingService.info('Person details retrieved successfully', {
        personId,
        personName: person.name,
        knownForDepartment: person.known_for_department,
        userId,
        duration_ms: duration
      })

      return {
        person,
        cached: false // Will be determined by repository implementation
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to get person details',
        error instanceof Error ? error : new Error(String(error)),
        {
          personId,
          userId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}