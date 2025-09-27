# Provider Source Registry Implementation Plan

## Overview

This implementation plan details the comprehensive provider source registry system for VNYL, designed to support multiple streaming and metadata providers (TMDB, Trakt, Fanart, MDBList, Stremio) with capability-based registration and discovery.

## Architecture Principles

- **CLEAN Architecture**: Domain → Infrastructure → Presentation layers
- **Capability-Based Discovery**: Providers register specific capabilities they support
- **Provider Agnostic**: Core entities remain independent of provider specifics
- **Extensible Design**: Easy addition of new provider sources
- **Type Safety**: Full TypeScript support throughout

## Core Concepts

### Provider Source
A provider source is a collection of one or more providers that share common authentication, configuration, and API endpoints. Examples:
- **TMDB Source**: Provides catalog, metadata, images, ratings providers
- **Stremio Source**: Provides addon catalog, streams, subtitles providers
- **Trakt Source**: Provides watchlist, activity, recommendations providers

### Provider Capabilities
Each provider implements one or more capabilities:
- `catalog` - Browse content collections
- `metadata` - Detailed media information
- `images` - Posters, backdrops, profile images
- `ratings` - User ratings and scores
- `reviews` - User reviews and comments
- `recommendations` - Suggested content
- `people` - Cast and crew information
- `streams` - Streaming links and sources
- `subtitles` - Subtitle tracks
- `watchlist` - User watchlist management
- `activity` - Watch progress and scrobbling
- `addon_catalog` - Stremio-specific addon discovery

### Entity Hierarchy

```
ContentRow (Provider-aware catalog section)
├── metadata: Provider info, title, catalog source
├── items: ContentItem[]
└── provider: ProviderInfo

ContentItem (Lightweight list item)
├── core: Basic media info (title, poster, etc.)
├── externalIds: Cross-provider ID mapping
├── provider: ProviderInfo
└── sourceContentRow?: Reference to originating ContentRow

MediaItem (Detailed media information)
├── core: Comprehensive media details
├── aggregated: Data merged from multiple providers
├── providers: ProviderInfo[] (all contributing providers)
├── sourceContentRow?: Reference to originating ContentRow
└── providerData: Raw provider responses (for debugging)
```

## Implementation Phases

### Phase 1: Core Domain Layer
1. [Entity Definitions](./01-entities.md) - ContentItem, ContentRow, MediaItem with provider tracking
2. [Provider Interfaces](./02-provider-interfaces.md) - Base interfaces and capability definitions
3. [Capability Interfaces](./03-capability-interfaces.md) - Specific capability contracts

### Phase 2: Infrastructure Layer
4. [Provider Registry](./04-provider-registry.md) - Core registry implementation
5. [Provider Sources](./05-provider-sources.md) - Source implementations (TMDB, Stremio, etc.)
6. [Data Transformers](./06-transformers.md) - Provider data to domain entity conversion

### Phase 3: Use Cases & Integration
7. [Use Cases](./07-use-cases.md) - Provider-aware business logic
8. [Dependency Injection](./08-dependency-injection.md) - DI container updates
9. [Configuration](./09-configuration.md) - Provider settings and priorities

### Phase 4: Testing & Cleanup
10. [Testing Strategy](./10-testing.md) - Comprehensive test coverage
11. [Migration Plan](./11-migration.md) - Cleanup unused code and migration path

## File Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── content/
│   │   │   ├── content-item.entity.ts
│   │   │   ├── content-row.entity.ts
│   │   │   └── media-item.entity.ts
│   │   └── providers/
│   │       ├── provider-info.entity.ts
│   │       └── provider-manifest.entity.ts
│   ├── providers/
│   │   ├── base/
│   │   │   ├── provider.interface.ts
│   │   │   ├── provider-source.interface.ts
│   │   │   └── provider-registry.interface.ts
│   │   ├── capabilities/
│   │   │   ├── catalog.interface.ts
│   │   │   ├── metadata.interface.ts
│   │   │   ├── images.interface.ts
│   │   │   ├── ratings.interface.ts
│   │   │   ├── streams.interface.ts
│   │   │   └── [other capabilities]
│   │   └── types/
│   │       ├── capabilities.types.ts
│   │       ├── provider.types.ts
│   │       └── requests.types.ts
│   └── usecases/
│       ├── providers/
│       └── content/
├── infrastructure/
│   ├── providers/
│   │   ├── registry/
│   │   │   ├── provider-registry.ts
│   │   │   ├── provider-source-registry.ts
│   │   │   └── provider-factory.ts
│   │   ├── base/
│   │   │   ├── base-provider.ts
│   │   │   ├── base-provider-source.ts
│   │   │   └── provider-manifest.ts
│   │   ├── sources/
│   │   │   ├── tmdb/
│   │   │   ├── stremio/
│   │   │   ├── trakt/
│   │   │   ├── fanart/
│   │   │   └── mdblist/
│   │   └── transformers/
│   │       ├── content-item.transformer.ts
│   │       ├── content-row.transformer.ts
│   │       └── media-item.transformer.ts
│   └── di/
│       ├── providers.tokens.ts
│       └── providers.registration.ts
```

## Key Features

### Provider Traceability
Every entity maintains information about its data sources:
- **ContentRow**: Knows which provider and catalog it came from
- **ContentItem**: References its source ContentRow and provider
- **MediaItem**: Tracks all contributing providers and source ContentRow

### Cross-Provider Data Aggregation
- External ID mapping enables data merging across providers
- Priority-based provider selection for conflicting data
- Comprehensive audit trail of data sources

### Capability-Based Discovery
- Query providers by specific capabilities needed
- Runtime capability detection and validation
- Graceful degradation when providers are unavailable

### Configuration Management
- Per-provider settings and API keys
- User-defined provider priorities
- Rate limiting and caching configuration

## Implementation Timeline

- **Week 1**: Core domain entities and interfaces
- **Week 2**: Provider registry and base implementations
- **Week 3**: TMDB and Stremio provider sources
- **Week 4**: Use case integration and testing
- **Week 5**: Additional providers and optimization

## Success Criteria

1. **Extensibility**: New providers can be added without core changes
2. **Performance**: Sub-200ms response times for cached requests
3. **Reliability**: Graceful handling of provider failures
4. **Maintainability**: Clear separation of concerns and testable code
5. **User Experience**: Seamless data aggregation from multiple sources

## Next Steps

1. Review and approve detailed entity specifications
2. Implement core domain layer (Phase 1)
3. Set up provider registry infrastructure (Phase 2)
4. Begin TMDB provider source implementation
5. Iterate and refine based on initial testing

See individual implementation files for detailed specifications and code examples.