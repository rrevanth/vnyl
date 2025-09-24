import React from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { ButtonProps, ButtonVariant, ButtonSize } from './button.types'

export const Button: React.FC<ButtonProps> = observer(({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  onPress,
  ...pressableProps
}) => {
  const { theme } = useTheme()
  const styles = createButtonStyles(theme, variant, size, disabled, fullWidth)

  const handlePress = (event: any) => {
    if (loading || disabled) return
    onPress?.(event)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={getTextColor(theme, variant, disabled)}
        />
      )
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        <Text style={[styles.text, textStyle]}>
          {title}
        </Text>
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
    )
  }

  return (
    <Pressable
      {...pressableProps}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && !loading && styles.pressed,
        style
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading
      }}
      accessibilityLabel={title}
      hitSlop={theme.hitSlop.sm}
    >
      {renderContent()}
    </Pressable>
  )
})

Button.displayName = 'Button'

const getBackgroundColor = (theme: any, variant: ButtonVariant, disabled: boolean) => {
  if (disabled) return theme.colors.interactive.disabled

  switch (variant) {
    case 'primary':
      return theme.colors.interactive.primary
    case 'secondary':
      return theme.colors.interactive.secondary
    case 'danger':
      return theme.colors.interactive.danger
    case 'outline':
    case 'ghost':
      return 'transparent'
    default:
      return theme.colors.interactive.primary
  }
}

const getTextColor = (theme: any, variant: ButtonVariant, disabled: boolean) => {
  if (disabled) return theme.colors.text.secondary

  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return theme.colors.text.inverse
    case 'outline':
      return theme.colors.interactive.primary
    case 'ghost':
      return theme.colors.text.primary
    default:
      return theme.colors.text.inverse
  }
}

const getBorderColor = (theme: any, variant: ButtonVariant, disabled: boolean) => {
  if (disabled) return theme.colors.interactive.disabled

  switch (variant) {
    case 'outline':
      return theme.colors.interactive.primary
    case 'primary':
    case 'secondary':
    case 'danger':
    case 'ghost':
    default:
      return 'transparent'
  }
}

const createButtonStyles = (
  theme: any,
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean
) => StyleSheet.create({
  button: {
    backgroundColor: getBackgroundColor(theme, variant, disabled),
    borderRadius: theme.borderRadius.md,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: getBorderColor(theme, variant, disabled),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    paddingVertical: size === 'sm' ? theme.spacing.xs :
                    size === 'lg' ? theme.spacing.md : theme.spacing.sm,
    paddingHorizontal: size === 'sm' ? theme.spacing.sm :
                       size === 'lg' ? theme.spacing.lg : theme.spacing.md,
    minHeight: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
    ...(!disabled && variant !== 'ghost' && theme.shadows.sm),
    opacity: disabled ? 0.6 : 1
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftIconContainer: {
    marginRight: theme.spacing.xs
  },
  rightIconContainer: {
    marginLeft: theme.spacing.xs
  },
  text: {
    fontSize: size === 'sm' ? theme.typography.caption.fontSize :
             size === 'lg' ? theme.typography.bodyBold.fontSize :
             theme.typography.body.fontSize,
    fontWeight: theme.typography.bodyBold.fontWeight,
    color: getTextColor(theme, variant, disabled),
    textAlign: 'center'
  }
})