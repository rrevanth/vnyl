/**
 * HomeScreenContent Component
 * 
 * Main content component for the home screen that displays multiple catalog rows
 * Uses useHomeScreen hook with deterministic catalog ordering
 * Implements Legend List for virtualized scrolling and Legend Motion for animations
 * No random special catalog insertions - stable, predictable ordering
 */

/* @jsxImportSource react */

import React, { useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, RefreshControl } from 'react-native'
import { observer } from '@legendapp/state/react'
import { LegendList } from '@legendapp/list'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem as CatalogItemEntity } from '@/src/domain/entities/media/catalog-item.entity'
import { useHomeScreen } from '@/src/presentation/shared/hooks/useHomeScreen'
import { CatalogRow } from './CatalogRow'
import { MotionWrapper } from './MotionWrapper'
import { moderateScale } from 'react-native-size-matters'

interface HomeScreenContentProps {
  onScroll?: (event: any) => void
}

export const HomeScreenContent: React.FC<HomeScreenContentProps> = observer(({
  onScroll
}) => {
  const { t, formatMessage } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Home screen state management using Legend State + TanStack Query
  const { state, actions } = useHomeScreen()

  // Prepare data for Legend List with deterministic ordering
  const listData = useMemo(() => {
    if (state.isEmpty) {
      return [{ type: 'empty', id: 'empty' }]
    }

    if (state.isError) {
      return [{ type: 'error', id: 'error', error: state.error }]
    }

    const items: any[] = []
    
    // Add welcome header
    items.push({ type: 'header', id: 'header' })

    // Add catalog rows in deterministic order (no special insertions)
    state.catalogs.forEach((catalog, index) => {
      items.push({
        type: 'catalog',
        id: catalog.id,
        catalog,
        index
      })
    })

    // Add loading indicator if loading more
    if (state.isLoadingMore) {
      items.push({ type: 'loading', id: 'loading-more' })
    }

    return items
  }, [state.catalogs, state.isEmpty, state.isError, state.error, state.isLoadingMore])

  const handleItemPress = useCallback((item: CatalogItemEntity) => {
    actions.handleItemPress(item)
  }, [actions])

  const handleItemLongPress = useCallback((item: CatalogItemEntity) => {
    actions.handleAddToWatchlist(item)
  }, [actions])

  const handleSeeAllPress = useCallback((catalog: Catalog) => {
    actions.handleSeeAllPress(catalog.name, catalog)
  }, [actions])

  const handleCatalogLoadMore = useCallback(async (catalog: Catalog) => {
    // Use simplified load more approach
    await actions.loadMoreItems(catalog)
  }, [actions])

  const handleRefresh = useCallback(async () => {
    await actions.refresh()
  }, [actions])

  const renderItem = useCallback(({ item: listItem }: { item: typeof listData[0] }) => {
    switch (listItem.type) {
      case 'header':
        return (
          <MotionWrapper
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            style={styles.header}
          >
            <Text style={styles.welcomeTitle}>
              {t('home.welcome')}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {t('home.discover_content')}
            </Text>
            
            {state.successfulProviders > 0 && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  {formatMessage('home.providers_active', { count: state.successfulProviders, total: state.totalProviders })}
                </Text>
                <Text style={styles.statsText}>
                  {formatMessage('home.total_items', { count: state.totalItems })}
                </Text>
              </View>
            )}
          </MotionWrapper>
        )

      case 'special':
        if (listItem.catalogs && listItem.catalogs.length > 0) {
          const specialCatalog: Catalog = {
            id: listItem.id,
            name: listItem.specialType === 'top10' 
              ? t('home.top_ten') 
              : t('home.award_winners'),
            items: listItem.catalogs.flatMap((c: Catalog) => c.items.slice(0, 10)),
            mediaType: 'mixed' as any,
            catalogContext: {
              providerId: 'special',
              providerName: 'Special',
              catalogId: listItem.id,
              catalogName: listItem.specialType === 'top10' 
                ? t('home.top_ten') 
                : t('home.award_winners'),
              catalogType: listItem.specialType,
              pageInfo: {
                currentPage: 1,
                hasMorePages: false,
                pageSize: 10
              },
              lastFetchAt: new Date(),
              requestId: `special-${listItem.id}`,
              metadata: {
                source: 'home-screen',
                operation: 'special-catalog',
                version: '1.0'
              }
            },
            pagination: {
              page: 1,
              hasMore: false
            },
            metadata: {
              fetchTime: Date.now(),
              cacheHit: false,
              itemCount: listItem.catalogs.flatMap((c: Catalog) => c.items.slice(0, 10)).length
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }

          return (
            <CatalogRow
              catalog={specialCatalog}
              onItemPress={handleItemPress}
              onItemLongPress={handleItemLongPress}
              onSeeAllPress={handleSeeAllPress}
              index={0}
            />
          )
        }
        return null

      case 'catalog':
        return (
          <CatalogRow
            catalog={listItem.catalog}
            onItemPress={handleItemPress}
            onItemLongPress={handleItemLongPress}
            onSeeAllPress={handleSeeAllPress}
            onLoadMore={handleCatalogLoadMore}
            isLoading={state.isLoadingMore}
            hasMore={listItem.catalog.pagination.hasMore}
            index={listItem.index}
          />
        )

      case 'loading':
        return (
          <MotionWrapper
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 300 }}
            style={styles.loadingContainer}
          >
            <Text style={styles.loadingText}>{t('common.loadingMore')}</Text>
          </MotionWrapper>
        )

      case 'empty':
        return (
          <MotionWrapper
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            style={styles.emptyContainer}
          >
            <Text style={styles.emptyTitle}>{t('home.no_catalogs')}</Text>
            <Text style={styles.emptyDescription}>
              {t('home.no_catalogs_description')}
            </Text>
          </MotionWrapper>
        )

      case 'error':
        return (
          <MotionWrapper
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            style={styles.errorContainer}
          >
            <Text style={styles.errorTitle}>{t('home.error')}</Text>
            <Text style={styles.errorDescription}>
              {listItem.error?.message || t('home.generic_error')}
            </Text>
          </MotionWrapper>
        )

      default:
        return null
    }
  }, [
    handleItemPress,
    handleItemLongPress,
    handleSeeAllPress,
    handleCatalogLoadMore,
    state,
    t,
    formatMessage,
    styles
  ])

  const getItemId = useCallback((item: typeof listData[0]) => item.id, [])

  const handleScroll = useCallback((event: any) => {
    actions.handleScroll(event)
    onScroll?.(event)
  }, [actions, onScroll])

  return (
    <View style={styles.container}>
      <LegendList
        data={listData}
        renderItem={renderItem}
        keyExtractor={getItemId}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.interactive.primary}
            colors={[theme.colors.interactive.primary]}
          />
        }
        onScroll={handleScroll}
        // maintainVisibleContentPosition={{
        //   minIndexForVisible: 1,
        //   autoscrollToTopThreshold: 100
        // }}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  welcomeTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading1.fontSize,
    fontWeight: theme.typography.heading1.fontWeight as any,
    lineHeight: theme.typography.heading1.lineHeight,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  statsText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },
  errorTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
})