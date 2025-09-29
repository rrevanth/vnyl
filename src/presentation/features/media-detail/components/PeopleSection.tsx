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
 * Person data structure
 */
export interface Person {
  /** Unique identifier for the person */
  id: string
  /** Person's full name */
  name: string
  /** Person's role in the production */
  role: string
  /** Character name (for cast members) */
  character?: string
  /** Profile image URL */
  profileImageUrl?: string
  /** Person's popularity ranking */
  popularity?: number
  /** Known for department (Acting, Directing, Writing, etc.) */
  knownForDepartment?: string
}

/**
 * People catalog data structure
 */
export interface PeopleCatalog {
  /** Unique identifier for the catalog */
  id: string
  /** Catalog title (e.g., "Cast", "Directors", "Writers") */
  title: string
  /** Array of people in this catalog */
  people: Person[]
  /** Category type for styling */
  category: 'cast' | 'crew' | 'directors' | 'writers' | 'producers'
  /** Whether to show character names */
  showCharacters?: boolean
}

/**
 * Props for PeopleSection component
 */
interface PeopleSectionProps {
  /** Array of people catalogs to display */
  catalogs: PeopleCatalog[]
  /** Callback when a person card is pressed */
  onPersonPress: (person: Person, catalog: PeopleCatalog) => void
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
  person: Person
  catalog: PeopleCatalog
  onPress: (person: Person, catalog: PeopleCatalog) => void
  theme: Theme
  showCharacter?: boolean
}

/**
 * Props for PeopleCatalogRow component
 */
interface PeopleCatalogRowProps {
  catalog: PeopleCatalog
  onPersonPress: (person: Person, catalog: PeopleCatalog) => void
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
  const imageSource = person.profileImageUrl 
    ? { uri: person.profileImageUrl }
    : { uri: getPlaceholderImage(person.knownForDepartment) }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => onPress(person, catalog)}
      accessibilityRole="button"
      accessibilityLabel={`${person.name}${person.character ? ` as ${person.character}` : ''}`}
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
        {person.popularity && person.popularity > 50 && (
          <View style={styles.popularityBadge}>
            <Text style={styles.popularityText}>★</Text>
          </View>
        )}
      </View>

      {/* Person details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {person.name}
        </Text>
        
        {showCharacter && person.character && catalog.showCharacters && (
          <Text style={styles.character} numberOfLines={2}>
            {person.character}
          </Text>
        )}
        
        <Text style={styles.role} numberOfLines={1}>
          {person.role}
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
  theme,
  maxPeople = 20
}) => {
  const { t } = useTranslation()
  const styles = createPeopleCatalogRowStyles(theme)

  // Limit the number of people displayed
  const displayPeople = catalog.people.slice(0, maxPeople)

  if (displayPeople.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Catalog header */}
      <View style={styles.header}>
        <Text style={styles.title}>{catalog.title}</Text>
        <Text style={styles.count}>
          {catalog.people.length} {catalog.people.length === 1 ? 'person' : 'people'}
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
        accessibilityLabel={`${catalog.title} horizontal scroll`}
      >
        {displayPeople.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            catalog={catalog}
            onPress={onPersonPress}
            theme={theme}
            showCharacter={catalog.showCharacters}
          />
        ))}

        {/* Show more indicator if there are more people */}
        {catalog.people.length > maxPeople && (
          <Pressable
            style={styles.showMoreCard}
            onPress={() => {
              // This could navigate to a full people list screen
              // For now, we'll just trigger the callback with a special person
              const morePerson: Person = {
                id: 'show-more',
                name: t('media_detail.people.show_more'),
                role: '',
                profileImageUrl: ''
              }
              onPersonPress(morePerson, catalog)
            }}
            accessibilityRole="button"
            accessibilityLabel={`Show all ${catalog.title}`}
          >
            <View style={styles.showMoreContent}>
              <Text style={styles.showMoreText}>
                +{catalog.people.length - maxPeople}
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
  title,
  showHeader = true,
  maxPeoplePerCatalog = 20
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createPeopleSectionStyles(theme)

  // Filter out empty catalogs
  const validCatalogs = catalogs.filter(catalog => catalog.people.length > 0)

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