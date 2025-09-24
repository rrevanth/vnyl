import React, { useState, useCallback } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { SettingRow } from '@/src/presentation/shared/ui/molecules/setting-row'
import { Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Input } from '@/src/presentation/shared/ui/atoms/input'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import type { PreferenceItemProps } from '../model/settings.types'
import { formatSettingValue } from '../model/settings.utils'
import { validateSettingValue } from '../lib/settings.config'

export const PreferenceItem: React.FC<PreferenceItemProps> = observer(({
  config,
  value,
  onValueChange,
  disabled = false,
  loading = false,
  error
}) => {
  const { theme } = useTheme()
  const [localValue, setLocalValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const styles = createPreferenceItemStyles(theme, !!error)

  const handleValueChange = useCallback((newValue: any) => {
    // Validate the new value
    const errors = validateSettingValue(config.key, newValue)
    setValidationErrors(errors)

    if (errors.length === 0) {
      onValueChange(config.key, newValue)
    }
    setLocalValue(newValue)
  }, [config.key, onValueChange])

  const handleSwitchChange = useCallback((newValue: boolean) => {
    handleValueChange(newValue)
  }, [handleValueChange])

  const handleTextSubmit = useCallback(() => {
    setIsEditing(false)
    handleValueChange(localValue)
  }, [localValue, handleValueChange])

  const handleButtonPress = useCallback(() => {
    if (config.key === 'exportData') {
      Alert.alert(
        'Export Data',
        'Export your collection data to CSV or JSON format.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Export', onPress: () => onValueChange(config.key, true) }
        ]
      )
    } else if (config.key === 'backupData') {
      Alert.alert(
        'Backup Data',
        'Backup your collection to iCloud or Google Drive.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Backup', onPress: () => onValueChange(config.key, true) }
        ]
      )
    } else if (config.key === 'resetPreferences') {
      Alert.alert(
        'Reset All Preferences',
        'This will reset all settings to their default values. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: () => onValueChange(config.key, true) }
        ]
      )
    } else {
      onValueChange(config.key, true)
    }
  }, [config.key, onValueChange])

  const renderSettingControl = () => {
    switch (config.type) {
      case 'switch':
        return (
          <SettingRow
            label={config.label}
            description={config.description}
            variant="switch"
            disabled={disabled || loading}
            switchProps={{
              value: value || false,
              onValueChange: handleSwitchChange
            }}
            leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
          />
        )

      case 'select':
        return (
          <SettingRow
            label={config.label}
            description={config.description}
            variant="navigation"
            disabled={disabled || loading}
            onPress={() => {
              // TODO: Implement picker/modal for select options
              Alert.alert('Select Option', 'Picker implementation coming soon')
            }}
            leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
            rightContent={
              <Text variant="body" color="secondary">
                {formatSettingValue(config.key, value)}
              </Text>
            }
          />
        )

      case 'multiSelect':
        return (
          <SettingRow
            label={config.label}
            description={config.description}
            variant="navigation"
            disabled={disabled || loading}
            onPress={() => {
              // TODO: Implement multi-select modal
              Alert.alert('Select Options', 'Multi-select implementation coming soon')
            }}
            leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
            rightContent={
              <Text variant="body" color="secondary">
                {formatSettingValue(config.key, value)}
              </Text>
            }
          />
        )

      case 'text':
      case 'password':
        if (isEditing) {
          return (
            <View style={styles.textInputContainer}>
              <View style={styles.textInputHeader}>
                <Text variant="bodyBold" color="primary">
                  {config.label}
                </Text>
                <View style={styles.textInputActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setIsEditing(false)
                      setLocalValue(value)
                      setValidationErrors([])
                    }}
                  />
                  <Button
                    title="Save"
                    variant="primary"
                    size="sm"
                    onPress={handleTextSubmit}
                    disabled={validationErrors.length > 0}
                  />
                </View>
              </View>
              <Input
                value={localValue || ''}
                onChangeText={setLocalValue}
                placeholder={config.placeholder}
                secureTextEntry={config.type === 'password'}
                autoFocus
              />
              {config.description && (
                <Text variant="caption" color="secondary" style={styles.description}>
                  {config.description}
                </Text>
              )}
            </View>
          )
        } else {
          return (
            <SettingRow
              label={config.label}
              description={config.description}
              variant="navigation"
              disabled={disabled || loading}
              onPress={() => setIsEditing(true)}
              leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
              rightContent={
                <Text variant="body" color="secondary">
                  {formatSettingValue(config.key, value)}
                </Text>
              }
            />
          )
        }

      case 'button':
        return (
          <SettingRow
            label={config.label}
            description={config.description}
            variant="button"
            disabled={disabled || loading}
            buttonProps={{
              title: 'Action',
              onPress: handleButtonPress,
              variant: config.key === 'resetPreferences' ? 'outline' : 'primary'
            }}
            leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
          />
        )

      case 'navigation':
        return (
          <SettingRow
            label={config.label}
            description={config.description}
            variant="navigation"
            disabled={disabled || loading}
            onPress={() => onValueChange(config.key, true)}
            leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
          />
        )

      default:
        return (
          <SettingRow
            label={config.label}
            description={config.description}
            disabled={disabled || loading}
            leftIcon={config.icon ? <Text>{config.icon}</Text> : undefined}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      {renderSettingControl()}

      {/* Error Display */}
      {(error || validationErrors.length > 0) && (
        <View style={styles.errorContainer}>
          {error && (
            <Text variant="caption" color="error" style={styles.errorText}>
              {error}
            </Text>
          )}
          {validationErrors.map((validationError, index) => (
            <Text
              key={index}
              variant="caption"
              color="error"
              style={styles.errorText}
            >
              {validationError}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
})

PreferenceItem.displayName = 'PreferenceItem'

const createPreferenceItemStyles = (theme: any, hasError: boolean) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs / 2
  },
  textInputContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: hasError ? theme.colors.status.error : theme.colors.border.primary,
    padding: theme.spacing.md
  },
  textInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  textInputActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  textInput: {
    marginBottom: theme.spacing.xs
  },
  description: {
    marginTop: theme.spacing.xs
  },
  errorContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs
  },
  errorText: {
    marginBottom: theme.spacing.xs / 2
  }
})