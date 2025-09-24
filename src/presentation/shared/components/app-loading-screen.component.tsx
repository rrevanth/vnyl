import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

interface AppLoadingScreenProps {
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  isLoading,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Initialization Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          {onRetry && (
            <Pressable
              style={styles.retryButton}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry initialization"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          )}
        </View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>VNYL</Text>
          <Text style={styles.loadingSubtitle}>Initializing app...</Text>
        </View>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  loadingContainer: {
    alignItems: 'center'
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 2
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center'
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 300
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
})