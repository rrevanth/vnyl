import { PersonFilmography } from '@/domain/entities/person'
import { IPersonRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface GetPersonFilmographyRequest {
  personId: string
  userId?: string
}

export interface GetPersonFilmographyResponse {
  filmography: PersonFilmography
  personId: string
  cached: boolean
}

/**
 * Use case for getting person's complete filmography
 * Handles both cast and crew credits with performance optimization
 */
export class GetPersonFilmographyUseCase {
  constructor(
    private readonly personRepository: IPersonRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: GetPersonFilmographyRequest): Promise<GetPersonFilmographyResponse> {
    const { personId, userId } = request

    // Validate input
    if (!personId.trim()) {
      throw new Error('Person ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log filmography access
      this.loggingService.logUserAction('view_person_filmography', userId || 'anonymous', {
        personId
      })

      const filmography = await this.personRepository.getFilmography(personId)

      // Handle not found
      if (!filmography) {
        this.loggingService.warn('Person filmography not found', {
          personId,
          userId
        })
        throw new Error(`Filmography for person ${personId} not found`)
      }

      // Log successful retrieval
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('get_person_filmography', duration, {
        personId,
        castCount: filmography.cast.length,
        crewCount: filmography.crew.length,
        userId
      })

      this.loggingService.info('Person filmography retrieved successfully', {
        personId,
        castCount: filmography.cast.length,
        crewCount: filmography.crew.length,
        totalCredits: filmography.cast.length + filmography.crew.length,
        userId,
        duration_ms: duration
      })

      return {
        filmography,
        personId,
        cached: false // Will be determined by repository implementation
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to get person filmography',
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