# VNYL App - Claude Development Guide

## Quick Reference

### Essential Workflow
1. **Analysis**: Sequential MCP for complex requirements
2. **Planning**: TodoWrite for >3 step operations
3. **Implementation**: Parallel operations with MultiEdit
4. **Validation**: `bun typecheck && bun lint` (REQUIRED)
5. **Testing**: iOS simulator verification

### MCP Server Usage
- **Sequential**: Multi-step reasoning, architecture decisions
- **Context7**: Official React Native/Expo documentation
- **Magic**: UI components (adapt to native RN)
- **Apple Fetch**: Internal Apple knowledge base
- **Playwright**: E2E testing and validation

## Technology Stack

### Core Technologies
- **Expo 54** (link preview, native tabs, peek & pop)
- **React Native** with TypeScript strict mode
- **Bun** package manager (required for all commands)
- **Legend State** observable state management with persistence
- **TanStack Query** data fetching with cache persistence
- **Axios** with Bearer token authentication and retry
- **Unistyles** centralized theme system with responsive design
- **Expo Localization** with comprehensive i18n support

### Development Standards
- **Native Components Only**: View, Text, Pressable, StyleSheet.create()
- **Theme Factory Pattern**: Centralized styling with light/dark mode
- **@ Import Pattern**: All internal imports use @ aliases
- **CLEAN Architecture**: Domain → Infrastructure → Presentation
- **Agent Workflows**: MCP orchestration for complex tasks

## CLEAN Architecture (Implemented)

```
src/
├── domain/           # Business logic (entities, use-cases, interfaces) ✅
├── infrastructure/   # External services (APIs, storage, DI container) ✅
├── data/            # Repository implementations and mappers ✅  
└── presentation/    # React Native UI (features, shared/ui, stores) ✅
```

### Implementation Status
- ✅ **Domain Layer**: Complete entities, repositories, services, use cases
- ✅ **Infrastructure Layer**: Axios clients, DI container, logging, storage, theme
- ✅ **Data Layer**: Repository implementations with TMDB/Stremio integration
- ✅ **Presentation Layer**: Feature-sliced architecture with Legend State stores

### Core Principles
- **Dependencies flow inward**: Infrastructure → Domain
- **All business logic**: Through domain use cases
- **DI container**: Central service management
- **Bearer authentication**: All API clients
- **Native components**: No external UI libraries

## Agent-Driven Development Workflow

### 1. Pre-Analysis Validation
```bash
# Always verify current state first
git status && git branch
bun typecheck && bun lint
```

### 2. Complex Task Pattern (>3 steps)
```typescript
// Use Sequential MCP for analysis
// Use TodoWrite for task orchestration
// Execute with parallel operations
// Validate with required gates
```

### 3. Tool Selection Matrix
| Task Type | Primary Tool | When to Use |
|-----------|-------------|-------------|
| Complex analysis | Sequential MCP | Architectural decisions |
| UI components | Magic MCP → Native RN | Component generation |
| Multi-file edits | MultiEdit | Related changes |
| Documentation | Context7 MCP | Official patterns |
| Validation | Bash | `bun typecheck && bun lint` |

## Critical Development Standards

### Required Import Pattern
```typescript
// ✅ REQUIRED - @ imports for all internal modules
import { useTheme } from '@/src/presentation/shared/theme'
import { container } from '@/src/infrastructure/di/container'
import { TOKENS } from '@/src/infrastructure/di/tokens'

// ❌ FORBIDDEN - Relative imports
import { useTheme } from '../../../shared/theme'
```

### Required Validation Gates
```bash
# ✅ MUST PASS before any commit or task completion
bun typecheck && bun lint

# ✅ Fix issues automatically when possible
bun run lint --fix
```

### Agent-Driven Patterns (REQUIRED)

```typescript
// ✅ CORRECT - Agent workflow for complex tasks
const agentWorkflow = async () => {
  // 1. Analysis (Sequential MCP for architecture/requirements)
  const analysis = await Sequential(/* multi-step analysis */)

  // 2. Planning (TodoWrite for >3 steps)
  await TodoWrite({ todos: taskList })

  // 3. Parallel execution
  const [file1, file2, file3] = await Promise.allSettled([
    Read({ file_path: '/path1' }),
    Read({ file_path: '/path2' }),
    Read({ file_path: '/path3' })
  ])

  // 4. Implementation (MultiEdit for related changes)
  await MultiEdit({ file_path, edits })

  // 5. CRITICAL - Validation gates
  await validateChanges() // bun typecheck && bun lint
}
```

### Bearer Token Authentication (REQUIRED)

```typescript
// ✅ REQUIRED - All APIs use Bearer tokens
export const createAPIConfig = (): ApiConfig => {
  const apiKey = process.env.EXPO_PUBLIC_API_KEY
  if (!apiKey) {
    throw new Error('EXPO_PUBLIC_API_KEY required')
  }

  return {
    baseURL: 'https://api.example.com/v1',
    timeout: 10000,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  }
}

// ✅ REQUIRED - Validate Bearer token in interceptors
private setupInterceptors() {
  this.client.interceptors.request.use((config) => {
    if (!config.headers?.Authorization?.startsWith('Bearer ')) {
      throw new Error('Bearer token required')
    }
    return config
  })
}
```

### iOS Testing Validation (FINAL STEP)

```typescript
// ✅ REQUIRED - Complete validation sequence
const fullValidation = async () => {
  // 1. Code validation
  await execAsync('bun typecheck && bun lint')

  // 2. Build validation
  await execAsync('bun run build')

  // 3. iOS simulator testing (CRITICAL)
  // Start simulator and test key user flows
  // Verify UI renders correctly
  // Test navigation and interactions

  // 4. Mark tasks complete only after iOS validation
}
```

### Native React Native Components (ENFORCED)

```typescript
// ✅ REQUIRED - Native RN components with theme
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/src/presentation/shared/theme'

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  const theme = useTheme()

  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.colors.interactive.primary,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      alignItems: 'center'
    },
    text: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600'
    }
  })

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
}

// ❌ FORBIDDEN - External UI libraries
// import { Button } from 'react-native-elements'
```

### Agent-Driven Development Workflow

**MCP Server Selection Matrix**:
- **Complex Analysis**: Sequential Thinking MCP for multi-step reasoning and architectural decisions
- **Documentation Lookup**: Context7 MCP for official React Native, Expo, and library documentation
- **UI Components**: Magic MCP for modern component patterns and design system integration
- **Knowledge Search**: Apple Fetch MCP for internal documentation and best practices
- **Documentation Creation**: Confluence MCP for project documentation and knowledge sharing

**Tool Selection Priority**:
1. **Multi-step Operations**: Use TodoWrite + Sequential Thinking for complex tasks
2. **Parallel Execution**: Batch Read operations, use MultiEdit for multiple file changes
3. **Agent Delegation**: Task agents for operations >7 directories or >50 files
4. **Validation Gates**: Always run `bun typecheck` and `bun lint` before marking tasks complete

### Styling Standards

- **Native Components Only**: Use React Native's View, Text, ScrollView, Pressable, etc.
- **StyleSheet.create()**: All styles through StyleSheet.create() for performance
- **Theme Factory Pattern**: Centralized theme system with light/dark mode support
- **No External UI Libraries**: Build custom components using native RN primitives
- **Responsive Scaling**: Use size-matters for consistent scaling across devices
- **Component Variants**: Custom variant systems using theme values and props

### Theme Factory Implementation (REQUIRED)

```typescript
// ✅ CORRECT - Theme factory with native React Native
// src/presentation/shared/theme/theme-factory.ts
import { StyleSheet } from 'react-native'
import { scale, moderateScale } from 'react-native-size-matters'

export interface ThemeColors {
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    inverse: string
  }
  border: {
    primary: string
    secondary: string
  }
  interactive: {
    primary: string
    secondary: string
    disabled: string
  }
}

export interface ThemeSpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export interface ThemeTypography {
  heading1: {
    fontSize: number
    lineHeight: number
    fontWeight: string
  }
  heading2: {
    fontSize: number
    lineHeight: number
    fontWeight: string
  }
  body: {
    fontSize: number
    lineHeight: number
    fontWeight: string
  }
  caption: {
    fontSize: number
    lineHeight: number
    fontWeight: string
  }
}

export interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  radius: ThemeRadius
  shadows: ThemeShadows
  transition: ThemeTransition
}

const lightTheme: Theme = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#E9ECEF'
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      inverse: '#FFFFFF'
    },
    border: {
      primary: '#DEE2E6',
      secondary: '#E9ECEF'
    },
    interactive: {
      primary: '#007AFF',
      secondary: '#5856D6',
      disabled: '#ADB5BD'
    }
  },
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
    xxl: scale(48)
  },
  typography: {
    heading1: {
      fontSize: moderateScale(28),
      lineHeight: moderateScale(36),
      fontWeight: '700'
    },
    heading2: {
      fontSize: moderateScale(24),
      lineHeight: moderateScale(32),
      fontWeight: '600'
    },
    body: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(24),
      fontWeight: '400'
    },
    caption: {
      fontSize: moderateScale(12),
      lineHeight: moderateScale(16),
      fontWeight: '400'
    }
  },
  borderRadius: {
    sm: scale(4),
    md: scale(8),
    lg: scale(12),
    full: scale(9999)
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8
    }
  }
}

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      inverse: '#000000'
    },
    border: {
      primary: '#38383A',
      secondary: '#48484A'
    },
    interactive: {
      primary: '#007AFF',
      secondary: '#5856D6',
      disabled: '#48484A'
    }
  }
}

export const createTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme
}

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm
  },
  primaryButton: {
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight
  },
  heading1: {
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
    color: theme.colors.text.primary
  },
  bodyText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text.primary
  }
})
```

### Native Component Patterns (REQUIRED)

```typescript
// ✅ CORRECT - Native React Native components with theme
import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = observer(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createButtonStyles(theme, variant, size, disabled)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
})

const createButtonStyles = (
  theme: Theme,
  variant: string,
  size: string,
  disabled: boolean
) => StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: size === 'sm' ? theme.spacing.xs :
                    size === 'lg' ? theme.spacing.md : theme.spacing.sm,
    paddingHorizontal: size === 'sm' ? theme.spacing.sm :
                       size === 'lg' ? theme.spacing.lg : theme.spacing.md,
    backgroundColor: variant === 'primary' ? theme.colors.interactive.primary :
                     variant === 'secondary' ? theme.colors.interactive.secondary :
                     'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? theme.colors.interactive.primary : 'transparent',
    ...(!disabled && theme.shadows.sm)
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    backgroundColor: theme.colors.interactive.disabled,
    ...theme.shadows.sm
  },
  text: {
    fontSize: size === 'sm' ? theme.typography.caption.fontSize :
             size === 'lg' ? theme.typography.heading2.fontSize :
             theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: variant === 'outline' ? theme.colors.interactive.primary :
           variant === 'primary' || variant === 'secondary' ? theme.colors.text.inverse :
           theme.colors.text.primary
  }
})

// ✅ CORRECT - Card component with native styling
interface CardProps {
  children: React.ReactNode
  variant?: 'elevated' | 'outlined' | 'filled'
  onPress?: () => void
}

export const Card: React.FC<CardProps> = observer(({
  children,
  variant = 'elevated',
  onPress
}) => {
  const theme = useTheme()
  const styles = createCardStyles(theme, variant)

  const CardComponent = onPress ? Pressable : View

  return (
    <CardComponent
      style={({ pressed }) => [
        styles.card,
        onPress && pressed && styles.pressed
      ]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </CardComponent>
  )
})

const createCardStyles = (theme: Theme, variant: string) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...(variant === 'elevated' && theme.shadows.md),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: theme.colors.border.primary
    })
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }]
  }
})
```

### Internationalization (i18n)

- **NO Hardcoded Text**: All text through translation keys
- **Centralized Translations**: Located at `src/presentation/shared/i18n/`
- **UseTranslation Hook**: Always use `useTranslation` for text
- **Key Structure**: Organize by feature and component hierarchy
- **Snake Case Keys**: All translation keys use snake_case convention

```typescript
// ✅ REQUIRED - Snake case for translation keys
const { t } = useTranslation()
title={t('settings.theme.dark_mode')}
description={t('settings.display.font_size')}
label={t('settings.locale.time_format')}

// ❌ FORBIDDEN - camelCase for translation keys
title={t('settings.theme.darkMode')}
description={t('settings.display.fontSize')}
```

### Naming Conventions

- **Files & Components**: Standard React Native conventions (PascalCase for components, camelCase for variables/functions)
- **Translation Keys**: snake_case for all i18n keys (`dark_mode`, `font_size`, `time_format`)
- **Theme Tokens**: Use built-in theme structure, extend with snake_case if needed
- **Variables & Functions**: camelCase (`darkMode`, `fontSize`, `toggleDarkMode`)
- **Directories & Files**: PascalCase for components (`SettingsCard.tsx`), camelCase for utilities

```typescript
// ✅ REQUIRED - Standard React Native naming conventions
const SettingsCard: React.FC<SettingsCardProps> = ({ title, onPress }) => {
  const [darkMode, setDarkMode] = useState(false)
  const toggleDarkMode = useCallback(() => setDarkMode(!darkMode), [darkMode])

  return (
    <Pressable onPress={onPress}>
      <Text>{t('settings.theme.dark_mode')}</Text>
    </Pressable>
  )
}

// ✅ REQUIRED - Snake case ONLY for translation keys
const translations = {
  settings: {
    theme: {
      dark_mode: 'Dark Mode',
      accent_color: 'Accent Color',
      high_contrast: 'High Contrast'
    },
    display: {
      font_size: 'Font Size',
      line_height: 'Line Height',
      compact_mode: 'Compact Mode'
    }
  }
}

// ✅ REQUIRED - Built-in theme tokens (already properly structured)
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md
  }
})
```

### State Management

- **Legend State**: Observable state management with fine-grained reactivity
- **Store Location**: `src/presentation/shared/stores/`
- **Clean Integration**: Stores follow CLEAN architecture principles
- **Typed State**: Full TypeScript support with strict mode compliance
- **Persistence**: Automatic synchronization with AsyncStorage

### Provider & Dependency Injection

- **DI Container**: Central dependency injection at `src/infrastructure/di/container.ts`
- **Provider Registry**: Unified provider system for external services
- **Use Case Injection**: All use cases properly injected with dependencies
- **Repository Pattern**: Data access abstracted through interfaces
- **Service Interfaces**: Domain services defined as interfaces

## Critical Development Standards

### 🔴 VALIDATION REQUIREMENTS (MUST PASS)

1. **TypeScript Strict Mode**: `bun run typecheck` MUST pass with zero errors
2. **ESLint Validation**: `bun run lint` MUST pass with zero errors or warnings
3. **Agent Workflow**: Use TodoWrite for operations with >3 steps
4. **MCP Integration**: Leverage appropriate MCP servers for complex tasks
5. **@ Import Pattern**: All internal imports MUST use @ aliases for maintainability
6. **Error Handling**: All try-catch blocks must check `error instanceof Error`
7. **Bearer Authentication**: All API clients must use Bearer token authentication
8. **Native Components Only**: Use React Native primitives, no external UI libraries
9. **Validation Gates**: Always run `bun typecheck && bun lint` after changes
10. **Agent Orchestration**: Use Task agents for multi-step operations and state management

### 🚫 NEVER DO THESE:

1. **Use external UI libraries** - Only native React Native components
2. **Hardcode styles** - Always use StyleSheet.create() with theme system
3. **Skip theme factory** - All styling through centralized theme
4. **Hardcode text** - Always use i18n keys with `useTranslation`
5. **Use console.log** - Always use logging service with structured data
6. **Call providers directly** - Always go through use cases
7. **Skip dependency injection** - Always use the DI container
8. **Ignore TypeScript strict mode** - Fix all type errors immediately
9. **Use non-observable state** - Always use Legend State observables
10. **Skip responsive scaling** - Always use size-matters for consistent scaling
11. **Forget error handling** - Always handle errors gracefully with proper typing
12. **Skip accessibility** - Add proper accessibility props to all interactive elements
13. **Use FlatList directly** - Use Legend List for better performance
14. **Manual animations** - Use Legend Motion for performant animations
15. **Direct API calls** - Always use TanStack Query with use cases
16. **Access error.message directly** - Always check `error instanceof Error` first
17. **Mutate readonly arrays** - Use spread operator to convert to mutable
18. **Assume object properties exist** - Use optional chaining and nullish coalescing
19. **Use sequential async operations** - Use Promise.allSettled for concurrent operations
20. **Skip error boundaries in queries** - Always handle loading, error, and empty states
21. **Leave unused variables** - Remove or prefix with underscore if intentionally unused
22. **Mix import types** - Be consistent with type-only imports
23. **Create functions in render** - Use useCallback for event handlers
24. **Skip ESLint disable comments** - Always provide specific rule and reason
25. **Disable ESLint rules globally** - Use specific line/block disables with justification
26. **Use inline styles** - Always use StyleSheet.create() for performance
27. **Skip theme integration** - All components must use theme system
28. **Copy-paste UI code** - Build reusable components following atomic design
29. **Skip MCP servers for complex tasks** - Use Sequential, Context7, Magic appropriately
30. **Ignore validation gates** - Always run typecheck and lint before completion
31. **Use relative imports** - Always use @ import patterns for internal modules
32. **Skip Bearer token authentication** - All API clients must use Bearer tokens
33. **Use external UI libraries** - Only native React Native components allowed
34. **Skip agent orchestration** - Use Task agents for complex multi-step operations
35. **Ignore MCP server capabilities** - Leverage MCP servers for appropriate tasks

### ✅ ALWAYS DO THESE:

1. **Use native React Native components** (View, Text, Pressable, ScrollView, etc.)
2. **Create styles with StyleSheet.create()** for optimal performance
3. **Use theme factory pattern** for consistent styling and theming
4. **Implement component variants** through props and theme values
5. **Use `useTranslation`** for all text with snake_case i18n keys
6. **Access services through DI container** with `useDI()` or `useService()`
7. **Follow CLEAN architecture layers** strictly
8. **Use Legend State observables** for all reactive state
9. **Use Legend List** for virtualized lists
10. **Use Legend Motion** for animations
11. **Use TanStack Query** for data fetching with cache persistence
12. **Use size-matters scaling** for responsive design
13. **Use safe area hooks** for proper edge-to-edge layouts
14. **Run `bun run typecheck`** before committing (CRITICAL)
15. **Run `bun run lint`** before committing (CRITICAL)
16. **Add proper TypeScript types** with strict mode compliance
17. **Include comprehensive JSDoc comments**
18. **Wrap errors with context** in try-catch blocks using `error instanceof Error`
19. **Use optional chaining (?.)** and nullish coalescing (??) for safe property access
20. **Convert readonly arrays** with spread operator when mutation is needed
21. **Handle all query states** (loading, error, success, empty) in components
22. **Use Promise.allSettled** for concurrent async operations
23. **Implement proper error boundaries** in TanStack Query with retry logic
24. **Type guard unknown data** before processing
25. **Organize imports** (external → internal with @ patterns → relative) with proper spacing
26. **Use @ imports for all internal modules** - Never use relative imports for maintainability
27. **Use type-only imports** when importing only for types
28. **Add accessibility labels** for all interactive elements
29. **Use useCallback and useMemo** appropriately for performance
30. **Add ESLint disable comments** with specific rule names and reasoning
31. **Implement compound component patterns** for complex UI elements
32. **Use environment checks** (__DEV__) for development-only code
33. **Structure components** following atomic design principles
34. **Register all services through DI container** - never create instances directly
35. **Use storage service abstraction** - never import AsyncStorage directly
36. **Initialize features through app-container.ts** for proper dependency flow
37. **Log through ILoggingService** - never use console.log directly
38. **Use TodoWrite for complex tasks** with >3 steps
39. **Leverage MCP servers appropriately** for enhanced development workflow
40. **Create reusable theme-based components** following atomic design patterns
41. **Implement responsive breakpoints** using device dimensions and scaling
42. **Use Bearer token authentication** for all API client configurations
43. **Implement validation gates** with `bun typecheck && bun lint` after all changes
44. **Orchestrate with Task agents** for multi-step operations and complex workflows
45. **Build native component libraries** using React Native primitives with theme system
46. **Execute parallel operations** where possible for optimal performance
47. **Follow naming conventions**: PascalCase for components, camelCase for variables/functions, snake_case for translation keys only

## TypeScript Strict Mode Standards

### Null Safety (REQUIRED)

```typescript
// ✅ CORRECT - Handle null/undefined explicitly
const user = getUser()
if (user?.name) {
  return user.name.toUpperCase()
}

// ✅ CORRECT - Use nullish coalescing
const displayName = user?.name ?? 'Anonymous'

// ❌ WRONG - Assuming values exist
const displayName = user.name.toUpperCase() // Type error in strict mode
```

### Type Assertions (REQUIRED)

```typescript
// ✅ CORRECT - Use type predicates
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

if (isString(data)) {
  // TypeScript knows data is string here
  return data.toUpperCase()
}

// ✅ CORRECT - Use non-null assertion only when certain
const element = document.getElementById('myId')!

// ❌ WRONG - Unsafe type assertion
const user = data as User // Could be wrong
```

### Error Handling (REQUIRED)

```typescript
// ✅ CORRECT - Proper error type handling in try-catch
try {
  const result = await someAsyncOperation()
  return result
} catch (error) {
  // Handle unknown error types properly
  const errorInstance = error instanceof Error ? error : new Error(String(error))
  logger.error('Operation failed', errorInstance, { context: 'additional-data' })
  throw new Error(`Operation failed: ${errorInstance.message}`)
}

// ✅ CORRECT - Error boundary patterns
const safeAsyncFunction = async (): Promise<{ data?: Result; error?: string }> => {
  try {
    const data = await riskyOperation()
    return { data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred'
    return { error: message }
  }
}

// ✅ CORRECT - Optional chaining with proper null checks
const processResponse = (response?: { data?: { message?: string } }) => {
  // Safe access with fallbacks
  const message = response?.data?.message ?? 'Default message'

  // Conditional processing
  if (response?.data?.message) {
    return response.data.message.toUpperCase()
  }

  return 'No message available'
}
```

## Native React Native Component Usage (REQUIRED)

```typescript
// ✅ CORRECT - Native components with theme integration
import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import { scale, moderateScale } from 'react-native-size-matters'

const MediaDetailsScreen = observer(() => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('mediaDetail.title')}</Text>
        <Text style={styles.subtitle}>{t('mediaDetail.subtitle')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mediaDetail.cast')}</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed
            ]}
            onPress={handleWatchNow}
            accessibilityRole="button"
            accessibilityLabel={t('mediaDetail.watchNow')}
          >
            <Text style={styles.buttonText}>{t('mediaDetail.watchNow')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  header: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg
  },
  title: {
    fontSize: theme.typography.heading1.fontSize,
    fontWeight: theme.typography.heading1.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary
  },
  card: {
    backgroundColor: theme.colors.background.secondary,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    ...theme.shadows.md
  },
  cardTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm
  },
  buttonContainer: {
    marginTop: theme.spacing.md
  },
  primaryButton: {
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600'
  }
})
```

## Complete Development Workflow

### Agent-Orchestrated Task Pattern
```typescript
// For complex features (>3 steps):
// 1. Sequential MCP: Analyze requirements and architecture
// 2. TodoWrite: Create structured task list
// 3. Parallel execution: Read files, MultiEdit changes
// 4. Validation: bun typecheck && bun lint (REQUIRED)
// 5. iOS testing: Simulator verification
```

The VNYL App development guide is now streamlined to focus on proven workflow patterns:

- **Agent-driven development** with MCP orchestration
- **Native React Native** components with theme system
- **Bearer token authentication** for all APIs
- **CLEAN architecture** with dependency injection
- **Validation gates** as critical quality controls
- **iOS testing** as final verification step

Follow these patterns for efficient, maintainable development.
