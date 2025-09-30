/**
 * ContentGrid
 *
 * Organism component for displaying grids of content (catalog rows, recommendations, etc.).
 * Integrates with existing CatalogRow component while providing consistent styling.
 *
 * Used throughout detail screens for content display.
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { SectionHeader } from '@/src/presentation/shared/components/molecules/SectionHeader'
import { ProgressIndicator } from '@/src/presentation/shared/components/atoms/ProgressIndicator'
import { CatalogRow } from '@/src/presentation/components/home/CatalogRow'
import type { Catalog } from '@/src/domain/entities/media/catalog.entity'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface ContentGridProps {
  /**
   * Section title
   */
  title: string

  /**
   * Section subtitle
   */
  subtitle?: string

  /**
   * Array of catalogs to display
   */
  catalogs: Catalog[]

  /**
   * Handler for item press
   */
  onItemPress: (item: CatalogItem) => void

  /**
   * Handler for load more
   */
  onLoadMore?: (catalog: Catalog) => Promise<void>

  /**
   * Optional see all handler
   */
  onSeeAll?: () => void

  /**
   * Whether content is loading
   */
  loading?: boolean

  /**
   * Loading message
   */
  loadingMessage?: string

  /**
   * Whether content is fully loaded
   */
  isFullyLoaded?: boolean

  /**
   * Whether to show see all button
   */
  showSeeAll?: boolean

  /**
   * Custom see all text
   */
  seeAllText?: string

  /**
   * Layout variant
   * - standard: Standard catalog row layout
   * - compact: More compact spacing
   * - detailed: More detailed layout with descriptions
   */
  variant?: 'standard' | 'compact' | 'detailed'

  /**
   * Test ID for testing
   */
  testID?: string
}

const ContentGridImpl: React.FC<ContentGridProps> = ({
  title,
  subtitle,
  catalogs,
  onItemPress,
  onLoadMore,
  onSeeAll,
  loading = false,
  loadingMessage,
  isFullyLoaded = false,
  showSeeAll = false,
  seeAllText,
  variant = 'standard',
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant)

  // Don't render if no catalogs and not loading
  if (!loading && catalogs.length === 0) {
    return null
  }

  // Show loading state
  if (loading && !isFullyLoaded && catalogs.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <SectionHeader
          title={title}
          subtitle={subtitle}
          showSeeAll={showSeeAll}
          onSeeAll={onSeeAll}
          seeAllText={seeAllText}
          loading={loading}
        />
        <ProgressIndicator
          message={loadingMessage || 'Loading content...'}
          variant="section"
        />
      </View>
    )
  }

  return (
    <View style={styles.container} testID={testID}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        showSeeAll={showSeeAll}
        onSeeAll={onSeeAll}
        seeAllText={seeAllText}
        loading={loading}
        count={getTotalItemCount(catalogs)}
      />

      {/* Catalog Rows */}
      <View style={styles.catalogsContainer}>
        {catalogs.map((catalog, catalogIndex) => (
          <View key={catalog.id} style={styles.catalogRow}>
            <CatalogRow
              catalog={catalog}
              onItemPress={onItemPress}
              onLoadMore={onLoadMore}
              isLoading={false}
              hasMore={catalog.pagination.hasMore}
              index={catalogIndex}
              isVisible={true}
            />
          </View>
        ))}
      </View>

      {/* Progressive loading indicator for additional content */}
      {loading && isFullyLoaded && catalogs.length > 0 && (
        <View style={styles.progressiveLoading}>
          <ProgressIndicator
            message={loadingMessage || 'Loading more...'}
            variant="inline"
          />
        </View>
      )}
    </View>
  )
}

export const ContentGrid = React.memo(observer(ContentGridImpl))

const getTotalItemCount = (catalogs: Catalog[]): number => {
  return catalogs.reduce((total, catalog) => total + catalog.items.length, 0)
}

const createStyles = (theme: Theme, variant: ContentGridProps['variant']) => {
  const getSpacing = () => {
    switch (variant) {
      case 'compact':
        return {
          sectionMargin: theme.spacing.md,
          catalogMargin: theme.spacing.sm,
        }
      case 'detailed':
        return {
          sectionMargin: theme.spacing.xl,
          catalogMargin: theme.spacing.lg,
        }
      default: // standard
        return {
          sectionMargin: theme.spacing.lg,
          catalogMargin: theme.spacing.md,
        }
    }
  }

  const spacing = getSpacing()

  return StyleSheet.create({
    container: {
      marginBottom: spacing.sectionMargin,
    },
    catalogsContainer: {
      // No additional styling needed - CatalogRow handles its own layout
    },
    catalogRow: {
      marginBottom: spacing.catalogMargin,
    },
    progressiveLoading: {
      marginTop: theme.spacing.sm,
    },
  })
}