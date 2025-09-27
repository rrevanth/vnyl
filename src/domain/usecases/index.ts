/**
 * Domain Use Cases Index
 * 
 * Simplified export point for user management use cases only.
 * Provider functionality is handled directly through provider registry.
 */

// =============================================================================
// User Management Use Cases (Existing)
// =============================================================================

export { GetOrCreateUserUseCase } from '@/src/domain/usecases/get-or-create-user.usecase'
export { ResetUserPreferencesUseCase } from '@/src/domain/usecases/reset-user-preferences.usecase'
export { UpdateUserLocaleUseCase } from '@/src/domain/usecases/update-user-locale.usecase'
export { UpdateUserPreferencesUseCase } from '@/src/domain/usecases/update-user-preferences.usecase'
export { UpdateUserThemeUseCase } from '@/src/domain/usecases/update-user-theme.usecase'

// Re-export types for existing user use cases
// Note: These types are defined elsewhere in the entities