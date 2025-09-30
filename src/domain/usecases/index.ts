/**
 * Domain Use Cases Index
 * 
 * Export point for all use cases including user management and catalog operations.
 */

// =============================================================================
// User Management Use Cases
// =============================================================================

export { GetOrCreateUserUseCase } from '@/src/domain/usecases/get-or-create-user.usecase'
export { ResetUserPreferencesUseCase } from '@/src/domain/usecases/reset-user-preferences.usecase'
export { UpdateUserLocaleUseCase } from '@/src/domain/usecases/update-user-locale.usecase'
export { UpdateUserPreferencesUseCase } from '@/src/domain/usecases/update-user-preferences.usecase'
export { UpdateUserThemeUseCase } from '@/src/domain/usecases/update-user-theme.usecase'

// =============================================================================
// Catalog Management Use Cases
// =============================================================================

export { GetAllCatalogsUseCase } from '@/src/domain/usecases/get-all-catalogs.usecase'
export type { GetAllCatalogsResult, ProviderError } from '@/src/domain/usecases/get-all-catalogs.usecase'

export { LoadMoreCatalogItemsUseCase } from '@/src/domain/usecases/load-more-catalog-items.usecase'
export type { 
  LoadMoreCatalogItemsRequest, 
  LoadMoreCatalogItemsResult, 
  LoadMetrics 
} from '@/src/domain/usecases/load-more-catalog-items.usecase'

export { LoadMoreRecommendationsUseCase } from '@/src/domain/usecases/load-more-recommendations.usecase'
export type {
  LoadMoreRecommendationsRequest,
  LoadMoreRecommendationsResult
} from '@/src/domain/usecases/load-more-recommendations.usecase'

export { LoadMorePeopleUseCase } from '@/src/domain/usecases/load-more-people.usecase'
export type {
  LoadMorePeopleRequest,
  LoadMorePeopleResult
} from '@/src/domain/usecases/load-more-people.usecase'

// =============================================================================
// Media Detail Workflow Use Cases
// =============================================================================

export { ResolveExternalIdsUseCase } from '@/src/domain/usecases/media/resolve-external-ids.use-case'
export type {
  ResolveExternalIdsRequest,
  ResolveExternalIdsResult,
  ExternalIdsResolutionMetrics,
  ExternalIdsProviderError
} from '@/src/domain/usecases/media/resolve-external-ids.use-case'

export { EnrichCatalogItemUseCase } from '@/src/domain/usecases/enrichment/enrich-catalog-item.use-case'
export type {
  EnrichCatalogItemRequest,
  EnrichCatalogItemResult,
  EnrichmentMetrics,
  EnrichmentProviderError
} from '@/src/domain/usecases/enrichment/enrich-catalog-item.use-case'

export { LoadSeasonEpisodesUseCase } from '@/src/domain/usecases/media/load-season-episodes.usecase'
export type {
  LoadSeasonEpisodesRequest,
  LoadSeasonEpisodesResponse,
  LoadSeasonEpisodesMetrics,
  LoadSeasonEpisodesProviderError
} from '@/src/domain/usecases/media/load-season-episodes.usecase'