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

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { scale, moderateScale, verticalScale } from 'react-native-size-matters'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'

/**
 * Media recommendation data structure
 */
export interface MediaRecommendation {
  /** Unique identifier for the media */
  id: string
  /** Media title */
  title: string
  /** Media overview/synopsis */
  overview: string
  /** Poster image URL */
  posterUrl: string
  /** Media type (movie, tv, etc.) */
  mediaType: 'movie' | 'tv' | 'person'
  /** Release date in ISO format */
  releaseDate?: string
  /** Media rating (0-10) */
  rating?: number
  /** Genre names */
  genres?: string[]
  /** Runtime in minutes */
  runtime?: number
  /** Number of seasons (for TV shows) */
  seasonCount?: number
  /** Popularity score */
  popularity?: number
  /** Whether the media is available for viewing */
  isAvailable?: boolean
}

/**
 * Recommendation catalog data structure
 */
export interface RecommendationCatalog {
  /** Unique identifier for the catalog */
  id: string
  /** Catalog title (e.g., "Recommended for You", "Similar Movies") */
  title: string
  /** Catalog description */
  description?: string
  /** Array of recommended media */
  media: MediaRecommendation[]
  /** Catalog type for analytics */
  catalogType: 'recommended' | 'similar' | 'trending' | 'popular' | 'related'
  /** Algorithm used for recommendations */
  algorithm?: string
}

/**
 * Props for RecommendationsSection component
 */
interface RecommendationsSectionProps {
  /** Array of recommendation catalogs to display */
  catalogs: RecommendationCatalog[]
  /** Callback when a media item is pressed */
  onMediaPress: (media: MediaRecommendation, catalog: RecommendationCatalog) => void
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
  media: MediaRecommendation
  catalog: RecommendationCatalog
  onPress: (media: MediaRecommendation, catalog: RecommendationCatalog) => void
  theme: Theme
  showRating?: boolean
}

/**
 * Props for RecommendationCatalogRow component
 */
interface RecommendationCatalogRowProps {
  catalog: RecommendationCatalog
  onMediaPress: (media: MediaRecommendation, catalog: RecommendationCatalog) => void
  theme: Theme
  maxMedia?: number
  showRatings?: boolean
}

/**
 * Format release year from ISO date
 */
const formatReleaseYear = (releaseDate?: string): string => {
  if (!releaseDate) return ''
  const year = new Date(releaseDate).getFullYear()
  return year ? `${year}` : ''
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
      return seasonCount ? `${seasonCount} Season${seasonCount > 1 ? 's' : ''}` : 'TV Series'
    case 'movie':
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
  const releaseYear = formatReleaseYear(media.releaseDate)
  const mediaTypeText = getMediaTypeText(media.mediaType, media.seasonCount)
  const runtimeText = formatRuntime(media.runtime)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        !media.isAvailable && styles.unavailableCard
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
        {showRating && media.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {media.rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Unavailable overlay */}
        {!media.isAvailable && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Coming Soon</Text>
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
        {media.genres && media.genres.length > 0 && (
          <View style={styles.genresContainer}>
            <Text style={styles.genres} numberOfLines={1}>
              {media.genres.slice(0, 2).join(' • ')}
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
  theme,
  maxMedia = 20,
  showRatings = true
}) => {
  const { t } = useTranslation()
  const styles = createRecommendationCatalogRowStyles(theme)

  // Limit the number of media items displayed
  const displayMedia = catalog.media.slice(0, maxMedia)

  if (displayMedia.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Catalog header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{catalog.title}</Text>
          {catalog.description && (
            <Text style={styles.description}>{catalog.description}</Text>
          )}
        </View>
        <Text style={styles.count}>
          {catalog.media.length} {catalog.media.length === 1 ? 'item' : 'items'}
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
        accessibilityLabel={`${catalog.title} horizontal scroll`}
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

        {/* Show more indicator if there are more items */}
        {catalog.media.length > maxMedia && (
          <Pressable
            style={styles.showMoreCard}
            onPress={() => {
              // This could navigate to a full recommendations screen
              // For now, we'll just trigger the callback with a special media item
              const moreMedia: MediaRecommendation = {
                id: 'show-more',
                title: t('media_detail.recommendations.show_more'),
                overview: '',
                posterUrl: '',
                mediaType: 'movie'
              }
              onMediaPress(moreMedia, catalog)
            }}
            accessibilityRole="button"
            accessibilityLabel={`Show all ${catalog.title}`}
          >
            <View style={styles.showMoreContent}>
              <Text style={styles.showMoreText}>
                +{catalog.media.length - maxMedia}
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
  title,
  showHeader = true,
  maxMediaPerCatalog = 20,
  showRatings = true
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createRecommendationsSectionStyles(theme)

  // Filter out empty catalogs
  const validCatalogs = catalogs.filter(catalog => catalog.media.length > 0)

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