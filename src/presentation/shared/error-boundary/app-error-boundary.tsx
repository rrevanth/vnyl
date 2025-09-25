import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { createTheme } from '@/src/presentation/shared/theme/theme-factory'
import type { Theme } from '@/src/presentation/shared/theme/types'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('AppErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      const { error } = this.state

      if (Fallback && error) {
        return (
          <Fallback
            error={error}
            retry={() => this.setState({ hasError: false, error: null })}
          />
        )
      }

      return <DefaultErrorFallback error={error} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = observer(({ error }) => {
  const theme = createTheme('light') // Use light theme as fallback
  const styles = createStyles(theme)

  const isDIError = error?.message?.includes('Service not registered') ||
                   error?.message?.includes('DI container')

  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.title}>
          {isDIError ? 'App Loading Error' : 'Something went wrong'}
        </Text>

        <Text style={styles.message}>
          {isDIError
            ? 'The app is still initializing. Please wait a moment and try again.'
            : 'An unexpected error occurred. Please restart the app.'
          }
        </Text>

        {__DEV__ && error && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info (Development Only):</Text>
            <Text style={styles.debugText}>{error.message}</Text>
          </View>
        )}
      </View>
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  errorCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadows.md
  },
  title: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  message: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.lg
  },
  debugContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.sm
  },
  debugTitle: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  debugText: {
    fontSize: theme.typography?.caption?.fontSize || theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace'
  }
})

export { AppErrorBoundary }