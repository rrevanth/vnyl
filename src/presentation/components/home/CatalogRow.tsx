/**
 * CatalogRow Component
 * 
 * Displays a horizontal scrollable catalog of media items using Legend List
 * Supports infinite loading with micro-animations using Legend Motion
 * Fully integrated with theme system and i18n
 */

/* @jsxImportSource react */

import React, { useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { observer } from '@legendapp/state/react'
import { LegendList } from '@legendapp/list'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem as CatalogItemEntity } from '@/src/domain/entities/media/catalog-item.entity'
import { CatalogItem } from './CatalogItem'
import { MotionWrapper } from './MotionWrapper'
import { scale, moderateScale } from 'react-native-size-matters'

interface CatalogRowProps {
  catalog: Catalog
  onItemPress: (item: CatalogItemEntity) => void
  onItemLongPress?: (item: CatalogItemEntity) => void
  onSeeAllPress?: (catalog: Catalog) => void
  onLoadMore?: (catalog: Catalog) => Promise<void>
  isLoading?: boolean
  hasMore?: boolean
  index: number
}

export const CatalogRow: React.FC<CatalogRowProps> = observer(({
  catalog,
  onItemPress,
  onItemLongPress,
  onSeeAllPress,
  onLoadMore,
  isLoading = false,
  hasMore = false,
  index
}) => {
  const { t, formatMessage } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Prepare data for Legend List
  const listData = useMemo(() => {
    const items = catalog.items.map((item, itemIndex) => ({
      id: `${catalog.id}-${item.id}-${itemIndex}`, // Make unique by combining catalog ID, item ID, and index
      item,
      index: itemIndex,
      isFirstItem: itemIndex === 0,
      isLastItem: itemIndex === catalog.items.length - 1
    }))

    // Add loading indicator if loading more
    if (isLoading && hasMore) {
      items.push({
        id: `${catalog.id}-loading`,
        item: null as any,
        index: items.length,
        isFirstItem: false,
        isLastItem: true,
        isLoading: true
      } as any)
    }

    return items
  }, [catalog.items, catalog.id, isLoading, hasMore])

  const handleSeeAllPress = useCallback(() => {
    onSeeAllPress?.(catalog)
  }, [onSeeAllPress, catalog])

  // commented out due to Legend List compatibility  
  // const handleLoadMore = useCallback(async () => {
  //   if (hasMore && !isLoading && onLoadMore) {
  //     await onLoadMore(catalog)
  //   }
  // }, [hasMore, isLoading, onLoadMore, catalog])

  const renderItem = useCallback(({ item: listItem }: { item: any }) => {
    // Handle loading indicator
    if (listItem.isLoading) {
      return (
        <MotionWrapper
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          style={styles.loadingIndicator}
        >
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </MotionWrapper>
      )
    }

    // Handle catalog item
    if (listItem.item) {
      return (
        <CatalogItem
          item={listItem.item}
          onPress={onItemPress}
          onLongPress={onItemLongPress}
          index={listItem.index}
          isFirstItem={listItem.isFirstItem}
          isLastItem={listItem.isLastItem}
        />
      )
    }

    return null
  }, [onItemPress, onItemLongPress, t, styles])

  const getItemId = useCallback((item: typeof listData[0]) => item.id, [])

  return (
    <MotionWrapper
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      style={styles.container}
    >
      {/* Catalog Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {catalog.name}
          </Text>
          
          <View style={styles.metadata}>
            <Text style={styles.itemCount}>
              {formatMessage('catalog.item_count', { count: catalog.items.length })}
            </Text>
            
            <Text style={styles.lastUpdated}>
              {formatMessage('catalog.last_updated', { date: catalog.updatedAt.toLocaleDateString() })}
            </Text>
          </View>
        </View>
        
        {onSeeAllPress && (
          <Pressable
            onPress={handleSeeAllPress}
            style={({ pressed }: { pressed: boolean }) => [
              styles.seeAllButton,
              pressed && styles.seeAllPressed
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('catalog.see_all')}
          >
            <Text style={styles.seeAllText}>{t('catalog.see_all')}</Text>
          </Pressable>
        )}
      </View>

      {/* Catalog Items List */}
      <View style={styles.listContainer}>
        <LegendList
          data={listData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={getItemId}
          // maintainVisibleContentPosition={{
          //   minIndexForVisible: 0,
          //   autoscrollToTopThreshold: 100
          // }}
          // onEndReached={handleLoadMore}
          // onEndReachedThreshold={0.5}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </MotionWrapper>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    lineHeight: theme.typography.heading2.lineHeight,
    marginBottom: theme.spacing.xs,
  },
  description: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    marginBottom: theme.spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemCount: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  lastUpdated: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '400',
  },
  seeAllButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.interactive.primary,
  },
  seeAllPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  seeAllText: {
    color: theme.colors.text.inverse,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  listContainer: {
    height: scale(260), // Fixed height for catalog items
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingRight: theme.spacing.md,
  },
  loadingIndicator: {
    width: scale(140),
    height: scale(200),
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
})