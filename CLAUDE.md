- always use bun as the package manager

# Hooks

## UserPromptSubmit Hook

Before working on any code changes, ensure the following commands run successfully:

1. Run `bun typecheck` for both @src/ and @app/ directories and fix any errors
2. Run `bun lint --fix` for both @src/ and @app/ directories and fix any remaining errors
3. Ensure `bun run ios` runs without any errors

These checks help maintain code quality and ensure the app builds correctly.

## Project Patterns Hook

When implementing new features or services, always follow these established patterns:

### Environment Configuration
- All environment variables must be prefixed with `EXPO_PUBLIC_` to be available in the client
- Use the centralized `src/config/env.ts` for all environment variable access
- Never hardcode API keys or sensitive data directly in components
- Use the `env` object and `apiEndpoints` helper for API configurations

### File Structure
- All source code must be placed under `src/` directory
- App routing and layouts go in `src/app/`
- Shared configuration in `src/config/`
- Services and API clients in `src/services/`
- Utility functions in `src/utils/`
- Type definitions in `src/types/`

### API Integration
- Use the predefined `apiEndpoints` from `src/config/env.ts` for consistent API URLs
- Create service classes in `src/services/` for each external API (TMDB, Trakt, MDBList, Fanart)
- Implement proper error handling and type safety for all API calls
- Use React Query or similar for data fetching and caching

### Code Quality
- All components must be TypeScript with proper type definitions
- Use ESLint and Prettier configurations for consistent code style
- Implement proper error boundaries and loading states
- Follow React Native and Expo best practices for performance

### Streaming App Architecture
- Implement service layer abstraction for metadata providers (TMDB, Trakt, MDBList)
- Use Fanart.tv for enhanced artwork and visual assets
- Implement proper user authentication with Trakt OAuth
- Design for offline-first capability where possible