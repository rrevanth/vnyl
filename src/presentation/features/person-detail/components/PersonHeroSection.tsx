/**
 * PersonHeroSection Component
 *
 * Apple TV+ inspired hero section for person detail screen featuring:
 * - Immersive full-width backdrop with professional overlay
 * - Clean navigation header with iOS-style controls
 * - Sophisticated person name and metadata display
 * - Smart content organization with "About" and service integration
 * - Premium visual hierarchy matching Apple TV+ design language
 * - Enhanced accessibility and responsive design
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Image
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { scale, moderateScale } from 'react-native-size-matters'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Ionicons } from '@expo/vector-icons'

// Screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

interface PersonHeroSectionProps {
  /** Person data to display */
  person: PersonCatalogItem
  /** Whether person data is currently being enriched */
  isLoading?: boolean
  /** Whether enrichment is complete */
  isFullyLoaded?: boolean
  /** Whether biography is expanded */
  expandedBiography?: boolean
  /** Handler for biography expand/collapse */
  onBiographyToggle?: () => void
  /** Handler for navigation back */
  onBack?: () => void
  /** Handler for share action */
  onShare?: () => void
}

/**
 * Format person's professional information for Apple TV+ style display
 */
const formatPersonMetadata = (person: PersonCatalogItem, t: (key: string) => string): string[] => {
  const metadata: string[] = []

  // Primary profession/department
  if (person.knownForDepartment) {
    metadata.push(person.knownForDepartment)
  }

  // Age and life dates in Apple TV+ format
  if (person.birthday) {
    const birthYear = person.birthday.getFullYear()
    if (person.deathday) {
      const deathYear = person.deathday.getFullYear()
      metadata.push(`${birthYear} - ${deathYear}`)
    } else {
      const currentYear = new Date().getFullYear()
      const age = currentYear - birthYear
      metadata.push(`${age} years old`)
    }
  }

  // Place of birth for context
  if (person.placeOfBirth) {
    metadata.push(person.placeOfBirth)
  }

  return metadata
}

/**
 * Get optimized person image for hero display
 */
const getOptimizedPersonImage = (person: PersonCatalogItem): { backdrop?: string; profile?: string } => {
  return {
    backdrop: person.backdropUrl || undefined,
    profile: person.profileUrl || undefined
  }
}

export const PersonHeroSection: React.FC<PersonHeroSectionProps> = observer(({
  person,
  isLoading = false,
  isFullyLoaded = false,
  expandedBiography = false,
  onBiographyToggle,
  onBack,
  onShare
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Extract person data with Apple TV+ formatting
  const { title: name, overview: biography } = person
  const metadata = useMemo(() => formatPersonMetadata(person, t), [person, t])
  const images = useMemo(() => getOptimizedPersonImage(person), [person])

  // Determine hero layout based on available images
  const hasBackdrop = !!images.backdrop
  const hasProfile = !!images.profile

  // Handle actions
  const handleBack = () => onBack?.()
  const handleShare = () => onShare?.()
  const handleBiographyToggle = () => onBiographyToggle?.()

  // Biography display logic
  const shouldShowBiography = biography && biography.trim().length > 0 && biography !== name
  const hasBiographyToggle = shouldShowBiography && biography.length > 200

  return (
    <View style={styles.heroContainer}>
      {/* Hero Background - Apple TV+ Style */}
      <ImageBackground
        source={hasBackdrop ? { uri: images.backdrop } : undefined}
        style={styles.heroBackground}
        resizeMode="cover"
      >
        {/* Premium Gradient Overlay */}
        <View style={styles.heroOverlay}>
          {/* Navigation Header - iOS Style */}
          <View style={styles.navigationHeader}>
            <Pressable
              style={styles.navButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.go_back')}
            >
              <Ionicons name="chevron-back" size={28} color={theme.colors.text.onColor} />
            </Pressable>

            <Pressable
              style={styles.navButton}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel={t('person_detail.share')}
            >
              <Ionicons name="square-outline" size={24} color={theme.colors.text.onColor} />
            </Pressable>
          </View>

          {/* Hero Content Area - Apple TV+ Layout */}
          <View style={styles.heroContentContainer}>
            <View style={styles.heroContent}>
              {/* Profile Image Section */}
              {hasProfile && (
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{ uri: images.profile }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Person Information */}
              <View style={styles.personInfo}>
                {/* Person Name - Apple TV+ Typography */}
                <Text style={styles.personName} numberOfLines={2}>
                  {name}
                </Text>

                {/* Professional Metadata */}
                {metadata.length > 0 && (
                  <View style={styles.metadataContainer}>
                    {metadata.map((item, index, array) => (
                      <React.Fragment key={index}>
                        <Text style={styles.metadataText}>{item}</Text>
                        {index < array.length - 1 && (
                          <Text style={styles.metadataSeparator}> • </Text>
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                )}

                {/* About Section - Apple TV+ Style */}
                {shouldShowBiography && (
                  <View style={styles.aboutSection}>
                    <Text style={styles.aboutTitle}>About</Text>
                    <Text
                      style={styles.aboutText}
                      numberOfLines={expandedBiography ? undefined : 3}
                    >
                      {biography}
                    </Text>
                    {hasBiographyToggle && (
                      <Pressable onPress={handleBiographyToggle} style={styles.moreButton}>
                        <Text style={styles.moreButtonText}>
                          {expandedBiography ? 'Less' : 'More'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Loading State */}
                {isLoading && !isFullyLoaded && (
                  <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color={theme.colors.text.onColor} />
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
})

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    // Hero Container - Apple TV+ Full Screen Design
    heroContainer: {
      height: screenHeight * 0.85, // Taller for immersive experience
      width: screenWidth,
      backgroundColor: theme.colors.background.primary,
    },
    heroBackground: {
      flex: 1,
      width: '100%',
    },
    heroOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Premium dark overlay
      paddingTop: theme.spacing.xl,
    },

    // Navigation Header - iOS Style
    navigationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      zIndex: 100,
    },
    navButton: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
    },

    // Hero Content Container - Apple TV+ Layout
    heroContentContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    heroContent: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.lg,
    },

    // Profile Image - Clean Circle Design
    profileImageContainer: {
      width: scale(120),
      height: scale(120),
      borderRadius: scale(60),
      backgroundColor: theme.colors.background.secondary,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      ...theme.shadows.lg,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },

    // Person Information - Apple TV+ Typography
    personInfo: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    personName: {
      color: theme.colors.text.onColor,
      fontSize: moderateScale(36), // Large, bold title
      fontWeight: '700',
      lineHeight: moderateScale(42),
      letterSpacing: -0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    // Metadata - Professional Information
    metadataContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    metadataText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: moderateScale(16),
      fontWeight: '500',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    metadataSeparator: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: moderateScale(16),
      fontWeight: '400',
    },

    // About Section - Apple TV+ Style
    aboutSection: {
      maxWidth: '85%', // Constrain width for readability
      gap: theme.spacing.xs,
    },
    aboutTitle: {
      color: theme.colors.text.onColor,
      fontSize: moderateScale(18),
      fontWeight: '600',
      letterSpacing: -0.2,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    aboutText: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: moderateScale(15),
      fontWeight: '400',
      lineHeight: moderateScale(22),
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    moreButton: {
      alignSelf: 'flex-start',
      paddingVertical: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    moreButtonText: {
      color: theme.colors.interactive.primary,
      fontSize: moderateScale(15),
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // Loading State
    loadingIndicator: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
  })
}

PersonHeroSection.displayName = 'PersonHeroSection'