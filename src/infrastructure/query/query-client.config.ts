/**
 * TanStack Query Configuration
 * 
 * Centralized configuration for TanStack Query with persistence,
 * error handling, and performance optimizations.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import { QueryClient } from '@tanstack/react-query'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

/**
 * Query configuration constants
 */
export const QUERY_CONFIG = {
  // Cache times
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  
  // Retry configuration
  RETRY_COUNT: 3,
  RETRY_DELAY: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  
  // Background refetch
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_ON_RECONNECT: true,
  
  // Query keys
  QUERY_KEYS: {
    MEDIA_DETAIL: 'media-detail',
    CATALOG_ITEMS: 'catalog-items',
    BASIC_CATALOG: 'basic-catalog'
  } as const
} as const

/**
 * Create configured QueryClient instance
 */
export const createQueryClient = (logger?: ILoggingService): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.STALE_TIME,
        gcTime: QUERY_CONFIG.CACHE_TIME, // Replaces cacheTime in v5
        retry: QUERY_CONFIG.RETRY_COUNT,
        retryDelay: QUERY_CONFIG.RETRY_DELAY,
        refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
        refetchOnReconnect: QUERY_CONFIG.REFETCH_ON_RECONNECT,
        
        // Error handling
        throwOnError: false,
        
        // Performance
        networkMode: 'online'
      },
      mutations: {
        retry: 1,
        networkMode: 'online'
      }
    },
    
    // Global error handling
    ...(logger && {
      logger: {
        log: (message: string) => logger.debug('TanStack Query', undefined, { message }),
        warn: (message: string) => logger.warn('TanStack Query warning', new Error(message)),
        error: (error: any) => logger.error('TanStack Query error', error instanceof Error ? error : new Error(String(error)))
      }
    })
  })
}

/**
 * Query key factories for consistent key generation
 */
export const queryKeys = {
  /**
   * Media detail query keys
   */
  mediaDetail: {
    all: [QUERY_CONFIG.QUERY_KEYS.MEDIA_DETAIL] as const,
    byId: (itemId: string) => [...queryKeys.mediaDetail.all, itemId] as const,
    byIdWithCapabilities: (itemId: string, capabilities: string[]) => 
      [...queryKeys.mediaDetail.byId(itemId), 'capabilities', capabilities.sort()] as const
  },
  
  /**
   * Catalog items query keys
   */
  catalogItems: {
    all: [QUERY_CONFIG.QUERY_KEYS.CATALOG_ITEMS] as const,
    basic: [QUERY_CONFIG.QUERY_KEYS.BASIC_CATALOG] as const,
    byType: (contentType: string) => [...queryKeys.catalogItems.basic, contentType] as const,
    byTypeAndCatalog: (contentType: string, catalogType: string) => 
      [...queryKeys.catalogItems.byType(contentType), catalogType] as const
  }
} as const

/**
 * Query client singleton instance
 * Use this for accessing the client outside of React components
 */
let queryClientInstance: QueryClient | null = null

export const getQueryClient = (): QueryClient => {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient()
  }
  return queryClientInstance
}

export const setQueryClient = (client: QueryClient): void => {
  queryClientInstance = client
}