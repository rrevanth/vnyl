/**
 * Home Screen Hook
 * 
 * Uses Legend State for UI state management and TanStack Query for API caching.
 * Follows CLEAN architecture with proper separation of concerns:
 * - Use cases handle business logic and state updates via catalog state service
 * - TanStack Query manages API caching only
 * - Legend State provides reactive UI state management
 * - Dependency injection for all services and use cases
 */

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useSafeGetAllCatalogsUseCase, useSafeLoadMoreCatalogItemsUseCase, useSafeLogging } from '@/src/infrastructure/di'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import { useScrollTabBar } from '@/src/presentation/shared/hooks/useScrollTabBar'
import { homescreenActions, homescreenSelectors } from '@/src/presentation/shared/stores/homescreen-store'
import { vnylQueryKeys } from '@/src/presentation/shared/queries/vnyl-query-client'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { LoadMoreCatalogItemsRequest } from '@/src/domain/usecases/load-more-catalog-items.usecase'
import type { HomeScreenLayoutPreference } from '@/src/domain/entities/user.entity'

/**
 * Home screen state from Legend State
 */
interface HomeScreenState {
  // Data state from Legend State
  catalogs: Catalog[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  isError: boolean
  refreshing: boolean
  hasMore: boolean
  isEmpty: boolean
  hasData: boolean
  totalCatalogs: number
  totalItems: number
  successfulProviders: number
  totalProviders: number
  
  // User preferences
  layout: HomeScreenLayoutPreference
  compactMode: boolean
  fontSize: string
  enabledProviders: Record<string, boolean>
  regionSettings: string
}

/**
 * Home screen actions
 */
interface HomeScreenActions {
  // Navigation
  handleScroll: (event: any) => void
  handleItemPress: (item: CatalogItem) => void
  handleAddToWatchlist: (item: CatalogItem) => void
  handleMorePress: (item: CatalogItem) => void
  handleSeeAllPress: (title: string, catalog?: Catalog) => void
  
  // Data management
  refresh: () => Promise<void>
  loadMoreItems: (catalog: Catalog) => Promise<void>
  clearError: () => void
  
  // Helper functions
  getCatalogById: (id: string) => Catalog | undefined
  getCatalogsByType: (mediaType: string) => Catalog[]
}

interface UseHomeScreenResult {
  state: HomeScreenState
  actions: HomeScreenActions
}

/**
 * Home Screen Hook (Performance Optimized)
 * 
 * Provides clean interface for home screen state management following CLEAN architecture.
 * All business logic delegated to use cases with proper dependency injection.
 * Optimized with selective subscriptions and computed values for better performance.
 */
const useHomeScreenImpl = (): UseHomeScreenResult => {
  const logger = useSafeLogging()
  
  // Get user preferences following app pattern
  const userPreferencesContext = useUserPreferences()
  const queryClient = useQueryClient()
  const { handleScroll } = useScrollTabBar()
  const getAllCatalogsUseCase = useSafeGetAllCatalogsUseCase()
  const loadMoreCatalogItemsUseCase = useSafeLoadMoreCatalogItemsUseCase()

  // Extract user preferences following app pattern - memoized for performance
  const preferences = useMemo(() => ({
    layout: userPreferencesContext.preferences.homeScreenLayout,
    compactMode: userPreferencesContext.preferences.displaySettings.compactMode,
    fontSize: userPreferencesContext.preferences.displaySettings.fontSize,
    enabledProviders: userPreferencesContext.preferences.providerPreferences.enabledProviders,
    regionSettings: 'US' // Default region settings
  }), [
    userPreferencesContext.preferences.homeScreenLayout,
    userPreferencesContext.preferences.displaySettings.compactMode,
    userPreferencesContext.preferences.displaySettings.fontSize,
    userPreferencesContext.preferences.providerPreferences.enabledProviders
  ])

  // TanStack Query for API caching only - Legend State managed by use case
  const { refetch } = useQuery({
    queryKey: vnylQueryKeys.catalogs.list(JSON.stringify(preferences)),
    queryFn: async () => {
      if (!getAllCatalogsUseCase) {
        throw new Error('Catalogs service not available')
      }

      logger?.info('HomeScreen: Loading catalogs via TanStack Query')
      
      try {
        // Use case now manages Legend State directly
        const result = await getAllCatalogsUseCase.execute()
        
        logger?.info('HomeScreen: Catalogs loaded with deterministic ordering', {
          catalogCount: result.catalogs.length,
          totalItems: result.catalogs.reduce((sum, catalog) => sum + catalog.items.length, 0),
          successfulProviders: result.successfulProviders,
          totalProviders: result.totalProviders
        })
        
        return result.catalogs // Return for TanStack Query cache only
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger?.error('HomeScreen: Failed to load catalogs', errorInstance)
        throw errorInstance
      }
    },
    enabled: !!getAllCatalogsUseCase,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 2
  })

  /**
   * Refresh catalogs following app's error handling pattern
   */
  const refresh = useCallback(async (): Promise<void> => {
    try {
      logger?.info('HomeScreen: Starting refresh with deterministic ordering')
      homescreenActions.setRefreshing(true)
      
      // Invalidate TanStack Query cache and refetch
      await queryClient.invalidateQueries({ 
        queryKey: vnylQueryKeys.catalogs.all 
      })
      await refetch()
      
      logger?.info('HomeScreen: Refresh completed successfully')
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger?.error('HomeScreen: Refresh failed', errorInstance)
      throw errorInstance
    } finally {
      homescreenActions.setRefreshing(false)
    }
  }, [logger, queryClient, refetch])

  /**
   * Load more items for a catalog following app's error handling pattern
   */
  const loadMoreItems = useCallback(async (catalog: Catalog): Promise<void> => {
    if (!loadMoreCatalogItemsUseCase) {
      const errorMessage = 'Load more service not available'
      homescreenActions.setError(errorMessage)
      throw new Error(errorMessage)
    }

    const nextPage = catalog.pagination.page + 1

    logger?.info('HomeScreen: Loading more items', { 
      catalogId: catalog.id,
      catalogType: catalog.catalogContext?.catalogType,
      currentItems: catalog.items.length,
      currentPage: catalog.pagination.page,
      requestingPage: nextPage,
      hasMore: catalog.pagination.hasMore
    })

    try {
      homescreenActions.setLoadingMore(true)
      homescreenActions.clearError()

      // Get provider and prepare request
      const providerId = catalog.catalogContext?.providerId || 'tmdb-catalog'

      const request: LoadMoreCatalogItemsRequest = {
        providerId,
        catalogId: catalog.catalogContext?.catalogId || catalog.catalogContext?.catalogType || catalog.id,
        catalog,
        page: nextPage,
        limit: 20,
        originalCatalogContext: catalog.catalogContext,
        originalPagination: catalog.pagination
      }

      // Call use case to load more items via TanStack Query
      const result = await loadMoreCatalogItemsUseCase.execute(request)

      if (result.items && result.items.length > 0) {
        // Update Legend State with new items
        homescreenActions.addMoreItemsToCatalog(catalog.id, result.items, result.pagination)
        
        logger?.info('HomeScreen: More items loaded successfully', {
          catalogId: catalog.id,
          newItemsCount: result.items.length,
          hasMore: result.pagination.hasMore,
          isLastPage: result.isLastPage
        })
      } else {
        logger?.warn('HomeScreen: No new items received')
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      homescreenActions.setError(errorInstance.message)
      logger?.error('HomeScreen: Load more failed', errorInstance)
      throw errorInstance
    } finally {
      homescreenActions.setLoadingMore(false)
    }
  }, [logger, loadMoreCatalogItemsUseCase])

  /**
   * Navigation handlers
   */
  const handleItemPress = useCallback((item: CatalogItem) => {
    logger?.debug('HomeScreen: Item pressed', undefined, { 
      title: item.title, 
      mediaType: item.mediaType 
    })
    
    // Store the selected item in the homescreen store for direct access (for both person and media)
    homescreenActions.setSelectedItem(item)
    
    if (item.mediaType === 'person') {
      router.push(`/person/${item.id}` as any)
    } else {
      router.push(`/media/${item.id}` as any)
    }
  }, [logger])

  const handleAddToWatchlist = useCallback((item: CatalogItem) => {
    logger?.debug('HomeScreen: Added to watchlist', undefined, { title: item.title })
    // Watchlist functionality to be implemented
  }, [logger])

  const handleMorePress = useCallback((item: CatalogItem) => {
    logger?.debug('HomeScreen: More options pressed', undefined, { title: item.title })
    // Handled by ContextMenu in components
  }, [logger])

  const handleSeeAllPress = useCallback((title: string, catalog?: Catalog) => {
    logger?.debug('HomeScreen: See all pressed', undefined, { title, catalogId: catalog?.id })
    
    if (catalog) {
      router.push(`/grid/${catalog.id}` as any)
    } else {
      router.push('/grid/all' as any)
    }
  }, [logger])

  /**
   * Helper functions
   */

  const clearError = useCallback(() => {
    homescreenActions.clearError()
  }, [])

  // Build state from Legend State store using optimized selectors
  const dataState = homescreenSelectors.dataState.get()
  const loadingState = homescreenSelectors.loadingState.get()
  const errorState = homescreenSelectors.errorState.get()
  const statsState = homescreenSelectors.statsState.get()

  const state: HomeScreenState = useMemo(() => ({
    // Data from optimized selectors
    ...dataState,
    ...loadingState,
    ...errorState,
    ...statsState,
    
    // User preferences (stable)
    ...preferences
  }), [dataState, loadingState, errorState, statsState, preferences])

  const actions: HomeScreenActions = {
    handleScroll,
    handleItemPress,
    handleAddToWatchlist,
    handleMorePress,
    handleSeeAllPress,
    refresh,
    loadMoreItems,
    clearError,
    getCatalogById: homescreenActions.getCatalogById,
    getCatalogsByType: homescreenActions.getCatalogsByType
  }

  return {
    state,
    actions
  }
}

/**
 * Export the hook - observer should be applied at component level
 */
export const useHomeScreen = useHomeScreenImpl

