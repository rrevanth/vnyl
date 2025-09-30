/**
 * MetadataChip
 *
 * Atomic component for displaying small pieces of metadata like:
 * - Release year (2024)
 * - Rating (★ 8.5)
 * - Runtime (120 min)
 * - Media type (Movie, TV Series)
 * - Genres, etc.
 *
 * Follows Apple TV+ design language with subtle backgrounds and clear typography.
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface MetadataChipProps {
  /**
   * The text content to display in the chip
   */
  text: string

  /**
   * Optional icon (as text/emoji) to display before the text
   */
  icon?: string

  /**
   * Visual variant of the chip
   * - default: Subtle background with primary text
   * - accent: Accent background with inverse text
   * - rating: Special styling for ratings (star icon, accent color)
   * - year: Special styling for years
   */
  variant?: 'default' | 'accent' | 'rating' | 'year'

  /**
   * Size variant
   * - sm: Compact size for dense layouts
   * - md: Standard size (default)
   * - lg: Larger size for emphasis
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether to show on a dark background (affects color selection)
   */
  onDark?: boolean

  /**
   * Test ID for testing
   */
  testID?: string
}

const MetadataChipImpl: React.FC<MetadataChipProps> = ({
  text,
  icon,
  variant = 'default',
  size = 'md',
  onDark = false,
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant, size, onDark)

  return (
    <View style={styles.container} testID={testID}>
      {icon && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text style={styles.text} numberOfLines={1}>
        {text}
      </Text>
    </View>
  )
}

export const MetadataChip = React.memo(observer(MetadataChipImpl))

const createStyles = (
  theme: Theme,
  variant: MetadataChipProps['variant'],
  size: MetadataChipProps['size'],
  onDark: boolean
) => {
  // Size-based dimensions
  const dimensions = {
    sm: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs / 2,
      fontSize: moderateScale(11),
      lineHeight: moderateScale(14),
    },
    md: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(16),
    },
    lg: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: moderateScale(14),
      lineHeight: moderateScale(18),
    }
  }

  // Variant-based colors
  const getColors = () => {
    const base = onDark ? {
      defaultBg: 'rgba(255,255,255,0.15)',
      defaultText: theme.colors.text.onColor,
      accentBg: theme.colors.interactive.primary,
      accentText: theme.colors.text.onColor,
    } : {
      defaultBg: theme.colors.background.tertiary,
      defaultText: theme.colors.text.primary,
      accentBg: theme.colors.interactive.primary,
      accentText: theme.colors.text.onColor,
    }

    switch (variant) {
      case 'accent':
        return {
          backgroundColor: base.accentBg,
          textColor: base.accentText,
        }
      case 'rating':
        return {
          backgroundColor: onDark ? 'rgba(255,193,7,0.2)' : 'rgba(255,193,7,0.1)',
          textColor: onDark ? '#FFC107' : '#F57C00',
        }
      case 'year':
        return {
          backgroundColor: base.defaultBg,
          textColor: theme.colors.text.secondary,
        }
      default:
        return {
          backgroundColor: base.defaultBg,
          textColor: base.defaultText,
        }
    }
  }

  const colors = getColors()
  const sizeDims = dimensions[size!]

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
      paddingHorizontal: sizeDims.paddingHorizontal,
      paddingVertical: sizeDims.paddingVertical,
      borderRadius: theme.radius.sm,
      alignSelf: 'flex-start',
    },
    icon: {
      fontSize: sizeDims.fontSize,
      lineHeight: sizeDims.lineHeight,
      color: colors.textColor,
      marginRight: theme.spacing.xs / 2,
    },
    text: {
      fontSize: sizeDims.fontSize,
      lineHeight: sizeDims.lineHeight,
      fontWeight: '500',
      color: colors.textColor,
    },
  })
}