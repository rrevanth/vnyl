import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'
import type { TextInputProps, TextStyle } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  disabled?: boolean
}

export const Input: React.FC<InputProps> = observer(({
  label,
  error,
  disabled = false,
  style,
  ...props
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, disabled, !!error)

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.text.tertiary}
        editable={!disabled}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  )
})

const createStyles = (theme: Theme, disabled: boolean, hasError: boolean) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xs
  },
  label: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: theme.typography.bodySmall.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  } as TextStyle,
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: hasError ? theme.colors.status.error : theme.colors.border.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    minHeight: 48
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.status.error,
    marginTop: theme.spacing.xs
  }
})