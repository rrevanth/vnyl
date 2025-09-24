import React from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Input } from '@/src/presentation/shared/ui/atoms/input'
import type { FormFieldProps } from './form-field.types'

export const FormField: React.FC<FormFieldProps> = observer(({
  label,
  required = false,
  labelStyle,
  showLabel = true,
  labelSpacing,
  layout = 'vertical',
  fieldContainerStyle,
  ...inputProps
}) => {
  const { theme } = useTheme()
  const styles = createFormFieldStyles(theme, layout, labelSpacing)

  const renderLabel = () => {
    if (!showLabel) return null

    return (
      <View style={styles.labelContainer}>
        <Text
          variant="bodyBold"
          color="primary"
          style={[styles.label, labelStyle]}
        >
          {label}
          {required && (
            <Text variant="bodyBold" color="error">
              {' *'}
            </Text>
          )}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, fieldContainerStyle]}>
      {renderLabel()}
      <Input
        {...inputProps}
        accessibilityLabel={`${label}${required ? ' (required)' : ''}`}
      />
    </View>
  )
})

FormField.displayName = 'FormField'

const createFormFieldStyles = (
  theme: any,
  layout: 'vertical' | 'horizontal',
  labelSpacing?: number
) => StyleSheet.create({
  container: {
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    alignItems: layout === 'horizontal' ? 'center' : 'stretch'
  },
  labelContainer: {
    marginBottom: layout === 'vertical' ? (labelSpacing ?? theme.spacing.xs) : 0,
    marginRight: layout === 'horizontal' ? theme.spacing.sm : 0,
    ...(layout === 'horizontal' && { minWidth: 80 })
  },
  label: {
    // Label styles are handled by the Text component
  }
})