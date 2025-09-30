/**
 * ProgressIndicator
 *
 * Atomic component for showing loading progress in detail screens.
 * Used for progressive loading states during data enrichment.
 */

import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface ProgressIndicatorProps {
  /**
   * Loading message to display
   */
  message: string

  /**
   * Position variant
   * - overlay: Fixed overlay position (for screen-level loading)
   * - inline: Inline within content (for section loading)
   * - section: Section-level loading with padding
   */
  variant?: 'overlay' | 'inline' | 'section'

  /**
   * Size of the activity indicator
   */
  size?: 'small' | 'large'

  /**
   * Whether to show on dark background
   */
  onDark?: boolean

  /**
   * Test ID for testing
   */
  testID?: string
}

const ProgressIndicatorImpl: React.FC<ProgressIndicatorProps> = ({
  message,
  variant = 'inline',
  size = 'small',
  onDark = false,
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant, onDark)

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content}>
        <ActivityIndicator
          size={size}
          color={theme.colors.interactive.primary}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  )
}

export const ProgressIndicator = React.memo(observer(ProgressIndicatorImpl))

const createStyles = (
  theme: Theme,
  variant: ProgressIndicatorProps['variant'],
  onDark: boolean
) => {
  const getContainerStyles = () => {
    switch (variant) {
      case 'overlay':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: theme.colors.background.primary,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          ...theme.shadows.sm,
        }
      case 'section':
        return {
          paddingVertical: theme.spacing.lg,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }
      default: // inline
        return {
          paddingVertical: theme.spacing.sm,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }
    }
  }

  const textColor = onDark
    ? theme.colors.text.onColor
    : theme.colors.text.secondary

  return StyleSheet.create({
    container: getContainerStyles(),
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: {
      color: textColor,
      fontSize: variant === 'overlay' ? moderateScale(12) : moderateScale(14),
      fontWeight: '500',
      marginLeft: theme.spacing.xs,
    },
  })
}