import React from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { SectionHeader } from '@/src/presentation/shared/ui/molecules/section-header'
import { FormField } from '@/src/presentation/shared/ui/molecules/form-field'
import { SettingRow } from '@/src/presentation/shared/ui/molecules/setting-row'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import type { PreferenceFormProps, PreferenceFormField } from './preference-form.types'

export const PreferenceForm: React.FC<PreferenceFormProps> = observer(({
  title,
  description,
  fields,
  values,
  errors = {},
  onFieldChange,
  onSubmit,
  onReset,
  loading = false,
  showSubmitButton = true,
  showResetButton = false,
  submitButtonTitle = 'Save',
  resetButtonTitle = 'Reset',
  validateOnChange = true,
  containerStyle,
  formStyle,
  buttonContainerStyle,
  fieldSpacing,
  showHeader = !!title,
  ...viewProps
}) => {
  const { theme } = useTheme()
  const styles = createPreferenceFormStyles(theme, fieldSpacing)

  const handleFieldChange = React.useCallback((fieldId: string, value: any) => {
    onFieldChange(fieldId, value)

    if (validateOnChange) {
      const field = fields.find(f => f.id === fieldId)
      if (field?.validate) {
        field.validate(value)
      }
    }
  }, [fields, onFieldChange, validateOnChange])

  const renderField = (field: PreferenceFormField) => {
    const fieldValue = values[field.id]
    const fieldError = errors[field.id] || field.error

    switch (field.type) {
      case 'switch':
        return (
          <SettingRow
            key={field.id}
            label={field.label}
            description={field.helperText}
            variant="switch"
            switchProps={{
              value: Boolean(fieldValue),
              onValueChange: (value) => handleFieldChange(field.id, value),
              disabled: field.disabled || loading
            }}
            disabled={field.disabled || loading}
          />
        )

      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <FormField
            key={field.id}
            label={field.label}
            value={fieldValue?.toString() || ''}
            placeholder={field.placeholder}
            onChangeText={(text) => handleFieldChange(field.id, text)}
            error={fieldError}
            successMessage={field.successMessage}
            helperText={field.helperText}
            required={field.required}
            editable={!field.disabled && !loading}
            keyboardType={
              field.type === 'email' ? 'email-address' :
              field.type === 'number' ? 'numeric' : 'default'
            }
            secureTextEntry={field.type === 'password'}
            autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
            autoCorrect={field.type === 'email' ? false : true}
          />
        )

      default:
        return null
    }
  }

  const renderButtons = () => {
    if (!showSubmitButton && !showResetButton) return null

    return (
      <View style={[styles.buttonContainer, buttonContainerStyle]}>
        {showResetButton && (
          <Button
            title={resetButtonTitle}
            onPress={onReset}
            variant="outline"
            disabled={loading}
            style={styles.resetButton}
          />
        )}

        {showSubmitButton && (
          <Button
            title={submitButtonTitle}
            onPress={onSubmit}
            variant="primary"
            loading={loading}
            disabled={loading}
            fullWidth={!showResetButton}
            style={showResetButton ? styles.submitButton : undefined}
          />
        )}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, containerStyle]}
    >
      <View {...viewProps} style={[styles.form, formStyle]}>
        {showHeader && (
          <SectionHeader
            title={title || ''}
            subtitle={description}
            bottomMargin={true}
          />
        )}

        <View style={styles.fieldsContainer}>
          {fields.map(renderField)}
        </View>

        {renderButtons()}
      </View>
    </KeyboardAvoidingView>
  )
})

PreferenceForm.displayName = 'PreferenceForm'

const createPreferenceFormStyles = (
  theme: any,
  fieldSpacing?: number
) => StyleSheet.create({
  container: {
    flex: 1
  },
  form: {
    flex: 1
  },
  fieldsContainer: {
    gap: fieldSpacing ?? theme.spacing.md
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm
  },
  submitButton: {
    flex: 1
  },
  resetButton: {
    flex: 1
  }
})