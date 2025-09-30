/**
 * DetailHeroSection
 *
 * Organism component for hero sections in detail screens.
 * Handles both media and person hero sections with proper theming and layout.
 *
 * Combines atoms and molecules for a complete hero experience.
 */

import React from 'react'
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { ExpandableText } from '@/src/presentation/shared/components/molecules/ExpandableText'
import { MetadataChip } from '@/src/presentation/shared/components/atoms/MetadataChip'
import { ServiceBadge } from '@/src/presentation/shared/components/atoms/ServiceBadge'
import { ActionButton } from '@/src/presentation/shared/components/atoms/ActionButton'
import { ProgressIndicator } from '@/src/presentation/shared/components/atoms/ProgressIndicator'

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export interface DetailHeroSectionProps {
  /**
   * Type of detail section
   */
  type: 'media' | 'person'

  /**
   * Title/name to display
   */
  title: string

  /**
   * Subtitle or tagline
   */
  subtitle?: string

  /**
   * Background image URL (backdrop for media, profile for person)
   */
  backgroundImageUrl?: string

  /**
   * Poster/profile image URL
   */
  posterImageUrl?: string

  /**
   * Overview or biography text
   */
  overview?: string

  /**
   * Whether overview is expanded
   */
  overviewExpanded?: boolean

  /**
   * Handler for overview expand/collapse
   */
  onOverviewToggle?: (expanded: boolean) => void

  /**
   * Metadata chips data
   */
  metadata: {
    text: string
    icon?: string
    variant?: 'default' | 'accent' | 'rating' | 'year'
  }[]

  /**
   * Service badges data (for media only)
   */
  services?: {
    serviceName: string
    logoUrl?: string
    status?: 'available' | 'coming_soon' | 'rent' | 'subscription'
  }[]

  /**
   * Action buttons data
   */
  actions: {
    title: string
    iconName?: keyof typeof Ionicons.glyphMap
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'tertiary'
  }[]

  /**
   * Whether content is loading
   */
  loading?: boolean

  /**
   * Loading message
   */
  loadingMessage?: string

  /**
   * Navigation handlers
   */
  onBack: () => void
  onShare: () => void

  /**
   * Test ID for testing
   */
  testID?: string
}

const DetailHeroSectionImpl: React.FC<DetailHeroSectionProps> = ({
  type,
  title,
  subtitle,
  backgroundImageUrl,
  posterImageUrl,
  overview,
  overviewExpanded = false,
  onOverviewToggle,
  metadata,
  services = [],
  actions,
  loading = false,
  loadingMessage,
  onBack,
  onShare,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme, type)

  const isMediaType = type === 'media'

  return (
    <View style={styles.container} testID={testID}>
      {/* Background Image */}
      <ImageBackground
        source={{ uri: backgroundImageUrl || posterImageUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay}>
          {/* Navigation Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.navButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.go_back')}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.onColor} />
            </Pressable>

            <Pressable
              style={styles.navButton}
              onPress={onShare}
              accessibilityRole="button"
              accessibilityLabel={t('common.share')}
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text.onColor} />
            </Pressable>
          </View>

          {/* Progressive Loading Indicator */}
          {loading && loadingMessage && (
            <ProgressIndicator
              message={loadingMessage}
              variant="overlay"
              onDark={true}
            />
          )}

          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Title and Subtitle */}
            <View style={styles.titleSection}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Metadata Chips */}
            {metadata.length > 0 && (
              <View style={styles.metadataSection}>
                {metadata.map((item, index) => (
                  <View key={index} style={styles.metadataChip}>
                    <MetadataChip
                      text={item.text}
                      icon={item.icon}
                      variant={item.variant}
                      onDark={true}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Overview/Biography */}
            {overview && (
              <View style={styles.overviewSection}>
                <ExpandableText
                  text={overview}
                  expanded={overviewExpanded}
                  onToggle={onOverviewToggle}
                  variant="overview"
                  onDark={true}
                />
              </View>
            )}

            {/* Action Buttons */}
            {actions.length > 0 && (
              <View style={styles.actionsSection}>
                {actions.map((action, index) => (
                  <View key={index} style={styles.actionButton}>
                    <ActionButton
                      title={action.title}
                      iconName={action.iconName}
                      onPress={action.onPress}
                      variant={action.variant}
                      onDark={true}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Service Badges (Media only) */}
            {isMediaType && services.length > 0 && (
              <View style={styles.servicesSection}>
                <Text style={styles.servicesTitle}>
                  {t('mediaDetail.watch_on')}
                </Text>
                <View style={styles.servicesList}>
                  {services.slice(0, 3).map((service, index) => (
                    <View key={index} style={styles.serviceBadge}>
                      <ServiceBadge
                        serviceName={service.serviceName}
                        logoUrl={service.logoUrl}
                        status={service.status}
                        onDark={true}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

export const DetailHeroSection = React.memo(observer(DetailHeroSectionImpl))

const createStyles = (theme: Theme, type: 'media' | 'person') => {
  const heroHeight = type === 'media' ? screenHeight * 0.7 : screenHeight * 0.5

  return StyleSheet.create({
    container: {
      height: heroHeight,
      width: screenWidth,
    },
    backgroundImage: {
      flex: 1,
      width: '100%',
    },
    backgroundOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'space-between',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    navButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    heroContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    titleSection: {
      marginBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.text.onColor,
      fontSize: theme.typography.display.fontSize,
      fontWeight: theme.typography.display.fontWeight as any,
      lineHeight: theme.typography.display.lineHeight,
      marginBottom: theme.spacing.sm,
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    subtitle: {
      color: theme.colors.text.onColor,
      fontSize: moderateScale(16),
      fontWeight: '500',
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    metadataSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.md,
    },
    metadataChip: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    overviewSection: {
      marginBottom: theme.spacing.md,
    },
    actionsSection: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.md,
    },
    actionButton: {
      marginRight: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    servicesSection: {
      marginTop: theme.spacing.sm,
    },
    servicesTitle: {
      color: theme.colors.text.onColor,
      fontSize: moderateScale(14),
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    servicesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    serviceBadge: {
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
  })
}