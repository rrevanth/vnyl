/**
 * Home Screen - Main Application Homescreen with Catalog Discovery
 * 
 * Displays all available catalogs from registered providers with proper
 * loading states, error handling, and responsive design following VNYL patterns.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import React, { useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useDI } from '@/src/presentation/shared/hooks/use-di'
import { NavigationHeader, ProviderSection } from '@/src/presentation/components/atoms'
import type { Theme } from '@/src/presentation/shared/theme'
import type { Catalog } from '@/src/domain/entities/provider-capabilities.entity'
import type { GetAllCatalogsUseCase } from '@/src/domain/usecases/get-all-catalogs.usecase'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { catalogStore, catalogActions, catalogComputed } from '@/src/presentation/shared/stores/catalog.store'

export default observer(function HomeScreen() {
  const theme = useTheme()
  const { t, formatMessage } = useTranslation()
  const styles = createStyles(theme)
  
  // Get use case from DI container
  const getAllCatalogsUseCase = useDI<GetAllCatalogsUseCase>(TOKENS.GET_ALL_CATALOGS_USE_CASE)
  
  // Get reactive state from store
  const loadingState = catalogStore.loadingState.get()
  const isLoading = catalogStore.isLoading.get()
  const providerGroups = catalogStore.providerGroups.get()
  const errors = catalogStore.errors.get()
  const expandedProviders = catalogStore.expandedProviders.get()
  const totalCatalogs = catalogStore.totalCatalogs.get()
  const totalProviders = catalogStore.totalProviders.get()
  const healthyProviders = catalogStore.healthyProviders.get()
  const lastUpdated = catalogStore.lastUpdated.get()

  /**
   * Load all catalogs from providers
   */
  const loadCatalogs = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        catalogActions.setLoading(true)
      }
      
      // Execute use case to get all catalogs
      const result = await getAllCatalogsUseCase.execute({
        includeEmptyCatalogs: false,
        loadSampleItems: true,
        sampleItemsLimit: 3
      })
      
      catalogActions.setCatalogData(result)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      catalogActions.setError(errorMessage)
    }
  }, [getAllCatalogsUseCase])

  /**
   * Handle catalog selection
   */
  const handleCatalogPress = useCallback((catalog: Catalog) => {
    catalogActions.setSelectedCatalog(catalog.id)
    // TODO: Navigate to catalog detail view
    console.log('Catalog selected:', catalog.title, 'from', catalog.providerInfo.sourceProvider)
  }, [])

  /**
   * Handle provider expansion toggle
   */
  const handleToggleProviderExpansion = useCallback((providerId: string) => {
    catalogActions.toggleProviderExpansion(providerId)
  }, [])

  /**
   * Handle retry loading
   */
  const handleRetry = useCallback(() => {
    catalogActions.clearErrors()
    loadCatalogs(true)
  }, [loadCatalogs])

  /**
   * Handle refresh (pull to refresh)
   */
  const handleRefresh = useCallback(() => {
    loadCatalogs(false) // Don't show loading indicator for refresh
  }, [loadCatalogs])

  // Load catalogs on component mount
  useEffect(() => {
    if (loadingState === 'idle') {
      loadCatalogs(true)
    }
  }, [loadCatalogs, loadingState])

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <Ionicons 
        name="library-outline" 
        size={48} 
        color={theme.colors.text.tertiary} 
      />
      <Text style={styles.loadingText}>
        {t('homescreen.loading_providers')}
      </Text>
    </View>
  )

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <Ionicons 
        name="warning-outline" 
        size={48} 
        color={theme.colors.status.error} 
      />
      <Text style={styles.errorTitle}>
        {t('homescreen.provider_error')}
      </Text>
      
      {errors.length > 0 && (
        <View style={styles.errorList}>
          {errors.slice(0, 3).map((error, index) => (
            <Text key={index} style={styles.errorText}>
              • {error.providerName}: {error.error}
            </Text>
          ))}
          {errors.length > 3 && (
            <Text style={styles.errorMoreText}>
              {formatMessage('common.and_more', { count: errors.length - 3 })}
            </Text>
          )}
        </View>
      )}
      
      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.retryButtonPressed
        ]}
        onPress={handleRetry}
        accessibilityRole="button"
        accessibilityLabel={t('catalog.retry_loading')}
      >
        <Ionicons 
          name="refresh-outline" 
          size={20} 
          color={theme.colors.text.inverse} 
        />
        <Text style={styles.retryButtonText}>
          {t('common.retry')}
        </Text>
      </Pressable>
    </View>
  )

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Ionicons 
        name="library-outline" 
        size={48} 
        color={theme.colors.text.tertiary} 
      />
      <Text style={styles.emptyTitle}>
        {t('homescreen.no_providers')}
      </Text>
      <Text style={styles.emptyDescription}>
        {t('catalog.no_catalogs')}
      </Text>
    </View>
  )

  /**
   * Render statistics header
   */
  const renderStatsHeader = () => {
    const providerStats = catalogComputed.getProviderStats()
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProviders}</Text>
            <Text style={styles.statLabel}>{t('homescreen.stats.providers')}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCatalogs}</Text>
            <Text style={styles.statLabel}>{t('homescreen.stats.catalogs')}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.status.success }]}>
              {healthyProviders}
            </Text>
            <Text style={styles.statLabel}>{t('homescreen.stats.healthy')}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(providerStats.avgResponseTime)}ms
            </Text>
            <Text style={styles.statLabel}>{t('homescreen.stats.response_time')}</Text>
          </View>
        </View>
        
        {lastUpdated && (
          <Text style={styles.lastUpdatedText}>
            {formatMessage('catalog.updated', {
              date: lastUpdated.toLocaleTimeString()
            })}
          </Text>
        )}
      </View>
    )
  }

  /**
   * Render provider sections
   */
  const renderProviderSections = () => (
    <View style={styles.providersContainer}>
      {providerGroups.map(providerGroup => (
        <ProviderSection
          key={providerGroup.providerId}
          providerGroup={providerGroup}
          isExpanded={expandedProviders.includes(providerGroup.providerId)}
          onToggleExpansion={handleToggleProviderExpansion}
          onCatalogPress={handleCatalogPress}
          showCompactCards={false}
          maxCatalogsPreview={3}
        />
      ))}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <NavigationHeader
        title={t('navigation.home')}
        showBackButton={false}
        rightElement={
          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            accessibilityRole="button"
            accessibilityLabel={t('common.refresh')}
            disabled={isLoading}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={isLoading ? theme.colors.text.disabled : theme.colors.text.primary}
            />
          </Pressable>
        }
      />
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && loadingState !== 'loading'}
            onRefresh={handleRefresh}
            tintColor={theme.colors.interactive.primary}
            colors={[theme.colors.interactive.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            {t('homescreen.welcome')}
          </Text>
        </View>

        {/* Content based on loading state */}
        {loadingState === 'loading' && renderLoadingState()}
        
        {loadingState === 'error' && renderErrorState()}
        
        {loadingState === 'success' && providerGroups.length === 0 && renderEmptyState()}
        
        {loadingState === 'success' && providerGroups.length > 0 && (
          <>
            {renderStatsHeader()}
            {renderProviderSections()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl
  },
  welcomeSection: {
    marginVertical: theme.spacing.lg
  },
  welcomeTitle: {
    fontSize: theme.typography.display.fontSize,
    fontWeight: theme.typography.display.fontWeight as '700',
    fontFamily: theme.typography.display.fontFamily,
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  refreshButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg
  },
  loadingText: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center'
  },
  errorTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as '600',
    fontFamily: theme.typography.heading2.fontFamily,
    color: theme.colors.status.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center'
  },
  errorList: {
    marginBottom: theme.spacing.lg,
    alignSelf: 'stretch'
  },
  errorText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontFamily: theme.typography.bodySmall.fontFamily,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'left'
  },
  errorMoreText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm
  },
  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  retryButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as '600',
    fontFamily: theme.typography.button.fontFamily,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.sm
  },
  emptyTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as '600',
    fontFamily: theme.typography.heading2.fontFamily,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center'
  },
  emptyDescription: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.body.lineHeight
  },
  statsContainer: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as '600',
    fontFamily: theme.typography.heading2.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  },
  lastUpdatedText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.tertiary,
    textAlign: 'center'
  },
  providersContainer: {
    flex: 1
  }
})