/**
 * Query Provider Component
 * 
 * Provides TanStack Query client with error handling and proper configuration
 * following atomic component patterns and CLEAN architecture principles.
 */

import React, { useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/src/presentation/shared/queries'
import { useServiceAvailable, useLogging } from '@/src/infrastructure/di/hooks'
import { TOKENS } from '@/src/infrastructure/di/tokens'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * Safe logging hook that handles DI container readiness
 */
const useSafeLogging = () => {
  const isLoggingAvailable = useServiceAvailable(TOKENS.LOGGING_SERVICE)
  
  // Always call useLogging (hooks must be called unconditionally)
  // but wrap in try-catch to handle when service isn't ready
  try {
    const logger = useLogging()
    return isLoggingAvailable ? logger : null
  } catch {
    // Service not available yet, return null
    return null
  }
}

/**
 * TanStack Query provider with robust error handling
 * Uses safe logging that handles DI container readiness
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Use safe logging hook that handles DI container readiness
  const logger = useSafeLogging()
  
  // Create query client (memoized to prevent recreation)
  const queryClient = useMemo(() => {
    // Provide fallback logger when DI container isn't ready
    const effectiveLogger = logger || {
      error: () => {},
      info: () => {},
      debug: () => {},
      warn: () => {}
    }
    
    const client = createQueryClient(effectiveLogger)
    
    // Log initialization if real logger is available
    if (logger) {
      logger.debug('QueryClient initialized', undefined, {
        context: 'QueryProvider',
        defaultStaleTime: client.getDefaultOptions().queries?.staleTime,
        defaultGcTime: client.getDefaultOptions().queries?.gcTime
      })
    }
    
    return client
  }, [logger])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

