/**
 * SeasonsView Component
 * 
 * Displays season selector and episode list for TV series content.
 * Features expandable episode details, episode selection, and season navigation.
 * Uses native React Native components with theme integration for consistent styling.
 * 
 * @component
 * @example
 * ```tsx
 * <SeasonsView
 *   seasons={seasons}
 *   selectedSeasonId={selectedSeasonId}
 *   onSeasonSelect={handleSeasonSelect}
 *   onEpisodePress={handleEpisodePress}
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
  FlatList,
  ListRenderItem
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { scale, moderateScale, verticalScale } from 'react-native-size-matters'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { Season } from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'
import type { EpisodeInfo } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Props for SeasonsView component
 */
interface SeasonsViewProps {
  /** Array of seasons to display (now from enriched data as Season[]) */
  seasons: Season[]
  /** Currently selected season ID */
  selectedSeasonId?: string
  /** Callback when a season is selected */
  onSeasonSelect: (seasonId: string) => void
  /** Callback when an episode is pressed */
  onEpisodePress: (episode: EpisodeInfo, season: Season) => void
  /** Optional section title override */
  title?: string
  /** Whether to show season selector */
  showSeasonSelector?: boolean
}

/**
 * Props for EpisodeCard component
 */
interface EpisodeCardProps {
  episode: EpisodeInfo
  season: Season
  onPress: (episode: EpisodeInfo, season: Season) => void
  theme: Theme
  isExpanded: boolean
  onToggleExpanded: () => void
}

/**
 * Props for SeasonSelector component
 */
interface SeasonSelectorProps {
  seasons: Season[]
  selectedSeasonId?: string
  onSeasonSelect: (seasonId: string) => void
  theme: Theme
}

/**
 * Formats duration from minutes to hours and minutes
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Formats air date to readable format from Date object or string
 */
const formatAirDate = (airDate: Date | string | undefined): string => {
  if (!airDate) return ''
  const date = airDate instanceof Date ? airDate : new Date(airDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * SeasonSelector - Horizontal scrolling season picker
 */
const SeasonSelector: React.FC<SeasonSelectorProps> = observer(({
  seasons,
  selectedSeasonId,
  onSeasonSelect,
  theme
}) => {
  const { t } = useTranslation()
  const styles = createSeasonSelectorStyles(theme)

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel={t('media_detail.seasons.selector_accessibility')}
      >
        {seasons.map((season) => {
          const isSelected = season.id === selectedSeasonId
          
          return (
            <Pressable
              key={season.id}
              style={({ pressed }) => [
                styles.seasonButton,
                isSelected && styles.seasonButtonSelected,
                pressed && styles.seasonButtonPressed
              ]}
              onPress={() => onSeasonSelect(season.id)}
              accessibilityRole="button"
              accessibilityLabel={`${season.name} - ${season.episodeCount} episodes`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.seasonText,
                  isSelected && styles.seasonTextSelected
                ]}
                numberOfLines={1}
              >
                {season.name}
              </Text>
              <Text
                style={[
                  styles.episodeCount,
                  isSelected && styles.episodeCountSelected
                ]}
              >
                {season.episodeCount} {season.episodeCount === 1 ? 'episode' : 'episodes'}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
})

/**
 * EpisodeCard - Individual episode with expandable details
 */
const EpisodeCard: React.FC<EpisodeCardProps> = observer(({
  episode,
  season,
  onPress,
  theme,
  isExpanded,
  onToggleExpanded
}) => {
  const { t } = useTranslation()
  const styles = createEpisodeCardStyles(theme)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(episode, season)}
      accessibilityRole="button"
      accessibilityLabel={`Episode ${episode.episodeNumber}: ${episode.name}`}
      accessibilityHint="Double tap to play episode"
    >
      <View style={styles.content}>
        {/* Episode thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: episode.stillUrl || '' }}
            style={styles.thumbnail}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          
          {/* Watch status indicator - using runtime as presence indicator */}
          {episode.runtime && episode.runtime > 0 && (
            <View style={styles.watchedBadge}>
              <View style={styles.watchedIcon} />
            </View>
          )}
        </View>

        {/* Episode details */}
        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.episodeNumber}>
              Episode {episode.episodeNumber}
            </Text>
            <Text style={styles.duration}>
              {formatDuration(episode.runtime || 0)}
            </Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {episode.name}
          </Text>

          <Text style={styles.airDate}>
            {formatAirDate(episode.airDate)}
          </Text>

          {episode.voteAverage && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                ★ {episode.voteAverage.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Synopsis - collapsible */}
          <Pressable
            style={styles.synopsisContainer}
            onPress={onToggleExpanded}
            accessibilityRole="button"
            accessibilityLabel={isExpanded ? t('media_detail.episodes.collapse') : t('media_detail.episodes.expand')}
          >
            <Text
              style={styles.synopsis}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {episode.overview || 'No description available.'}
            </Text>
            
            {episode.overview && episode.overview.length > 100 && (
              <Text style={styles.expandText}>
                {isExpanded 
                  ? t('media_detail.episodes.show_less')
                  : t('media_detail.episodes.show_more')
                }
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
})

/**
 * SeasonsView - Main component displaying seasons and episodes
 */
export const SeasonsView: React.FC<SeasonsViewProps> = observer(({
  seasons,
  selectedSeasonId,
  onSeasonSelect,
  onEpisodePress,
  title,
  showSeasonSelector = true
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createSeasonsViewStyles(theme)
  
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set())

  // Find selected season or default to first season
  const selectedSeason = selectedSeasonId 
    ? seasons.find(s => s.id === selectedSeasonId) 
    : seasons[0]

  const handleToggleExpanded = useCallback((episodeId: string) => {
    setExpandedEpisodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId)
      } else {
        newSet.add(episodeId)
      }
      return newSet
    })
  }, [])

  const renderEpisode: ListRenderItem<EpisodeInfo> = useCallback(({ item: episode }) => {
    if (!selectedSeason) return null

    return (
      <EpisodeCard
        episode={episode}
        season={selectedSeason}
        onPress={onEpisodePress}
        theme={theme}
        isExpanded={expandedEpisodes.has(String(episode.id))}
        onToggleExpanded={() => handleToggleExpanded(String(episode.id))}
      />
    )
  }, [selectedSeason, onEpisodePress, theme, expandedEpisodes, handleToggleExpanded])

  // Don't render if no seasons
  if (!seasons || seasons.length === 0) {
    return null
  }

  const sectionTitle = title ?? t('media_detail.seasons.title')

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
        {selectedSeason && (
          <Text style={styles.headerSubtitle}>
            {selectedSeason.overview || ''}
          </Text>
        )}
      </View>

      {/* Season selector */}
      {showSeasonSelector && seasons.length > 1 && (
        <SeasonSelector
          seasons={seasons}
          selectedSeasonId={selectedSeasonId}
          onSeasonSelect={onSeasonSelect}
          theme={theme}
        />
      )}

      {/* Episodes list */}
      {selectedSeason && (
        <FlatList
          data={selectedSeason.episodes}
          renderItem={renderEpisode}
          keyExtractor={(episode) => String(episode.id || `episode-${episode.episodeNumber}`)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.episodesList}
          accessibilityLabel={`${selectedSeason.name} episodes list`}
        />
      )}
    </View>
  )
})

/**
 * Styles for SeasonsView component
 */
const createSeasonsViewStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  headerTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  headerSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.body.lineHeight
  },
  episodesList: {
    paddingBottom: theme.spacing.xl
  }
})

/**
 * Styles for SeasonSelector component
 */
const createSeasonSelectorStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingRight: theme.spacing.xl
  },
  seasonButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minWidth: scale(120),
    alignItems: 'center'
  },
  seasonButtonSelected: {
    backgroundColor: theme.colors.interactive.primary,
    borderColor: theme.colors.interactive.primary
  },
  seasonButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  seasonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  seasonTextSelected: {
    color: theme.colors.text.inverse
  },
  episodeCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: scale(2)
  },
  episodeCountSelected: {
    color: theme.colors.text.inverse,
    opacity: 0.8
  }
})

/**
 * Styles for EpisodeCard component
 */
const createEpisodeCardStyles = (theme: Theme) => {
  const thumbnailWidth = scale(120)
  const thumbnailHeight = verticalScale(68)

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.secondary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      ...theme.shadows.sm
    },
    cardPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }]
    },
    content: {
      flexDirection: 'row',
      padding: theme.spacing.sm
    },
    thumbnailContainer: {
      position: 'relative',
      width: thumbnailWidth,
      height: thumbnailHeight,
      borderRadius: theme.radius.sm,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.tertiary
    },
    thumbnail: {
      width: '100%',
      height: '100%'
    },
    watchedBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      width: scale(16),
      height: scale(16),
      borderRadius: scale(8),
      backgroundColor: theme.colors.interactive.primary,
      justifyContent: 'center',
      alignItems: 'center'
    },
    watchedIcon: {
      width: 0,
      height: 0,
      borderLeftWidth: scale(6),
      borderTopWidth: scale(4),
      borderBottomWidth: scale(4),
      borderLeftColor: theme.colors.text.inverse,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      marginLeft: scale(1)
    },
    unavailableOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    unavailableText: {
      fontSize: moderateScale(10),
      color: '#FFFFFF',
      fontWeight: '600',
      textAlign: 'center'
    },
    details: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      justifyContent: 'space-between'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs
    },
    episodeNumber: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: '600',
      color: theme.colors.interactive.primary
    },
    duration: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary
    },
    title: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: theme.typography.body.lineHeight,
      marginBottom: theme.spacing.xs
    },
    airDate: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs
    },
    ratingContainer: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing.xs
    },
    rating: {
      fontSize: theme.typography.caption.fontSize,
      color: '#FFD700',
      fontWeight: '600'
    },
    synopsisContainer: {
      flex: 1
    },
    synopsis: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.caption.lineHeight
    },
    expandText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.interactive.primary,
      fontWeight: '600',
      marginTop: theme.spacing.xs
    }
  })
}

SeasonSelector.displayName = 'SeasonSelector'
EpisodeCard.displayName = 'EpisodeCard'
SeasonsView.displayName = 'SeasonsView'

export default SeasonsView