import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const createQueryClient = (): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) {
              return false
            }
          }
          return failureCount < 3
        }
      },
      mutations: {
        retry: false
      }
    }
  })

  return queryClient
}

export const setupQueryPersistence = async (queryClient: QueryClient): Promise<void> => {
  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'vnyl_query_cache'
  })

  try {
    await persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      buster: '1.0.0' // Change this to clear cache on app updates
    })
  } catch (error) {
    // Log error but don't prevent app from starting
    console.warn('Failed to restore query cache:', error)
  }
}