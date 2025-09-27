import React from 'react'
import { Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

/**
 * Button component props interface
 */
interface ButtonProps {
  /** Button text content */
  title: string
  /** Function called when button is pressed */
  onPress: () => void
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'outline'
  /** Size variant for the button */
  size?: 'sm' | 'md' | 'lg'
  /** Whether button is disabled */
  disabled?: boolean
  /** Whether to show loading spinner */
  loading?: boolean
  /** Whether button should take full width of container */
  fullWidth?: boolean
}

/**
 * Reusable button component with multiple variants, sizes, and states
 * 
 * Features:
 * - Multiple visual variants (primary, secondary, outline)
 * - Size variants (sm, md, lg) with responsive scaling
 * - Loading state with activity indicator
 * - Disabled state with appropriate styling
 * - Full width option for layout flexibility
 * - Automatic theme integration for light/dark modes
 * - Accessibility support with proper roles and labels
 * 
 * @example
 * ```tsx
 * <Button
 *   title="Save Changes"
 *   onPress={handleSave}
 *   variant="primary"
 *   size="md"
 *   loading={isSaving}
 * />
 * ```
 */
export const Button: React.FC<ButtonProps> = observer(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant, size, disabled, fullWidth)
  const isDisabled = disabled || loading

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.interactive.primary : theme.colors.text.inverse}
        />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  )
})

interface ButtonStyles {
  button: ViewStyle
  pressed: ViewStyle
  text: TextStyle
}

const createStyles = (
  theme: Theme,
  variant: string,
  size: string,
  disabled: boolean,
  fullWidth: boolean
): ButtonStyles => {
  const getPadding = () => {
    switch (size) {
      case 'sm': return { vertical: theme.spacing.xs, horizontal: theme.spacing.sm }
      case 'lg': return { vertical: theme.spacing.md, horizontal: theme.spacing.lg }
      default: return { vertical: theme.spacing.sm, horizontal: theme.spacing.md }
    }
  }

  const getFontSize = () => {
    switch (size) {
      case 'sm': return theme.typography.caption.fontSize
      case 'lg': return theme.typography.heading3.fontSize
      default: return theme.typography.body.fontSize
    }
  }

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.interactive.disabled
    switch (variant) {
      case 'secondary': return theme.colors.interactive.secondary
      case 'outline': return 'transparent'
      default: return theme.colors.interactive.primary
    }
  }

  const getTextColor = () => {
    if (disabled) return theme.colors.text.disabled
    switch (variant) {
      case 'outline': return theme.colors.interactive.primary
      default: return theme.colors.text.inverse
    }
  }

  const padding = getPadding()

  return StyleSheet.create({
    button: {
      backgroundColor: getBackgroundColor(),
      borderRadius: theme.radius.md,
      paddingVertical: padding.vertical,
      paddingHorizontal: padding.horizontal,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: size === 'sm' ? 36 : size === 'lg' ? 56 : 48,
      width: fullWidth ? '100%' : undefined,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: variant === 'outline'
        ? disabled
          ? theme.colors.interactive.disabled
          : theme.colors.interactive.primary
        : 'transparent',
      ...(!disabled && theme.shadows.sm)
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }]
    },
    text: {
      fontSize: getFontSize(),
      fontWeight: '600' as TextStyle['fontWeight'],
      fontFamily: theme.typography.body.fontFamily,
      color: getTextColor(),
      textAlign: 'center'
    }
  })
}