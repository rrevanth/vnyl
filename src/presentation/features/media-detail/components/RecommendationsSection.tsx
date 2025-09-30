/**
 * RecommendationsSection Component
 * 
 * Displays recommendation catalogs (Recommended, Similar) for media content.
 * Uses the existing CatalogRow component pattern for consistency with the app's design system.
 * Features horizontal scrolling media cards with proper accessibility and navigation.
 * 
 * @component
 * @example
 * ```tsx
 * <RecommendationsSection
 *   catalogs={recommendationCatalogs}
 *   onMediaPress={handleMediaPress}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { scale, moderateScale, verticalScale } from 'react-native-size-matters'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Helper functions for extracting data from CatalogItem
 */

/**
 * Format release year from CatalogItem
 */
const getMediaReleaseYear = (media: CatalogItem): string => {
  if (media.releaseDate) {
    const year = new Date(media.releaseDate).getFullYear()
    return year ? `${year}` : ''
  }
  return ''
}

/**
 * Get media rating from CatalogItem
 */
const getMediaRating = (media: CatalogItem): number | undefined => {
  return media.voteAverage
}

/**
 * Get media genres from CatalogItem
 */
const getMediaGenres = (media: CatalogItem): string[] => {
  return media.genres || []
}

/**
 * Get runtime from CatalogItem (for movies)
 */
const getMediaRuntime = (media: CatalogItem): number | undefined => {
  if ('runtime' in media) {
    return (media as any).runtime
  }
  return undefined
}

/**
 * Get season count from CatalogItem (for TV shows)
 */
const getMediaSeasonCount = (media: CatalogItem): number | undefined => {
  if ('numberOfSeasons' in media) {
    return (media as any).numberOfSeasons
  }
  return undefined
}

/**
 * Props for RecommendationsSection component
 */
interface RecommendationsSectionProps {
  /** Array of recommendation catalogs to display (now coming from enriched data as Catalog[]) */
  catalogs: Catalog[]
  /** Callback when a media item is pressed */
  onMediaPress: (media: CatalogItem, catalog: Catalog) => void
  /** Callback when load more is requested for a catalog */
  onLoadMore?: (catalogId: string) => Promise<void>
  /** Optional section title override */
  title?: string
  /** Whether to show the section header */
  showHeader?: boolean
  /** Maximum number of media items to show per catalog */
  maxMediaPerCatalog?: number
  /** Whether to show ratings on media cards */
  showRatings?: boolean
}

/**
 * Props for MediaCard component
 */
interface MediaCardProps {
  media: CatalogItem
  catalog: Catalog
  onPress: (media: CatalogItem, catalog: Catalog) => void
  theme: Theme
  showRating?: boolean
}

/**
 * Props for RecommendationCatalogRow component
 */
interface RecommendationCatalogRowProps {
  catalog: Catalog
  onMediaPress: (media: CatalogItem, catalog: Catalog) => void
  onLoadMore?: (catalogId: string) => Promise<void>
  theme: Theme
  maxMedia?: number
  showRatings?: boolean
}

/**
 * Format runtime to readable format
 */
const formatRuntime = (minutes?: number): string => {
  if (!minutes) return ''
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Get media type display text
 */
const getMediaTypeText = (mediaType: string, seasonCount?: number): string => {
  switch (mediaType) {
    case 'tv':
    case 'TV_SERIES':
      return seasonCount ? `${seasonCount} Season${seasonCount > 1 ? 's' : ''}` : 'TV Series'
    case 'movie':
    case 'MOVIE':
      return 'Movie'
    default:
      return ''
  }
}

/**
 * MediaCard - Individual recommendation card with poster and metadata
 */
const MediaCard: React.FC<MediaCardProps> = observer(({
  media,
  catalog,
  onPress,
  theme,
  showRating = true
}) => {
  const styles = createMediaCardStyles(theme)
  const releaseYear = getMediaReleaseYear(media)
  const mediaRating = getMediaRating(media)
  const genres = getMediaGenres(media)
  const runtime = getMediaRuntime(media)
  const seasonCount = getMediaSeasonCount(media)
  const mediaTypeText = getMediaTypeText(media.mediaType, seasonCount)
  const runtimeText = formatRuntime(runtime)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(media, catalog)}
      accessibilityRole="button"
      accessibilityLabel={`${media.title}${releaseYear ? ` (${releaseYear})` : ''}`}
      accessibilityHint="Double tap to view details"
    >
      {/* Poster image */}
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: media.posterUrl }}
          style={styles.poster}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        
        {/* Rating badge */}
        {showRating && mediaRating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {mediaRating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Popular indicator */}
        {media.popularity && media.popularity > 80 && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>🔥</Text>
          </View>
        )}
      </View>

      {/* Media metadata */}
      <View style={styles.metadata}>
        <Text style={styles.title} numberOfLines={2}>
          {media.title}
        </Text>
        
        <View style={styles.subtitleRow}>
          {releaseYear && (
            <Text style={styles.year}>{releaseYear}</Text>
          )}
          {mediaTypeText && (
            <Text style={styles.mediaType}>{mediaTypeText}</Text>
          )}
        </View>

        {runtimeText && (
          <Text style={styles.runtime}>{runtimeText}</Text>
        )}

        {/* Genres */}
        {genres && genres.length > 0 && (
          <View style={styles.genresContainer}>
            <Text style={styles.genres} numberOfLines={1}>
              {genres.slice(0, 2).join(' • ')}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
})

/**
 * RecommendationCatalogRow - Horizontal scrolling row for a specific catalog
 */
const RecommendationCatalogRow: React.FC<RecommendationCatalogRowProps> = observer(({
  catalog,
  onMediaPress,
  onLoadMore,
  theme,
  maxMedia = 20,
  showRatings = true
}) => {
  const { t } = useTranslation()
  const styles = createRecommendationCatalogRowStyles(theme)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Limit the number of media items displayed
  const displayMedia = catalog.items.slice(0, maxMedia)
  
  // Handle load more functionality
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !catalog.pagination.hasMore || !onLoadMore) {
      return
    }
    
    try {
      setIsLoadingMore(true)
      await onLoadMore(catalog.id)
    } catch (error) {
      // Error handling is done by the parent component
      console.warn('Failed to load more recommendations:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, catalog.pagination.hasMore, catalog.id, onLoadMore])

  if (displayMedia.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Catalog header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{catalog.name}</Text>
        </View>
        <Text style={styles.count}>
          {catalog.items.length} {catalog.items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Horizontal scrolling media list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={scale(140)}
        snapToAlignment="start"
        accessibilityLabel={`${catalog.name} horizontal scroll`}
      >
        {displayMedia.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            catalog={catalog}
            onPress={onMediaPress}
            theme={theme}
            showRating={showRatings}
          />
        ))}

        {/* Load More button or loading indicator */}
        {catalog.pagination.hasMore && onLoadMore && (
          <>
            {isLoadingMore ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator 
                  size="small" 
                  color={theme.colors.interactive.primary}
                  accessibilityLabel={t('common.loading')}
                />
                <Text style={styles.loadingText}>
                  {t('common.loading')}
                </Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.loadMoreCard,
                  pressed && styles.loadMorePressed
                ]}
                onPress={handleLoadMore}
                accessibilityRole="button"
                accessibilityLabel={`Load more ${catalog.name}`}
                accessibilityHint="Double tap to load more recommendations"
              >
                <View style={styles.loadMoreContent}>
                  <Text style={styles.loadMoreText}>
                    {t('common.load_more')}
                  </Text>
                  <Text style={styles.loadMoreLabel}>
                    {catalog.pagination.totalItems 
                      ? `${catalog.items.length} of ${catalog.pagination.totalItems}`
                      : `${catalog.items.length} items`
                    }
                  </Text>
                </View>
              </Pressable>
            )}
          </>
        )}

        {/* Show more indicator if there are more items (fallback for when loadMore is not available) */}
        {catalog.items.length > maxMedia && !catalog.pagination.hasMore && (
          <Pressable
            style={styles.showMoreCard}
            onPress={() => {
              // This could navigate to a full recommendations screen
              // For now, we'll just trigger the callback with a placeholder item
              const moreMedia: CatalogItem = {
                id: 'show-more',
                title: t('media_detail.recommendations.show_more'),
                overview: '',
                posterUrl: '',
                backdropUrl: '',
                mediaType: catalog.mediaType,
                externalIds: {},
                contentContext: catalog.catalogContext,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              onMediaPress(moreMedia, catalog)
            }}
            accessibilityRole="button"
            accessibilityLabel={`Show all ${catalog.name}`}
          >
            <View style={styles.showMoreContent}>
              <Text style={styles.showMoreText}>
                +{catalog.items.length - maxMedia}
              </Text>
              <Text style={styles.showMoreLabel}>
                {t('media_detail.recommendations.more')}
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
})

/**
 * RecommendationsSection - Main component displaying multiple recommendation catalogs
 */
export const RecommendationsSection: React.FC<RecommendationsSectionProps> = observer(({
  catalogs,
  onMediaPress,
  onLoadMore,
  title,
  showHeader = true,
  maxMediaPerCatalog = 20,
  showRatings = true
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createRecommendationsSectionStyles(theme)

  // Filter out empty catalogs
  const validCatalogs = catalogs.filter(catalog => catalog.items.length > 0)

  // Don't render if no valid catalogs
  if (validCatalogs.length === 0) {
    return null
  }

  const sectionTitle = title ?? t('media_detail.recommendations.title')

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sectionTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {t('media_detail.recommendations.subtitle')}
          </Text>
        </View>
      )}

      {/* Render each recommendation catalog */}
      {validCatalogs.map((catalog) => (
        <RecommendationCatalogRow
          key={catalog.id}
          catalog={catalog}
          onMediaPress={onMediaPress}
          onLoadMore={onLoadMore}
          theme={theme}
          maxMedia={maxMediaPerCatalog}
          showRatings={showRatings}
        />
      ))}
    </View>
  )
})

/**
 * Styles for RecommendationsSection component
 */
const createRecommendationsSectionStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  headerTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  headerSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary
  }
})

/**
 * Styles for RecommendationCatalogRow component
 */
const createRecommendationCatalogRowStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  count: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingRight: theme.spacing.xl
  },
  showMoreCard: {
    width: scale(120),
    height: verticalScale(220),
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  showMoreContent: {
    alignItems: 'center'
  },
  showMoreText: {
    fontSize: moderateScale(24),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  showMoreLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  },
  loadingCard: {
    width: scale(120),
    height: verticalScale(220),
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm
  },
  loadingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center'
  },
  loadMoreCard: {
    width: scale(120),
    height: verticalScale(220),
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md
  },
  loadMorePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  loadMoreContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadMoreText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.xs
  },
  loadMoreLabel: {
    fontSize: moderateScale(10),
    color: theme.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.8
  }
})

/**
 * Styles for MediaCard component
 */
const createMediaCardStyles = (theme: Theme) => {
  const cardWidth = scale(120)
  const cardHeight = verticalScale(220)
  const posterHeight = verticalScale(160)

  return StyleSheet.create({
    card: {
      width: cardWidth,
      height: cardHeight,
      marginRight: theme.spacing.sm,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      ...theme.shadows.sm
    },
    cardPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }]
    },
    unavailableCard: {
      opacity: 0.7
    },
    posterContainer: {
      position: 'relative',
      width: '100%',
      height: posterHeight,
      backgroundColor: theme.colors.background.tertiary
    },
    poster: {
      width: '100%',
      height: '100%'
    },
    ratingBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      left: theme.spacing.xs,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
      borderRadius: theme.radius.sm
    },
    ratingText: {
      fontSize: moderateScale(10),
      color: '#FFD700',
      fontWeight: '600'
    },
    unavailableOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingVertical: scale(4),
      alignItems: 'center'
    },
    unavailableText: {
      fontSize: moderateScale(10),
      color: '#FFFFFF',
      fontWeight: '600'
    },
    popularBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: 'rgba(255, 69, 0, 0.9)',
      paddingHorizontal: scale(4),
      paddingVertical: scale(2),
      borderRadius: theme.radius.sm
    },
    popularText: {
      fontSize: moderateScale(10)
    },
    metadata: {
      flex: 1,
      padding: theme.spacing.xs,
      justifyContent: 'space-between'
    },
    title: {
      fontSize: moderateScale(11),
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: moderateScale(14),
      marginBottom: theme.spacing.xs
    },
    subtitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: scale(2)
    },
    year: {
      fontSize: moderateScale(9),
      color: theme.colors.text.secondary,
      fontWeight: '500'
    },
    mediaType: {
      fontSize: moderateScale(9),
      color: theme.colors.interactive.primary,
      fontWeight: '500'
    },
    runtime: {
      fontSize: moderateScale(9),
      color: theme.colors.text.secondary,
      marginBottom: scale(2)
    },
    genresContainer: {
      marginTop: 'auto'
    },
    genres: {
      fontSize: moderateScale(8),
      color: theme.colors.text.secondary,
      lineHeight: moderateScale(10)
    }
  })
}

MediaCard.displayName = 'MediaCard'
RecommendationCatalogRow.displayName = 'RecommendationCatalogRow'
RecommendationsSection.displayName = 'RecommendationsSection'

export default RecommendationsSection