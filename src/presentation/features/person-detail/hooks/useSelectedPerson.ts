/**
 * useSelectedPerson Hook
 *
 * CLEAN architecture hook for getting selected person using proper use case pattern.
 * Replaces direct store access with domain use case abstraction.
 */

import { useQuery } from '@tanstack/react-query'
import { useDI } from '@/src/infrastructure/di/hooks'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import type {
  GetSelectedPersonUseCase,
  GetSelectedPersonRequest
} from '@/src/domain/usecases/person/get-selected-person.usecase'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Hook for getting selected person using CLEAN architecture pattern
 *
 * @param personId - Optional person ID from route parameters
 * @param personParam - Optional person object from route parameters
 * @returns Query result with selected person data
 */
export const useSelectedPerson = (personId?: string, personParam?: any) => {
  const getSelectedPersonUseCase = useDI<GetSelectedPersonUseCase>(TOKENS.GET_SELECTED_PERSON_USE_CASE)

  return useQuery({
    queryKey: ['selected-person', personId, personParam?.id],
    queryFn: async (): Promise<PersonCatalogItem | null> => {
      const request: GetSelectedPersonRequest = {
        personId,
        personParam
      }

      const result = await getSelectedPersonUseCase.execute(request)
      return result.person
    },
    enabled: !!(personId || personParam),
    staleTime: 0, // Always check for updates since selection can change
    retry: false, // Don't retry for selection queries
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })
}