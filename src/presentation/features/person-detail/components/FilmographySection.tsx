/**
 * FilmographySection Component
 * 
 * Filmography section for person detail screen featuring:
 * - Multiple CatalogRow components for different filmography types
 * - Horizontal scrolling media cards
 * - Load more functionality using existing patterns
 * - Error states and loading indicators
 * - Native React Native components with theme integration
 */

import React, { useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { observer } from '@legendapp/state/react'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem, CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { CatalogRow } from '@/src/presentation/components/home/CatalogRow'

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
 * Get filmography section title based on catalog content
 */
const getFilmographyTitle = (catalog: Catalog, t: (key: string) => string): string => {
  const catalogName = catalog.name.toLowerCase()
  
  // Map common catalog types to translated titles
  if (catalogName.includes('movie') || catalogName.includes('film')) {
    return t('person_detail.filmography.movies')
  }
  if (catalogName.includes('tv') || catalogName.includes('television')) {
    return t('person_detail.filmography.tv_shows')
  }
  if (catalogName.includes('cast') || catalogName.includes('acting')) {
    return t('person_detail.filmography.acting')
  }
  if (catalogName.includes('crew') || catalogName.includes('production')) {
    return t('person_detail.filmography.crew')
  }
  if (catalogName.includes('director') || catalogName.includes('directing')) {
    return t('person_detail.filmography.directing')
  }
  if (catalogName.includes('writer') || catalogName.includes('writing')) {
    return t('person_detail.filmography.writing')
  }
  if (catalogName.includes('producer') || catalogName.includes('producing')) {
    return t('person_detail.filmography.producing')
  }
  
  // Fall back to the original catalog name
  return catalog.name
}

/**
 * Sort catalogs by importance and size
 */
const sortCatalogs = (catalogs: Catalog[]): Catalog[] => {
  return [...catalogs].sort((a, b) => {
    // Prioritize by type first
    const getTypePriority = (catalog: Catalog): number => {
      const name = catalog.name.toLowerCase()
      if (name.includes('acting') || name.includes('cast')) return 1
      if (name.includes('movie') || name.includes('film')) return 2
      if (name.includes('tv') || name.includes('television')) return 3
      if (name.includes('directing')) return 4
      if (name.includes('writing')) return 5
      if (name.includes('producing')) return 6
      return 7 // Other crew roles
    }
    
    const aPriority = getTypePriority(a)
    const bPriority = getTypePriority(b)
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }
    
    // Then by number of items (descending)
    return b.items.length - a.items.length
  })
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

  // Filter and sort catalogs
  const validCatalogs = React.useMemo(() => {
    const filtered = catalogs.filter(catalog => catalog.items.length > 0)
    return sortCatalogs(filtered)
  }, [catalogs])

  // Handle catalog load more
  const handleCatalogLoadMore = useCallback(async (catalog: Catalog) => {
    if (!onLoadMore) return
    
    try {
      await onLoadMore(catalog.id)
    } catch (error) {
      // Error handling is done by the parent component
      console.warn('Failed to load more filmography:', error)
    }
  }, [onLoadMore])

  // Don't render if no content and not loading
  if (validCatalogs.length === 0 && !isLoading) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('person_detail.filmography.title')}
        </Text>
        {validCatalogs.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {`${validCatalogs.reduce((sum, catalog) => sum + catalog.items.length, 0)} total works`}
          </Text>
        )}
      </View>

      {/* Loading State for Initial Load */}
      {isLoading && validCatalogs.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('person_detail.filmography.loading')}
          </Text>
        </View>
      )}

      {/* Filmography Catalogs */}
      {validCatalogs.length > 0 && (
        <View style={styles.catalogsContainer}>
          {validCatalogs.map((catalog, catalogIndex) => {
            const catalogTitle = getFilmographyTitle(catalog, t)
            
            return (
              <View key={catalog.id} style={styles.catalogSection}>
                <CatalogRow
                  catalog={{
                    ...catalog,
                    name: catalogTitle // Use the translated/formatted title
                  }}
                  onItemPress={onItemPress}
                  onLoadMore={onLoadMore ? handleCatalogLoadMore : undefined}
                  isLoading={false} // Individual catalog loading is handled by the store
                  hasMore={catalog.pagination.hasMore}
                  index={catalogIndex}
                  isVisible={true}
                />
              </View>
            )
          })}
        </View>
      )}

      {/* Progressive Loading Indicator */}
      {isLoading && validCatalogs.length > 0 && (
        <View style={styles.progressiveLoadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressiveLoadingText}>
            {t('person_detail.filmography.loading_more')}
          </Text>
        </View>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  catalogsContainer: {
    gap: theme.spacing.lg,
  },
  catalogSection: {
    // Individual catalog section - styling handled by CatalogRow
  },
  progressiveLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    ...theme.shadows.sm,
  },
  progressiveLoadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
})

FilmographySection.displayName = 'FilmographySection'