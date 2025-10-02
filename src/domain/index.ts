/**
 * Domain Layer - VNYL App
 * 
 * This is the core business logic layer following CLEAN architecture principles.
 * The domain layer is independent of external frameworks and infrastructure.
 * It defines entities, use cases, and interfaces that represent the business rules.
 * 
 * Key Principles:
 * - No external dependencies (only native TypeScript/JavaScript)
 * - Business logic is expressed through use cases
 * - All external dependencies are abstracted through interfaces
 * - Repository and service interfaces follow dependency inversion principle
 * 
 * Structure:
 * - entities/: Core business entities (Media, Person, Stream, User, Playlist)
 * - repositories/: Interface definitions for data access
 * - services/: Interface definitions for external services
 * - usecases/: Business logic implementations
 */

// Core domain exports
export * from './entities'
export * from './repositories'
export * from './services'
export * from './usecases'