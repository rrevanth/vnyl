/**
 * MediaDetailScreen
 * 
 * Comprehensive media detail screen implementing the full VNYL workflow:
 * 1. Progressive data enrichment (external IDs → enriched data)
 * 2. Hero section with backdrop, metadata, and actions
 * 3. Multiple content sections (trailers, people, seasons, recommendations)
 * 4. TanStack Query for API caching and state management
 * 5. Legend State for UI state management
 * 6. Native React Native components with theme integration
 * 7. Full accessibility and i18n support
 */

/* @jsxImportSource react */

import React, { useCallback, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Alert
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { observable } from '@legendapp/state'
import { useQuery } from '@tanstack/react-query'
// Note: expo-linear-gradient import removed - using native gradient alternative
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { moderateScale, scale } from 'react-native-size-matters'

// Internal imports with @ patterns
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { 
  useResolveExternalIdsUseCase, 
  useEnrichCatalogItemUseCase,
  useLogging,
  useSafeLoadMoreRecommendationsUseCase,
  useSafeLoadMorePeopleUseCase
} from '@/src/infrastructure/di'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { CatalogItemUtils } from '@/src/domain/entities/media/catalog-item.entity'
import { mediaDetailActions, mediaDetailSelectors } from '@/src/presentation/shared/stores/media-detail-store'
import { homescreenSelectors, homescreenActions } from '@/src/presentation/shared/stores/homescreen-store'
import type { 
  ResolveExternalIdsResult 
} from '@/src/domain/usecases/media/resolve-external-ids.use-case'
import type { 
  EnrichCatalogItemResult 
} from '@/src/domain/usecases/enrichment/enrich-catalog-item.use-case'
import type {
  LoadMoreRecommendationsRequest
} from '@/src/domain/usecases/load-more-recommendations.usecase'
import type {
  LoadMorePeopleRequest
} from '@/src/domain/usecases/load-more-people.usecase'
import { CatalogRow } from '@/src/presentation/components/home/CatalogRow'
import { ProgressiveSeasonsView } from '@/src/presentation/features/media-detail/components/ProgressiveSeasonsView'

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Local UI state management with Legend State
const mediaDetailState = observable<{
  expandedOverview: boolean
  showShareMenu: boolean
  isInWatchlist: boolean
}>({
  expandedOverview: false,
  showShareMenu: false,
  isInWatchlist: false
})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Placeholder for future extensibility
interface MediaDetailScreenProps {
  // Props interface for future extensibility - currently no props needed
}

const MediaDetailScreenImpl: React.FC<MediaDetailScreenProps> = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t, formatMessage } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)
  const router = useRouter()
  const logger = useLogging()

  // Use cases from DI container
  const resolveExternalIdsUseCase = useResolveExternalIdsUseCase()
  const enrichCatalogItemUseCase = useEnrichCatalogItemUseCase()
  const loadMoreRecommendationsUseCase = useSafeLoadMoreRecommendationsUseCase()
  const loadMorePeopleUseCase = useSafeLoadMorePeopleUseCase()

  // Get the selected catalog item directly from the homescreen store (no serialization needed)
  // We still need this as the entry point, but we'll manage the enriched item in MediaDetail store
  const selectedItem = homescreenSelectors.selectedItem.get()

  // Use the selected item as initial item - this is the complete CatalogItem object
  const initialItem = selectedItem

  if (!initialItem) {
    logger?.warn('No selected catalog item found in store', new Error('Missing catalog item'), {
      context: 'media_detail_screen',
      routeId: id
    })
  }

  // Step 1: Resolve external IDs query
  const {
    data: externalIdsResult,
    isLoading: isResolvingIds,
    error: resolveIdsError
  } = useQuery<ResolveExternalIdsResult, Error>({
    queryKey: ['media-external-ids', id],
    queryFn: async () => {
      if (!initialItem) {
        throw new Error('Initial catalog item is required for external ID resolution')
      }

      logger.info('Starting external ID resolution', {
        context: 'media_detail_screen',
        catalogItemId: initialItem.id,
        mediaType: initialItem.mediaType
      })

      const result = await resolveExternalIdsUseCase.execute({
        catalogItem: initialItem,
        allowCache: true,
        timeoutMs: 8000,
        toleratePartialFailure: true
      })

      logger.info('External ID resolution completed', {
        context: 'media_detail_screen',
        catalogItemId: initialItem.id,
        fullyResolved: result.fullyResolved,
        newExternalIds: result.metrics.newExternalIds,
        executionTime: Math.round(result.metrics.executionTime)
      })

      return result
    },
    enabled: !!initialItem,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // Step 2: Enrich catalog item query
  const {
    data: enrichmentResult,
    isLoading: isEnriching,
    error: enrichmentError
  } = useQuery<EnrichCatalogItemResult, Error>({
    queryKey: ['media-enrichment', externalIdsResult?.enrichedItem?.id],
    queryFn: async () => {
      if (!externalIdsResult?.enrichedItem) {
        throw new Error('Enriched item with external IDs is required for enrichment')
      }

      logger.info('Starting catalog item enrichment', {
        context: 'media_detail_screen',
        catalogItemId: externalIdsResult.enrichedItem.id,
        mediaType: externalIdsResult.enrichedItem.mediaType,
        externalIdCount: Object.keys(externalIdsResult.enrichedItem.externalIds).length
      })

      const result = await enrichCatalogItemUseCase.execute({
        catalogItem: externalIdsResult.enrichedItem,
        allowCache: true,
        timeoutMs: 15000,
        toleratePartialFailure: true,
        preserveExistingEnrichments: true
      })

      logger.info('Catalog item enrichment completed', {
        context: 'media_detail_screen',
        catalogItemId: externalIdsResult.enrichedItem.id,
        fullyEnriched: result.fullyEnriched,
        enrichmentsAdded: result.metrics.enrichmentsAdded,
        executionTime: Math.round(result.metrics.executionTime)
      })

      return result
    },
    enabled: !!externalIdsResult?.enrichedItem,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  })

  // Final enriched item for display - always start with initialItem
  const enrichedItem = enrichmentResult?.enrichedItem || externalIdsResult?.enrichedItem || initialItem

  // Progressive loading states
  const hasInitialData = !!initialItem
  const isResolvingExternalIds = isResolvingIds && !externalIdsResult
  const isEnrichingContent = isEnriching && !enrichmentResult
  const isFullyLoaded = !!enrichmentResult?.enrichedItem

  // Extract enriched data for sections - extract from new provider structure
  const enrichedData = enrichedItem?.enrichedData
  const metadata = enrichedData?.enrichments.get(ProviderCapability.METADATA)?.data as any
  const peopleResult = enrichedData?.enrichments.get(ProviderCapability.PEOPLE)?.data as any
  const recommendationsResult = enrichedData?.enrichments.get(ProviderCapability.RECOMMENDATIONS)?.data as any
  const seasonsResult = enrichedData?.enrichments.get(ProviderCapability.SEASONS_EPISODES)?.data as any
  
  // Extract catalogs from the new provider structure (used for initial loading)
  const extractedPeopleCatalogs = useMemo(() => {
    return peopleResult?.people || (Array.isArray(peopleResult) ? peopleResult : [])
  }, [peopleResult])
  
  const extractedRecommendationCatalogs = useMemo(() => {
    return recommendationsResult?.recommendations || (Array.isArray(recommendationsResult) ? recommendationsResult : [])
  }, [recommendationsResult])
  
  const extractedSeasonMetadata = useMemo(() => {
    return Array.isArray(seasonsResult) ? seasonsResult : (seasonsResult?.seasons || null)
  }, [seasonsResult])

  // Get catalogs from MediaDetail store (preferred source after initial loading)
  const storedPeopleCatalogs = mediaDetailSelectors.peopleCatalogs.get()
  const storedRecommendationCatalogs = mediaDetailSelectors.recommendationCatalogs.get()
  
  // Use store data if available, otherwise fall back to extracted data
  const peopleCatalogs = storedPeopleCatalogs.length > 0 ? storedPeopleCatalogs : extractedPeopleCatalogs
  const recommendationCatalogs = storedRecommendationCatalogs.length > 0 ? storedRecommendationCatalogs : extractedRecommendationCatalogs
  const seasonMetadata = extractedSeasonMetadata

  // Store enriched data in MediaDetail store when enrichment data is available
  useEffect(() => {
    if (isFullyLoaded && enrichedItem) {
      // Store the enriched item
      mediaDetailActions.setEnrichedItem(enrichedItem)
      
      // Store people catalogs (use extracted data, not store data)
      if (extractedPeopleCatalogs.length > 0) {
        mediaDetailActions.setPeopleCatalogs(extractedPeopleCatalogs)
      }
      
      // Store recommendation catalogs (use extracted data, not store data)
      if (extractedRecommendationCatalogs.length > 0) {
        mediaDetailActions.setRecommendationCatalogs(extractedRecommendationCatalogs)
      }
      
      // Note: Season metadata is now handled progressively, not stored in MediaDetail store
      
      logger.info('Stored enriched data in MediaDetail store', {
        context: 'media_detail_screen',
        enrichedItemId: enrichedItem.id,
        peopleCount: extractedPeopleCatalogs.length,
        recommendationsCount: extractedRecommendationCatalogs.length,
        hasSeasonMetadata: !!seasonMetadata && Array.isArray(seasonMetadata) && seasonMetadata.length > 0
      })
    }
  }, [isFullyLoaded, enrichedItem, extractedPeopleCatalogs, extractedRecommendationCatalogs, seasonMetadata, logger])

  // Error handling - only show errors if we have no data to display
  const criticalError = (resolveIdsError || enrichmentError) && !hasInitialData
  useEffect(() => {
    if (resolveIdsError || enrichmentError) {
      const errorInstance = (resolveIdsError || enrichmentError) instanceof Error 
        ? (resolveIdsError || enrichmentError) 
        : new Error(String(resolveIdsError || enrichmentError))
      
      logger.warn('Media detail background process failed', errorInstance!, {
        context: 'media_detail_screen',
        catalogItemId: id,
        step: resolveIdsError ? 'external_ids' : 'enrichment',
        hasInitialData,
        severity: hasInitialData ? 'low' : 'high'
      })
    }
  }, [resolveIdsError, enrichmentError, logger, id, hasInitialData])

  // UI event handlers
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handlePlayAction = useCallback(() => {
    if (!enrichedItem) return
    
    logger.info('Play action triggered', {
      context: 'media_detail_screen',
      catalogItemId: enrichedItem.id,
      mediaType: enrichedItem.mediaType
    })

    Alert.alert(
      t('mediaDetail.play_title'),
      t('mediaDetail.play_message'),
      [{ text: t('common.ok'), style: 'default' }]
    )
  }, [enrichedItem, logger, t])

  const handleWatchlistToggle = useCallback(() => {
    if (!enrichedItem) return

    const newStatus = !mediaDetailState.isInWatchlist.get()
    mediaDetailState.isInWatchlist.set(newStatus)

    logger.info('Watchlist toggle', {
      context: 'media_detail_screen',
      catalogItemId: enrichedItem.id,
      addedToWatchlist: newStatus
    })

    Alert.alert(
      newStatus ? t('mediaDetail.added_to_watchlist') : t('mediaDetail.removed_from_watchlist'),
      undefined,
      [{ text: t('common.ok'), style: 'default' }]
    )
  }, [enrichedItem, logger, t])

  const handleShare = useCallback(() => {
    if (!enrichedItem) return

    logger.info('Share action triggered', {
      context: 'media_detail_screen',
      catalogItemId: enrichedItem.id,
      title: enrichedItem.title
    })

    Alert.alert(
      t('mediaDetail.share_title'),
      formatMessage('mediaDetail.share_message', { title: enrichedItem.title }),
      [{ text: t('common.ok'), style: 'default' }]
    )
  }, [enrichedItem, logger, t, formatMessage])

  const toggleOverview = useCallback(() => {
    mediaDetailState.expandedOverview.set(!mediaDetailState.expandedOverview.get())
  }, [])


  const handlePersonPress = useCallback((person: CatalogItem) => {
    logger.info('Person pressed', {
      context: 'media_detail_screen',
      personId: person.id,
      personTitle: person.title
    })
    // Navigate to person detail screen
  }, [logger])

  const handleRecommendationPress = useCallback((item: CatalogItem) => {
    logger.info('Recommendation pressed', {
      context: 'media_detail_screen',
      recommendedItemId: item.id,
      title: item.title
    })
    
    // Store the selected item in the homescreen store for navigation to new media detail screen
    // This is needed for the next MediaDetailScreen instance to have initial data
    homescreenActions.setSelectedItem(item)
    // Navigate to the new media detail screen
    router.push(`/media/${item.id}` as any)
  }, [logger, router])

  const handleEpisodePress = useCallback((episode: any, season: any) => {
    logger.info('Episode pressed', {
      context: 'media_detail_screen',
      episodeId: episode.id,
      episodeName: episode.name,
      seasonNumber: season.seasonNumber
    })
    // Handle episode playback or navigation
  }, [logger])

  // Load more handler for catalogs
  const handleCatalogLoadMore = useCallback(async (catalog: Catalog) => {
    if (!enrichedItem) return
    
    logger.info('Load more catalog requested', {
      context: 'media_detail_screen',
      catalogItemId: enrichedItem.id,
      catalogId: catalog.id,
      catalogType: catalog.catalogContext?.catalogType
    })
    
    // Determine which load more function to use based on catalog type
    const catalogType = catalog.catalogContext?.catalogType
    const nextPage = catalog.pagination.page + 1
    
    try {
      mediaDetailActions.clearError()
      
      if (catalogType === 'recommendations' && loadMoreRecommendationsUseCase) {
        mediaDetailActions.setLoadingMoreRecommendations(true)
        
        const request: LoadMoreRecommendationsRequest = {
          providerId: catalog.catalogContext?.providerId || 'tmdb-recommendations',
          catalogId: catalog.id,
          catalog: catalog,
          originalMediaItem: enrichedItem,
          page: nextPage,
          limit: 20,
          originalCatalogContext: catalog.catalogContext,
          originalPagination: catalog.pagination
        }
        
        const result = await loadMoreRecommendationsUseCase.execute(request)
        
        if (result.items && result.items.length > 0) {
          mediaDetailActions.addMoreRecommendationItems(catalog.id, result.items, result.pagination)
          
          logger.info('MediaDetail: More recommendations loaded successfully', {
            catalogId: catalog.id,
            newItemsCount: result.items.length,
            hasMore: result.pagination.hasMore
          })
        } else {
          logger.warn('MediaDetail: No new recommendations received')
        }
        
      } else if (catalogType === 'people' && loadMorePeopleUseCase) {
        mediaDetailActions.setLoadingMorePeople(true)
        
        const request: LoadMorePeopleRequest = {
          providerId: catalog.catalogContext?.providerId || 'tmdb-people',
          catalogId: catalog.id,
          catalog: catalog,
          originalMediaItem: enrichedItem,
          page: nextPage,
          limit: 20,
          originalCatalogContext: catalog.catalogContext,
          originalPagination: catalog.pagination
        }
        
        const result = await loadMorePeopleUseCase.execute(request)
        
        if (result.items && result.items.length > 0) {
          mediaDetailActions.addMorePeopleItems(catalog.id, result.items, result.pagination)
          
          logger.info('MediaDetail: More people loaded successfully', {
            catalogId: catalog.id,
            newItemsCount: result.items.length,
            hasMore: result.pagination.hasMore
          })
        } else {
          logger.warn('MediaDetail: No new people received')
        }
        
      } else {
        logger.warn('Unknown catalog type for load more or use case not available', undefined, {
          context: 'media_detail_screen',
          catalogType,
          catalogId: catalog.id,
          hasRecommendationsUseCase: !!loadMoreRecommendationsUseCase,
          hasPeopleUseCase: !!loadMorePeopleUseCase
        })
        
        Alert.alert(
          t('mediaDetail.load_more_title'),
          t('mediaDetail.load_more_message'),
          [{ text: t('common.ok'), style: 'default' }]
        )
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      mediaDetailActions.setError(errorInstance.message)
      logger.error('MediaDetail: Load more catalog failed', errorInstance, {
        context: 'media_detail_screen',
        catalogType,
        catalogId: catalog.id
      })
      
      Alert.alert(
        t('mediaDetail.load_more_error_title'),
        t('mediaDetail.load_more_error_message'),
        [{ text: t('common.ok'), style: 'default' }]
      )
    } finally {
      // Reset loading states regardless of catalog type
      mediaDetailActions.setLoadingMorePeople(false)
      mediaDetailActions.setLoadingMoreRecommendations(false)
    }
  }, [enrichedItem, logger, t, loadMoreRecommendationsUseCase, loadMorePeopleUseCase])


  // Only show full loading screen if we have no data at all
  if (!hasInitialData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('mediaDetail.loading_details')}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Only show error screen if we have critical error and no data to display
  if (criticalError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.status.error} />
          <Text style={styles.errorTitle}>{t('mediaDetail.error_title')}</Text>
          <Text style={styles.errorMessage}>{t('mediaDetail.error_message')}</Text>
          <Pressable style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>{t('common.go_back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // At this point we have enrichedItem (either initial, with external IDs, or fully enriched)
  if (!enrichedItem) {
    return null // This should never happen due to the checks above
  }


  const displayTitle = CatalogItemUtils.getDisplayTitle(enrichedItem)
  const releaseYear = CatalogItemUtils.getReleaseYear(enrichedItem)
  const formattedRating = CatalogItemUtils.getFormattedVoteAverage(enrichedItem)
  const runtime = CatalogItemUtils.isMovieItem(enrichedItem) ? enrichedItem.runtime : undefined

  // Helper functions for rendering sections
  const hasStreamingServices = metadata && typeof metadata === 'object' && 'streamingServices' in metadata && Array.isArray(metadata.streamingServices)
  const hasVideos = metadata && typeof metadata === 'object' && 'videos' in metadata && Array.isArray(metadata.videos) && metadata.videos.length > 0
  const hasPeopleCatalogs = Array.isArray(peopleCatalogs) && peopleCatalogs.length > 0
  const hasRecommendationCatalogs = Array.isArray(recommendationCatalogs) && recommendationCatalogs.length > 0
  const hasSeasonMetadata = seasonMetadata && Array.isArray(seasonMetadata) && seasonMetadata.length > 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progressive Loading Indicator */}
        {(isResolvingExternalIds || isEnrichingContent) && (
          <View style={styles.progressIndicator}>
            <View style={styles.progressContent}>
              <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
              <Text style={styles.progressText}>
                {isResolvingExternalIds 
                  ? t('mediaDetail.loading_details')
                  : t('mediaDetail.loading_content')
                }
              </Text>
            </View>
          </View>
        )}

        {/* Hero Section with Backdrop */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{ uri: enrichedItem.backdropUrl || enrichedItem.posterUrl }}
            style={styles.backdropImage}
            resizeMode="cover"
          >
            <View style={styles.backdropGradient}>
              {/* Navigation Header */}
              <View style={styles.header}>
                <Pressable
                  style={styles.backButton}
                  onPress={handleBack}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.go_back')}
                >
                  <Ionicons name="arrow-back" size={24} color={theme.colors.text.onColor} />
                </Pressable>
                
                <Pressable
                  style={styles.shareButton}
                  onPress={handleShare}
                  accessibilityRole="button"
                  accessibilityLabel={t('mediaDetail.share')}
                >
                  <Ionicons name="share-outline" size={24} color={theme.colors.text.onColor} />
                </Pressable>
              </View>

              {/* Hero Content */}
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {displayTitle}
                </Text>
                
                <View style={styles.heroMetadata}>
                  {releaseYear && (
                    <Text style={styles.metadataText}>{releaseYear}</Text>
                  )}
                  {formattedRating && (
                    <Text style={styles.metadataText}>★ {formattedRating}</Text>
                  )}
                  {runtime && (
                    <Text style={styles.metadataText}>
                      {formatMessage('mediaDetail.runtime_minutes', { minutes: runtime })}
                    </Text>
                  )}
                  <Text style={styles.metadataText}>
                    {enrichedItem.mediaType === MediaType.MOVIE ? t('media.movie') : t('media.tv')}
                  </Text>
                </View>

                {/* Overview */}
                {enrichedItem.overview && (
                  <View style={styles.overviewContainer}>
                    <Text
                      style={styles.overviewText}
                      numberOfLines={mediaDetailState.expandedOverview.get() ? undefined : 3}
                    >
                      {enrichedItem.overview}
                    </Text>
                    <Pressable onPress={toggleOverview} style={styles.expandButton}>
                      <Text style={styles.expandButtonText}>
                        {mediaDetailState.expandedOverview.get() ? t('mediaDetail.show_less') : t('mediaDetail.show_more')}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Pressable
                    style={styles.playButton}
                    onPress={handlePlayAction}
                    accessibilityRole="button"
                    accessibilityLabel={t('mediaDetail.play')}
                  >
                    <Ionicons name="play" size={20} color={theme.colors.text.onColor} />
                    <Text style={styles.playButtonText}>{t('mediaDetail.play')}</Text>
                  </Pressable>

                  <Pressable
                    style={styles.watchlistButton}
                    onPress={handleWatchlistToggle}
                    accessibilityRole="button"
                    accessibilityLabel={
                      mediaDetailState.isInWatchlist.get() 
                        ? t('mediaDetail.remove_from_watchlist')
                        : t('mediaDetail.add_to_watchlist')
                    }
                  >
                    <Ionicons 
                      name={mediaDetailState.isInWatchlist.get() ? "checkmark" : "add"} 
                      size={20} 
                      color={theme.colors.text.secondary} 
                    />
                    <Text style={styles.watchlistButtonText}>
                      {mediaDetailState.isInWatchlist.get() ? t('mediaDetail.in_watchlist') : t('mediaDetail.watchlist')}
                    </Text>
                  </Pressable>
                </View>

                {/* External Service Badges - only show if enriched */}
                {hasStreamingServices && isFullyLoaded && (
                  <View style={styles.streamingServices}>
                    <Text style={styles.streamingTitle}>{t('mediaDetail.watch_on')}</Text>
                    <View style={styles.serviceBadges}>
                      {metadata.streamingServices.slice(0, 3).map((service: any, index: number) => (
                        <View key={service?.name || index} style={styles.serviceBadge}>
                          <Text style={styles.serviceBadgeText}>{service?.name || 'Service'}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Loading indicator for external services */}
                {isEnrichingContent && (
                  <View style={styles.streamingServices}>
                    <Text style={styles.streamingTitle}>{t('mediaDetail.watch_on')}</Text>
                    <View style={styles.serviceBadgeLoading}>
                      <ActivityIndicator size="small" color={theme.colors.text.onColor} />
                      <Text style={styles.loadingServiceText}>Loading services...</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content Sections */}
        <View style={styles.contentSections}>
          {/* Trailers Section - only show when fully enriched */}
          {hasVideos && isFullyLoaded && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.trailers')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trailersContainer}>
                {metadata.videos.slice(0, 5).map((video: any, index: number) => (
                  <Pressable key={video?.id || index} style={styles.trailerCard}>
                    <View style={styles.trailerThumbnail}>
                      <Ionicons name="play-circle" size={32} color={theme.colors.text.onColor} />
                    </View>
                    <Text style={styles.trailerTitle} numberOfLines={2}>
                      {video?.name || 'Video'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Loading state for trailers */}
          {isEnrichingContent && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.trailers')}</Text>
              <View style={styles.sectionLoading}>
                <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                <Text style={styles.sectionLoadingText}>Loading videos...</Text>
              </View>
            </View>
          )}

          {/* Seasons Section (TV Series only) - Progressive Loading */}
          {CatalogItemUtils.isTVItem(enrichedItem) && hasSeasonMetadata && isFullyLoaded && (
            <ProgressiveSeasonsView
              catalogItem={enrichedItem}
              seasonMetadata={seasonMetadata}
              onEpisodePress={handleEpisodePress}
              title={t('mediaDetail.seasons')}
            />
          )}

          {/* Loading state for seasons (TV only) */}
          {CatalogItemUtils.isTVItem(enrichedItem) && isEnrichingContent && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.seasons')}</Text>
              <View style={styles.sectionLoading}>
                <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                <Text style={styles.sectionLoadingText}>Loading season metadata...</Text>
              </View>
            </View>
          )}

          {/* People Section - only show when fully enriched */}
          {hasPeopleCatalogs && isFullyLoaded && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.cast_crew')}</Text>
              {peopleCatalogs.map((catalog, catalogIndex) => (
                <CatalogRow
                  key={catalog.id}
                  catalog={catalog}
                  onItemPress={handlePersonPress}
                  onLoadMore={handleCatalogLoadMore}
                  isLoading={false}
                  hasMore={catalog.pagination.hasMore}
                  index={catalogIndex}
                  isVisible={true}
                />
              ))}
            </View>
          )}

          {/* Loading state for cast & crew */}
          {isEnrichingContent && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.cast_crew')}</Text>
              <View style={styles.sectionLoading}>
                <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                <Text style={styles.sectionLoadingText}>Loading cast & crew...</Text>
              </View>
            </View>
          )}

          {/* Recommendations Section - only show when fully enriched */}
          {hasRecommendationCatalogs && isFullyLoaded && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.you_might_like')}</Text>
              {recommendationCatalogs.map((catalog, catalogIndex) => (
                <CatalogRow
                  key={catalog.id}
                  catalog={catalog}
                  onItemPress={handleRecommendationPress}
                  onLoadMore={handleCatalogLoadMore}
                  isLoading={false}
                  hasMore={catalog.pagination.hasMore}
                  index={catalogIndex}
                  isVisible={true}
                />
              ))}
            </View>
          )}

          {/* Loading state for recommendations */}
          {isEnrichingContent && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('mediaDetail.you_might_like')}</Text>
              <View style={styles.sectionLoading}>
                <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                <Text style={styles.sectionLoadingText}>Loading recommendations...</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export const MediaDetailScreen = React.memo(observer(MediaDetailScreenImpl))

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.interactive.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  retryButtonText: {
    color: theme.colors.text.onColor,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as any,
  },
  heroSection: {
    height: screenHeight * 0.7,
    width: screenWidth,
  },
  backdropImage: {
    flex: 1,
    width: '100%',
  },
  backdropGradient: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  shareButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  heroTitle: {
    color: theme.colors.text.onColor,
    fontSize: theme.typography.display.fontSize,
    fontWeight: theme.typography.display.fontWeight as any,
    lineHeight: theme.typography.display.lineHeight,
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  metadataText: {
    color: theme.colors.text.onColor,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overviewContainer: {
    marginBottom: theme.spacing.md,
  },
  overviewText: {
    color: theme.colors.text.onColor,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  expandButton: {
    marginTop: theme.spacing.xs,
  },
  expandButtonText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.interactive.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    marginRight: theme.spacing.md,
    ...theme.shadows.md,
  },
  playButtonText: {
    color: theme.colors.text.onColor,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as any,
    marginLeft: theme.spacing.xs,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  watchlistButtonText: {
    color: theme.colors.text.onColor,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  streamingServices: {
    marginTop: theme.spacing.sm,
  },
  streamingTitle: {
    color: theme.colors.text.onColor,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  serviceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  serviceBadgeText: {
    color: theme.colors.text.onColor,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  contentSections: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    marginBottom: theme.spacing.md,
  },
  trailersContainer: {
    flexDirection: 'row',
  },
  trailerCard: {
    width: scale(200),
    marginRight: theme.spacing.md,
  },
  trailerThumbnail: {
    height: scale(112),
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  trailerTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    lineHeight: moderateScale(18),
  },
  peopleContainer: {
    flexDirection: 'row',
  },
  personCard: {
    width: scale(100),
    marginRight: theme.spacing.sm,
  },
  personImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.xs,
    alignSelf: 'center',
  },
  personImageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.full,
  },
  personImageStyle: {
    borderRadius: theme.radius.full,
  },
  personImagePlaceholder: {
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(12),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    lineHeight: moderateScale(16),
  },
  personRole: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(11),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: moderateScale(14),
  },
  // Progressive loading indicator styles
  progressIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  // Service badge loading styles
  serviceBadgeLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingServiceText: {
    color: theme.colors.text.onColor,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  // Section loading styles
  sectionLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  sectionLoadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
})