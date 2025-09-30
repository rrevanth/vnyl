/**
 * ProgressiveSeasonsView Component
 * 
 * Displays seasons and episodes with HORIZONTAL infinite scrolling, following CatalogRow pattern.
 * Features season dropdown selector and horizontal poster-style episode cards.
 * Uses Legend State for reactive state management and LegendList for optimal performance.
 * 
 * Key Features:
 * - Progressive season loading (load Season 1 on mount, additional seasons on demand)
 * - Fixed header with season dropdown for navigation
 * - HORIZONTAL infinite scrolling episodes list with poster-style cards
 * - Smart navigation that updates dropdown based on visible episodes
 * - Individual season loading states and error handling
 * - Accessibility support with proper labels and roles
 * 
 * @component
 * @example
 * ```tsx
 * <ProgressiveSeasonsView
 *   catalogItem={tvSeriesItem}
 *   seasonMetadata={seasonMetadata}
 *   onEpisodePress={handleEpisodePress}
 *   title="Episodes"
 * />
 * ```
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  ViewabilityConfig,
  ViewToken
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { LegendList } from '@legendapp/list'
import { scale, verticalScale } from 'react-native-size-matters'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useDI } from '@/src/infrastructure/di/hooks'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { CatalogItem, EpisodeInfo } from '@/src/domain/entities/media/catalog-item.entity'
import type { Season, SeasonMetadata } from '@/src/domain/providers/seasons/seasons-episodes-provider.interface'
import type { LoadSeasonEpisodesUseCase } from '@/src/domain/usecases/media/load-season-episodes.usecase'

/**
 * Props for ProgressiveSeasonsView component
 */
interface ProgressiveSeasonsViewProps {
  /** The TV series catalog item for loading seasons */
  readonly catalogItem: CatalogItem
  
  /** Season metadata array for initial display */
  readonly seasonMetadata: SeasonMetadata[]
  
  /** Callback when an episode is pressed */
  readonly onEpisodePress: (episode: EpisodeInfo, season: Season) => void
  
  /** Optional section title override */
  readonly title?: string
}

/**
 * Props for EpisodeCard component in horizontal list (poster-style)
 */
interface HorizontalEpisodeCardProps {
  readonly episode: EpisodeInfo
  readonly season: Season
  readonly onPress: (episode: EpisodeInfo, season: Season) => void
  readonly theme: Theme
  readonly index: number
  readonly isFirstItem: boolean
  readonly isLastItem: boolean
}

/**
 * Props for SeasonDropdown component
 */
interface SeasonDropdownProps {
  readonly seasonMetadata: SeasonMetadata[]
  readonly currentSeasonNumber: number
  readonly onSeasonSelect: (seasonNumber: number) => void
  readonly theme: Theme
  readonly loadedSeasonsMap: Map<number, Season>
  readonly isLoadingSeasonNumber: number | null
}

/**
 * Item type for the flat episodes list with season context
 */
interface FlatEpisodeItem {
  readonly episode: EpisodeInfo
  readonly season: Season
  readonly key: string
}

/**
 * Loading state for individual seasons
 */
interface SeasonLoadingState {
  readonly isLoading: boolean
  readonly hasError: boolean
  readonly errorMessage?: string
}


/**
 * SeasonDropdown - Fixed header dropdown for season selection
 */
const SeasonDropdown: React.FC<SeasonDropdownProps> = observer(({
  seasonMetadata,
  currentSeasonNumber,
  onSeasonSelect,
  theme,
  loadedSeasonsMap,
  isLoadingSeasonNumber
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const styles = createSeasonDropdownStyles(theme)

  const handleSeasonPress = useCallback((seasonNumber: number) => {
    setIsOpen(false)
    onSeasonSelect(seasonNumber)
  }, [onSeasonSelect])

  const currentSeason = seasonMetadata.find(s => s.seasonNumber === currentSeasonNumber)
  const isLoading = isLoadingSeasonNumber === currentSeasonNumber

  return (
    <View style={styles.container}>
      {/* Dropdown trigger */}
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
          isOpen && styles.triggerOpen
        ]}
        onPress={() => setIsOpen(!isOpen)}
        accessibilityRole="button"
        accessibilityLabel={`${currentSeason?.name || `Season ${currentSeasonNumber}`} - Season selector`}
        accessibilityHint={t('mediaDetail.seasonsDetail.season_selector_hint')}
        accessibilityState={{ expanded: isOpen }}
      >
        <View style={styles.triggerContent}>
          <Text style={styles.seasonTitle} numberOfLines={1}>
            {currentSeason?.name || `Season ${currentSeasonNumber}`}
          </Text>
          <Text style={styles.episodeCount}>
            {loadedSeasonsMap.has(currentSeasonNumber) 
              ? `${loadedSeasonsMap.get(currentSeasonNumber)?.episodes.length || 0} ${loadedSeasonsMap.get(currentSeasonNumber)?.episodes.length === 1 ? t('mediaDetail.seasonsDetail.episode_singular') : t('mediaDetail.seasonsDetail.episode_plural')}`
              : `${currentSeason?.episodeCount || 0} ${currentSeason?.episodeCount === 1 ? t('mediaDetail.seasonsDetail.episode_singular') : t('mediaDetail.seasonsDetail.episode_plural')}`
            }
          </Text>
        </View>
        
        <View style={styles.triggerActions}>
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>{t('mediaDetail.seasonsDetail.loading_text')}</Text>
            </View>
          )}
          <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>
            ▼
          </Text>
        </View>
      </Pressable>

      {/* Dropdown menu */}
      {isOpen && (
        <View style={styles.dropdown}>
          {seasonMetadata.map((season) => {
            const isCurrentSeason = season.seasonNumber === currentSeasonNumber
            const isSeasonLoading = isLoadingSeasonNumber === season.seasonNumber
            const isSeasonLoaded = loadedSeasonsMap.has(season.seasonNumber)
            
            return (
              <Pressable
                key={season.id}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  isCurrentSeason && styles.dropdownItemSelected,
                  pressed && styles.dropdownItemPressed
                ]}
                onPress={() => handleSeasonPress(season.seasonNumber)}
                accessibilityRole="button"
                accessibilityLabel={`${season.name} - ${season.episodeCount} episodes`}
                accessibilityState={{ selected: isCurrentSeason }}
                disabled={isSeasonLoading}
              >
                <View style={styles.dropdownItemContent}>
                  <Text 
                    style={[
                      styles.dropdownSeasonName,
                      isCurrentSeason && styles.dropdownSeasonNameSelected
                    ]}
                    numberOfLines={1}
                  >
                    {season.name}
                  </Text>
                  <Text 
                    style={[
                      styles.dropdownEpisodeCount,
                      isCurrentSeason && styles.dropdownEpisodeCountSelected
                    ]}
                  >
                    {season.episodeCount} {season.episodeCount === 1 ? t('mediaDetail.seasonsDetail.episode_singular') : t('mediaDetail.seasonsDetail.episode_plural')}
                  </Text>
                </View>
                
                <View style={styles.dropdownItemStatus}>
                  {isSeasonLoading && (
                    <Text style={styles.statusText}>{t('mediaDetail.seasonsDetail.loading_text')}</Text>
                  )}
                  {isSeasonLoaded && !isSeasonLoading && (
                    <Text style={styles.statusText}>✓</Text>
                  )}
                </View>
              </Pressable>
            )
          })}
        </View>
      )}
    </View>
  )
})

/**
 * HorizontalEpisodeCard - Individual episode card with overlay text (banner-style)
 */
const HorizontalEpisodeCard: React.FC<HorizontalEpisodeCardProps> = observer(({
  episode,
  season,
  onPress,
  theme,
  index,
  isFirstItem,
  isLastItem
}) => {
  const { t, formatMessage } = useTranslation()
  const styles = createHorizontalEpisodeCardStyles(theme, isFirstItem, isLastItem)

  // Comprehensive safety validation
  if (!episode || !season) {
    console.warn('[ProgressiveSeasonsView] Missing episode or season data', { episode, season, index })
    return null
  }

  // Safe string extraction with extensive validation
  const getSafeString = (value: any, fallback: string): string => {
    if (value === null || value === undefined) {
      return fallback
    }
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : fallback
    }
    if (typeof value === 'number') {
      return String(value)
    }
    return fallback
  }

  const getSafeNumber = (value: any, fallback: number): number => {
    if (typeof value === 'number' && !isNaN(value) && value > 0) {
      return value
    }
    return fallback
  }

  // Create completely safe episode data
  const episodeNumber = getSafeNumber(episode.episodeNumber, index + 1)
  const seasonNumber = getSafeNumber(season.seasonNumber, 1)
  const episodeName = getSafeString(episode.name, formatMessage('mediaDetail.episodes.episode_title', { number: episodeNumber }))
  const episodeOverview = getSafeString(episode.overview, '')
  const stillUrl = getSafeString(episode.stillUrl, '')
  const runtime = getSafeNumber(episode.runtime, 0)
  const voteAverage = getSafeNumber(episode.voteAverage, 0)
  
  // Safe date handling
  const airDateText = (() => {
    try {
      if (episode.airDate) {
        const date = episode.airDate instanceof Date ? episode.airDate : new Date(episode.airDate)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      }
    } catch {
      // Ignore date parsing errors
    }
    return t('mediaDetail.episodes.no_air_date')
  })()

  // Safe runtime formatting
  const runtimeText = (() => {
    if (runtime > 0) {
      if (runtime < 60) {
        return `${Math.floor(runtime)}${t('mediaDetail.episodes.minutes_short')}`
      }
      const hours = Math.floor(runtime / 60)
      const minutes = Math.floor(runtime % 60)
      return minutes > 0 ? `${hours}${t('mediaDetail.episodes.hours_short')} ${minutes}${t('mediaDetail.episodes.minutes_short')}` : `${hours}${t('mediaDetail.episodes.hours_short')}`
    }
    return t('mediaDetail.episodes.no_runtime')
  })()

  // Safe image URL
  const imageUrl = stillUrl.length > 0 
    ? stillUrl 
    : 'https://via.placeholder.com/280x160/333333/FFFFFF?text=No+Image'

  // Safe episode text that will definitely render
  const episodeBadgeText = formatMessage('mediaDetail.episodes.season_episode_format', { season: seasonNumber, episode: episodeNumber })
  const accessibilityLabel = `Season ${seasonNumber}, Episode ${episodeNumber}: ${episodeName}`
  
  // Truncate overview to prevent rendering issues
  const truncatedOverview = episodeOverview.length > 120 
    ? `${episodeOverview.slice(0, 117)}...` 
    : episodeOverview

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(episode, season)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={t('mediaDetail.episodes.play_hint')}
    >
      <View style={styles.container}>
        {/* Episode banner with overlay */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.banner}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          
          {/* Gradient overlay */}
          <View style={styles.gradientOverlay} />
          
          {/* Season/Episode badge */}
          <View style={styles.episodeBadge}>
            <Text style={styles.episodeBadgeText}>
              {episodeBadgeText}
            </Text>
          </View>
          
          {/* Play button */}
          <View style={styles.playButton}>
            <View style={styles.playIcon} />
          </View>
          
          {/* Text overlay content */}
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle} numberOfLines={1}>
              {episodeName}
            </Text>
            
            {truncatedOverview.length > 0 && (
              <Text style={styles.overlayOverview} numberOfLines={2}>
                {truncatedOverview}
              </Text>
            )}
            
            <View style={styles.overlayMeta}>
              {runtimeText.length > 0 && (
                <Text style={styles.overlayMetaText}>
                  {runtimeText}
                </Text>
              )}
              
              {airDateText.length > 0 && (
                <Text style={styles.overlayMetaText}>
                  {airDateText}
                </Text>
              )}
              
              {voteAverage > 0 && (
                <Text style={styles.overlayRating}>
                  {`★ ${voteAverage.toFixed(1)}`}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
})

/**
 * ProgressiveSeasonsView - Main component with progressive loading
 */
export const ProgressiveSeasonsView: React.FC<ProgressiveSeasonsViewProps> = observer(({
  catalogItem,
  seasonMetadata,
  onEpisodePress,
  title
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createProgressiveSeasonsViewStyles(theme)
  
  // Dependency injection
  const loadSeasonEpisodesUseCase = useDI<LoadSeasonEpisodesUseCase>(TOKENS.LOAD_SEASON_EPISODES_USE_CASE)
  
  // Component state
  const [loadedSeasonsMap, setLoadedSeasonsMap] = useState<Map<number, Season>>(new Map())
  const [currentSeasonNumber, setCurrentSeasonNumber] = useState(1)
  const [isLoadingSeasonNumber, setIsLoadingSeasonNumber] = useState<number | null>(null)
  const [lastLoadedSeasonNumber, setLastLoadedSeasonNumber] = useState(0)
  const [, setSeasonLoadingStates] = useState<Map<number, SeasonLoadingState>>(new Map())
  
  // Refs
  const listRef = useRef<any>(null)
  
  // Load Season 1 on mount - moved to after loadSeason is defined

  /**
   * Loads a specific season with episodes
   */
  const loadSeason = useCallback(async (seasonNumber: number) => {
    if (loadedSeasonsMap.has(seasonNumber) || isLoadingSeasonNumber === seasonNumber) {
      return
    }

    setIsLoadingSeasonNumber(seasonNumber)
    setSeasonLoadingStates(prev => new Map(prev).set(seasonNumber, {
      isLoading: true,
      hasError: false
    }))

    try {
      const response = await loadSeasonEpisodesUseCase.execute({
        catalogItem,
        seasonNumber,
        timeoutMs: 15000,
        allowCache: true
      })

      setLoadedSeasonsMap(prev => new Map(prev).set(seasonNumber, response.season))
      setLastLoadedSeasonNumber(Math.max(lastLoadedSeasonNumber, seasonNumber))
      setSeasonLoadingStates(prev => new Map(prev).set(seasonNumber, {
        isLoading: false,
        hasError: false
      }))

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      
      console.error(`[ProgressiveSeasonsView] Failed to load season ${seasonNumber}:`, {
        error: errorInstance.message,
        catalogItem: catalogItem.id,
        seasonNumber
      })
      
      setSeasonLoadingStates(prev => new Map(prev).set(seasonNumber, {
        isLoading: false,
        hasError: true,
        errorMessage: errorInstance.message
      }))

      Alert.alert(
        'Load Error',
        `Failed to load Season ${seasonNumber}: ${errorInstance.message}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => loadSeason(seasonNumber) }
        ]
      )
    } finally {
      setIsLoadingSeasonNumber(null)
    }
  }, [catalogItem, loadSeasonEpisodesUseCase, loadedSeasonsMap, isLoadingSeasonNumber, lastLoadedSeasonNumber])

  // Load Season 1 on mount
  useEffect(() => {
    if (seasonMetadata.length > 0 && !loadedSeasonsMap.has(1)) {
      loadSeason(1)
    }
  }, [seasonMetadata, loadSeason, loadedSeasonsMap])

  /**
   * Handles season selection from dropdown
   */
  const handleSeasonSelect = useCallback((seasonNumber: number) => {
    setCurrentSeasonNumber(seasonNumber)
    
    // Load season if not already loaded
    if (!loadedSeasonsMap.has(seasonNumber)) {
      loadSeason(seasonNumber)
    }
    
    // Scroll to season's first episode if loaded
    if (loadedSeasonsMap.has(seasonNumber)) {
      const seasonFirstEpisodeIndex = flatEpisodeItems.findIndex(
        item => item.season.seasonNumber === seasonNumber
      )
      
      if (seasonFirstEpisodeIndex >= 0 && listRef.current) {
        listRef.current.scrollToIndex?.({ index: seasonFirstEpisodeIndex, animated: true })
      }
    }
  }, [loadedSeasonsMap, loadSeason]) // eslint-disable-line react-hooks/exhaustive-deps


  /**
   * Handles viewability changes to update current season
   */
  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0]
      if (firstVisibleItem?.item) {
        const episodeItem = firstVisibleItem.item as FlatEpisodeItem
        if (episodeItem.season.seasonNumber !== currentSeasonNumber) {
          setCurrentSeasonNumber(episodeItem.season.seasonNumber)
        }
      }
    }
  }, [currentSeasonNumber])

  /**
   * Handles load more for horizontal infinite scroll
   */
  const handleLoadMore = useCallback(() => {
    const nextSeasonNumber = lastLoadedSeasonNumber + 1
    const nextSeasonExists = seasonMetadata.some(s => s.seasonNumber === nextSeasonNumber)
    
    if (nextSeasonExists && !loadedSeasonsMap.has(nextSeasonNumber) && isLoadingSeasonNumber !== nextSeasonNumber) {
      loadSeason(nextSeasonNumber)
    }
  }, [lastLoadedSeasonNumber, seasonMetadata, loadedSeasonsMap, isLoadingSeasonNumber, loadSeason])

  // Create flat episodes list from loaded seasons with validation
  const flatEpisodeItems = useMemo((): FlatEpisodeItem[] => {
    const items: FlatEpisodeItem[] = []
    
    // Sort seasons by season number
    const sortedSeasons = Array.from(loadedSeasonsMap.values())
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
    
    sortedSeasons.forEach(season => {
      if (!season || !season.episodes || !Array.isArray(season.episodes)) {
        console.warn(`[ProgressiveSeasonsView] Invalid season data:`, season)
        return
      }
      
      season.episodes.forEach((episode, episodeIndex) => {
        // Validate episode data before adding to list
        if (!episode) {
          console.warn(`[ProgressiveSeasonsView] Null episode at season ${season.seasonNumber}, index ${episodeIndex}`)
          return
        }
        
        // Check for critical rendering-breaking properties
        const hasRenderingIssues = (
          (episode.name !== null && episode.name !== undefined && typeof episode.name !== 'string') ||
          (episode.runtime !== null && episode.runtime !== undefined && typeof episode.runtime !== 'number') ||
          (episode.stillUrl !== null && episode.stillUrl !== undefined && typeof episode.stillUrl !== 'string') ||
          (episode.voteAverage !== null && episode.voteAverage !== undefined && typeof episode.voteAverage !== 'number')
        )
        
        if (hasRenderingIssues) {
          console.error(`[ProgressiveSeasonsView] Episode has rendering issues - Season ${season.seasonNumber}, Episode ${episode.episodeNumber || episodeIndex + 1}:`, {
            episode,
            name: { value: episode.name, type: typeof episode.name },
            runtime: { value: episode.runtime, type: typeof episode.runtime },
            stillUrl: { value: episode.stillUrl, type: typeof episode.stillUrl },
            voteAverage: { value: episode.voteAverage, type: typeof episode.voteAverage }
          })
        }
        
        // Create safe key for the episode
        const episodeKey = `${season.seasonNumber}-${episode.id || episode.episodeNumber || episodeIndex}`
        
        items.push({
          episode,
          season,
          key: episodeKey
        })
      })
    })
    
    console.log(`[ProgressiveSeasonsView] Created ${items.length} episode items from ${sortedSeasons.length} seasons`)
    return items
  }, [loadedSeasonsMap])

  /**
   * Render episode item for horizontal LegendList with error boundary
   */
  const renderEpisode = useCallback(({ item, index: listIndex }: { item: FlatEpisodeItem, index: number }) => {
    try {
      if (!item || !item.episode || !item.season) {
        console.warn(`[ProgressiveSeasonsView] Invalid item at index ${listIndex}:`, item)
        return null
      }
      
      return (
        <HorizontalEpisodeCard
          episode={item.episode}
          season={item.season}
          onPress={onEpisodePress}
          theme={theme}
          index={listIndex}
          isFirstItem={listIndex === 0}
          isLastItem={listIndex === flatEpisodeItems.length - 1}
        />
      )
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      console.error(`[ProgressiveSeasonsView] Error rendering episode at index ${listIndex}:`, {
        error: errorInstance.message,
        item,
        listIndex
      })
      return null
    }
  }, [onEpisodePress, theme, flatEpisodeItems.length])

  // Note: LegendList doesn't use getItemLayout like FlatList

  // Viewability config for smart season detection
  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 250
  }

  // Don't render if no season metadata
  if (!seasonMetadata || seasonMetadata.length === 0) {
    return null
  }

  const sectionTitle = title ?? t('mediaDetail.seasonsDetail.title')

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
      </View>

      {/* Fixed season dropdown */}
      <SeasonDropdown
        seasonMetadata={seasonMetadata}
        currentSeasonNumber={currentSeasonNumber}
        onSeasonSelect={handleSeasonSelect}
        theme={theme}
        loadedSeasonsMap={loadedSeasonsMap}
        isLoadingSeasonNumber={isLoadingSeasonNumber}
      />

      {/* Horizontal episodes list */}
      {flatEpisodeItems.length > 0 && (
        <View style={styles.episodesContainer}>
          <LegendList
            ref={listRef}
            data={flatEpisodeItems}
            renderItem={renderEpisode}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.7}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            style={styles.episodesList}
            contentContainerStyle={styles.episodesListContent}
            accessibilityLabel={`Episodes for ${catalogItem.title}`}
          />
        </View>
      )}

      {/* Loading indicator for empty state */}
      {flatEpisodeItems.length === 0 && isLoadingSeasonNumber && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            {t('mediaDetail.episodes.loading_season')}
          </Text>
        </View>
      )}
    </View>
  )
})

/**
 * Styles for ProgressiveSeasonsView component
 */
const createProgressiveSeasonsViewStyles = (theme: Theme) => StyleSheet.create({
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
  episodesContainer: {
    height: scale(240) // Fixed height for horizontal scrolling with banner cards
  },
  episodesList: {
    flex: 1
  },
  episodesListContent: {
    paddingRight: theme.spacing.md
  },
  emptyStateContainer: {
    height: scale(280),
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  emptyStateText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  }
})

/**
 * Styles for SeasonDropdown component
 */
const createSeasonDropdownStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    zIndex: 1000
  },
  trigger: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm
  },
  triggerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  triggerOpen: {
    borderColor: theme.colors.interactive.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  triggerContent: {
    flex: 1
  },
  seasonTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  episodeCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary
  },
  triggerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loadingIndicator: {
    marginRight: theme.spacing.xs
  },
  loadingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.interactive.primary,
    fontWeight: '500'
  },
  chevron: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    transform: [{ rotate: '0deg' }]
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }]
  },
  dropdown: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.interactive.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    maxHeight: verticalScale(200),
    ...theme.shadows.md
  },
  dropdownItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.secondary
  },
  dropdownItemSelected: {
    backgroundColor: theme.colors.interactive.primary + '20'
  },
  dropdownItemPressed: {
    opacity: 0.7
  },
  dropdownItemContent: {
    flex: 1
  },
  dropdownSeasonName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  dropdownSeasonNameSelected: {
    color: theme.colors.interactive.primary,
    fontWeight: '600'
  },
  dropdownEpisodeCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary
  },
  dropdownEpisodeCountSelected: {
    color: theme.colors.interactive.primary + 'CC'
  },
  dropdownItemStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scale(24)
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.interactive.primary,
    fontWeight: '600'
  }
})

/**
 * Styles for HorizontalEpisodeCard component (banner-style with overlay)
 */
const createHorizontalEpisodeCardStyles = (theme: Theme, isFirstItem: boolean, isLastItem: boolean) => {
  const bannerWidth = scale(280)
  const bannerHeight = scale(160)

  return StyleSheet.create({
    card: {
      width: bannerWidth,
      marginLeft: isFirstItem ? theme.spacing.md : theme.spacing.sm,
      marginRight: isLastItem ? theme.spacing.md : theme.spacing.sm
    },
    cardPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }]
    },
    container: {
      flex: 1
    },
    bannerContainer: {
      position: 'relative',
      width: bannerWidth,
      height: bannerHeight,
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.tertiary,
      ...theme.shadows.md
    },
    banner: {
      width: '100%',
      height: '100%'
    },
    gradientOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
      backgroundColor: 'transparent',
      // Create gradient effect using multiple overlays
      ...({
        shadowColor: theme.colors.background.primary,
        shadowOffset: { width: 0, height: -20 },
        shadowOpacity: 0.8,
        shadowRadius: 20
      })
    },
    episodeBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      left: theme.spacing.xs,
      backgroundColor: theme.colors.overlay.backdrop,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm
    },
    episodeBadgeText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: '700',
      color: theme.colors.text.onColor
    },
    playButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: theme.colors.overlay.surface,
      justifyContent: 'center',
      alignItems: 'center'
    },
    playIcon: {
      width: 0,
      height: 0,
      borderLeftWidth: scale(10),
      borderTopWidth: scale(8),
      borderBottomWidth: scale(8),
      borderLeftColor: theme.colors.text.primary,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      marginLeft: scale(2)
    },
    overlayContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.overlay.backdrop
    },
    overlayTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '700',
      color: theme.colors.text.onColor,
      marginBottom: theme.spacing.xs
    },
    overlayOverview: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.onColor + 'E6', // 90% opacity
      lineHeight: theme.typography.caption.lineHeight,
      marginBottom: theme.spacing.xs
    },
    overlayMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs
    },
    overlayMetaText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.onColor + 'CC', // 80% opacity
      fontWeight: '500'
    },
    overlayRating: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.status.warning,
      fontWeight: '600'
    }
  })
}

// Display names for debugging
SeasonDropdown.displayName = 'SeasonDropdown'
HorizontalEpisodeCard.displayName = 'HorizontalEpisodeCard'
ProgressiveSeasonsView.displayName = 'ProgressiveSeasonsView'

export default ProgressiveSeasonsView