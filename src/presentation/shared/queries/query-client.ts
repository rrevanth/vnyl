/**
 * TanStack Query Configuration with Persistence
 * 
 * Provides comprehensive query client configuration with persistence patterns,
 * cache management, and error handling for the VNYL app.
 * 
 * Follows existing patterns and integrates with CLEAN architecture.
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

/**
 * Query configuration constants
 */
export const QUERY_CONFIG = {
  // Cache times
  STALE_TIME: {
    SHORT: 1 * 60 * 1000,      // 1 minute
    MEDIUM: 5 * 60 * 1000,     // 5 minutes  
    LONG: 15 * 60 * 1000,      // 15 minutes
    VERY_LONG: 60 * 60 * 1000  // 1 hour
  },
  CACHE_TIME: {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 10 * 60 * 1000,    // 10 minutes
    LONG: 30 * 60 * 1000,      // 30 minutes
    VERY_LONG: 2 * 60 * 60 * 1000 // 2 hours
  },
  // Retry configuration
  RETRY: {
    DEFAULT: 2,
    IMPORTANT: 3,
    NONE: 0
  },
  // Network configuration
  NETWORK: {
    TIMEOUT: 30000, // 30 seconds
    OFFLINE_RETRY: 1
  }
} as const

/**
 * Query key factories for consistent cache management
 */
export const queryKeys = {
  // Catalog queries
  catalogs: {
    all: ['catalogs'] as const,
    lists: () => [...queryKeys.catalogs.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.catalogs.lists(), { filters }] as const,
    details: () => [...queryKeys.catalogs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.catalogs.details(), id] as const,
    pagination: (id: string, providerId: string) => ['catalog-pagination', id, providerId] as const
  },
  // Search queries  
  search: {
    all: ['search'] as const,
    unified: (query: string) => [...queryKeys.search.all, 'unified', query] as const,
    provider: (providerId: string, query: string) => [...queryKeys.search.all, 'provider', providerId, query] as const
  },
  // Media queries
  media: {
    all: ['media'] as const,
    details: () => [...queryKeys.media.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.media.details(), id] as const,
    trailers: (id: string) => [...queryKeys.media.all, 'trailers', id] as const,
    credits: (id: string) => [...queryKeys.media.all, 'credits', id] as const
  },
  // User data
  user: {
    all: ['user'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    watchlist: () => [...queryKeys.user.all, 'watchlist'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const
  }
} as const

/**
 * Creates a configured QueryClient with error handling and logging
 */
export const createQueryClient = (): QueryClient => {
  // Use console for logging since we can't use hooks in this factory function
  const logError = (context: string, error: unknown, meta?: any) => {
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    console.error(`QueryClient: ${context}`, errorInstance, meta)
  }

  const logInfo = (context: string, meta?: any) => {
    console.log(`QueryClient: ${context}`, meta)
  }

  // Query cache with error handling
  const queryCache = new QueryCache({
    onError: (error, query) => {
      logError('Query failed', error, {
        queryKey: query.queryKey,
        queryHash: query.queryHash
      })
    },
    onSuccess: (data, query) => {
      logInfo('Query succeeded', {
        queryKey: query.queryKey,
        dataSize: typeof data === 'object' && data ? Object.keys(data).length : 'unknown'
      })
    }
  })

  // Mutation cache with error handling  
  const mutationCache = new MutationCache({
    onError: (error, variables, context, mutation) => {
      logError('Mutation failed', error, {
        mutationKey: mutation.options.mutationKey,
        variables
      })
    },
    onSuccess: (data, variables, context, mutation) => {
      logInfo('Mutation succeeded', {
        mutationKey: mutation.options.mutationKey
      })
    }
  })

  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered fresh
        staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
        
        // GC time - how long data stays in cache after component unmounts  
        gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
        
        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on certain error types
          if (error instanceof Error) {
            // Don't retry on authentication errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              return false
            }
            // Don't retry on not found errors
            if (error.message.includes('404') || error.message.includes('Not Found')) {
              return false
            }
          }
          
          // Default retry logic
          return failureCount < QUERY_CONFIG.RETRY.DEFAULT
        },
        
        // Network configuration
        refetchOnWindowFocus: false, // Disable for mobile
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Error handling
        throwOnError: false, // Let components handle errors
        
        // Network mode
        networkMode: 'online', // Only run queries when online
        
        // Retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
      },
      mutations: {
        retry: QUERY_CONFIG.RETRY.DEFAULT,
        throwOnError: false,
        networkMode: 'online'
      }
    }
  })
}

/**
 * Cache invalidation utilities
 */
export const cacheUtils = {
  /**
   * Invalidate all catalog-related queries
   */
  invalidateCatalogs: async (queryClient: QueryClient): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.catalogs.all })
  },

  /**
   * Invalidate specific catalog
   */
  invalidateCatalog: async (queryClient: QueryClient, catalogId: string): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.catalogs.detail(catalogId) })
  },

  /**
   * Invalidate search queries
   */
  invalidateSearch: async (queryClient: QueryClient): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.search.all })
  },

  /**
   * Invalidate user data
   */
  invalidateUser: async (queryClient: QueryClient): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
  },

  /**
   * Clear all caches (nuclear option)
   */
  clearAllCaches: async (queryClient: QueryClient): Promise<void> => {
    await queryClient.clear()
  },

  /**
   * Prefetch catalog data
   */
  prefetchCatalog: async (
    queryClient: QueryClient, 
    catalogId: string, 
    providerId: string
  ): Promise<void> => {
    // This would be implemented with actual use case when component uses it
    console.log('Prefetching catalog:', catalogId, providerId)
  },

  /**
   * Set query data optimistically
   */
  setOptimisticData: <TData>(
    queryClient: QueryClient,
    queryKey: any[],
    updater: (oldData: TData | undefined) => TData
  ): void => {
    queryClient.setQueryData(queryKey, updater)
  }
}

/**
 * Query status utilities
 */
export const queryStatusUtils = {
  /**
   * Check if any queries are loading
   */
  isAnyQueryLoading: (queryClient: QueryClient): boolean => {
    return queryClient.isFetching() > 0
  },

  /**
   * Get cache statistics
   */
  getCacheStats: (queryClient: QueryClient) => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      successQueries: queries.filter(q => q.state.status === 'success').length,
      staleQueries: queries.filter(q => q.isStale()).length
    }
  },

  /**
   * Log cache statistics
   */
  logCacheStats: (queryClient: QueryClient): void => {
    const stats = queryStatusUtils.getCacheStats(queryClient)
    console.log('Query Cache Statistics:', stats)
  }
}