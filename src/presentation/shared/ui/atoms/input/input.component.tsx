import React from 'react'
import {
  TextInput,
  View,
  Text,
  Pressable,
  StyleSheet
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { InputProps, InputVariant, InputSize, InputState } from './input.types'

export const Input: React.FC<InputProps> = observer(({
  variant = 'filled',
  size = 'md',
  state = 'default',
  error,
  successMessage,
  helperText,
  fullWidth = true,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  clearable = false,
  onClear,
  value,
  placeholder,
  editable = true,
  ...textInputProps
}) => {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = React.useState(false)

  const currentState: InputState = React.useMemo(() => {
    if (error) return 'error'
    if (successMessage) return 'success'
    if (isFocused) return 'focused'
    return state
  }, [error, successMessage, isFocused, state])

  const styles = createInputStyles(theme, variant, size, currentState, fullWidth, !editable)

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const handleClear = () => {
    onClear?.()
  }

  const showClearButton = clearable && value && value.length > 0 && editable

  const renderMessage = () => {
    if (error) {
      return <Text style={styles.errorMessage}>{error}</Text>
    }
    if (successMessage) {
      return <Text style={styles.successMessage}>{successMessage}</Text>
    }
    if (helperText) {
      return <Text style={styles.helperText}>{helperText}</Text>
    }
    return null
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          {...textInputProps}
          value={value}
          placeholder={placeholder}
          style={[styles.input, inputStyle]}
          placeholderTextColor={theme.colors.input.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          accessibilityState={{
            disabled: !editable
          }}
        />

        {showClearButton && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={theme.hitSlop.sm}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}

        {rightIcon && !showClearButton && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {renderMessage()}
    </View>
  )
})

Input.displayName = 'Input'

const getBackgroundColor = (theme: any, variant: InputVariant, state: InputState, disabled: boolean) => {
  if (disabled) return theme.colors.interactive.disabled

  switch (variant) {
    case 'filled':
      return theme.colors.input.background
    case 'outlined':
    case 'default':
      return 'transparent'
    default:
      return theme.colors.input.background
  }
}

const getBorderColor = (theme: any, variant: InputVariant, state: InputState, disabled: boolean) => {
  if (disabled) return theme.colors.interactive.disabled

  if (variant === 'default') return 'transparent'

  switch (state) {
    case 'error':
      return theme.colors.input.error
    case 'success':
      return theme.colors.interactive.success
    case 'focused':
      return theme.colors.interactive.primary
    default:
      return theme.colors.border.primary
  }
}

const createInputStyles = (
  theme: any,
  variant: InputVariant,
  size: InputSize,
  state: InputState,
  fullWidth: boolean,
  disabled: boolean
) => StyleSheet.create({
  container: {
    alignSelf: fullWidth ? 'stretch' : 'flex-start'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getBackgroundColor(theme, variant, state, disabled),
    borderRadius: theme.borderRadius.md,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: getBorderColor(theme, variant, state, disabled),
    paddingHorizontal: theme.spacing.sm,
    minHeight: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
    opacity: disabled ? 0.6 : 1
  },
  input: {
    flex: 1,
    fontSize: size === 'sm' ? theme.typography.caption.fontSize :
             size === 'lg' ? theme.typography.bodyBold.fontSize :
             theme.typography.body.fontSize,
    lineHeight: size === 'sm' ? theme.typography.caption.lineHeight :
                size === 'lg' ? theme.typography.bodyBold.lineHeight :
                theme.typography.body.lineHeight,
    color: theme.colors.text.primary,
    paddingVertical: size === 'sm' ? theme.spacing.xs :
                     size === 'lg' ? theme.spacing.sm : theme.spacing.xs
  },
  leftIconContainer: {
    marginRight: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightIconContainer: {
    marginLeft: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearButton: {
    marginLeft: theme.spacing.xs,
    padding: theme.spacing.xs / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '600'
  },
  errorMessage: {
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    color: theme.colors.input.error,
    marginTop: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs
  },
  successMessage: {
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    color: theme.colors.interactive.success,
    marginTop: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs
  },
  helperText: {
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.xs
  }
})