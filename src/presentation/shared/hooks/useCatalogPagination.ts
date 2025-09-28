/**
 * Catalog Pagination TanStack Query Hook
 * 
 * Provides infinite query support for catalog pagination with HomeScreenController integration.
 * Handles loading more items, cache management, and optimistic updates.
 * 
 * Follows CLEAN architecture patterns and existing pagination patterns.
 */

import { useInfiniteQuery, useQueryClient, InfiniteData } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useSafeLoadMoreCatalogItemsUseCase, useSafeLogging } from '@/src/infrastructure/di'
import type { LoadMoreCatalogItemsRequest, LoadMoreCatalogItemsResult } from '@/src/domain/usecases/load-more-catalog-items.usecase'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { PaginationInfo } from '@/src/domain/entities/media/catalog.entity'

/**
 * Catalog pagination query configuration
 */
interface UseCatalogPaginationOptions {
  /** Initial page to start from */
  initialPage?: number
  /** Items per page */
  pageSize?: number
  /** Enable automatic fetching */
  enabled?: boolean
  /** Stale time in milliseconds */
  staleTime?: number
  /** Cache time in milliseconds */
  cacheTime?: number
  /** Retry configuration */
  retry?: number | boolean
}

/**
 * Catalog pagination result
 */
interface UseCatalogPaginationResult {
  // Data state
  allItems: CatalogItem[]
  pages: LoadMoreCatalogItemsResult[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isFetching: boolean
  isFetchingNextPage: boolean
  
  // Pagination state
  hasNextPage: boolean
  hasPreviousPage: boolean
  currentPage: number
  totalPages?: number
  totalItems?: number
  
  // Actions
  fetchNextPage: () => Promise<any>
  refetch: () => Promise<any>
  invalidate: () => Promise<void>
  
  // Helper functions
  getItemsByPage: (pageIndex: number) => CatalogItem[]
  getLatestPagination: () => PaginationInfo | undefined
}

/**
 * Default pagination options
 */
const DEFAULT_PAGINATION_OPTIONS: UseCatalogPaginationOptions = {
  initialPage: 1,
  pageSize: 20,
  enabled: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 2
}

/**
 * TanStack Infinite Query hook for catalog pagination
 * 
 * Provides infinite scrolling/pagination for catalog items with
 * proper cache management and error handling.
 */
export const useCatalogPagination = (
  catalogId: string,
  providerId: string,
  options: UseCatalogPaginationOptions = {}
): UseCatalogPaginationResult => {
  const loadMoreCatalogItemsUseCase = useSafeLoadMoreCatalogItemsUseCase()
  const logger = useSafeLogging()
  const queryClient = useQueryClient()
  
  // Merge options with defaults
  const paginationOptions = { ...DEFAULT_PAGINATION_OPTIONS, ...options }
  
  // Create query key for this specific catalog pagination
  const queryKey = useMemo(() => [
    'catalog-pagination',
    catalogId,
    providerId,
    { pageSize: paginationOptions.pageSize }
  ], [catalogId, providerId, paginationOptions.pageSize])

  // Infinite query for pagination
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    refetch
  } = useInfiniteQuery<LoadMoreCatalogItemsResult, Error, InfiniteData<LoadMoreCatalogItemsResult>, readonly unknown[], number>({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam?: number } = {}): Promise<LoadMoreCatalogItemsResult> => {
      if (!loadMoreCatalogItemsUseCase) {
        throw new Error('Pagination service not available. Please wait for app initialization.')
      }

      const page = pageParam ?? paginationOptions.initialPage!
      logger?.info('CatalogPagination: Fetching page', { 
        catalogId, 
        providerId, 
        page,
        pageSize: paginationOptions.pageSize
      })

      try {
        const request: LoadMoreCatalogItemsRequest = {
          catalogId,
          providerId,
          page,
          limit: paginationOptions.pageSize!
        }

        const result = await loadMoreCatalogItemsUseCase.execute(request)
        
        logger?.info('CatalogPagination: Page loaded successfully', {
          catalogId,
          providerId,
          page,
          itemsCount: result.items?.length || 0,
          hasMore: result.pagination?.hasMore || false,
          isLastPage: result.isLastPage
        })

        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger?.error('CatalogPagination: Page load failed', errorInstance, {
          catalogId,
          providerId,
          page
        })
        throw errorInstance
      }
    },
    initialPageParam: paginationOptions.initialPage! as number,
    getNextPageParam: (lastPage: LoadMoreCatalogItemsResult, allPages: LoadMoreCatalogItemsResult[]): number | undefined => {
      // Continue pagination if there are more items and we haven't reached the last page
      if (lastPage.pagination?.hasMore && !lastPage.isLastPage) {
        return allPages.length + 1
      }
      return undefined
    },
    getPreviousPageParam: (firstPage: LoadMoreCatalogItemsResult, allPages: LoadMoreCatalogItemsResult[]): number | undefined => {
      // Support backward pagination if needed
      return allPages.length > 1 ? 1 : undefined
    },
    enabled: paginationOptions.enabled && !!loadMoreCatalogItemsUseCase,
    retry: paginationOptions.retry,
    staleTime: paginationOptions.staleTime,
    gcTime: paginationOptions.cacheTime
  })

  // Extract all items from all pages
  const allItems = useMemo((): CatalogItem[] => {
    if (!data?.pages) return []
    
    return data.pages.reduce<CatalogItem[]>((acc, page) => {
      if (page.items) {
        return [...acc, ...page.items]
      }
      return acc
    }, [])
  }, [data?.pages])

  // Get current pagination state
  const currentPage = useMemo(() => data?.pages.length || 0, [data?.pages.length])
  
  // Get latest pagination info
  const getLatestPagination = useCallback((): PaginationInfo | undefined => {
    if (!data?.pages || data.pages.length === 0) return undefined
    const lastPage = data.pages[data.pages.length - 1] as LoadMoreCatalogItemsResult
    return lastPage?.pagination
  }, [data?.pages])

  // Extract pagination metadata
  const latestPagination = getLatestPagination()
  const totalPages = useMemo(() => latestPagination?.totalPages, [latestPagination?.totalPages])
  const totalItems = useMemo(() => latestPagination?.totalItems, [latestPagination?.totalItems])

  // Invalidate query cache
  const invalidate = useCallback(async (): Promise<void> => {
    logger?.info('CatalogPagination: Invalidating pagination cache', { catalogId, providerId })
    await queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey, catalogId, providerId, logger])

  // Helper: Get items from specific page
  const getItemsByPage = useCallback((pageIndex: number): CatalogItem[] => {
    if (!data?.pages || pageIndex >= data.pages.length || pageIndex < 0) {
      return []
    }
    const page = data.pages[pageIndex] as LoadMoreCatalogItemsResult
    return page?.items || []
  }, [data?.pages])

  return {
    // Data state
    allItems,
    pages: (data?.pages as LoadMoreCatalogItemsResult[]) || [],
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
    isFetchingNextPage,
    
    // Pagination state
    hasNextPage: hasNextPage || false,
    hasPreviousPage: hasPreviousPage || false,
    currentPage,
    totalPages,
    totalItems,
    
    // Actions
    fetchNextPage,
    refetch,
    invalidate,
    
    // Helper functions
    getItemsByPage,
    getLatestPagination
  }
}

/**
 * Hook for simple catalog page loading (single page)
 * 
 * Use this when you need to load a specific page without infinite scrolling.
 */
export const useCatalogPage = (
  catalogId: string,
  providerId: string,
  page: number,
  options: Omit<UseCatalogPaginationOptions, 'initialPage'> = {}
) => {
  const modifiedOptions = {
    ...options,
    initialPage: page
  }
  
  const result = useCatalogPagination(catalogId, providerId, modifiedOptions)
  
  // Return only the current page data for simpler usage
  return {
    ...result,
    items: result.getItemsByPage(0), // First (and only) page
    pagination: result.getLatestPagination()
  }
}