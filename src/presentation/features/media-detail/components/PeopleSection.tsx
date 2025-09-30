/**
 * PeopleSection Component
 * 
 * Displays multiple people catalogs (Cast, Directors, Writers) for media content.
 * Features horizontal scrolling person cards with profile images and roles.
 * Uses the existing CatalogRow component pattern for consistency.
 * 
 * @component
 * @example
 * ```tsx
 * <PeopleSection
 *   catalogs={peopleCatalogs}
 *   onPersonPress={handlePersonPress}
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
import type { CatalogItem, PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

/**
 * Helper function to check if catalog item is a person
 */
const isPersonCatalogItem = (item: CatalogItem): item is PersonCatalogItem => {
  return 'personData' in item && item.personData !== undefined
}

/**
 * Get person display name from catalog item
 */
const getPersonDisplayName = (item: CatalogItem): string => {
  if (isPersonCatalogItem(item) && item.personData?.name) {
    return item.personData.name
  }
  return item.title || 'Unknown Person'
}

/**
 * Get person role/character from catalog item
 */
const getPersonRole = (item: CatalogItem): string => {
  if (isPersonCatalogItem(item) && item.personData) {
    if (item.personData.character) {
      return item.personData.character
    }
    if (item.personData.job) {
      return item.personData.job
    }
    if (item.personData.knownForDepartment) {
      return item.personData.knownForDepartment
    }
  }
  return 'Person'
}

/**
 * Get person profile image URL from catalog item
 */
const getPersonProfileUrl = (item: CatalogItem): string | undefined => {
  if (isPersonCatalogItem(item) && item.personData?.profilePath) {
    return item.personData.profilePath
  }
  return item.posterUrl
}

/**
 * Props for PeopleSection component
 */
interface PeopleSectionProps {
  /** Array of people catalogs to display (now coming from enriched data as Catalog[]) */
  catalogs: Catalog[]
  /** Callback when a person card is pressed */
  onPersonPress: (person: CatalogItem, catalog: Catalog) => void
  /** Callback when load more is requested for a catalog */
  onLoadMore?: (catalogId: string) => Promise<void>
  /** Optional section title override */
  title?: string
  /** Whether to show the section header */
  showHeader?: boolean
  /** Maximum number of people to show per catalog */
  maxPeoplePerCatalog?: number
}

/**
 * Props for PersonCard component
 */
interface PersonCardProps {
  person: CatalogItem
  catalog: Catalog
  onPress: (person: CatalogItem, catalog: Catalog) => void
  theme: Theme
  showCharacter?: boolean
}

/**
 * Props for PeopleCatalogRow component
 */
interface PeopleCatalogRowProps {
  catalog: Catalog
  onPersonPress: (person: CatalogItem, catalog: Catalog) => void
  onLoadMore?: (catalogId: string) => Promise<void>
  theme: Theme
  maxPeople?: number
}

/**
 * Get placeholder image based on known department
 */
const getPlaceholderImage = (knownForDepartment?: string): string => {
  // Return a placeholder based on department or default person icon
  return 'https://via.placeholder.com/150x200/CCCCCC/666666?text=Person'
}

/**
 * Check if catalog contains cast members (for showing character names)
 */
const shouldShowCharacters = (catalog: Catalog): boolean => {
  return catalog.name.toLowerCase().includes('cast')
}

/**
 * PersonCard - Individual person card with profile image and role
 */
const PersonCard: React.FC<PersonCardProps> = observer(({
  person,
  catalog,
  onPress,
  theme,
  showCharacter = true
}) => {
  const styles = createPersonCardStyles(theme)
  const personName = getPersonDisplayName(person)
  const personRole = getPersonRole(person)
  const profileUrl = getPersonProfileUrl(person)
  const characterName = isPersonCatalogItem(person) ? person.personData?.character : undefined
  const popularity = isPersonCatalogItem(person) ? person.personData?.popularity : undefined
  
  const imageSource = profileUrl 
    ? { uri: profileUrl }
    : { uri: getPlaceholderImage(isPersonCatalogItem(person) ? person.personData?.knownForDepartment : undefined) }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(person, catalog)}
      accessibilityRole="button"
      accessibilityLabel={`${personName}${characterName ? ` as ${characterName}` : ''}`}
      accessibilityHint="Double tap to view person details"
    >
      {/* Profile image */}
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.profileImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        
        {/* Popularity indicator for top performers */}
        {popularity && popularity > 50 && (
          <View style={styles.popularityBadge}>
            <Text style={styles.popularityText}>★</Text>
          </View>
        )}
      </View>

      {/* Person details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {personName}
        </Text>
        
        {showCharacter && characterName && shouldShowCharacters(catalog) && (
          <Text style={styles.character} numberOfLines={2}>
            {characterName}
          </Text>
        )}
        
        <Text style={styles.role} numberOfLines={1}>
          {personRole}
        </Text>
      </View>
    </Pressable>
  )
})

/**
 * PeopleCatalogRow - Horizontal scrolling row of people for a specific catalog
 */
const PeopleCatalogRow: React.FC<PeopleCatalogRowProps> = observer(({
  catalog,
  onPersonPress,
  onLoadMore,
  theme,
  maxPeople = 20
}) => {
  const { t } = useTranslation()
  const styles = createPeopleCatalogRowStyles(theme)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Limit the number of people displayed
  const displayPeople = catalog.items.slice(0, maxPeople)
  
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
      console.warn('Failed to load more people:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, catalog.pagination.hasMore, catalog.id, onLoadMore])

  if (displayPeople.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Catalog header */}
      <View style={styles.header}>
        <Text style={styles.title}>{catalog.name}</Text>
        <Text style={styles.count}>
          {catalog.items.length} {catalog.items.length === 1 ? 'person' : 'people'}
        </Text>
      </View>

      {/* Horizontal scrolling people list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={scale(120)}
        snapToAlignment="start"
        accessibilityLabel={`${catalog.name} horizontal scroll`}
      >
        {displayPeople.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            catalog={catalog}
            onPress={onPersonPress}
            theme={theme}
            showCharacter={shouldShowCharacters(catalog)}
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
                accessibilityHint="Double tap to load more people"
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

        {/* Show more indicator if there are more people (fallback for when loadMore is not available) */}
        {catalog.items.length > maxPeople && !catalog.pagination.hasMore && (
          <Pressable
            style={styles.showMoreCard}
            onPress={() => {
              // This could navigate to a full people list screen
              // For now, we'll just trigger the callback with a placeholder item
              // Create a placeholder catalog item for "show more"
              const morePerson: CatalogItem = {
                id: 'show-more',
                title: t('media_detail.people.show_more'),
                overview: '',
                posterUrl: '',
                backdropUrl: '',
                mediaType: catalog.mediaType,
                externalIds: {},
                contentContext: catalog.catalogContext,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              onPersonPress(morePerson, catalog)
            }}
            accessibilityRole="button"
            accessibilityLabel={`Show all ${catalog.name}`}
          >
            <View style={styles.showMoreContent}>
              <Text style={styles.showMoreText}>
                +{catalog.items.length - maxPeople}
              </Text>
              <Text style={styles.showMoreLabel}>
                {t('media_detail.people.more')}
              </Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
})

/**
 * PeopleSection - Main component displaying multiple people catalogs
 */
export const PeopleSection: React.FC<PeopleSectionProps> = observer(({
  catalogs,
  onPersonPress,
  onLoadMore,
  title,
  showHeader = true,
  maxPeoplePerCatalog = 20
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createPeopleSectionStyles(theme)

  // Filter out empty catalogs
  const validCatalogs = catalogs.filter(catalog => catalog.items.length > 0)

  // Don't render if no valid catalogs
  if (validCatalogs.length === 0) {
    return null
  }

  const sectionTitle = title ?? t('media_detail.people.title')

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sectionTitle}</Text>
          <Text style={styles.headerSubtitle}>
            {validCatalogs.length} {validCatalogs.length === 1 ? 'category' : 'categories'}
          </Text>
        </View>
      )}

      {/* Render each people catalog */}
      {validCatalogs.map((catalog) => (
        <PeopleCatalogRow
          key={catalog.id}
          catalog={catalog}
          onPersonPress={onPersonPress}
          onLoadMore={onLoadMore}
          theme={theme}
          maxPeople={maxPeoplePerCatalog}
        />
      ))}
    </View>
  )
})

/**
 * Styles for PeopleSection component
 */
const createPeopleSectionStyles = (theme: Theme) => StyleSheet.create({
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
 * Styles for PeopleCatalogRow component
 */
const createPeopleCatalogRowStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary
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
    width: scale(100),
    height: verticalScale(160),
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
    width: scale(100),
    height: verticalScale(160),
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
    width: scale(100),
    height: verticalScale(160),
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
 * Styles for PersonCard component
 */
const createPersonCardStyles = (theme: Theme) => {
  const cardWidth = scale(100)
  const cardHeight = verticalScale(160)
  const imageHeight = verticalScale(120)

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
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: imageHeight,
      backgroundColor: theme.colors.background.tertiary
    },
    profileImage: {
      width: '100%',
      height: '100%'
    },
    popularityBadge: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      width: scale(20),
      height: scale(20),
      borderRadius: scale(10),
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    popularityText: {
      fontSize: moderateScale(10),
      color: '#000000',
      fontWeight: '600'
    },
    details: {
      flex: 1,
      padding: theme.spacing.xs,
      justifyContent: 'space-between'
    },
    name: {
      fontSize: moderateScale(11),
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: moderateScale(14)
    },
    character: {
      fontSize: moderateScale(9),
      color: theme.colors.text.secondary,
      lineHeight: moderateScale(12),
      fontStyle: 'italic'
    },
    role: {
      fontSize: moderateScale(9),
      color: theme.colors.interactive.primary,
      fontWeight: '500'
    }
  })
}

PersonCard.displayName = 'PersonCard'
PeopleCatalogRow.displayName = 'PeopleCatalogRow'
PeopleSection.displayName = 'PeopleSection'

export default PeopleSection