/**
 * FilmographySection Component
 *
 * Apple TV+ inspired filmography section for person detail screen featuring:
 * - Professional "Cast & Crew" style presentation
 * - High-quality poster thumbnails with proper aspect ratios
 * - Clean category organization matching Apple TV+ patterns
 * - Enhanced visual hierarchy and typography
 * - Smooth horizontal scrolling with proper spacing
 * - Load more functionality with visual indicators
 * - Premium design language consistent with Apple TV+
 */

import React, { useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale, scale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem, CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'

// Item dimensions matching Apple TV+ poster aspect ratios
const POSTER_ASPECT_RATIO = 2/3  // Standard movie poster ratio
const ITEM_WIDTH = scale(120)
const ITEM_HEIGHT = ITEM_WIDTH / POSTER_ASPECT_RATIO

interface FilmographySectionProps {
  /** Person whose filmography is being displayed */
  person: PersonCatalogItem
  /** Array of filmography catalogs to display */
  catalogs: Catalog[]
  /** Callback when a filmography item is pressed */
  onItemPress: (item: CatalogItem) => void
  /** Callback when load more is requested for a catalog */
  onLoadMore?: (catalogId: string) => Promise<void>
  /** Whether filmography is currently being loaded */
  isLoading?: boolean
  /** Whether initial filmography load is complete */
  isFullyLoaded?: boolean
}

/**
 * Get formatted section title for Apple TV+ style
 */
const getFormattedSectionTitle = (catalog: Catalog, t: (key: string) => string): string => {
  const catalogName = catalog.name.toLowerCase()

  // Map to Apple TV+ style section names
  if (catalogName.includes('movie') || catalogName.includes('film')) {
    return 'Movies'
  }
  if (catalogName.includes('tv') || catalogName.includes('television')) {
    return 'Shows'
  }
  if (catalogName.includes('cast') || catalogName.includes('acting')) {
    return 'Acting'
  }
  if (catalogName.includes('crew') || catalogName.includes('production')) {
    return 'Production'
  }
  if (catalogName.includes('director') || catalogName.includes('directing')) {
    return 'Directing'
  }
  if (catalogName.includes('writer') || catalogName.includes('writing')) {
    return 'Writing'
  }
  if (catalogName.includes('producer') || catalogName.includes('producing')) {
    return 'Producing'
  }

  // Capitalize first letter of original name
  return catalog.name.charAt(0).toUpperCase() + catalog.name.slice(1)
}

/**
 * Smart catalog sorting for Apple TV+ hierarchy
 */
const sortCatalogsForDisplay = (catalogs: Catalog[]): Catalog[] => {
  return [...catalogs].sort((a, b) => {
    // Priority order matching Apple TV+ design patterns
    const getPriority = (catalog: Catalog): number => {
      const name = catalog.name.toLowerCase()
      if (name.includes('acting') || name.includes('cast')) return 1
      if (name.includes('movie') || name.includes('film')) return 2
      if (name.includes('tv') || name.includes('show')) return 3
      if (name.includes('directing')) return 4
      if (name.includes('writing')) return 5
      if (name.includes('producing')) return 6
      return 7
    }

    const aPriority = getPriority(a)
    const bPriority = getPriority(b)

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Secondary sort by item count (descending)
    return b.items.length - a.items.length
  })
}

/**
 * Render filmography item card with Apple TV+ styling
 */
const FilmographyItemCard: React.FC<{
  item: CatalogItem
  onPress: (item: CatalogItem) => void
  theme: Theme
}> = ({ item, onPress, theme }) => {
  const styles = createItemStyles(theme)

  // Get best available image (prefer poster, fallback to backdrop)
  const imageSource = item.posterUrl || item.backdropUrl

  // Extract year from release date
  const releaseYear = item.releaseDate
    ? new Date(item.releaseDate).getFullYear()
    : undefined

  return (
    <Pressable
      style={styles.itemCard}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}${releaseYear ? ` from ${releaseYear}` : ''}`}
    >
      {/* Poster Image */}
      <View style={styles.posterContainer}>
        {imageSource ? (
          <Image
            source={{ uri: imageSource }}
            style={styles.posterImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Ionicons
              name={item.mediaType === 'tv' ? 'tv-outline' : 'film-outline'}
              size={32}
              color={theme.colors.text.secondary}
            />
          </View>
        )}
      </View>

      {/* Title and Year */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {releaseYear && (
          <Text style={styles.itemYear}>
            {releaseYear}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

export const FilmographySection: React.FC<FilmographySectionProps> = observer(({
  person,
  catalogs,
  onItemPress,
  onLoadMore,
  isLoading = false,
  isFullyLoaded = false
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Process and sort catalogs for Apple TV+ presentation
  const displayCatalogs = React.useMemo(() => {
    const validCatalogs = catalogs.filter(catalog => catalog.items.length > 0)
    return sortCatalogsForDisplay(validCatalogs)
  }, [catalogs])

  // Handle load more for catalog
  const handleLoadMore = useCallback(async (catalogId: string) => {
    if (!onLoadMore) return

    try {
      await onLoadMore(catalogId)
    } catch (error) {
      // Error handled by parent component
      console.warn('Failed to load more filmography:', error)
    }
  }, [onLoadMore])

  // Don't render if no content and not loading
  if (displayCatalogs.length === 0 && !isLoading) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Initial Loading State */}
      {isLoading && displayCatalogs.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            Loading filmography...
          </Text>
        </View>
      )}

      {/* Filmography Content */}
      {displayCatalogs.length > 0 && (
        <>
          {displayCatalogs.map((catalog, catalogIndex) => {
            const sectionTitle = getFormattedSectionTitle(catalog, t)
            const hasMore = catalog.pagination?.hasMore ?? false

            return (
              <View key={catalog.id} style={styles.filmographySection}>
                {/* Section Header - Apple TV+ Style */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                  <Pressable
                    style={styles.seeAllButton}
                    onPress={() => {/* Navigate to full section view */}}
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.interactive.primary}
                    />
                  </Pressable>
                </View>

                {/* Horizontal Scroll Container */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                  style={styles.scrollContainer}
                >
                  {/* Filmography Items */}
                  {catalog.items.map((item, itemIndex) => (
                    <FilmographyItemCard
                      key={`${item.id}-${itemIndex}`}
                      item={item}
                      onPress={onItemPress}
                      theme={theme}
                    />
                  ))}

                  {/* Load More Button */}
                  {hasMore && onLoadMore && (
                    <Pressable
                      style={styles.loadMoreCard}
                      onPress={() => handleLoadMore(catalog.id)}
                    >
                      <View style={styles.loadMoreContent}>
                        <Ionicons
                          name="add-circle-outline"
                          size={32}
                          color={theme.colors.interactive.primary}
                        />
                        <Text style={styles.loadMoreText}>Load More</Text>
                      </View>
                    </Pressable>
                  )}
                </ScrollView>
              </View>
            )
          })}

          {/* Progressive Loading Indicator */}
          {isLoading && displayCatalogs.length > 0 && (
            <View style={styles.progressIndicator}>
              <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
              <Text style={styles.progressText}>
                Loading more content...
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  // Container - Apple TV+ Section Spacing
  container: {
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xl,
  },

  // Loading State - Initial Load
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '500',
  },

  // Filmography Section - Apple TV+ Layout
  filmographySection: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(24), // Large Apple TV+ section headers
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  seeAllText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },

  // Horizontal Scroll - Apple TV+ Style
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  // Load More Card
  loadMoreCard: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    borderStyle: 'dashed',
  },
  loadMoreContent: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  loadMoreText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    textAlign: 'center',
  },

  // Progress Indicator
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  progressText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
})

// Item Card Styles - Separate for reusability
const createItemStyles = (theme: Theme) => StyleSheet.create({
  itemCard: {
    width: ITEM_WIDTH,
    gap: theme.spacing.sm,
  },
  posterContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.secondary,
    ...theme.shadows.sm,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
  },
  itemInfo: {
    gap: theme.spacing.xs,
  },
  itemTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    lineHeight: moderateScale(18),
  },
  itemYear: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
})

FilmographySection.displayName = 'FilmographySection'