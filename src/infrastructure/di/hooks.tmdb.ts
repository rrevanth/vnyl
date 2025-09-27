/**
 * TMDB Service Hooks
 * 
 * React hooks for accessing TMDB services from the DI container
 */

import { useDI } from './hooks'
import { TOKENS } from './tokens'
import type { ITMDBService } from '../api/tmdb/tmdb.service'

/**
 * Hook to access TMDB service
 */
export const useTMDBService = (): ITMDBService => {
  return useDI<ITMDBService>(TOKENS.TMDB_SERVICE)
}

/**
 * Hook to access TMDB API client specifically
 */
export const useTMDBClient = () => {
  const tmdbService = useTMDBService()
  return tmdbService.client
}

/**
 * Hook to access TMDB configuration service specifically
 */
export const useTMDBConfig = () => {
  const tmdbService = useTMDBService()
  return tmdbService.config
}