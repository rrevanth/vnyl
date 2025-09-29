/**
 * CatalogRow Component
 * 
 * Displays a horizontal scrollable catalog of media items using Legend List
 * Supports infinite loading with micro-animations using Legend Motion
 * Fully integrated with theme system and i18n
 */

/* @jsxImportSource react */

import React, { useCallback, useMemo, useRef, useEffect } from 'react'
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
import { LazyContainer } from '@/src/presentation/shared/components/LazyContainer'
import { useLazyLoading, useLazyLoadingPerformance } from '@/src/presentation/shared/hooks/useLazyLoading'
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
  /** Whether this row is currently in viewport */
  isVisible?: boolean
  /** Callback when row becomes visible */
  onVisible?: () => void
}

const CatalogRowImpl: React.FC<CatalogRowProps> = ({
  catalog,
  onItemPress,
  onItemLongPress,
  onSeeAllPress,
  onLoadMore,
  isLoading = false,
  hasMore = false,
  index,
  isVisible = true,
  onVisible
}) => {
  const { t, formatMessage } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Performance monitoring
  useLazyLoadingPerformance(`CatalogRow-${catalog.id}`)

  // Lazy loading for catalog items
  const {
    itemsToRender,
    isLoading: isLazyLoading,
    hasMore: hasMoreLazy,
    loadMore: loadMoreLazy,
    reset: resetLazy
  } = useLazyLoading(catalog.items.length, {
    initialCount: 5,
    batchSize: 3,
    threshold: 0.8,
    loadDelay: 150
  })

  // Track previous item count for animation detection
  const previousItemCount = useRef(catalog.items.length)
  const lastNewItemsCount = useRef(0)

  useEffect(() => {
    const currentCount = catalog.items.length
    if (currentCount > previousItemCount.current) {
      // New items were added
      lastNewItemsCount.current = currentCount - previousItemCount.current
      previousItemCount.current = currentCount
      
      // Clear the new items flag after animation
      setTimeout(() => {
        lastNewItemsCount.current = 0
      }, 1000) // Clear after 1 second
    } else {
      previousItemCount.current = currentCount
    }
  }, [catalog.items.length])

  // Reset lazy loading when catalog items change
  useEffect(() => {
    resetLazy()
  }, [catalog.items.length, resetLazy])

  // Prepare data for Legend List with lazy loading support
  const listData = useMemo(() => {
    const totalItems = catalog.items.length
    const newItemsCount = lastNewItemsCount.current
    
    // Only render items up to the lazy loading limit
    const itemsToShow = catalog.items.slice(0, itemsToRender)
    
    const items = itemsToShow.map((item, itemIndex) => {
      // Check if this item is one of the newly added items
      const isNewItem = newItemsCount > 0 && itemIndex >= (totalItems - newItemsCount)
      // Stagger animation delay for new items
      const animationDelay = isNewItem ? (itemIndex - (totalItems - newItemsCount)) * 100 : 0
      
      return {
        // UNIQUE + STABLE key: catalog.id + item.id + index for absolute uniqueness without timestamps
        id: `${catalog.id}-item-${item.id}-pos-${itemIndex}`,
        item,
        index: itemIndex,
        isFirstItem: itemIndex === 0,
        isLastItem: itemIndex === itemsToShow.length - 1,
        isNewItem,
        animationDelay,
        isLazyLoaded: itemIndex >= 5 // Mark items after initial 5 as lazy loaded
      }
    })

    // Add lazy loading indicator if more items available
    if (hasMoreLazy && !isLazyLoading) {
      items.push({
        id: `${catalog.id}-lazy-load-more`,
        item: null as any,
        index: items.length,
        isFirstItem: false,
        isLastItem: true,
        isLazyLoadTrigger: true
      } as any)
    }

    // Add loading indicator if loading more from API
    if ((isLoading && hasMore) || isLazyLoading) {
      items.push({
        id: `${catalog.id}-loading-indicator`,
        item: null as any,
        index: items.length,
        isFirstItem: false,
        isLastItem: true,
        isLoading: true
      } as any)
    }

    return items
  }, [catalog.items, catalog.id, itemsToRender, isLoading, hasMore, isLazyLoading, hasMoreLazy])

  const handleSeeAllPress = useCallback(() => {
    onSeeAllPress?.(catalog)
  }, [onSeeAllPress, catalog])

  const handleLoadMore = useCallback(async () => {
    // First try lazy loading more local items
    if (hasMoreLazy && !isLazyLoading) {
      loadMoreLazy()
      return
    }
    
    // Then load more from API if available
    if (hasMore && !isLoading && onLoadMore) {
      await onLoadMore(catalog)
    }
  }, [hasMore, isLoading, onLoadMore, catalog, hasMoreLazy, isLazyLoading, loadMoreLazy])

  const renderItem = useCallback(({ item: listItem }: { item: any }) => {
    // Handle lazy load trigger
    if (listItem.isLazyLoadTrigger) {
      return (
        <Pressable
          onPress={loadMoreLazy}
          style={styles.lazyLoadTrigger}
          accessibilityRole="button"
          accessibilityLabel={t('catalog.load_more_items')}
        >
          <Text style={styles.lazyLoadText}>
            {formatMessage('catalog.show_more', { count: Math.min(3, catalog.items.length - itemsToRender) })}
          </Text>
        </Pressable>
      )
    }

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
          <Text style={styles.loadingText}>
            {isLazyLoading ? t('catalog.loading_more') : t('common.loading')}
          </Text>
        </MotionWrapper>
      )
    }

    // Handle catalog item with lazy container
    if (listItem.item) {
      const isLazyItem = listItem.isLazyLoaded
      
      return (
        <LazyContainer
          isVisible={isVisible}
          renderPlaceholder={isLazyItem}
          height={scale(260)}
          unloadDelay={2000}
        >
          <CatalogItem
            item={listItem.item}
            onPress={onItemPress}
            onLongPress={onItemLongPress}
            index={listItem.index}
            isFirstItem={listItem.isFirstItem}
            isLastItem={listItem.isLastItem}
            isNewItem={listItem.isNewItem}
            animationDelay={listItem.animationDelay}
            isLazyLoaded={isLazyItem}
          />
        </LazyContainer>
      )
    }

    return null
  }, [onItemPress, onItemLongPress, t, formatMessage, styles, loadMoreLazy, itemsToRender, catalog.items.length, isVisible, isLazyLoading])

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
          
          <Text style={styles.itemCount}>
            {formatMessage('catalog.item_count', { count: catalog.items.length })}
          </Text>
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.7}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </MotionWrapper>
  )
}

export const CatalogRow = React.memo(observer(CatalogRowImpl))

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
  itemCount: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
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
  lazyLoadTrigger: {
    width: scale(140),
    height: scale(200),
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderStyle: 'dashed',
  },
  lazyLoadText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
})