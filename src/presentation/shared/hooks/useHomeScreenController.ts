import { useState, useCallback, useEffect } from 'react'
import { useSafeGetAllCatalogsUseCase, useSafeLoadMoreCatalogItemsUseCase, useSafeLogging } from '@/src/infrastructure/di'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import type { GetAllCatalogsResult } from '@/src/domain/usecases/get-all-catalogs.usecase'
import type { LoadMoreCatalogItemsRequest, LoadMoreCatalogItemsResult } from '@/src/domain/usecases/load-more-catalog-items.usecase'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { HomeScreenLayoutPreference } from '@/src/domain/entities/user.entity'

/**
 * HomeScreenController - Coordinates catalog data fetching with user preferences
 * 
 * Follows CLEAN architecture patterns:
 * - Coordinates use cases through dependency injection
 * - Manages loading states and error handling
 * - Integrates user preferences for display configuration
 * - Prepared for TanStack Query integration
 */

export interface HomeScreenState {
  catalogs: Catalog[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  refreshing: boolean
}

export interface HomeScreenActions {
  loadCatalogs: () => Promise<void>
  loadMoreItems: (catalogId: string, providerId: string, page: number) => Promise<void>
  loadMoreItemsWithCatalog: (catalog: Catalog, providerId: string, page: number) => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}

export interface HomeScreenPreferences {
  layout: HomeScreenLayoutPreference
  compactMode: boolean
  fontSize: string
  enabledProviders: Record<string, boolean>
  regionSettings: string
}

export interface UseHomeScreenControllerReturn {
  state: HomeScreenState
  actions: HomeScreenActions
  preferences: HomeScreenPreferences
}

/**
 * HomeScreenController hook
 * 
 * Manages home screen state, catalog loading, and user preferences coordination
 * Ready for TanStack Query integration while maintaining use case orchestration
 */
export const useHomeScreenController = (): UseHomeScreenControllerReturn => {
  const getAllCatalogsUseCase = useSafeGetAllCatalogsUseCase()
  const loadMoreCatalogItemsUseCase = useSafeLoadMoreCatalogItemsUseCase()
  const logger = useSafeLogging()
  const userPreferencesContext = useUserPreferences()

  // State management
  const [state, setState] = useState<HomeScreenState>({
    catalogs: [],
    isLoading: false,
    isLoadingMore: false,
    error: null,
    hasMore: false,
    refreshing: false
  })

  // Helper function to safely update state
  const updateState = useCallback((updates: Partial<HomeScreenState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Error handling with proper typing
  const handleError = useCallback((error: unknown, context: string) => {
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    logger?.error(`HomeScreen: ${context}`, errorInstance)
    updateState({ 
      error: errorInstance.message,
      isLoading: false,
      isLoadingMore: false,
      refreshing: false 
    })
  }, [logger, updateState])

  // Load initial catalogs
  const loadCatalogs = useCallback(async () => {
    if (!getAllCatalogsUseCase) {
      updateState({ error: 'Catalogs service not available', isLoading: false })
      return
    }

    try {
      logger?.info('HomeScreen: Loading catalogs', {
        layout: userPreferencesContext.preferences.homeScreenLayout,
        enabledProviders: userPreferencesContext.preferences.providerPreferences.enabledProviders
      })

      updateState({ isLoading: true, error: null })

      const result: GetAllCatalogsResult = await getAllCatalogsUseCase.execute()

      if (result.catalogs) {
        const hasMoreItems = result.catalogs.some(catalog => catalog.pagination.hasMore)
        
        updateState({
          catalogs: result.catalogs,
          hasMore: hasMoreItems,
          isLoading: false
        })

        logger?.info('HomeScreen: Catalogs loaded successfully', {
          catalogCount: result.catalogs.length,
          totalItems: result.catalogs.reduce((sum, catalog) => sum + catalog.items.length, 0),
          hasMore: hasMoreItems,
          successfulProviders: result.successfulProviders,
          totalProviders: result.totalProviders
        })
      } else {
        throw new Error('No catalogs received from providers')
      }
    } catch (error) {
      handleError(error, 'failed to load catalogs')
    }
  }, [
    getAllCatalogsUseCase,
    userPreferencesContext.preferences.homeScreenLayout,
    userPreferencesContext.preferences.providerPreferences.enabledProviders,
    logger,
    updateState,
    handleError
  ])

  // Load more items for a specific catalog
  const loadMoreItems = useCallback(async (catalogId: string, providerId: string, page: number) => {
    if (!loadMoreCatalogItemsUseCase) {
      updateState({ error: 'Load more service not available', isLoadingMore: false })
      return
    }

    try {
      logger?.info('HomeScreen: Loading more items', { catalogId, providerId, page })

      updateState({ isLoadingMore: true, error: null })

      // Find the catalog to get its context
      const catalog = state.catalogs.find(c => c.id === catalogId)
      if (!catalog) {
        throw new Error(`Catalog ${catalogId} not found`)
      }

      const request: LoadMoreCatalogItemsRequest = {
        providerId,
        catalogId,
        catalog,
        page,
        limit: 20,
        originalCatalogContext: catalog.catalogContext,
        originalPagination: catalog.pagination
      }

      const result: LoadMoreCatalogItemsResult = await loadMoreCatalogItemsUseCase.execute(request)

      if (result.items) {
        setState(prev => {
          const updatedCatalogs = prev.catalogs.map(catalog => {
            if (catalog.id === catalogId) {
              return {
                ...catalog,
                items: [...catalog.items, ...result.items],
                pagination: result.pagination,
                updatedAt: new Date()
              }
            }
            return catalog
          })

          const hasMoreItems = updatedCatalogs.some(catalog => catalog.pagination.hasMore)

          return {
            ...prev,
            catalogs: updatedCatalogs,
            hasMore: hasMoreItems,
            isLoadingMore: false
          }
        })

        logger?.info('HomeScreen: More items loaded successfully', {
          catalogId,
          providerId,
          newItemsCount: result.items.length,
          hasMore: result.pagination.hasMore,
          isLastPage: result.isLastPage
        })
      } else {
        throw new Error('No items received from provider')
      }
    } catch (error) {
      handleError(error, 'failed to load more items')
    }
  }, [
    loadMoreCatalogItemsUseCase,
    logger,
    updateState,
    handleError,
    state.catalogs
  ])

  // Load more items for a specific catalog using catalog object directly (avoids catalog lookup)
  const loadMoreItemsWithCatalog = useCallback(async (catalog: Catalog, providerId: string, page: number) => {
    if (!loadMoreCatalogItemsUseCase) {
      updateState({ error: 'Load more service not available', isLoadingMore: false })
      return
    }

    try {
      logger?.info('HomeScreen: Loading more items with catalog object', { 
        catalogId: catalog.id,
        catalogType: catalog.catalogContext?.catalogType,
        providerId, 
        page 
      })

      updateState({ isLoadingMore: true, error: null })

      // Use catalog object directly, no lookup needed
      const request: LoadMoreCatalogItemsRequest = {
        providerId,
        catalogId: catalog.catalogContext?.catalogId || catalog.catalogContext?.catalogType || catalog.id,
        catalog,
        page,
        limit: 20,
        originalCatalogContext: catalog.catalogContext,
        originalPagination: catalog.pagination
      }

      const result: LoadMoreCatalogItemsResult = await loadMoreCatalogItemsUseCase.execute(request)

      if (result.items) {
        setState(prev => {
          const updatedCatalogs = prev.catalogs.map(existingCatalog => {
            if (existingCatalog.id === catalog.id) {
              return {
                ...existingCatalog,
                items: [...existingCatalog.items, ...result.items],
                pagination: result.pagination,
                updatedAt: new Date()
              }
            }
            return existingCatalog
          })

          const hasMoreItems = updatedCatalogs.some(catalog => catalog.pagination.hasMore)

          return {
            ...prev,
            catalogs: updatedCatalogs,
            hasMore: hasMoreItems,
            isLoadingMore: false
          }
        })

        logger?.info('HomeScreen: More items loaded successfully with catalog object', {
          catalogId: catalog.id,
          catalogType: catalog.catalogContext?.catalogType,
          providerId,
          newItemsCount: result.items.length,
          hasMore: result.pagination.hasMore,
          isLastPage: result.isLastPage
        })
      } else {
        throw new Error('No items received from provider')
      }
    } catch (error) {
      handleError(error, 'failed to load more items with catalog')
    }
  }, [
    loadMoreCatalogItemsUseCase,
    logger,
    updateState,
    handleError,
    setState
  ])

  // Refresh all catalogs
  const refresh = useCallback(async () => {
    try {
      logger?.info('HomeScreen: Refreshing catalogs')
      
      updateState({ refreshing: true, error: null })

      // Clear current catalogs and reload
      updateState({ catalogs: [] })
      await loadCatalogs()

      updateState({ refreshing: false })
      
      logger?.info('HomeScreen: Refresh completed successfully')
    } catch (error) {
      handleError(error, 'failed to refresh catalogs')
    }
  }, [loadCatalogs, logger, updateState, handleError])

  // Clear error state
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // Auto-load catalogs on mount or when preferences change
  useEffect(() => {
    if (!userPreferencesContext.isLoading && state.catalogs.length === 0 && !state.isLoading) {
      loadCatalogs()
    }
  }, [
    userPreferencesContext.preferences.providerPreferences.enabledProviders,
    userPreferencesContext.isLoading,
    state.catalogs.length,
    state.isLoading,
    loadCatalogs
  ])

  // Extract user preferences for home screen configuration
  const preferences: HomeScreenPreferences = {
    layout: userPreferencesContext.preferences.homeScreenLayout,
    compactMode: userPreferencesContext.preferences.displaySettings.compactMode,
    fontSize: userPreferencesContext.preferences.displaySettings.fontSize,
    enabledProviders: userPreferencesContext.preferences.providerPreferences.enabledProviders,
    regionSettings: userPreferencesContext.preferences.providerPreferences.regionSettings
  }

  const actions: HomeScreenActions = {
    loadCatalogs,
    loadMoreItems,
    loadMoreItemsWithCatalog,
    refresh,
    clearError
  }

  return {
    state,
    actions,
    preferences
  }
}