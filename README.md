# VNYL - Media Discovery & Management Platform

> A modern React Native application built with Expo for discovering, managing, and enjoying media content through multiple provider integrations.

## 🎯 Project Overview

VNYL is a comprehensive media platform that aggregates content from multiple providers like TMDB, Trakt, and others, offering users a unified interface for discovering, tracking, and managing their media consumption. Built with modern React Native and Expo technologies, it follows clean architecture principles for maintainability and extensibility.

### Key Features
- 🎬 **Multi-Provider Integration**: Seamless integration with TMDB, Trakt, and other media providers
- 🔍 **Advanced Search**: Cross-provider search with intelligent filtering and sorting
- 📱 **Native Experience**: Built with React Native for optimal iOS and Android performance
- 🎨 **Adaptive Theming**: Dynamic light/dark mode with customizable accent colors
- 🌐 **Internationalization**: Multi-language support with localized content
- ⚡ **Offline Support**: TanStack Query with persistent caching for offline access
- 🔐 **Secure Authentication**: Bearer token authentication with credential management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Bun package manager (required)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vnyl

# Install dependencies with Bun (required)
bun install

# Start development server
bun run start

# Run on specific platforms
bun run ios      # iOS simulator
bun run android  # Android emulator
bun run web      # Web browser
```

### Development Commands

```bash
# Code Quality (REQUIRED before commits)
bun run typecheck && bun run lint    # Must pass for all commits
bun run lint:fix                     # Auto-fix linting issues
bun run format                       # Format code with Prettier

# Platform-specific builds
bun run ios                         # iOS development build
bun run android                     # Android development build
```

## 🏗️ Architecture Principles

### CLEAN Architecture (Enforced)

```
src/
├── domain/           # Business logic, entities, use cases, interfaces
├── infrastructure/   # External services, APIs, storage, DI container
├── data/            # Repository implementations, data access
└── presentation/    # React Native UI, features, shared components
```

#### Core Principles
- **Dependencies flow inward**: Infrastructure → Domain
- **Business logic isolation**: All business rules in domain use cases
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Interface Segregation**: Clean interfaces for each capability
- **Single Responsibility**: Each component has one reason to change

### Agent-Driven Development Workflow

This project follows an **agent-orchestrated development pattern** using MCP (Model Context Protocol) servers for enhanced productivity:

#### MCP Server Integration
- **Sequential Thinking**: Multi-step reasoning for complex analysis and architectural decisions
- **Context7**: Official React Native/Expo documentation lookup and framework pattern guidance
- **Magic**: Modern UI component generation adapted to native React Native patterns
- **Apple Fetch**: Internal Apple knowledge base access for iOS-specific optimizations

#### Development Workflow Pattern
```typescript
// Agent-orchestrated task execution
const agentWorkflow = async () => {
  // 1. Analysis: Sequential MCP for architecture/requirements
  await sequential.analyze(requirements)
  
  // 2. Planning: TodoWrite for >3-step operations
  await todoWrite.plan(taskList)
  
  // 3. Parallel execution: Batch operations for efficiency
  await Promise.allSettled([
    read(file1), read(file2), read(file3)
  ])
  
  // 4. Implementation: MultiEdit for related changes
  await multiEdit({ file_path, edits })
  
  // 5. Validation: Required quality gates
  await validate() // bun typecheck && bun lint
}
```

## 🔧 Technology Stack

### Core Technologies
- **Expo 54**: Latest Expo SDK with native tabs, link preview, peek & pop
- **React Native 0.81.4**: Cross-platform mobile development
- **TypeScript 5.9**: Strict mode for type safety and code quality
- **Bun**: Fast package manager and task runner

### State Management & Data
- **Legend State**: High-performance observable state management
- **TanStack Query v5**: Data fetching, caching, and synchronization
- **AsyncStorage**: Persistent local storage for user preferences

### UI & Theming
- **Native Components Only**: View, Text, Pressable, StyleSheet.create()
- **Theme Factory Pattern**: Centralized theming with light/dark mode
- **Size Matters**: Responsive scaling across device sizes
- **Expo Fonts**: Google Fonts integration (Inter, Poppins, Roboto, Open Sans)

### Networking & APIs
- **Axios**: HTTP client with Bearer token authentication
- **Axios Retry**: Automatic retry logic for failed requests
- **Provider Registry**: Dynamic provider management and capability resolution

### Development Tools
- **ESLint**: Code linting with Expo configuration
- **Prettier**: Code formatting
- **TypeScript**: Static type checking in strict mode

## 🌐 Provider Registry System

### Overview
The Provider Registry is the core system that manages external service integrations (TMDB, Trakt, etc.) with dynamic capability resolution and health monitoring.

### Architecture
```typescript
// Provider capabilities are dynamically resolved
enum ProviderCapability {
  METADATA = 'metadata',
  CATALOG = 'catalog', 
  SEARCH = 'search',
  STREAM = 'stream',
  RECOMMENDATION = 'recommendation',
  COLLECTION = 'collection',
  WATCHLIST = 'watchlist',
  PROGRESS = 'progress',
  RATING = 'rating',
  IMAGE = 'image',
  VIDEO = 'video',
  SUBTITLE = 'subtitle'
}

// Registration pattern
providerRegistry.registerProviderWithCapabilities('tmdb', {
  [ProviderCapability.METADATA]: TMDBMetadataProvider,
  [ProviderCapability.CATALOG]: TMDBCatalogProvider,
  [ProviderCapability.SEARCH]: TMDBSearchProvider,
  // ... additional capabilities
}, config)
```

### Key Features
- **Dynamic Capability Resolution**: Providers register capabilities they support
- **Health Monitoring**: Automatic health checks with retry logic
- **Load Balancing**: Priority-based provider selection
- **Error Resilience**: Automatic failover and error recovery
- **Configuration Management**: Per-provider settings and authentication

### Provider Integration Pattern
```typescript
// 1. Provider implements capability interface
class TMDBMetadataProvider implements IMetadataProvider {
  async getMetadata(context: EnhancedMediaContext): Promise<MediaMetadata> {
    // Implementation using TMDB API
  }
}

// 2. Register with capability
container.registerProvider('tmdb', ProviderCapability.METADATA, TMDBMetadataProvider)

// 3. Resolve dynamically
const metadataProvider = await registry.resolveCapability(ProviderCapability.METADATA)
```

## 📱 Development Standards

### Required Patterns

#### Import Pattern (ENFORCED)
```typescript
// ✅ REQUIRED - @ imports for all internal modules
import { useTheme } from '@/src/presentation/shared/theme'
import { container } from '@/src/infrastructure/di/container'

// ❌ FORBIDDEN - Relative imports
import { useTheme } from '../../../shared/theme'
```

#### Component Pattern (ENFORCED)
```typescript
// ✅ REQUIRED - Native RN components with theme
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/src/presentation/shared/theme'

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  const theme = useTheme()
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.colors.interactive.primary,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
    }
  })

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text>{title}</Text>
    </Pressable>
  )
}
```

#### Authentication Pattern (ENFORCED)
```typescript
// ✅ REQUIRED - Bearer token authentication
const apiClient = axios.create({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
```

### Validation Gates (CRITICAL)
```bash
# ✅ MUST PASS before any commit or task completion
bun run typecheck && bun run lint

# These commands must return 0 exit codes:
# - No TypeScript errors in strict mode
# - No ESLint errors or warnings
# - All imports use @ patterns
# - All components use native RN primitives
```

### Quality Standards

#### Code Organization
- **Feature-based structure**: Organize by domain, not file type
- **Atomic Design**: Component hierarchy following atomic design principles
- **Single Responsibility**: Each file has one clear purpose
- **Descriptive Naming**: Clear, self-documenting names for files and functions

#### Performance Requirements
- **Lazy Loading**: Dynamic imports for non-critical components
- **Image Optimization**: Expo Image with proper caching
- **List Virtualization**: Legend List for large datasets
- **Bundle Optimization**: Tree shaking and code splitting

#### Accessibility Standards
- **Screen Reader Support**: Proper accessibility labels and roles
- **Touch Targets**: Minimum 44pt touch target sizes
- **Color Contrast**: WCAG AA compliance for text and UI elements
- **Keyboard Navigation**: Full keyboard accessibility support

## 🎨 Theming System

### Theme Factory Pattern
```typescript
// Centralized theme management
export const createTheme = (mode: 'light' | 'dark'): Theme => {
  return {
    colors: {
      background: { primary: mode === 'dark' ? '#000000' : '#FFFFFF' },
      text: { primary: mode === 'dark' ? '#FFFFFF' : '#000000' },
      interactive: { primary: '#007AFF' }
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: {
      heading1: { fontSize: 28, fontWeight: '700' },
      body: { fontSize: 16, fontWeight: '400' }
    }
  }
}
```

### Component Styling
```typescript
// StyleSheet.create() with theme integration
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.body.fontSize
  }
})
```

## 🌍 Internationalization

### Translation System
```typescript
// i18n pattern with snake_case keys
const { t } = useTranslation()

// ✅ CORRECT - Snake case for all translation keys
title={t('settings.theme.dark_mode')}
description={t('settings.display.font_size')}

// Translation file structure
const translations = {
  settings: {
    theme: {
      dark_mode: 'Dark Mode',
      accent_color: 'Accent Color'
    }
  }
}
```

## 🔒 Security & Authentication

### Bearer Token Management
```typescript
// Secure credential storage
const secureStorage = {
  async setItem(key: string, value: string) {
    // Use Expo SecureStore for sensitive data
    await SecureStore.setItemAsync(key, value)
  },
  
  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key)
  }
}

// API client with authentication
const createAPIClient = (bearerToken: string) => {
  return axios.create({
    headers: { 'Authorization': `Bearer ${bearerToken}` }
  })
}
```

### Validation & Error Handling
```typescript
// Comprehensive error handling
try {
  const result = await apiCall()
  return result
} catch (error) {
  const errorInstance = error instanceof Error ? error : new Error(String(error))
  logger.error('API call failed', errorInstance, { context: 'user-action' })
  throw new Error(`Operation failed: ${errorInstance.message}`)
}
```

## 🧪 Testing Strategy

### Testing Patterns
```typescript
// Component testing with React Native Testing Library
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '../Button'

test('Button handles press events', () => {
  const onPressMock = jest.fn()
  const { getByRole } = render(<Button title="Test" onPress={onPressMock} />)
  
  fireEvent.press(getByRole('button'))
  expect(onPressMock).toHaveBeenCalled()
})
```

### End-to-End Testing
- **Expo Development Builds**: Testing on real devices
- **iOS Simulator**: Primary testing environment
- **Android Emulator**: Cross-platform validation
- **Manual Testing**: User flow validation before releases

## 📖 Contributing Guidelines

### Development Workflow

1. **Pre-Development**:
   ```bash
   git status && git branch        # Verify clean state
   bun run typecheck && bun run lint  # Ensure quality gates pass
   ```

2. **Feature Development**:
   ```bash
   git checkout -b feature/your-feature-name
   # Implement feature following architecture patterns
   bun run typecheck && bun run lint  # Validate before commit
   ```

3. **Commit Standards**:
   ```bash
   # Descriptive commit messages
   git commit -m "feat: implement provider capability configuration system
   
   - Add capability configuration objects to TMDBSettings
   - Create GetProviderCapabilitiesUseCase for dynamic resolution
   - Implement stack navigation for TMDB settings sections
   
   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

### Code Review Checklist

- [ ] **Architecture Compliance**: Follows CLEAN architecture principles
- [ ] **Import Patterns**: Uses @ imports for all internal modules
- [ ] **Component Standards**: Native RN components with theme integration
- [ ] **Type Safety**: TypeScript strict mode compliance
- [ ] **Authentication**: Bearer token patterns for API clients
- [ ] **Error Handling**: Proper try-catch with error instanceof checks
- [ ] **Performance**: Efficient patterns (StyleSheet.create, useCallback, etc.)
- [ ] **Accessibility**: Proper labels and touch targets
- [ ] **i18n**: All text uses translation keys
- [ ] **Testing**: Adequate test coverage for new functionality

### Pull Request Template
```markdown
## Description
Brief description of changes and their purpose.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally (`bun run typecheck && bun run lint`)
- [ ] iOS simulator testing completed
- [ ] Android emulator testing completed (if applicable)
- [ ] Manual testing of user flows completed

## Architecture Compliance
- [ ] Follows CLEAN architecture principles
- [ ] Uses @ import patterns
- [ ] Implements proper error handling
- [ ] Maintains TypeScript strict mode compliance
```

## 📚 Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [CLEAN Architecture Guide](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Legend State Documentation](https://legendapp.com/open-source/state/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

### Development Tools
- [Claude Code](https://claude.ai/code) - AI-powered development assistance
- [Expo Dev Tools](https://docs.expo.dev/debugging/tools/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Desktop debugging platform

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)
- [GitHub Discussions](https://github.com/expo/expo/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using React Native, Expo, and modern development practices.