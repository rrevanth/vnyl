/**
 * Home Catalogs TanStack Query Hook
 * 
 * Provides TanStack Query integration for home screen catalog management.
 * Integrates with HomeScreenController for state coordination while providing
 * server state management, caching, and background refetching.
 * 
 * Follows CLEAN architecture patterns and existing codebase conventions.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useSafeGetAllCatalogsUseCase, useSafeLogging } from '@/src/infrastructure/di'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import { vnylQueryKeys } from '@/src/presentation/shared/queries/vnyl-query-client'
import type { GetAllCatalogsResult } from '@/src/domain/usecases/get-all-catalogs.usecase'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'

/**
 * Re-export query keys for backward compatibility
 */
export const catalogQueryKeys = vnylQueryKeys.catalogs

/**
 * Home catalogs query configuration
 */
interface UseHomeCatalogsOptions {
  /** Enable background refetching */
  refetchOnWindowFocus?: boolean
  /** Stale time in milliseconds */
  staleTime?: number
  /** Cache time in milliseconds */
  cacheTime?: number
  /** Enable automatic refetching */
  refetchOnMount?: boolean
  /** Retry configuration */
  retry?: number | boolean
}

/**
 * Home catalogs query result
 */
interface UseHomeCatalogsResult {
  // Data state
  catalogs: Catalog[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isRefetching: boolean
  isFetching: boolean
  
  // Derived state
  isEmpty: boolean
  hasData: boolean
  totalCatalogs: number
  totalItems: number
  
  // Provider statistics
  successfulProviders: number
  totalProviders: number
  
  // Actions
  refetch: () => Promise<any>
  invalidate: () => Promise<void>
  
  // Helper functions
  getCatalogById: (id: string) => Catalog | undefined
  getCatalogsByType: (mediaType: string) => Catalog[]
  getFreshCatalogs: (maxAgeSeconds: number) => Catalog[]
}

/**
 * Default query options
 */
const DEFAULT_OPTIONS: UseHomeCatalogsOptions = {
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnMount: true,
  retry: 2
}

/**
 * TanStack Query hook for home screen catalogs
 * 
 * Provides server state management for catalog data with automatic
 * caching, background updates, and error handling.
 */
export const useHomeCatalogs = (options: UseHomeCatalogsOptions = {}): UseHomeCatalogsResult => {
  const getAllCatalogsUseCase = useSafeGetAllCatalogsUseCase()
  const logger = useSafeLogging()
  const queryClient = useQueryClient()
  const userPreferencesContext = useUserPreferences()
  
  // Merge options with defaults
  const queryOptions = { ...DEFAULT_OPTIONS, ...options }
  
  // Create query key based on user preferences for cache isolation
  const queryKey = useMemo(() => {
    const filters = JSON.stringify({
      layout: userPreferencesContext.preferences.homeScreenLayout,
      enabledProviders: userPreferencesContext.preferences.providerPreferences.enabledProviders,
      regionSettings: userPreferencesContext.preferences.providerPreferences.regionSettings
    })
    return vnylQueryKeys.catalogs.list(filters)
  }, [
    userPreferencesContext.preferences.homeScreenLayout,
    userPreferencesContext.preferences.providerPreferences.enabledProviders,
    userPreferencesContext.preferences.providerPreferences.regionSettings
  ])

  // Main query for fetching catalogs
  const {
    data: queryResult,
    isLoading,
    isError,
    error,
    isRefetching,
    isFetching,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<GetAllCatalogsResult> => {
      if (!getAllCatalogsUseCase) {
        throw new Error('Catalog service not available. Please wait for app initialization.')
      }

      logger?.info('HomeCatalogs: Fetching catalogs via TanStack Query', {
        layout: userPreferencesContext.preferences.homeScreenLayout,
        enabledProviders: userPreferencesContext.preferences.providerPreferences.enabledProviders
      })

      try {
        const result = await getAllCatalogsUseCase.execute()
        
        logger?.info('HomeCatalogs: Query successful', {
          catalogCount: result.catalogs?.length || 0,
          totalItems: result.catalogs?.reduce((sum, catalog) => sum + catalog.items.length, 0) || 0,
          successfulProviders: result.successfulProviders,
          totalProviders: result.totalProviders
        })

        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger?.error('HomeCatalogs: Query failed', errorInstance)
        throw errorInstance
      }
    },
    enabled: !userPreferencesContext.isLoading && !!getAllCatalogsUseCase,
    retry: queryOptions.retry,
    staleTime: queryOptions.staleTime,
    gcTime: queryOptions.cacheTime,
    refetchOnWindowFocus: queryOptions.refetchOnWindowFocus,
    refetchOnMount: queryOptions.refetchOnMount
  })

  // Extract catalogs from query result with proper typing
  const catalogs = useMemo(() => queryResult?.catalogs || [], [queryResult?.catalogs])
  
  // Derived state
  const isEmpty = useMemo(() => catalogs.length === 0, [catalogs.length])
  const hasData = useMemo(() => catalogs.length > 0, [catalogs.length])
  const totalCatalogs = useMemo(() => catalogs.length, [catalogs.length])
  const totalItems = useMemo(
    () => catalogs.reduce((sum: number, catalog: Catalog) => sum + catalog.items.length, 0),
    [catalogs]
  )
  
  // Provider statistics
  const successfulProviders = useMemo(() => queryResult?.successfulProviders || 0, [queryResult?.successfulProviders])
  const totalProviders = useMemo(() => queryResult?.totalProviders || 0, [queryResult?.totalProviders])

  // Invalidate query cache
  const invalidate = useCallback(async (): Promise<void> => {
    logger?.info('HomeCatalogs: Invalidating query cache')
    await queryClient.invalidateQueries({ queryKey: vnylQueryKeys.catalogs.all })
  }, [queryClient, logger])

  // Helper: Get catalog by ID
  const getCatalogById = useCallback((id: string): Catalog | undefined => {
    return catalogs.find((catalog: Catalog) => catalog.id === id)
  }, [catalogs])

  // Helper: Get catalogs by media type
  const getCatalogsByType = useCallback((mediaType: string): Catalog[] => {
    return catalogs.filter((catalog: Catalog) => catalog.mediaType === mediaType)
  }, [catalogs])

  // Helper: Get fresh catalogs within age threshold
  const getFreshCatalogs = useCallback((maxAgeSeconds: number): Catalog[] => {
    const now = new Date()
    return catalogs.filter((catalog: Catalog) => {
      const ageSeconds = (now.getTime() - catalog.updatedAt.getTime()) / 1000
      return ageSeconds <= maxAgeSeconds
    })
  }, [catalogs])

  return {
    // Data state
    catalogs,
    isLoading,
    isError,
    error: error as Error | null,
    isRefetching,
    isFetching,
    
    // Derived state
    isEmpty,
    hasData,
    totalCatalogs,
    totalItems,
    
    // Provider statistics
    successfulProviders,
    totalProviders,
    
    // Actions
    refetch,
    invalidate,
    
    // Helper functions
    getCatalogById,
    getCatalogsByType,
    getFreshCatalogs
  }
}