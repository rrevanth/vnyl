/**
 * Home Feature Module
 * Main entry point for all home-related functionality
 */

// Store exports
export {
  homeStore,
  homeActions,
  homeComputed,
} from './stores'

export type {
  HomeStore,
  HomeState,
  HomeActions,
  HomeComputed,
  CatalogSection,
  HeroContent,
} from './stores'

// Screen exports
export * from './screens'