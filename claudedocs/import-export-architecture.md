# VNYL App - Import/Export Architecture Documentation

## Overview

This document describes the complete import/export architecture for the VNYL app, following CLEAN architecture principles with comprehensive barrel exports and @ import patterns.

## TypeScript Path Mapping Configuration

Located in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./src/app/*"],
      "@/config/*": ["./src/config/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/data/*": ["./src/data/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/presentation/*": ["./src/presentation/*"]
    }
  }
}
```

## Barrel Export Structure

### Main Application Entry Point

**`src/index.ts`** - Root application export:
- Exports all CLEAN architecture layers
- Provides application lifecycle utilities
- Includes version and configuration information

### Domain Layer (`src/domain/`)

**`src/domain/index.ts`** - Core business logic exports:
- `entities/` - Business entities (Media, Person, Stream, User, Playlist)
- `repositories/` - Repository interface definitions
- `services/` - Service interface definitions  
- `usecases/` - Business logic implementations

Hierarchy:
```
domain/
├── index.ts (main export)
├── entities/
│   ├── index.ts
│   ├── media/index.ts
│   ├── person/index.ts
│   ├── stream/index.ts
│   ├── user/index.ts
│   └── playlist/index.ts
├── repositories/index.ts
├── services/index.ts
└── usecases/
    ├── index.ts
    ├── media/index.ts
    ├── person/index.ts
    ├── stream/index.ts
    ├── user/index.ts
    └── playlist/index.ts
```

### Data Layer (`src/data/`)

**`src/data/index.ts`** - Data access layer exports:
- `datasources/` - Local and remote data sources
- `repositories/` - Repository implementations
- `mappers/` - Data transformation utilities

Hierarchy:
```
data/
├── index.ts (main export)
├── datasources/
│   ├── index.ts
│   ├── local/index.ts
│   └── remote/index.ts
├── repositories/
│   ├── index.ts
│   └── implementations/index.ts
└── mappers/index.ts
```

### Infrastructure Layer (`src/infrastructure/`)

**`src/infrastructure/index.ts`** - External services layer exports:
- `api/` - API clients and services
- `storage/` - Storage implementations
- `logging/` - Logging services
- `i18n/` - Internationalization services
- `theme/` - Theme and styling services
- `di/` - Dependency injection container

Hierarchy:
```
infrastructure/
├── index.ts (main export)
├── api/
│   ├── index.ts
│   ├── clients/index.ts
│   └── axios/index.ts
├── storage/index.ts
├── logging/index.ts
├── i18n/index.ts
├── theme/
│   ├── index.ts
│   ├── hooks/index.ts
│   ├── utils/index.ts
│   └── unistyles/index.ts
└── di/index.ts
```

### Presentation Layer (`src/presentation/`)

**`src/presentation/index.ts`** - UI layer exports:
- `features/` - Feature-specific components and logic
- `shared/` - Reusable UI components and utilities

Hierarchy:
```
presentation/
├── index.ts (main export)
├── features/
│   ├── index.ts
│   ├── home/
│   │   ├── index.ts
│   │   ├── stores/index.ts
│   │   ├── hooks/index.ts
│   │   └── screens/index.ts
│   ├── media-detail/
│   │   ├── index.ts
│   │   └── stores/index.ts
│   ├── library/
│   │   ├── index.ts
│   │   └── stores/index.ts
│   └── search/
│       ├── index.ts
│       └── stores/index.ts
└── shared/
    ├── index.ts
    ├── components/
    │   ├── index.ts
    │   └── atoms/index.ts
    ├── stores/index.ts
    ├── hooks/index.ts
    └── i18n/
        ├── index.ts
        ├── hooks/index.ts
        ├── locales/
        │   ├── index.ts
        │   ├── en/index.ts
        │   ├── es/index.ts
        │   ├── fr/index.ts
        │   ├── de/index.ts
        │   └── ja/index.ts
        └── utils/index.ts
```

## Import Pattern Standards

### ✅ Required: @ Import Patterns

All internal imports MUST use @ aliases:

```typescript
// ✅ CORRECT - @ imports for all internal modules
import { useTheme } from '@/src/presentation/shared/theme'
import { container } from '@/src/infrastructure/di/container'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { HomeStore } from '@/src/presentation/features/home/stores'

// ❌ FORBIDDEN - Relative imports
import { useTheme } from '../../../shared/theme'
import { container } from '../../infrastructure/di/container'
```

### Import Organization Standards

```typescript
// 1. External dependencies
import React from 'react'
import { View, Text } from 'react-native'
import { observer } from '@legendapp/state/react'

// 2. Internal imports with @ patterns (grouped by layer)
// Domain layer
import { MediaEntity } from '@/src/domain/entities/media'
import { GetMediaDetailsUseCase } from '@/src/domain/usecases/media'

// Infrastructure layer
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { useDI } from '@/src/infrastructure/di/hooks'

// Presentation layer
import { useHomeStore } from '@/src/presentation/features/home/hooks'
import { Button } from '@/src/presentation/shared/components/atoms'

// 3. Type-only imports (when applicable)
import type { HomeState, CatalogSection } from '@/src/presentation/features/home/stores'
```

## Export Patterns

### Barrel Export Pattern

Each directory with TypeScript files includes an `index.ts` that exports all public interfaces:

```typescript
// Feature barrel export example (home/index.ts)
export * from './stores'
export * from './hooks'
export * from './screens'

// Re-export commonly used items for convenience
export {
  homeStore,
  homeActions,
  homeComputed,
  useHomeStore,
  HomeScreen,
  type HomeState,
  type CatalogSection,
} from './stores'
```

### Hierarchical Export Pattern

Exports flow from leaf → root, maintaining clear dependency boundaries:

```
Leaf modules → Feature index → Layer index → Main index
     ↑              ↑             ↑           ↑
HomeStore.ts → home/index.ts → features/index.ts → presentation/index.ts → src/index.ts
```

## Dependency Flow Validation

### CLEAN Architecture Compliance

- ✅ Domain layer has no external dependencies
- ✅ Data layer depends only on Domain
- ✅ Infrastructure layer depends only on Domain
- ✅ Presentation layer can depend on all layers

### Import Resolution Testing

TypeScript path mapping is working correctly. The `@/*` patterns resolve to the correct module paths as configured in `tsconfig.json`.

## Migration Completed

### Converted Relative Imports

The following files were updated from relative imports to @ imports:

1. **Infrastructure Layer:**
   - `src/infrastructure/di/container.ts`
   - `src/infrastructure/theme/hooks/useResponsive.ts`
   - `src/infrastructure/theme/hooks/useAppTheme.ts`
   - `src/infrastructure/api/clients/stremio-api.client.ts`
   - `src/infrastructure/api/clients/tmdb-api.client.ts`

2. **Presentation Layer:**
   - `src/presentation/features/home/hooks/useHomeStore.ts`
   - `src/presentation/features/home/screens/HomeScreen.tsx`
   - `src/presentation/shared/i18n/utils/translation-keys.ts`
   - `src/presentation/shared/i18n/hooks/useLocale.ts`
   - `src/presentation/shared/i18n/hooks/index.ts`
   - `src/presentation/shared/i18n/hooks/useTranslation.ts`

### Created Barrel Exports

Added comprehensive `index.ts` files throughout the codebase:

1. **Root Level:**
   - `src/index.ts` - Main application export

2. **Feature Level:**
   - `src/presentation/features/home/index.ts`
   - `src/presentation/features/home/stores/index.ts`
   - `src/presentation/features/home/hooks/index.ts`
   - `src/presentation/features/home/screens/index.ts`
   - `src/presentation/features/media-detail/index.ts`
   - `src/presentation/features/media-detail/stores/index.ts`
   - `src/presentation/features/library/index.ts`
   - `src/presentation/features/library/stores/index.ts`
   - `src/presentation/features/search/index.ts`
   - `src/presentation/features/search/stores/index.ts`

3. **Shared Components:**
   - `src/presentation/shared/components/index.ts`

## Benefits Achieved

### 1. **Maintainability**
- Clear module boundaries and dependencies
- Easy refactoring with reliable import paths
- Consistent import patterns across the codebase

### 2. **Developer Experience**
- Predictable import paths using @ aliases
- Auto-completion support for all modules
- Clear separation of concerns

### 3. **Architecture Compliance**
- Enforced CLEAN architecture dependency rules
- Clear layer boundaries through import patterns
- Type-safe cross-layer communication

### 4. **Scalability**
- Hierarchical export structure supports growth
- Feature-based organization for maintainability
- Clear public API surface for each module

## Usage Examples

### Accessing Domain Services
```typescript
import { resolve } from '@/src/infrastructure/di/container'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import type { IMediaRepository } from '@/src/domain/repositories'

const mediaRepository = resolve<IMediaRepository>(TOKENS.MediaRepository)
```

### Using Feature Components
```typescript
import { HomeScreen, useHomeStore } from '@/src/presentation/features/home'
import { Button, Card } from '@/src/presentation/shared/components/atoms'

// All feature functionality available through single import
```

### Cross-Layer Integration
```typescript
// Presentation → Domain → Infrastructure flow
import { useMediaDetails } from '@/src/presentation/features/media-detail/hooks'
import { GetMediaDetailsUseCase } from '@/src/domain/usecases/media'
import { TMDBApiClient } from '@/src/infrastructure/api/clients'
```

This architecture provides a solid foundation for the VNYL app's continued development with clear, maintainable, and scalable import/export patterns.