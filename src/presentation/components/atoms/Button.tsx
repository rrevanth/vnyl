import React from 'react'
import { Text, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'
import type { ViewStyle, TextStyle } from 'react-native'

export interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = observer(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false
}) => {
  const theme = useTheme()
  const styles = createButtonStyles(theme, variant, size, disabled, fullWidth)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled
      ] as ViewStyle[]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <Text style={styles.text as TextStyle}>{title}</Text>
    </Pressable>
  )
})

const createButtonStyles = (
  theme: Theme,
  variant: string,
  size: string,
  disabled: boolean,
  fullWidth: boolean
) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.interactive.primary,
          borderColor: 'transparent'
        }
      case 'secondary':
        return {
          backgroundColor: theme.colors.interactive.secondary,
          borderColor: 'transparent'
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.interactive.primary,
          borderWidth: 1
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        }
      default:
        return {
          backgroundColor: theme.colors.interactive.primary,
          borderColor: 'transparent'
        }
    }
  }

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radius.sm
        }
      case 'lg':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.lg
        }
      default:
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.md
        }
    }
  }

  const getTextColor = (): string => {
    if (disabled) return theme.colors.text.disabled

    switch (variant) {
      case 'outline':
        return theme.colors.interactive.primary
      case 'ghost':
        return theme.colors.text.primary
      case 'primary':
      case 'secondary':
        return theme.colors.text.inverse
      default:
        return theme.colors.text.inverse
    }
  }

  const getTextSize = (): number => {
    switch (size) {
      case 'sm':
        return theme.typography.bodySmall.fontSize
      case 'lg':
        return theme.typography.heading3.fontSize
      default:
        return theme.typography.button.fontSize
    }
  }

  return StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      ...getVariantStyles(),
      ...getSizeStyles(),
      width: fullWidth ? '100%' : 'auto',
      ...(!disabled && variant !== 'ghost' && theme.shadows.sm)
    } as ViewStyle,
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }]
    } as ViewStyle,
    disabled: {
      backgroundColor: theme.colors.interactive.disabled,
      borderColor: theme.colors.interactive.disabled
    } as ViewStyle,
    text: {
      fontSize: getTextSize(),
      fontWeight: theme.typography.button.fontWeight,
      color: getTextColor(),
      textAlign: 'center'
    } as TextStyle
  })
}