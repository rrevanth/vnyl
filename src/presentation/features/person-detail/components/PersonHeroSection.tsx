/**
 * PersonHeroSection Component
 * 
 * Hero section for person detail screen featuring:
 * - Large profile image with fallback handling
 * - Person name and primary department
 * - Birth/death dates and place of birth
 * - Known for department badge
 * - Progressive loading states
 * - Native React Native components with theme integration
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { scale, moderateScale } from 'react-native-size-matters'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Ionicons } from '@expo/vector-icons'

// Screen dimensions for responsive design
// const { width: screenWidth } = Dimensions.get('window')

interface PersonHeroSectionProps {
  /** Person data to display */
  person: PersonCatalogItem
  /** Whether person data is currently being enriched */
  isLoading?: boolean
  /** Whether enrichment is complete */
  isFullyLoaded?: boolean
}

/**
 * Format person's age or age at death
 */
const formatAge = (birthday?: Date, deathday?: Date): string | null => {
  if (!birthday) return null
  
  const endDate = deathday || new Date()
  const birthYear = birthday.getFullYear()
  const endYear = endDate.getFullYear()
  const age = endYear - birthYear
  
  // Check if birthday has passed this year (for living people)
  if (!deathday) {
    const birthdayThisYear = new Date(endYear, birthday.getMonth(), birthday.getDate())
    if (endDate < birthdayThisYear) {
      return `${age - 1}`
    }
  }
  
  return `${age}`
}

/**
 * Format date for display
 */
const formatDate = (date: Date, locale: string = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Get appropriate placeholder icon based on gender or department
 */
// const getPlaceholderIcon = (person: PersonCatalogItem): string => {
//   // Use gender-neutral person icon as default
//   return 'person-outline'
// }

/**
 * Get department color based on known department
 */
const getDepartmentColor = (theme: Theme, knownForDepartment?: string): string => {
  if (!knownForDepartment) return theme.colors.interactive.secondary
  
  const department = knownForDepartment.toLowerCase()
  
  switch (department) {
    case 'acting':
      return '#FF6B6B' // Red for actors
    case 'directing':
      return '#4ECDC4' // Teal for directors
    case 'writing':
      return '#45B7D1' // Blue for writers
    case 'production':
      return '#96CEB4' // Green for producers
    case 'camera':
      return '#FFEAA7' // Yellow for cinematography
    case 'editing':
      return '#DDA0DD' // Purple for editors
    case 'sound':
      return '#F39C12' // Orange for sound
    default:
      return theme.colors.interactive.secondary
  }
}

export const PersonHeroSection: React.FC<PersonHeroSectionProps> = observer(({
  person,
  isLoading = false,
  isFullyLoaded = false
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Extract person data
  const {
    title: name,
    profileUrl,
    knownForDepartment,
    birthday,
    deathday,
    placeOfBirth,
    popularity
  } = person

  // Calculate age
  const age = useMemo(() => {
    return formatAge(birthday, deathday)
  }, [birthday, deathday])

  // Format dates for display
  const formattedBirthday = useMemo(() => {
    return birthday ? formatDate(birthday) : null
  }, [birthday])

  const formattedDeathday = useMemo(() => {
    return deathday ? formatDate(deathday) : null
  }, [deathday])

  // Department color
  const departmentColor = useMemo(() => {
    return getDepartmentColor(theme, knownForDepartment)
  }, [theme, knownForDepartment])

  // Profile image source
  const imageSource = useMemo(() => {
    if (profileUrl) {
      return { uri: profileUrl }
    }
    return null
  }, [profileUrl])

  return (
    <View style={styles.container}>
      {/* Profile Image Section */}
      <View style={styles.imageSection}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.profileImage}
              resizeMode="cover"
              accessibilityLabel={`${name} profile photo`}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons 
                name="person-outline"
                size={scale(80)} 
                color={theme.colors.text.secondary} 
              />
            </View>
          )}
          
          {/* Popularity indicator for very popular people */}
          {popularity && popularity > 80 && (
            <View style={styles.popularityBadge}>
              <Ionicons name="star" size={scale(16)} color="#FFD700" />
            </View>
          )}
        </View>

        {/* Known For Department Badge */}
        {knownForDepartment && (
          <View style={[styles.departmentBadge, { backgroundColor: departmentColor }]}>
            <Text style={styles.departmentText}>
              {knownForDepartment}
            </Text>
          </View>
        )}
      </View>

      {/* Person Information */}
      <View style={styles.infoSection}>
        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {/* Age and Life Dates */}
        {(age || formattedBirthday || formattedDeathday) && (
          <View style={styles.lifeDates}>
            {age && (
              <Text style={styles.ageText}>
                {deathday ? `Died at ${age} years old` : `${age} years old`}
              </Text>
            )}
            
            {formattedBirthday && (
              <Text style={styles.dateText}>
                {deathday 
                  ? `${formattedBirthday} - ${formattedDeathday}`
                  : `Born ${formattedBirthday}`
                }
              </Text>
            )}
          </View>
        )}

        {/* Place of Birth */}
        {placeOfBirth && (
          <View style={styles.birthPlaceContainer}>
            <Ionicons name="location-outline" size={scale(16)} color={theme.colors.text.secondary} />
            <Text style={styles.birthPlaceText}>
              {placeOfBirth}
            </Text>
          </View>
        )}

        {/* Loading States */}
        {isLoading && !isFullyLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
            <Text style={styles.loadingText}>
              {t('person_detail.loading_details')}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
})

const createStyles = (theme: Theme) => {
  const imageSize = scale(160)
  
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    imageSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    imageContainer: {
      position: 'relative',
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.tertiary,
      ...theme.shadows.lg,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.tertiary,
    },
    popularityBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    departmentBadge: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      ...theme.shadows.sm,
    },
    departmentText: {
      color: theme.colors.text.onColor,
      fontSize: moderateScale(12),
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoSection: {
      alignItems: 'center',
      width: '100%',
    },
    name: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.display.fontSize,
      fontWeight: theme.typography.display.fontWeight as any,
      lineHeight: theme.typography.display.lineHeight,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    lifeDates: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    ageText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.heading2.fontSize,
      fontWeight: '500',
      marginBottom: theme.spacing.xs,
    },
    dateText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.body.fontSize,
      textAlign: 'center',
      lineHeight: theme.typography.body.lineHeight,
    },
    birthPlaceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    birthPlaceText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.body.fontSize,
      marginLeft: theme.spacing.xs,
      textAlign: 'center',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    loadingText: {
      color: theme.colors.text.secondary,
      fontSize: moderateScale(12),
      fontWeight: '500',
      marginLeft: theme.spacing.xs,
    },
  })
}

PersonHeroSection.displayName = 'PersonHeroSection'