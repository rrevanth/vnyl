/**
 * Person Detail Feature Hooks
 * 
 * TanStack Query hooks for person detail screen functionality including:
 * - Person enrichment (detailed person metadata)
 * - Filmography catalogs fetching
 * - Infinite scrolling for filmography items
 * 
 * Integrates with Legend State store for reactive state management
 * and uses dependency injection for use case access.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDI } from '@/src/infrastructure/di/hooks'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { personDetailActions, personDetailSelectors } from '@/src/presentation/shared/stores/person-detail-store'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { 
  EnrichPersonUseCase, 
  EnrichPersonRequest, 
  EnrichPersonResult 
} from '@/src/domain/usecases/person/enrich-person.usecase'
import type {
  GetPersonFilmographyUseCase,
  GetPersonFilmographyRequest,
  GetPersonFilmographyResult
} from '@/src/domain/usecases/person/get-person-filmography.usecase'
import type {
  LoadMoreFilmographyUseCase,
  LoadMoreFilmographyRequest,
  LoadMoreFilmographyResult
} from '@/src/domain/usecases/person/load-more-filmography.usecase'

/**
 * Hook for enriching person with detailed metadata
 * 
 * @param person - The person catalog item to enrich
 * @param options - Query options and configuration
 * @returns Query result with enriched person data
 */
export const useEnrichPerson = (
  person: PersonCatalogItem | null,
  options: {
    enabled?: boolean
    allowCache?: boolean
    toleratePartialFailure?: boolean
    timeoutMs?: number
  } = {}
) => {
  const enrichPersonUseCase = useDI<EnrichPersonUseCase>(TOKENS.ENRICH_PERSON_USE_CASE)
  
  return useQuery({
    queryKey: ['person-enrich', person?.id, person?.contentContext?.providerId],
    queryFn: async (): Promise<EnrichPersonResult> => {
      if (!person) {
        throw new Error('Person is required for enrichment')
      }

      const request: EnrichPersonRequest = {
        person,
        allowCache: options.allowCache ?? true,
        toleratePartialFailure: options.toleratePartialFailure ?? true,
        timeoutMs: options.timeoutMs ?? 10000,
        preserveExistingEnrichments: true
      }

      personDetailActions.setEnriching(true)
      
      try {
        const result = await enrichPersonUseCase.execute(request)
        
        // Update store with enriched person
        personDetailActions.setEnrichedPerson(result.enrichedPerson)
        
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to enrich person'
        personDetailActions.setError(errorMessage)
        throw error
      } finally {
        personDetailActions.setEnriching(false)
      }
    },
    enabled: options.enabled !== false && !!person,
    staleTime: 15 * 60 * 1000, // 15 minutes - person details don't change often
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Enable offline support
    networkMode: 'offlineFirst'
  })
}

/**
 * Hook for fetching person filmography catalogs
 * 
 * @param person - The person to get filmography for
 * @param options - Query options and pagination
 * @returns Query result with filmography catalogs
 */
export const usePersonFilmography = (
  person: PersonCatalogItem | null,
  options: {
    enabled?: boolean
    toleratePartialFailure?: boolean
    timeoutMs?: number
  } = {}
) => {
  const getPersonFilmographyUseCase = useDI<GetPersonFilmographyUseCase>(TOKENS.GET_PERSON_FILMOGRAPHY_USE_CASE)
  
  return useQuery({
    queryKey: ['person-filmography', person?.id, person?.contentContext?.providerId],
    queryFn: async (): Promise<GetPersonFilmographyResult> => {
      if (!person) {
        throw new Error('Person is required for filmography')
      }

      const request: GetPersonFilmographyRequest = {
        person,
        toleratePartialFailure: options.toleratePartialFailure ?? true,
        timeoutMs: options.timeoutMs ?? 10000
      }

      try {
        const result = await getPersonFilmographyUseCase.execute(request)
        
        // Update store with filmography catalogs
        personDetailActions.setFilmographyCatalogs(result.filmographyCatalogs)
        
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch filmography'
        personDetailActions.setError(errorMessage)
        throw error
      }
    },
    enabled: options.enabled !== false && !!person,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Enable offline support
    networkMode: 'offlineFirst'
  })
}

/**
 * Hook for loading more filmography items with infinite scrolling
 * 
 * @param options - Configuration for the mutation
 * @returns Mutation for loading more filmography items
 */
export const useLoadMoreFilmography = () => {
  const loadMoreFilmographyUseCase = useDI<LoadMoreFilmographyUseCase>(TOKENS.LOAD_MORE_FILMOGRAPHY_USE_CASE)
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (request: LoadMoreFilmographyRequest): Promise<LoadMoreFilmographyResult> => {
      personDetailActions.setLoadingMoreFilmography(true)
      
      try {
        const result = await loadMoreFilmographyUseCase.execute(request)
        
        // Update store with new items
        personDetailActions.addMoreFilmographyItems(
          request.catalogId,
          result.items,
          result.pagination
        )
        
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load more filmography'
        personDetailActions.setError(errorMessage)
        throw error
      } finally {
        personDetailActions.setLoadingMoreFilmography(false)
      }
    },
    onSuccess: (result, variables) => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['person-filmography', variables.originalPerson.id]
      })
    },
    onError: (error) => {
      console.error('Load more filmography failed:', error)
      // Error is already set in the store, so just log it
    }
  })
}

/**
 * Hook for accessing current person detail state from the store
 * 
 * @returns Current person detail state and loading information
 */
export const usePersonDetailState = () => {
  return {
    // Data state
    dataState: personDetailSelectors.dataState,
    enrichedPerson: personDetailSelectors.enrichedPerson.get(),
    filmographyCatalogs: personDetailSelectors.filmographyCatalogs.get(),
    
    // Loading state
    loadingState: personDetailSelectors.loadingState,
    isEnriching: personDetailSelectors.isEnriching.get(),
    isLoadingMoreFilmography: personDetailSelectors.isLoadingMoreFilmography.get(),
    
    // Error state
    error: personDetailSelectors.error.get(),
    
    // UI state
    uiState: personDetailSelectors.uiState,
    expandedBiography: personDetailSelectors.expandedBiography.get(),
    
    // Filmography-specific state
    filmographyState: personDetailSelectors.filmographyState,
    
    // Utility functions
    findFilmographyCatalog: personDetailSelectors.findFilmographyCatalog,
    canLoadMoreFilmography: personDetailSelectors.canLoadMoreFilmography,
    
    // Actions
    actions: personDetailActions
  }
}

/**
 * Hook for complete person detail functionality
 * Combines all person-related hooks for convenient usage in components
 * 
 * @param person - The person catalog item
 * @param options - Configuration options
 * @returns Complete person detail functionality
 */
export const usePersonDetailComplete = (
  person: PersonCatalogItem | null,
  options: {
    autoEnrich?: boolean
    autoLoadFilmography?: boolean
    enrichOptions?: Parameters<typeof useEnrichPerson>[1]
    filmographyOptions?: Parameters<typeof usePersonFilmography>[1]
  } = {}
) => {
  const {
    autoEnrich = true,
    autoLoadFilmography = true,
    enrichOptions = {},
    filmographyOptions = {}
  } = options

  // Enrich person with detailed metadata
  const enrichQuery = useEnrichPerson(person, {
    enabled: autoEnrich,
    ...enrichOptions
  })

  // Load filmography catalogs
  const filmographyQuery = usePersonFilmography(person, {
    enabled: autoLoadFilmography,
    ...filmographyOptions
  })

  // Load more filmography mutation
  const loadMoreFilmographyMutation = useLoadMoreFilmography()

  // Store state
  const storeState = usePersonDetailState()

  // Utility function to load more items for a specific catalog
  const loadMoreForCatalog = async (catalogId: string, page: number = 2) => {
    if (!person) {
      throw new Error('Person is required to load more filmography')
    }

    const catalog = storeState.findFilmographyCatalog(catalogId)
    if (!catalog) {
      throw new Error(`Catalog not found: ${catalogId}`)
    }

    const request: LoadMoreFilmographyRequest = {
      providerId: catalog.catalogContext.providerId,
      catalogId,
      catalog,
      originalPerson: person,
      page,
      limit: 20,
      originalCatalogContext: catalog.catalogContext,
      originalPagination: catalog.pagination
    }

    return loadMoreFilmographyMutation.mutateAsync(request)
  }

  return {
    // Query states
    enrichQuery,
    filmographyQuery,
    loadMoreFilmographyMutation,
    
    // Combined loading state
    isLoading: enrichQuery.isLoading || filmographyQuery.isLoading,
    isError: enrichQuery.isError || filmographyQuery.isError,
    combinedError: enrichQuery.error || filmographyQuery.error || storeState.error,
    
    // Store state and actions
    ...storeState,
    
    // Utility functions
    loadMoreForCatalog,
    
    // Refetch functions
    refetchAll: () => {
      enrichQuery.refetch()
      filmographyQuery.refetch()
    }
  }
}

