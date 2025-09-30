/**
 * ActionButton
 *
 * Atomic component for action buttons in detail screens.
 * Supports different variants for play, watchlist, share, and other actions.
 *
 * Follows Apple TV+ design language with proper accessibility and interaction states.
 */

import React from 'react'
import { Pressable, Text, StyleSheet, View } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface ActionButtonProps {
  /**
   * Button text
   */
  title: string

  /**
   * Icon name from Ionicons
   */
  iconName?: keyof typeof Ionicons.glyphMap

  /**
   * Button press handler
   */
  onPress: () => void

  /**
   * Button variant
   * - primary: Main action button (play, confirm)
   * - secondary: Secondary action button (watchlist, info)
   * - tertiary: Subtle action button (share, more)
   * - destructive: Destructive action (remove, delete)
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive'

  /**
   * Size variant
   * - sm: Compact size
   * - md: Standard size (default)
   * - lg: Large size for emphasis
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether button is disabled
   */
  disabled?: boolean

  /**
   * Whether button is in loading state
   */
  loading?: boolean

  /**
   * Whether to show on dark background
   */
  onDark?: boolean

  /**
   * Full width button
   */
  fullWidth?: boolean

  /**
   * Accessibility label
   */
  accessibilityLabel?: string

  /**
   * Test ID for testing
   */
  testID?: string
}

const ActionButtonImpl: React.FC<ActionButtonProps> = ({
  title,
  iconName,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onDark = false,
  fullWidth = false,
  accessibilityLabel,
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant, size, onDark, fullWidth, disabled)

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress()
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
    >
      <View style={styles.content}>
        {iconName && !loading && (
          <Ionicons
            name={iconName}
            size={getIconSize(size)}
            color={styles.text.color}
            style={styles.icon}
          />
        )}
        {loading && (
          <View style={styles.loadingIcon}>
            {/* Loading indicator placeholder - would use ActivityIndicator in real implementation */}
            <Ionicons
              name="hourglass-outline"
              size={getIconSize(size)}
              color={styles.text.color}
              style={styles.icon}
            />
          </View>
        )}
        <Text style={styles.text} numberOfLines={1}>
          {loading ? 'Loading...' : title}
        </Text>
      </View>
    </Pressable>
  )
}

export const ActionButton = React.memo(observer(ActionButtonImpl))

const getIconSize = (size: ActionButtonProps['size']): number => {
  switch (size) {
    case 'sm':
      return moderateScale(16)
    case 'lg':
      return moderateScale(24)
    default:
      return moderateScale(20)
  }
}

const createStyles = (
  theme: Theme,
  variant: ActionButtonProps['variant'],
  size: ActionButtonProps['size'],
  onDark: boolean,
  fullWidth: boolean,
  disabled: boolean
) => {
  // Size-based dimensions
  const dimensions = {
    sm: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      fontSize: moderateScale(12),
      lineHeight: moderateScale(16),
    },
    md: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: moderateScale(14),
      lineHeight: moderateScale(18),
    },
    lg: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: moderateScale(16),
      lineHeight: moderateScale(20),
    }
  }

  // Variant-based colors
  const getColors = () => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.interactive.disabled,
        textColor: theme.colors.text.disabled,
        borderColor: 'transparent',
      }
    }

    const base = onDark ? {
      primaryBg: theme.colors.interactive.primary,
      primaryText: theme.colors.text.onColor,
      secondaryBg: 'rgba(255,255,255,0.2)',
      secondaryText: theme.colors.text.onColor,
      tertiaryBg: 'transparent',
      tertiaryText: theme.colors.text.onColor,
      tertiaryBorder: 'rgba(255,255,255,0.3)',
    } : {
      primaryBg: theme.colors.interactive.primary,
      primaryText: theme.colors.text.onColor,
      secondaryBg: theme.colors.background.secondary,
      secondaryText: theme.colors.text.primary,
      tertiaryBg: 'transparent',
      tertiaryText: theme.colors.text.secondary,
      tertiaryBorder: theme.colors.border.secondary,
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: base.primaryBg,
          textColor: base.primaryText,
          borderColor: 'transparent',
        }
      case 'secondary':
        return {
          backgroundColor: base.secondaryBg,
          textColor: base.secondaryText,
          borderColor: onDark ? 'rgba(255,255,255,0.3)' : theme.colors.border.primary,
        }
      case 'tertiary':
        return {
          backgroundColor: base.tertiaryBg,
          textColor: base.tertiaryText,
          borderColor: base.tertiaryBorder,
        }
      case 'destructive':
        return {
          backgroundColor: theme.colors.status.error,
          textColor: theme.colors.text.onColor,
          borderColor: 'transparent',
        }
      default:
        return {
          backgroundColor: base.primaryBg,
          textColor: base.primaryText,
          borderColor: 'transparent',
        }
    }
  }

  const colors = getColors()
  const dims = dimensions[size!]

  return StyleSheet.create({
    button: {
      backgroundColor: colors.backgroundColor,
      borderWidth: variant === 'tertiary' ? 1 : 0,
      borderColor: colors.borderColor,
      borderRadius: theme.radius.md,
      paddingHorizontal: dims.paddingHorizontal,
      paddingVertical: dims.paddingVertical,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      minHeight: size === 'lg' ? moderateScale(48) : size === 'sm' ? moderateScale(32) : moderateScale(40),
      ...((variant === 'primary' || variant === 'destructive') && !disabled && theme.shadows.sm),
    },
    buttonPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
      opacity: 0.6,
      transform: [{ scale: 1 }],
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    icon: {
      marginRight: theme.spacing.xs,
    },
    loadingIcon: {
      marginRight: theme.spacing.xs,
    },
    text: {
      fontSize: dims.fontSize,
      lineHeight: dims.lineHeight,
      fontWeight: variant === 'primary' || variant === 'destructive' ? '600' : '500',
      color: colors.textColor,
      textAlign: 'center',
    },
  })
}