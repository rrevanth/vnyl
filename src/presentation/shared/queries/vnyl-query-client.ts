/**
 * Simple TanStack Query Utilities for VNYL App
 * 
 * Basic query utilities and types for TanStack Query integration.
 * Uses console logging since hooks can't be used in factory functions.
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Create a query client with sensible defaults for the VNYL app
 */
export const createVnylQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false, // Better for mobile
        refetchOnReconnect: true,
        networkMode: 'online'
      },
      mutations: {
        retry: 2,
        networkMode: 'online'
      }
    }
  })
}

/**
 * Query key factories for consistent cache management
 */
export const vnylQueryKeys = {
  // Catalog queries
  catalogs: {
    all: ['catalogs'] as const,
    list: (filters: string) => ['catalogs', 'list', { filters }] as const,
    detail: (id: string) => ['catalogs', 'detail', id] as const,
    pagination: (id: string, providerId: string) => ['catalog-pagination', id, providerId] as const
  },
  // Search queries  
  search: {
    all: ['search'] as const,
    unified: (query: string) => ['search', 'unified', query] as const
  },
  // Media queries
  media: {
    all: ['media'] as const,
    detail: (id: string) => ['media', 'detail', id] as const
  }
} as const