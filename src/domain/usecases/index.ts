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