import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { useLogging, useStorage, useApiClient } from '@/src/infrastructure/di'
import { useTheme } from '@/src/presentation/shared/theme'
import { Heading, Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import { SectionHeader } from '@/src/presentation/shared/ui/molecules/section-header'

const HomeScreen: React.FC = observer(() => {
  const { theme } = useTheme()
  const router = useRouter()
  const logger = useLogging()
  const storage = useStorage()
  const apiClient = useApiClient()
  const [storageValue, setStorageValue] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<string>('Ready')
  const [showDeveloperSection, setShowDeveloperSection] = useState(__DEV__)
  const styles = createStyles(theme)

  // Mock data for demonstration
  const recentlyPlayed = [
    { id: '1', title: 'Dark Side of the Moon', artist: 'Pink Floyd', coverUrl: null },
    { id: '2', title: 'Abbey Road', artist: 'The Beatles', coverUrl: null },
    { id: '3', title: 'Rumours', artist: 'Fleetwood Mac', coverUrl: null }
  ]

  const recommendations = [
    { id: '1', title: 'The Wall', artist: 'Pink Floyd', reason: 'Similar to your recent plays' },
    { id: '2', title: 'Sgt. Pepper\'s', artist: 'The Beatles', reason: 'Based on your library' }
  ]

  useEffect(() => {
    logger.info('Home screen mounted')

    // Test storage on mount
    const testStorage = async () => {
      try {
        const value = await storage.getItem('test-key')
        setStorageValue(value)
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to get storage item', errorInstance)
      }
    }

    testStorage()
  }, [logger, storage])

  const handleTestServices = async () => {
    try {
      setTestStatus('Testing...')

      // Test logging
      logger.info('Testing services from UI')

      // Test storage
      await storage.setItem('test-key', `Test value ${Date.now()}`)
      const newValue = await storage.getItem('test-key')
      setStorageValue(newValue)

      // Test API client config (won't make actual request without proper config)
      const config = apiClient.getDefaultConfig()
      logger.info('API client config retrieved', { baseURL: config.baseURL })

      setTestStatus('All services working! ✅')

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger.error('Service test failed', errorInstance)
      setTestStatus('Service test failed ❌')
    }
  }

  const handleNavigateToSearch = () => {
    router.push('/search')
  }

  const handleNavigateToLibrary = () => {
    router.push('/library')
  }

  const handleNavigateToSettings = () => {
    router.push('/settings')
  }

  const toggleDeveloperSection = () => {
    setShowDeveloperSection(!showDeveloperSection)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Heading variant="h1" color="primary">
            Welcome Back
          </Heading>
          <Text variant="body" color="secondary">
            Discover and manage your vinyl collection
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Get started with common tasks"
          />
          <View style={styles.quickActionsGrid}>
            <Button
              title="Search Records"
              variant="primary"
              size="md"
              onPress={handleNavigateToSearch}
              style={styles.quickActionButton}
            />
            <Button
              title="My Library"
              variant="secondary"
              size="md"
              onPress={handleNavigateToLibrary}
              style={styles.quickActionButton}
            />
            <Button
              title="Settings"
              variant="outline"
              size="md"
              onPress={handleNavigateToSettings}
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Recently Played */}
        <View style={styles.section}>
          <SectionHeader
            title="Recently Played"
            subtitle="Your recent listening activity"
            action={{
              title: 'View All',
              onPress: () => router.push('/library')
            }}
          />
          {recentlyPlayed.length > 0 ? (
            <View style={styles.itemsList}>
              {recentlyPlayed.map((item) => (
                <View key={item.id} style={styles.mediaItem}>
                  <View style={styles.albumCover}>
                    <Text variant="caption" color="secondary">🎵</Text>
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text variant="bodyBold" color="primary" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text variant="caption" color="secondary" numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text variant="body" color="secondary" align="center">
                No recent activity. Start exploring your collection!
              </Text>
            </View>
          )}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for You"
            subtitle="Discover new music based on your taste"
          />
          {recommendations.length > 0 ? (
            <View style={styles.itemsList}>
              {recommendations.map((item) => (
                <View key={item.id} style={styles.recommendationItem}>
                  <View style={styles.albumCover}>
                    <Text variant="caption" color="secondary">💿</Text>
                  </View>
                  <View style={styles.mediaInfo}>
                    <Text variant="bodyBold" color="primary" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text variant="caption" color="secondary" numberOfLines={1}>
                      {item.artist}
                    </Text>
                    <Text variant="small" color="secondary" numberOfLines={2}>
                      {item.reason}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text variant="body" color="secondary" align="center">
                Build your library to get personalized recommendations
              </Text>
            </View>
          )}
        </View>

        {/* Collection Stats */}
        <View style={styles.section}>
          <SectionHeader
            title="Collection Overview"
            subtitle="Your vinyl library at a glance"
          />
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text variant="bodyBold" color="primary" align="center">0</Text>
              <Text variant="caption" color="secondary" align="center">Records</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="bodyBold" color="primary" align="center">0</Text>
              <Text variant="caption" color="secondary" align="center">Artists</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="bodyBold" color="primary" align="center">0</Text>
              <Text variant="caption" color="secondary" align="center">Genres</Text>
            </View>
          </View>
        </View>

        {/* Developer Section (Collapsible) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Pressable
              onPress={toggleDeveloperSection}
              style={styles.developerHeader}
              accessibilityRole="button"
              accessibilityLabel={`${showDeveloperSection ? 'Hide' : 'Show'} developer section`}
            >
              <Text variant="bodyBold" color="secondary">
                🛠️ Developer Tools {showDeveloperSection ? '▼' : '▶'}
              </Text>
            </Pressable>

            {showDeveloperSection && (
              <View style={styles.developerContent}>
                <View style={styles.statusContainer}>
                  <Text variant="body" color="primary">
                    Services Status: {testStatus}
                  </Text>
                  {storageValue && (
                    <Text variant="caption" color="secondary">
                      Storage Value: {storageValue}
                    </Text>
                  )}
                </View>

                <Button
                  title="Test Services"
                  variant="outline"
                  size="sm"
                  onPress={handleTestServices}
                  style={styles.testButton}
                />

                <View style={styles.servicesContainer}>
                  <Text variant="bodyBold" color="primary">Available Services:</Text>
                  <Text variant="caption" color="secondary">✅ Logging Service</Text>
                  <Text variant="caption" color="secondary">✅ Storage Service (AsyncStorage)</Text>
                  <Text variant="caption" color="secondary">✅ API Client (Axios)</Text>
                  <Text variant="caption" color="secondary">✅ Config Client</Text>
                  <Text variant="caption" color="secondary">✅ DI Container</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
})

export default HomeScreen

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg
  },
  welcomeSection: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  quickActionButton: {
    flex: 1,
    minWidth: '30%'
  },
  itemsList: {
    gap: theme.spacing.sm
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  albumCover: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  mediaInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    alignItems: 'center'
  },
  developerHeader: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm
  },
  developerContent: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
    gap: theme.spacing.sm
  },
  statusContainer: {
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  testButton: {
    alignSelf: 'center'
  },
  servicesContainer: {
    gap: theme.spacing.xs / 2
  }
})
