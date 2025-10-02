/**
 * VNYL App - Main Application Exports
 * 
 * This file serves as the main entry point for the VNYL app, providing
 * access to all application layers following CLEAN architecture principles.
 * 
 * Architecture Layers:
 * - Domain: Business logic and entities
 * - Data: Repository implementations and data sources
 * - Infrastructure: External services and framework implementations
 * - Presentation: UI components, screens, and state management
 */

// Export individual layers to avoid conflicts
// Use selective imports to avoid duplicate exports

// Domain entities (core business models)
export type { MediaEntity } from './domain/entities/media'
export type { PersonEntity } from './domain/entities/person'
export type { StreamEntity } from './domain/entities/stream'
export type { UserEntity } from './domain/entities/user'
export type { PlaylistEntity } from './domain/entities/playlist'

// Presentation layer (stores, screens, components)
export * from './presentation'