/**
 * PersonInfoSection Component
 *
 * Apple TV+ inspired information section for person detail screen featuring:
 * - Clean "Information" section matching Apple TV+ design patterns
 * - Professional biographical information organization
 * - Smart content hierarchy with visual consistency
 * - Enhanced accessibility and responsive layout
 * - "How to Watch" equivalent with filmography highlights
 * - Premium typography matching Apple's design language
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

interface PersonInfoSectionProps {
  /** Person data to display */
  person: PersonCatalogItem
  /** Whether biography is expanded */
  expandedBiography?: boolean
  /** Callback when biography toggle is pressed */
  onBiographyToggle?: () => void
  /** Callback when known work is pressed */
  onKnownForPress?: (work: any) => void
  /** Whether person data is currently being enriched */
  isLoading?: boolean
  /** Whether enrichment is complete */
  isFullyLoaded?: boolean
}

/**
 * Format person's biographical details for Apple TV+ style display
 */
const formatPersonBiography = (person: PersonCatalogItem): {
  born?: string
  died?: string
  age?: string
  birthPlace?: string
  profession?: string
  popularity?: string
} => {
  const details: any = {}

  // Format birth information
  if (person.birthday) {
    const birthDate = new Date(person.birthday)
    details.born = birthDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    // Calculate age
    const currentYear = new Date().getFullYear()
    const birthYear = birthDate.getFullYear()
    if (person.deathday) {
      const deathYear = new Date(person.deathday).getFullYear()
      details.age = `${deathYear - birthYear} years`
    } else {
      details.age = `${currentYear - birthYear} years old`
    }
  }

  // Format death information
  if (person.deathday) {
    const deathDate = new Date(person.deathday)
    details.died = deathDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Other details
  if (person.placeOfBirth) {
    details.birthPlace = person.placeOfBirth
  }

  if (person.knownForDepartment) {
    details.profession = person.knownForDepartment
  }

  // Format popularity
  if (person.popularity) {
    if (person.popularity >= 100) details.popularity = 'Very High'
    else if (person.popularity >= 50) details.popularity = 'High'
    else if (person.popularity >= 20) details.popularity = 'Medium'
    else if (person.popularity >= 5) details.popularity = 'Low'
    else details.popularity = 'Emerging'
  }

  return details
}

/**
 * Extract highlight works from known for array
 */
const getHighlightWorks = (person: PersonCatalogItem): { title: string; character?: string; year?: string }[] => {
  if (!person.knownFor || person.knownFor.length === 0) return []

  return person.knownFor.slice(0, 3).map(work => ({
    title: work.title || 'Unknown Title',
    character: (work as any).character, // Type assertion since character may not be in interface
    year: work.releaseDate ? new Date(work.releaseDate).getFullYear().toString() : undefined
  }))
}

export const PersonInfoSection: React.FC<PersonInfoSectionProps> = observer(({
  person,
  expandedBiography = false,
  onBiographyToggle,
  onKnownForPress,
  isLoading = false,
  isFullyLoaded = false
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Format person details for Apple TV+ style display
  const biographyDetails = useMemo(() => formatPersonBiography(person), [person])
  const highlightWorks = useMemo(() => getHighlightWorks(person), [person])

  // Biography display logic
  const { overview: biography } = person
  const shouldShowBiography = biography && biography.trim().length > 0 && biography !== person.title
  const hasBiographyToggle = shouldShowBiography && biography.length > 300

  // Information section data
  const informationRows = useMemo(() => {
    const rows: { label: string; value: string }[] = []

    if (biographyDetails.born) {
      rows.push({ label: 'Born', value: biographyDetails.born })
    }

    if (biographyDetails.died) {
      rows.push({ label: 'Died', value: biographyDetails.died })
    }

    if (biographyDetails.birthPlace) {
      rows.push({ label: 'Place of Birth', value: biographyDetails.birthPlace })
    }

    if (biographyDetails.profession) {
      rows.push({ label: 'Known For', value: biographyDetails.profession })
    }

    if (biographyDetails.popularity) {
      rows.push({ label: 'Popularity', value: biographyDetails.popularity })
    }

    return rows
  }, [biographyDetails])

  // Don't render if no meaningful content and not loading
  if (informationRows.length === 0 && !shouldShowBiography && highlightWorks.length === 0 && !isLoading) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* How to Watch Equivalent - Career Highlights */}
      {highlightWorks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Highlights</Text>
          <View style={styles.highlightsContainer}>
            {highlightWorks.map((work, index) => (
              <Pressable
                key={index}
                style={styles.highlightItem}
                onPress={() => onKnownForPress?.(work)}
              >
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>{work.title}</Text>
                  {work.year && (
                    <Text style={styles.highlightYear}>{work.year}</Text>
                  )}
                  {work.character && (
                    <Text style={styles.highlightCharacter}>as {work.character}</Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* About Section - Full Biography */}
      {shouldShowBiography && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <Text
              style={styles.aboutText}
              numberOfLines={expandedBiography ? undefined : 4}
            >
              {biography}
            </Text>
            {hasBiographyToggle && (
              <Pressable onPress={onBiographyToggle} style={styles.moreButton}>
                <Text style={styles.moreButtonText}>
                  {expandedBiography ? 'Less' : 'More'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Information Section - Apple TV+ Style */}
      {informationRows.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.informationContainer}>
            {informationRows.map((row, index) => (
              <View key={index} style={styles.informationRow}>
                <Text style={styles.informationLabel}>{row.label}</Text>
                <Text style={styles.informationValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Loading State */}
      {isLoading && !isFullyLoaded && (
        <View style={styles.section}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
            <Text style={styles.loadingText}>
              {t('person_detail.loading_details')}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  // Container - Apple TV+ Section Spacing
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xl,
  },

  // Section Structure - Clean Apple TV+ Layout
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(24), // Large section headers
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: theme.spacing.xs,
  },

  // Career Highlights - "How to Watch" Style
  highlightsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  highlightContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  highlightTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    lineHeight: moderateScale(20),
  },
  highlightYear: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  highlightCharacter: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '400',
    fontStyle: 'italic',
  },

  // About Section - Apple TV+ Style
  aboutContainer: {
    gap: theme.spacing.sm,
  },
  aboutText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '400',
    lineHeight: moderateScale(24),
    letterSpacing: -0.1,
  },
  moreButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  moreButtonText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },

  // Information Section - Apple TV+ Clean Rows
  informationContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  informationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  informationLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '500',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  informationValue: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'right',
    flex: 2,
  },

  // Loading State
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '500',
  },
})

PersonInfoSection.displayName = 'PersonInfoSection'