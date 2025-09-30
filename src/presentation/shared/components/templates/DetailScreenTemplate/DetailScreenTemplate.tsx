/**
 * DetailScreenTemplate
 *
 * Template component that provides the standard layout structure for detail screens.
 * Handles scroll behavior, safe areas, and consistent spacing.
 *
 * Used as the foundation for both media and person detail screens.
 */

import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { observer } from '@legendapp/state/react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface DetailScreenTemplateProps {
  /**
   * Hero section content (required)
   */
  heroSection: React.ReactNode

  /**
   * Main content sections
   */
  children: React.ReactNode

  /**
   * Whether to show scroll indicators
   */
  showScrollIndicator?: boolean

  /**
   * Whether to enable bounce on scroll
   */
  bounces?: boolean

  /**
   * Custom scroll view props
   */
  scrollViewProps?: React.ComponentProps<typeof ScrollView>

  /**
   * Custom safe area edges
   */
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[]

  /**
   * Layout variant
   * - standard: Default layout with standard spacing
   * - compact: Reduced spacing for dense content
   * - spacious: Increased spacing for premium feel
   */
  variant?: 'standard' | 'compact' | 'spacious'

  /**
   * Test ID for testing
   */
  testID?: string
}

const DetailScreenTemplateImpl: React.FC<DetailScreenTemplateProps> = ({
  heroSection,
  children,
  showScrollIndicator = false,
  bounces = true,
  scrollViewProps,
  safeAreaEdges = ['top'],
  variant = 'standard',
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant)

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges} testID={testID}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={showScrollIndicator}
        bounces={bounces}
        {...scrollViewProps}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {heroSection}
        </View>

        {/* Content Sections */}
        <View style={styles.contentContainer}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export const DetailScreenTemplate = React.memo(observer(DetailScreenTemplateImpl))

const createStyles = (theme: Theme, variant: DetailScreenTemplateProps['variant']) => {
  const getSpacing = () => {
    switch (variant) {
      case 'compact':
        return {
          contentPadding: theme.spacing.sm,
        }
      case 'spacious':
        return {
          contentPadding: theme.spacing.xl,
        }
      default: // standard
        return {
          contentPadding: theme.spacing.md,
        }
    }
  }

  const spacing = getSpacing()

  return StyleSheet.create({
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
    heroContainer: {
      // Hero section handles its own styling
    },
    contentContainer: {
      padding: spacing.contentPadding,
    },
  })
}