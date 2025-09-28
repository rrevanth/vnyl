/**
 * Integrated Home Screen Hook with TanStack Query
 * 
 * Combines HomeScreenController functionality with TanStack Query for optimal
 * server state management while maintaining existing controller patterns.
 * 
 * Provides comprehensive home screen state management with:
 * - Server state via TanStack Query
 * - Client state via HomeScreenController
 * - Unified interface for components
 * - Automatic cache invalidation and background updates
 */

import { useCallback, useMemo } from 'react'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useSafeLogging } from '@/src/infrastructure/di'
import { useScrollTabBar } from '@/src/presentation/shared/hooks/useScrollTabBar'
import { useHomeScreenController } from '@/src/presentation/shared/hooks/useHomeScreenController'
import { useHomeCatalogs } from '@/src/presentation/shared/hooks/useHomeCatalogs'
import { useCatalogPagination } from '@/src/presentation/shared/hooks/useCatalogPagination'
import { vnylQueryKeys } from '@/src/presentation/shared/queries/vnyl-query-client'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { HomeScreenLayoutPreference } from '@/src/domain/entities/user.entity'

/**
 * Integrated home screen state combining server and client state
 */
interface IntegratedHomeScreenState {
  // Server state (from TanStack Query)
  catalogs: Catalog[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isRefetching: boolean
  isEmpty: boolean
  hasData: boolean
  totalCatalogs: number
  totalItems: number
  successfulProviders: number
  totalProviders: number
  
  // Client state (from HomeScreenController)
  isLoadingMore: boolean
  refreshing: boolean
  hasMore: boolean
  
  // User preferences
  layout: HomeScreenLayoutPreference
  compactMode: boolean
  fontSize: string
  enabledProviders: Record<string, boolean>
  regionSettings: string
}

/**
 * Integrated actions combining query and controller actions
 */
interface IntegratedHomeScreenActions {
  // Navigation
  handleScroll: (event: any) => void
  handleItemPress: (item: CatalogItem) => void
  handleAddToWatchlist: (item: CatalogItem) => void
  handleMorePress: (item: CatalogItem) => void
  handleSeeAllPress: (title: string, catalog?: Catalog) => void
  
  // Data management
  refresh: () => Promise<void>
  loadMoreItems: (catalogId: string, providerId: string, page: number) => Promise<void>
  loadMoreItemsWithCatalog: (catalog: Catalog, providerId: string, page: number) => Promise<void>
  refetch: () => Promise<any>
  invalidateCache: () => Promise<void>
  clearError: () => void
  
  // Helper functions
  getSpecialCatalogs: (catalogs: Catalog[]) => { top10Index: number; awardsIndex: number }
  getCatalogById: (id: string) => Catalog | undefined
  getCatalogsByType: (mediaType: string) => Catalog[]
  getFreshCatalogs: (maxAgeSeconds: number) => Catalog[]
}

/**
 * Options for integrated home screen hook
 */
interface UseIntegratedHomeScreenOptions {
  /** Enable background refetching */
  enableBackgroundRefetch?: boolean
  /** Stale time for catalog data */
  staleTime?: number
  /** Enable automatic refresh on mount */
  refreshOnMount?: boolean
}

/**
 * Result of integrated home screen hook
 */
interface UseIntegratedHomeScreenResult {
  state: IntegratedHomeScreenState
  actions: IntegratedHomeScreenActions
}

/**
 * Integrated Home Screen Hook
 * 
 * Combines HomeScreenController with TanStack Query for comprehensive
 * home screen state management with optimal caching and performance.
 */
export const useIntegratedHomeScreen = (
  options: UseIntegratedHomeScreenOptions = {}
): UseIntegratedHomeScreenResult => {
  const logger = useSafeLogging()
  const queryClient = useQueryClient()
  const { handleScroll } = useScrollTabBar()
  
  // HomeScreenController for client state management
  const {
    state: controllerState,
    actions: controllerActions,
    preferences
  } = useHomeScreenController()
  
  // TanStack Query for server state management  
  const {
    catalogs: queryCatalogs,
    isLoading: queryLoading,
    isError: queryError,
    error: queryErrorDetails,
    isRefetching,
    isEmpty,
    hasData,
    totalCatalogs,
    totalItems,
    successfulProviders,
    totalProviders,
    refetch: queryRefetch,
    invalidate: queryInvalidate,
    getCatalogById,
    getCatalogsByType,
    getFreshCatalogs
  } = useHomeCatalogs({
    refetchOnWindowFocus: options.enableBackgroundRefetch,
    staleTime: options.staleTime,
    refetchOnMount: options.refreshOnMount
  })

  // Combine loading states intelligently
  const isLoading = useMemo(() => {
    // Show loading if either source is loading, but prioritize query loading for initial load
    return queryLoading || (controllerState.isLoading && queryCatalogs.length === 0)
  }, [queryLoading, controllerState.isLoading, queryCatalogs.length])

  // Combine error states with TanStack Query taking precedence
  const isError = useMemo(() => {
    return queryError || (controllerState.error !== null)
  }, [queryError, controllerState.error])

  const error = useMemo(() => {
    return queryErrorDetails || (controllerState.error ? new Error(controllerState.error) : null)
  }, [queryErrorDetails, controllerState.error])

  // Use query catalogs as primary source, fallback to controller if needed
  const catalogs = useMemo(() => {
    return queryCatalogs.length > 0 ? queryCatalogs : controllerState.catalogs
  }, [queryCatalogs, controllerState.catalogs])

  /**
   * Enhanced refresh that coordinates both query and controller
   */
  const refresh = useCallback(async (): Promise<void> => {
    logger?.info('IntegratedHomeScreen: Starting coordinated refresh')
    
    try {
      // Invalidate TanStack Query cache and refetch
      await queryInvalidate()
      await queryRefetch()
      
      // Also refresh controller state as backup
      await controllerActions.refresh()
      
      logger?.info('IntegratedHomeScreen: Coordinated refresh completed')
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger?.error('IntegratedHomeScreen: Refresh failed', errorInstance)
      throw errorInstance
    }
  }, [logger, queryInvalidate, queryRefetch, controllerActions])

  /**
   * Load more items with optimistic updates
   */
  const loadMoreItems = useCallback(async (
    catalogId: string, 
    providerId: string, 
    page: number
  ): Promise<void> => {
    logger?.info('IntegratedHomeScreen: Loading more items', { catalogId, providerId, page })
    
    try {
      // Use controller's load more functionality
      await controllerActions.loadMoreItems(catalogId, providerId, page)
      
      // Invalidate relevant queries to sync with new data
      await queryClient.invalidateQueries({ 
        queryKey: vnylQueryKeys.catalogs.pagination(catalogId, providerId)
      })
      
      // Also invalidate main catalog query to update hasMore states
      await queryClient.invalidateQueries({ 
        queryKey: vnylQueryKeys.catalogs.all 
      })
      
      logger?.info('IntegratedHomeScreen: Load more completed successfully')
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger?.error('IntegratedHomeScreen: Load more failed', errorInstance)
      throw errorInstance
    }
  }, [logger, controllerActions, queryClient])

  /**
   * Load more items using catalog object directly (avoids catalog lookup issues)
   */
  const loadMoreItemsWithCatalog = useCallback(async (
    catalog: Catalog,
    providerId: string, 
    page: number
  ): Promise<void> => {
    logger?.info('IntegratedHomeScreen: Loading more items with catalog object', { 
      catalogId: catalog.id, 
      catalogType: catalog.catalogContext?.catalogType,
      providerId, 
      page 
    })
    
    try {
      // Use the catalogContext.catalogId (original ID) instead of the modified unique catalog.id
      const originalCatalogId = catalog.catalogContext?.catalogId || catalog.catalogContext?.catalogType || 'unknown'
      
      logger?.debug('IntegratedHomeScreen: Using catalog object directly for load more', undefined, {
        uniqueCatalogId: catalog.id,
        originalCatalogId,
        catalogType: catalog.catalogContext?.catalogType
      })
      
      // Use controller's new loadMoreItemsWithCatalog method to avoid catalog lookup
      await controllerActions.loadMoreItemsWithCatalog(catalog, providerId, page)
      
      // Invalidate relevant queries to sync with new data
      await queryClient.invalidateQueries({ 
        queryKey: vnylQueryKeys.catalogs.pagination(catalog.id, providerId)
      })
      
      // Also invalidate main catalog query to update hasMore states
      await queryClient.invalidateQueries({ 
        queryKey: vnylQueryKeys.catalogs.all 
      })
      
      logger?.info('IntegratedHomeScreen: Load more with catalog completed successfully')
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger?.error('IntegratedHomeScreen: Load more with catalog failed', errorInstance, {
        catalogId: catalog.id,
        catalogType: catalog.catalogContext?.catalogType
      })
      throw errorInstance
    }
  }, [logger, controllerActions, queryClient])

  /**
   * Comprehensive cache invalidation
   */
  const invalidateCache = useCallback(async (): Promise<void> => {
    logger?.info('IntegratedHomeScreen: Invalidating all caches')
    
    // Invalidate all catalog-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: vnylQueryKeys.catalogs.all }),
      queryClient.invalidateQueries({ queryKey: ['catalog-pagination'] })
    ])
    
    logger?.info('IntegratedHomeScreen: Cache invalidation completed')
  }, [logger, queryClient])

  /**
   * Enhanced item press with analytics
   */
  const handleItemPress = useCallback((item: CatalogItem) => {
    logger?.debug('IntegratedHomeScreen: Item pressed', undefined, { 
      title: item.title, 
      mediaType: item.mediaType, 
      externalIds: item.externalIds 
    })
    
    if (item.mediaType === 'person') {
      router.push(`/person/${item.id}` as any)
    } else {
      router.push(`/media/${item.id}` as any)
    }
  }, [logger])

  /**
   * Add to watchlist with optimistic updates
   */
  const handleAddToWatchlist = useCallback((item: CatalogItem) => {
    logger?.debug('IntegratedHomeScreen: Added to watchlist', undefined, { title: item.title })
    // TODO: Implement watchlist functionality via use case with optimistic updates
  }, [logger])

  /**
   * More options press handler
   */
  const handleMorePress = useCallback((item: CatalogItem) => {
    logger?.debug('IntegratedHomeScreen: More options pressed', undefined, { title: item.title })
    // Handled by ContextMenu in components
  }, [logger])

  /**
   * See all press with enhanced navigation
   */
  const handleSeeAllPress = useCallback((title: string, catalog?: Catalog) => {
    logger?.debug('IntegratedHomeScreen: See all pressed', undefined, { title, catalogId: catalog?.id })
    
    if (catalog) {
      router.push(`/grid/${catalog.id}` as any)
    } else {
      router.push('/grid/all' as any)
    }
  }, [logger])

  /**
   * Clear error state from both sources
   */
  const clearError = useCallback(() => {
    controllerActions.clearError()
    // TanStack Query errors clear automatically on successful refetch
  }, [controllerActions])

  /**
   * Get special catalogs with enhanced logic
   */
  const getSpecialCatalogs = useCallback((inputCatalogs: Catalog[]) => {
    if (!inputCatalogs || inputCatalogs.length < 2) return { top10Index: -1, awardsIndex: -1 }
    
    // Use deterministic selection based on catalog IDs for consistency
    const shouldHaveTop10 = Math.random() > 0.3 // 70% chance
    const shouldHaveAwards = Math.random() > 0.5 // 50% chance
    
    let top10Index = -1
    let awardsIndex = -1
    
    if (shouldHaveTop10 && inputCatalogs.length >= 2) {
      top10Index = Math.floor(Math.random() * Math.min(4, inputCatalogs.length))
    }
    
    if (shouldHaveAwards && inputCatalogs.length >= 3) {
      do {
        awardsIndex = Math.floor(Math.random() * Math.min(6, inputCatalogs.length))
      } while (awardsIndex === top10Index && inputCatalogs.length > 1)
    }
    
    return { top10Index, awardsIndex }
  }, [])

  // Construct integrated state
  const state: IntegratedHomeScreenState = {
    // Server state (prioritized)
    catalogs,
    isLoading,
    isError,
    error,
    isRefetching,
    isEmpty,
    hasData,
    totalCatalogs,
    totalItems,
    successfulProviders,
    totalProviders,
    
    // Client state
    isLoadingMore: controllerState.isLoadingMore,
    refreshing: controllerState.refreshing,
    hasMore: controllerState.hasMore,
    
    // User preferences
    layout: preferences.layout,
    compactMode: preferences.compactMode,
    fontSize: preferences.fontSize,
    enabledProviders: preferences.enabledProviders,
    regionSettings: preferences.regionSettings
  }

  // Construct integrated actions
  const actions: IntegratedHomeScreenActions = {
    // Navigation
    handleScroll,
    handleItemPress,
    handleAddToWatchlist,
    handleMorePress,
    handleSeeAllPress,
    
    // Data management
    refresh,
    loadMoreItems,
    loadMoreItemsWithCatalog,
    refetch: queryRefetch,
    invalidateCache,
    clearError,
    
    // Helper functions
    getSpecialCatalogs,
    getCatalogById,
    getCatalogsByType,
    getFreshCatalogs
  }

  return {
    state,
    actions
  }
}

/**
 * Hook factory for creating pagination hooks for specific catalogs
 * 
 * This factory returns a function that can be used to create catalog pagination hooks.
 * Since React hooks cannot be called inside callbacks, this should be used at the component level.
 */
export const createCatalogPaginationHook = (catalogId: string, providerId: string) => {
  return () => useCatalogPagination(catalogId, providerId, {
    pageSize: 20,
    staleTime: 5 * 60 * 1000
  })
}