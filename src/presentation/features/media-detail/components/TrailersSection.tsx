/**
 * TrailersSection Component
 * 
 * Displays a horizontal scrolling list of video trailer thumbnails for media content.
 * Features video thumbnails with play indicators and metadata overlay.
 * Uses native React Native components with theme integration for consistent styling.
 * 
 * @component
 * @example
 * ```tsx
 * <TrailersSection
 *   trailers={trailers}
 *   onTrailerPress={handleTrailerPress}
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
 * Video trailer data structure
 */
export interface VideoTrailer {
  /** Unique identifier for the trailer */
  id: string
  /** Display title of the trailer */
  title: string
  /** Duration in seconds */
  duration: number
  /** Thumbnail image URL */
  thumbnailUrl: string
  /** Video quality (e.g., 'HD', '4K', 'SD') */
  quality?: string
  /** Video type (e.g., 'Trailer', 'Behind the Scenes', 'Featurette') */
  type?: string
  /** Video URL for playback */
  videoUrl: string
}

/**
 * Props for TrailersSection component
 */
interface TrailersSectionProps {
  /** Array of video trailers to display */
  trailers: VideoTrailer[]
  /** Callback when a trailer thumbnail is pressed */
  onTrailerPress: (trailer: VideoTrailer) => void
  /** Optional section title override */
  title?: string
  /** Whether to show the section header */
  showHeader?: boolean
}

/**
 * Individual trailer card component
 */
interface TrailerCardProps {
  trailer: VideoTrailer
  onPress: (trailer: VideoTrailer) => void
  theme: Theme
}

/**
 * Formats duration from seconds to MM:SS format
 */
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * TrailerCard - Individual trailer thumbnail with metadata overlay
 */
const TrailerCard: React.FC<TrailerCardProps> = observer(({ trailer, onPress, theme }) => {
  const styles = createTrailerCardStyles(theme)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(trailer)}
      accessibilityRole="button"
      accessibilityLabel={`Play trailer: ${trailer.title}`}
      accessibilityHint="Double tap to play video"
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: trailer.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        
        {/* Play button overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <View style={styles.playIcon} />
          </View>
        </View>

        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(trailer.duration)}
          </Text>
        </View>

        {/* Quality badge */}
        {trailer.quality && (
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>{trailer.quality}</Text>
          </View>
        )}
      </View>

      {/* Trailer metadata */}
      <View style={styles.metadata}>
        <Text style={styles.title} numberOfLines={2}>
          {trailer.title}
        </Text>
        {trailer.type && (
          <Text style={styles.type} numberOfLines={1}>
            {trailer.type}
          </Text>
        )}
      </View>
    </Pressable>
  )
})

/**
 * TrailersSection - Main component displaying horizontal scroll of trailers
 */
export const TrailersSection: React.FC<TrailersSectionProps> = observer(({
  trailers,
  onTrailerPress,
  title,
  showHeader = true
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createTrailersSectionStyles(theme)

  // Don't render if no trailers
  if (!trailers || trailers.length === 0) {
    return null
  }

  const sectionTitle = title ?? t('media_detail.trailers.title')

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sectionTitle}</Text>
          <Text style={styles.headerCount}>
            {trailers.length} {trailers.length === 1 ? 'trailer' : 'trailers'}
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={scale(200)}
        snapToAlignment="start"
        accessibilityLabel={`${sectionTitle} horizontal scroll`}
      >
        {trailers.map((trailer, index) => (
          <TrailerCard
            key={trailer.id}
            trailer={trailer}
            onPress={onTrailerPress}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  )
})

/**
 * Styles for TrailersSection component
 */
const createTrailersSectionStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  headerTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary
  },
  headerCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingRight: theme.spacing.xl
  }
})

/**
 * Styles for individual TrailerCard component
 */
const createTrailerCardStyles = (theme: Theme) => {
  const cardWidth = scale(180)
  const cardHeight = verticalScale(160)
  const thumbnailHeight = verticalScale(100)

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
    thumbnailContainer: {
      position: 'relative',
      width: '100%',
      height: thumbnailHeight,
      backgroundColor: theme.colors.background.tertiary
    },
    thumbnail: {
      width: '100%',
      height: '100%'
    },
    playOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },
    playButton: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.md
    },
    playIcon: {
      width: 0,
      height: 0,
      borderLeftWidth: scale(12),
      borderTopWidth: scale(8),
      borderBottomWidth: scale(8),
      borderLeftColor: theme.colors.text.primary,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      marginLeft: scale(2)
    },
    durationBadge: {
      position: 'absolute',
      bottom: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
      borderRadius: theme.radius.sm
    },
    durationText: {
      fontSize: moderateScale(10),
      color: '#FFFFFF',
      fontWeight: '600'
    },
    qualityBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
      borderRadius: theme.radius.sm
    },
    qualityText: {
      fontSize: moderateScale(10),
      color: theme.colors.text.inverse,
      fontWeight: '600'
    },
    metadata: {
      flex: 1,
      padding: theme.spacing.sm,
      justifyContent: 'space-between'
    },
    title: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: theme.typography.caption.lineHeight
    },
    type: {
      fontSize: moderateScale(10),
      color: theme.colors.text.secondary,
      marginTop: scale(2)
    }
  })
}

TrailerCard.displayName = 'TrailerCard'
TrailersSection.displayName = 'TrailersSection'

export default TrailersSection