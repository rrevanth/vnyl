/**
 * PersonDetailScreen
 * 
 * Comprehensive person detail screen implementing the full VNYL workflow:
 * 1. Person enrichment with detailed metadata
 * 2. Hero section with profile image, name, and biographical info
 * 3. Information section with biography and personal details
 * 4. Filmography section with multiple catalog rows
 * 5. Native React Native components with theme integration
 * 6. Full accessibility and i18n support
 * 7. Integration with person detail store and TanStack Query
 */

/* @jsxImportSource react */

import React, { useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale } from 'react-native-size-matters'

// Internal imports with @ patterns
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { useLogging } from '@/src/infrastructure/di'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { usePersonDetailComplete } from '@/src/presentation/features/person-detail/hooks/usePersonDetail'
import { useSelectedPerson } from '@/src/presentation/features/person-detail/hooks/useSelectedPerson'
import { PersonHeroSection } from '@/src/presentation/features/person-detail/components/PersonHeroSection'
import { PersonInfoSection } from '@/src/presentation/features/person-detail/components/PersonInfoSection'
import { FilmographySection } from '@/src/presentation/features/person-detail/components/FilmographySection'
import { SkeletonLoader } from '@/src/presentation/shared/components/atoms/SkeletonLoader'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Placeholder for future extensibility
interface PersonDetailScreenProps {
  // Props interface for future extensibility - currently no props needed
}

const PersonDetailScreenImpl: React.FC<PersonDetailScreenProps> = () => {
  const { id, person } = useLocalSearchParams<{ id: string; person?: any }>()
  const { t, formatMessage } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)
  const router = useRouter()
  const logger = useLogging()

  // Use CLEAN architecture pattern for person selection
  const selectedPersonQuery = useSelectedPerson(id, person)
  const personItem = selectedPersonQuery.data

  // Ensure we have a person item for detail screens
  if (!personItem && !selectedPersonQuery.isLoading) {
    logger?.warn('No selected person item found', new Error('Missing person item'), {
      context: 'person_detail_screen',
      routeId: id,
      hasPersonParam: !!person,
      queryError: selectedPersonQuery.error?.message
    })
  }

  // Use complete person detail hook
  const {
    enrichQuery,
    filmographyQuery,
    loadMoreForCatalog,
    isError,
    combinedError,
    enrichedPerson,
    filmographyCatalogs,
    expandedBiography,
    actions
  } = usePersonDetailComplete(personItem || null, {
    autoEnrich: true,
    autoLoadFilmography: true
  })

  // Progressive loading states
  const hasInitialData = !!personItem
  const isEnrichingPerson = enrichQuery.isLoading && !enrichQuery.data
  const isLoadingFilmography = filmographyQuery.isLoading && !filmographyQuery.data
  const isFullyLoaded = !!enrichQuery.data && !!filmographyQuery.data
  const isLoadingPersonSelection = selectedPersonQuery.isLoading

  // Final person for display - always start with initial person
  const displayPerson = enrichedPerson || personItem

  // Navigation handlers
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleFilmographyItemPress = useCallback((item: CatalogItem) => {
    logger.info('Filmography item pressed', {
      context: 'person_detail_screen',
      itemId: item.id,
      title: item.title,
      mediaType: item.mediaType
    })
    
    // Navigate to media detail with object in params
    router.push({
      pathname: '/media/[id]' as any,
      params: { 
        id: item.id,
        item: item as any
      }
    } as any)
  }, [logger, router])

  const handleLoadMoreFilmography = useCallback(async (catalogId: string) => {
    if (!displayPerson) return
    
    try {
      logger.info('Load more filmography requested', {
        context: 'person_detail_screen',
        personId: displayPerson.id,
        catalogId
      })
      
      const catalog = filmographyCatalogs.find(c => c.id === catalogId)
      if (!catalog) {
        throw new Error(`Catalog not found: ${catalogId}`)
      }
      
      const nextPage = catalog.pagination.page + 1
      await loadMoreForCatalog(catalogId, nextPage)
      
      logger.info('Load more filmography completed', {
        context: 'person_detail_screen',
        personId: displayPerson.id,
        catalogId,
        page: nextPage
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger.error('Load more filmography failed', errorInstance, {
        context: 'person_detail_screen',
        personId: displayPerson.id,
        catalogId
      })
      
      Alert.alert(
        t('person_detail.load_more_error_title'),
        t('person_detail.load_more_error_message'),
        [{ text: t('common.ok'), style: 'default' }]
      )
    }
  }, [displayPerson, filmographyCatalogs, loadMoreForCatalog, logger, t])

  const handleBiographyToggle = useCallback(() => {
    actions.setExpandedBiography(!expandedBiography)
  }, [actions, expandedBiography])

  const handleShare = useCallback(() => {
    if (!displayPerson) return

    logger.info('Person share action triggered', {
      context: 'person_detail_screen',
      personId: displayPerson.id,
      personName: displayPerson.title
    })

    Alert.alert(
      t('person_detail.share_title'),
      formatMessage('person_detail.share_message', { name: displayPerson.title }),
      [{ text: t('common.ok'), style: 'default' }]
    )
  }, [displayPerson, logger, t, formatMessage])

  const handleKnownForPress = useCallback((work: any) => {
    logger.info('Known work pressed', {
      context: 'person_detail_screen',
      workId: work.id,
      workTitle: work.title,
      mediaType: work.mediaType
    })

    // Navigate to media detail with work object
    router.push({
      pathname: '/media/[id]' as any,
      params: {
        id: work.id,
        item: work as any
      }
    } as any)
  }, [logger, router])

  // Error handling - only show errors if we have no data to display
  const criticalError = isError && !hasInitialData
  useEffect(() => {
    if (combinedError && hasInitialData) {
      // Log error but don't show critical error screen
      const errorInstance = combinedError instanceof Error 
        ? combinedError 
        : new Error(String(combinedError))
      
      logger.warn('Person detail background process failed', errorInstance, {
        context: 'person_detail_screen',
        personId: id,
        hasInitialData,
        severity: hasInitialData ? 'low' : 'high'
      })
    }
  }, [combinedError, logger, id, hasInitialData])

  // Show full loading screen if we have no data at all or still loading person selection
  if (!hasInitialData || isLoadingPersonSelection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <SkeletonLoader variant="hero" />
          <SkeletonLoader variant="info" />
          <SkeletonLoader variant="filmography" itemCount={6} />
        </View>
      </SafeAreaView>
    )
  }

  // Show error screen if we have critical error and no data to display
  if (criticalError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.status.error} />
          <Text style={styles.errorTitle}>{t('person_detail.error_title')}</Text>
          <Text style={styles.errorMessage}>{t('person_detail.error_message')}</Text>
          <Pressable style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>{t('common.go_back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // At this point we have displayPerson (either initial or enriched)
  if (!displayPerson) {
    return null // This should never happen due to the checks above
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progressive Loading Indicator */}
        {(isEnrichingPerson || isLoadingFilmography) && (
          <View style={styles.progressIndicator}>
            <View style={styles.progressContent}>
              <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
              <Text style={styles.progressText}>
                {isEnrichingPerson
                  ? t('person_detail.loading_details')
                  : t('person_detail.loading_filmography')
                }
              </Text>
            </View>
          </View>
        )}

        {/* Hero Section with Profile Image */}
        <PersonHeroSection
          person={displayPerson}
          isLoading={isEnrichingPerson}
          isFullyLoaded={isFullyLoaded}
          expandedBiography={expandedBiography}
          onBiographyToggle={handleBiographyToggle}
          onBack={handleBack}
          onShare={handleShare}
        />

        {/* Content Sections */}
        <View style={styles.contentSections}>
          {/* Personal Information Section */}
          <PersonInfoSection
            person={displayPerson}
            expandedBiography={expandedBiography}
            onBiographyToggle={handleBiographyToggle}
            onKnownForPress={handleKnownForPress}
            isLoading={isEnrichingPerson}
            isFullyLoaded={isFullyLoaded}
          />

          {/* Filmography Section */}
          {(filmographyCatalogs.length > 0 || isLoadingFilmography) && (
            <FilmographySection
              person={displayPerson}
              catalogs={filmographyCatalogs}
              onItemPress={handleFilmographyItemPress}
              onLoadMore={handleLoadMoreFilmography}
              isLoading={isLoadingFilmography}
              isFullyLoaded={isFullyLoaded}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export const PersonDetailScreen = React.memo(observer(PersonDetailScreenImpl))

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
  contentContainer: {
    flex: 1,
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
  contentSections: {
    padding: theme.spacing.md,
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
})