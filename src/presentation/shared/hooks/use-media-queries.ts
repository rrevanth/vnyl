/**
 * Media Query Hooks - TanStack Query Integration for Media Operations
 * 
 * Custom hooks that integrate the media repository with TanStack Query
 * for efficient caching, background updates, and error handling.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMediaRepository } from '@/src/infrastructure/di/hooks'
import { queryKeys } from '@/src/infrastructure/query/query-client.config'
import type { BasicCatalogItem } from '@/src/domain/entities/enhanced-catalog-item.entity'

/**
 * Hook for loading basic catalog items with caching and pagination
 */
export const useBasicCatalogItems = (params: {
  catalogType: string
  contentType?: string
  page?: number
  limit?: number
  region?: string
  language?: string
  genre?: string
  year?: number
  enabled?: boolean
}) => {
  const mediaRepository = useMediaRepository()
  
  return useQuery({
    queryKey: queryKeys.catalogItems.byTypeAndCatalog(
      params.contentType || 'movie',
      params.catalogType
    ).concat([JSON.stringify(params)]),
    queryFn: () => mediaRepository.getBasicCatalogItems(params),
    enabled: params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: `Failed to load ${params.catalogType} ${params.contentType || 'movies'}`
    }
  })
}

/**
 * Hook for infinite loading of catalog items (pagination)
 */
export const useInfiniteCatalogItems = (params: {
  catalogType: string
  contentType?: string
  limit?: number
  region?: string
  language?: string
  genre?: string
  year?: number
  enabled?: boolean
}) => {
  const mediaRepository = useMediaRepository()
  
  return useInfiniteQuery({
    queryKey: queryKeys.catalogItems.byTypeAndCatalog(
      params.contentType || 'movie',
      params.catalogType
    ).concat(['infinite', JSON.stringify(params)]),
    queryFn: ({ pageParam = 1 }) => 
      mediaRepository.getBasicCatalogItems({ ...params, page: pageParam }),
    enabled: params.enabled !== false,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (longer for infinite queries)
    retry: 2,
    meta: {
      errorMessage: `Failed to load ${params.catalogType} ${params.contentType || 'movies'}`
    }
  })
}

/**
 * Hook for loading detailed media information
 */
export const useMediaDetail = (itemId: string, options?: {
  includeImages?: boolean
  includeVideos?: boolean
  includeRecommendations?: boolean
  forceRefresh?: boolean
  enabled?: boolean
}) => {
  const mediaRepository = useMediaRepository()
  
  return useQuery({
    queryKey: queryKeys.mediaDetail.byId(itemId).concat([
      JSON.stringify(options || {})
    ]),
    queryFn: () => mediaRepository.getMediaDetail(itemId, options),
    enabled: options?.enabled !== false && !!itemId,
    staleTime: 30 * 60 * 1000, // 30 minutes (longer for detailed data)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: `Failed to load media details for ${itemId}`
    }
  })
}

/**
 * Hook for searching media
 */
export const useSearchMedia = (query: string, options?: {
  contentType?: string
  page?: number
  limit?: number
  includeAdult?: boolean
  enabled?: boolean
}) => {
  const mediaRepository = useMediaRepository()
  
  return useQuery({
    queryKey: ['media-search', query, JSON.stringify(options || {})],
    queryFn: () => mediaRepository.searchMedia(query, options),
    enabled: (options?.enabled !== false) && !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for search)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Fewer retries for search
    meta: {
      errorMessage: `Failed to search for "${query}"`
    }
  })
}

/**
 * Hook for infinite search results
 */
export const useInfiniteSearchMedia = (query: string, options?: {
  contentType?: string
  limit?: number
  includeAdult?: boolean
  enabled?: boolean
}) => {
  const mediaRepository = useMediaRepository()
  
  return useInfiniteQuery({
    queryKey: ['media-search-infinite', query, JSON.stringify(options || {})],
    queryFn: ({ pageParam = 1 }) => 
      mediaRepository.searchMedia(query, { ...options, page: pageParam }),
    enabled: (options?.enabled !== false) && !!query && query.length >= 2,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    meta: {
      errorMessage: `Failed to search for "${query}"`
    }
  })
}

/**
 * Hook for getting similar media
 */
export const useSimilarMedia = (itemId: string, options?: {
  page?: number
  limit?: number
  enabled?: boolean
}) => {
  const mediaRepository = useMediaRepository()
  
  return useQuery({
    queryKey: ['similar-media', itemId, JSON.stringify(options || {})],
    queryFn: () => mediaRepository.getSimilarMedia(itemId, options),
    enabled: (options?.enabled !== false) && !!itemId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    meta: {
      errorMessage: `Failed to load similar media for ${itemId}`
    }
  })
}

/**
 * Mutation hook for invalidating media cache
 */
export const useInvalidateMediaCache = () => {
  const mediaRepository = useMediaRepository()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      await mediaRepository.invalidateMediaCache(itemId)
      // Also invalidate TanStack Query cache
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mediaDetail.byId(itemId)
      })
    },
    meta: {
      errorMessage: 'Failed to invalidate media cache'
    }
  })
}

/**
 * Mutation hook for clearing all media cache
 */
export const useClearAllMediaCache = () => {
  const mediaRepository = useMediaRepository()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await mediaRepository.clearAllCache()
      // Also clear TanStack Query cache
      await queryClient.invalidateQueries({
        queryKey: queryKeys.catalogItems.all
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.mediaDetail.all
      })
    },
    meta: {
      errorMessage: 'Failed to clear media cache'
    }
  })
}

/**
 * Hook to check if media detail is cached
 */
export const useIsMediaDetailCached = (itemId: string) => {
  const mediaRepository = useMediaRepository()
  
  return useQuery({
    queryKey: ['media-cache-status', itemId],
    queryFn: () => mediaRepository.isMediaDetailCached(itemId),
    enabled: !!itemId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: false, // Don't retry cache checks
    meta: {
      errorMessage: `Failed to check cache status for ${itemId}`
    }
  })
}

/**
 * Prefetch utilities for optimistic loading
 */
export const useMediaPrefetch = () => {
  const queryClient = useQueryClient()
  const mediaRepository = useMediaRepository()
  
  const prefetchCatalogItems = async (params: {
    catalogType: string
    contentType?: string
    page?: number
    limit?: number
  }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.catalogItems.byTypeAndCatalog(
        params.contentType || 'movie',
        params.catalogType
      ).concat([JSON.stringify(params)]),
      queryFn: () => mediaRepository.getBasicCatalogItems(params),
      staleTime: 5 * 60 * 1000
    })
  }
  
  const prefetchMediaDetail = async (itemId: string, options?: {
    includeImages?: boolean
    includeVideos?: boolean
    includeRecommendations?: boolean
  }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.mediaDetail.byId(itemId).concat([
        JSON.stringify(options || {})
      ]),
      queryFn: () => mediaRepository.getMediaDetail(itemId, options),
      staleTime: 30 * 60 * 1000
    })
  }
  
  return {
    prefetchCatalogItems,
    prefetchMediaDetail
  }
}

/**
 * Hook for batch operations
 */
export const useMediaBatch = () => {
  const queryClient = useQueryClient()
  const mediaRepository = useMediaRepository()
  
  const batchPrefetchMediaDetails = async (itemIds: string[]) => {
    await Promise.allSettled(
      itemIds.map(itemId => 
        queryClient.prefetchQuery({
          queryKey: queryKeys.mediaDetail.byId(itemId),
          queryFn: () => mediaRepository.getMediaDetail(itemId),
          staleTime: 30 * 60 * 1000
        })
      )
    )
  }
  
  const batchInvalidateCache = async (itemIds: string[]) => {
    await Promise.allSettled([
      ...itemIds.map(itemId => mediaRepository.invalidateMediaCache(itemId)),
      ...itemIds.map(itemId => 
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.mediaDetail.byId(itemId)
        })
      )
    ])
  }
  
  return {
    batchPrefetchMediaDetails,
    batchInvalidateCache
  }
}

/**
 * Multiple catalog types hook for dashboard/home screen
 * Fixed to call hooks consistently and filter results
 */
export const useMultipleCatalogs = (
  contentType: 'movie' | 'tv',
  catalogTypes: string[] = ['popular', 'trending']
) => {
  // Always call all possible hooks to maintain consistent order
  const popularQuery = useBasicCatalogItems({ catalogType: 'popular', contentType })
  const trendingQuery = useBasicCatalogItems({ catalogType: 'trending', contentType })
  const topRatedQuery = useBasicCatalogItems({ catalogType: 'top_rated', contentType })
  const nowPlayingQuery = useBasicCatalogItems({ catalogType: 'now_playing', contentType })
  const upcomingQuery = useBasicCatalogItems({ catalogType: 'upcoming', contentType })

  // Map catalog types to their corresponding queries
  const catalogQueryMap = {
    popular: popularQuery,
    trending: trendingQuery,
    top_rated: topRatedQuery,
    now_playing: nowPlayingQuery,
    upcoming: upcomingQuery
  }

  // Filter to only the requested catalog types
  const activeQueries = catalogTypes
    .map(catalogType => catalogQueryMap[catalogType as keyof typeof catalogQueryMap])
    .filter(Boolean)

  return {
    queries: activeQueries,
    isLoading: activeQueries.some(query => query.isLoading),
    isError: activeQueries.some(query => query.isError),
    errors: activeQueries.filter(query => query.error).map(query => query.error),
    data: catalogTypes.reduce((acc, catalogType) => {
      const query = catalogQueryMap[catalogType as keyof typeof catalogQueryMap]
      if (query?.data) {
        acc[catalogType] = query.data.items
      }
      return acc
    }, {} as Record<string, BasicCatalogItem[]>)
  }
}