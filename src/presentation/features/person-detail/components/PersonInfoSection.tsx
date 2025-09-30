/**
 * PersonInfoSection Component
 * 
 * Information section for person detail screen featuring:
 * - Biography with expand/collapse functionality
 * - Also known as (alternative names)
 * - Personal details in a clean layout
 * - Progressive loading states
 * - Native React Native components with theme integration
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
  /** Whether person data is currently being enriched */
  isLoading?: boolean
  /** Whether enrichment is complete */
  isFullyLoaded?: boolean
}

/**
 * Format popularity score for display
 */
const formatPopularity = (popularity?: number): string | null => {
  if (!popularity) return null
  
  if (popularity >= 100) return 'Very High'
  if (popularity >= 50) return 'High'
  if (popularity >= 20) return 'Medium'
  if (popularity >= 5) return 'Low'
  return 'Emerging'
}

/**
 * Get gender display text
 */
const getGenderDisplay = (gender?: number): string | null => {
  switch (gender) {
    case 1: return 'Female'
    case 2: return 'Male'
    case 3: return 'Non-binary'
    default: return null
  }
}

/**
 * Extract also known as names from enriched data
 */
const getAlsoKnownAs = (person: PersonCatalogItem): string[] => {
  // Check if we have enriched data with also known as information
  const enrichedData = person.enrichedData
  if (!enrichedData) return []
  
  // Try to extract from various possible enrichment sources
  const alsoKnownAs: string[] = []
  
  // Add any alternative names from the overview if it contains semicolon-separated names
  if (person.overview && person.overview !== person.title) {
    const names = person.overview.split(';').map(name => name.trim()).filter(Boolean)
    if (names.length > 1) {
      alsoKnownAs.push(...names.slice(1)) // Skip first name as it's likely the main name
    }
  }
  
  return alsoKnownAs.filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
}

export const PersonInfoSection: React.FC<PersonInfoSectionProps> = observer(({
  person,
  expandedBiography = false,
  onBiographyToggle,
  isLoading = false,
  isFullyLoaded = false
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Extract person data
  const {
    overview: biography,
    popularity,
    gender,
    knownForDepartment,
    birthday,
    deathday
  } = person

  // Process additional information
  const alsoKnownAs = useMemo(() => getAlsoKnownAs(person), [person])
  const popularityDisplay = useMemo(() => formatPopularity(popularity), [popularity])
  const genderDisplay = useMemo(() => getGenderDisplay(gender), [gender])

  // Determine if we should show biography
  const hasBiography = biography && biography.trim().length > 0 && biography !== person.title
  const shouldShowBiographyToggle = hasBiography && biography.length > 200

  // Personal details for the grid
  const personalDetails = useMemo(() => {
    const details: { key: string; label: string; value: string }[] = []
    
    if (knownForDepartment) {
      details.push({
        key: 'department',
        label: t('person_detail.known_for_department'),
        value: knownForDepartment
      })
    }
    
    if (genderDisplay) {
      details.push({
        key: 'gender',
        label: t('person_detail.gender'),
        value: genderDisplay
      })
    }
    
    if (popularityDisplay) {
      details.push({
        key: 'popularity',
        label: t('person_detail.popularity'),
        value: popularityDisplay
      })
    }
    
    if (birthday && !deathday) { // Only show if person is still alive
      const age = new Date().getFullYear() - birthday.getFullYear()
      details.push({
        key: 'age',
        label: t('person_detail.age_label'),
        value: `${age} ${t('person_detail.years_old')}`
      })
    }
    
    return details
  }, [knownForDepartment, genderDisplay, popularityDisplay, birthday, deathday, t])

  // Don't render if no meaningful content
  if (!hasBiography && alsoKnownAs.length === 0 && personalDetails.length === 0 && !isLoading) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Biography Section */}
      {(hasBiography || isLoading) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('person_detail.biography')}</Text>
          
          {hasBiography && (
            <View style={styles.biographyContainer}>
              <Text
                style={styles.biographyText}
                numberOfLines={expandedBiography ? undefined : 4}
              >
                {biography}
              </Text>
              
              {shouldShowBiographyToggle && onBiographyToggle && (
                <Pressable onPress={onBiographyToggle} style={styles.expandButton}>
                  <Text style={styles.expandButtonText}>
                    {expandedBiography ? t('person_detail.show_less') : t('person_detail.show_more')}
                  </Text>
                  <Ionicons 
                    name={expandedBiography ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={theme.colors.interactive.primary} 
                  />
                </Pressable>
              )}
            </View>
          )}
          
          {isLoading && !hasBiography && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
              <Text style={styles.loadingText}>
                {t('person_detail.loading_biography')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Also Known As Section */}
      {alsoKnownAs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('person_detail.also_known_as')}</Text>
          <View style={styles.alsoKnownAsContainer}>
            {alsoKnownAs.map((name, index) => (
              <View key={index} style={styles.alsoKnownAsItem}>
                <Text style={styles.alsoKnownAsText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Personal Details Section */}
      {(personalDetails.length > 0 || isLoading) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('person_detail.personal_details')}</Text>
          
          {personalDetails.length > 0 && (
            <View style={styles.detailsGrid}>
              {personalDetails.map((detail) => (
                <View key={detail.key} style={styles.detailItem}>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          )}
          
          {isLoading && personalDetails.length === 0 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
              <Text style={styles.loadingText}>
                {t('person_detail.loading_details')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
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
  biographyContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  biographyText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.sm,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
  },
  expandButtonText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  alsoKnownAsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  alsoKnownAsItem: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  alsoKnownAsText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  detailsGrid: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.secondary,
  },
  detailLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
})

PersonInfoSection.displayName = 'PersonInfoSection'