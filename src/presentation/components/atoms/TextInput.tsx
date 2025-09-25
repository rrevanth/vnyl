import React from 'react'
import { View, Text, TextInput as RNTextInput, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle, TextInputProps as RNTextInputProps } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string
  error?: string
  description?: string
  variant?: 'default' | 'outlined'
}

export const TextInput: React.FC<TextInputProps> = observer(({
  label,
  error,
  description,
  variant = 'default',
  ...textInputProps
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant, !!error)

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={styles.inputContainer}>
        <RNTextInput
          style={styles.input}
          placeholderTextColor={theme.colors.text.tertiary}
          selectionColor={theme.colors.interactive.primary}
          {...textInputProps}
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {description && !error && (
        <Text style={styles.descriptionText}>{description}</Text>
      )}
    </View>
  )
})

interface TextInputStyles {
  container: ViewStyle
  label: TextStyle
  inputContainer: ViewStyle
  input: TextStyle
  errorText: TextStyle
  descriptionText: TextStyle
}

const createStyles = (theme: Theme, variant: string, hasError: boolean): TextInputStyles => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  inputContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: hasError
      ? theme.colors.status.error
      : variant === 'outlined'
        ? theme.colors.border.primary
        : 'transparent'
  },
  input: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs
  },
  descriptionText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs
  }
})