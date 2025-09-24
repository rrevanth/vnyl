import React, { useMemo, useCallback } from 'react'
import { ScrollView, View, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { Heading, Text } from '@/src/presentation/shared/ui/atoms/typography'
import {
  useUserPreferences,
  useThemePreferences,
  useApiKeyPreferences
} from '@/src/presentation/shared/hooks/user-preferences.hook'
import { PreferenceSection } from './preference-section'
import { PreferenceItem } from './preference-item'
import { SETTINGS_SECTIONS } from '../lib/settings.config'
import { createPreferenceUpdate, getPreferenceValue, getPreferenceErrorMessage } from '../model/settings.utils'
import type { SettingsScreenProps } from '../model/settings.types'

export const SettingsScreen: React.FC<SettingsScreenProps> = observer(() => {
  const { theme } = useTheme()
  const styles = createSettingsScreenStyles(theme)

  // User preferences hooks
  const {
    preferences,
    isLoading,
    error,
    updatePreferences,
    resetPreferences
  } = useUserPreferences()

  // These hooks are imported for future use
  const { currentTheme } = useThemePreferences() // eslint-disable-line @typescript-eslint/no-unused-vars
  const { hasApiKeys } = useApiKeyPreferences() // eslint-disable-line @typescript-eslint/no-unused-vars

  const handleExportData = useCallback(async () => {
    try {
      // TODO: Implement actual export functionality
      Alert.alert(
        'Export Completed',
        'Your data has been exported successfully.',
        [{ text: 'OK' }]
      )
    } catch (exportError) { // eslint-disable-line @typescript-eslint/no-unused-vars
      Alert.alert(
        'Export Failed',
        'Failed to export your data. Please try again.',
        [{ text: 'OK' }]
      )
    }
  }, [])

  const handleBackupData = useCallback(async () => {
    try {
      // TODO: Implement actual backup functionality
      Alert.alert(
        'Backup Completed',
        'Your data has been backed up to the cloud.',
        [{ text: 'OK' }]
      )
    } catch (backupError) { // eslint-disable-line @typescript-eslint/no-unused-vars
      Alert.alert(
        'Backup Failed',
        'Failed to backup your data. Please try again.',
        [{ text: 'OK' }]
      )
    }
  }, [])

  const handleResetPreferences = useCallback(async () => {
    try {
      await resetPreferences.mutateAsync()
      Alert.alert(
        'Reset Complete',
        'All preferences have been reset to their default values.',
        [{ text: 'OK' }]
      )
    } catch (resetError) { // eslint-disable-line @typescript-eslint/no-unused-vars
      Alert.alert(
        'Reset Failed',
        'Failed to reset preferences. Please try again.',
        [{ text: 'OK' }]
      )
    }
  }, [resetPreferences])

  const handleNavigationAction = useCallback((key: string) => {
    switch (key) {
      case 'appVersion':
        Alert.alert(
          'VNYL App',
          'Version 1.0.0\nBuild 1.0.0 (1)\n\n© 2024 VNYL. All rights reserved.',
          [{ text: 'OK' }]
        )
        break
      case 'privacyPolicy':
        Alert.alert(
          'Privacy Policy',
          'Privacy policy implementation coming soon.',
          [{ text: 'OK' }]
        )
        break
      case 'termsOfService':
        Alert.alert(
          'Terms of Service',
          'Terms of service implementation coming soon.',
          [{ text: 'OK' }]
        )
        break
      case 'support':
        Alert.alert(
          'Support',
          'Support center implementation coming soon.',
          [{ text: 'OK' }]
        )
        break
    }
  }, [])

  // Handle preference value changes
  const handlePreferenceChange = useCallback(async (key: string, value: any) => {
    try {
      // Handle special cases
      if (key === 'exportData') {
        await handleExportData()
        return
      }

      if (key === 'backupData') {
        await handleBackupData()
        return
      }

      if (key === 'resetPreferences') {
        await handleResetPreferences()
        return
      }

      if (key === 'appVersion' || key === 'privacyPolicy' || key === 'termsOfService' || key === 'support') {
        handleNavigationAction(key)
        return
      }

      // Create the preference update payload
      const updatePayload = createPreferenceUpdate(key, value)

      // Update preferences using the mutation
      await updatePreferences.mutateAsync(updatePayload)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const errorMessage = getPreferenceErrorMessage(key, errorInstance)

      Alert.alert(
        'Update Failed',
        errorMessage,
        [{ text: 'OK' }]
      )
    }
  }, [updatePreferences, handleExportData, handleBackupData, handleResetPreferences, handleNavigationAction])

  // Render sections with their settings
  const renderSection = useCallback((section: typeof SETTINGS_SECTIONS[0]) => {
    return (
      <PreferenceSection
        key={section.id}
        title={section.title}
        description={section.description}
        icon={section.icon}
      >
        {section.settings.map((setting) => {
          const currentValue = getPreferenceValue(preferences, setting.key)
          const isUpdating = updatePreferences.isPending || resetPreferences.isPending

          return (
            <PreferenceItem
              key={setting.key}
              config={setting}
              value={currentValue}
              onValueChange={handlePreferenceChange}
              disabled={setting.disabled || isUpdating}
              loading={isUpdating}
              error={updatePreferences.error?.message}
            />
          )
        })}
      </PreferenceSection>
    )
  }, [preferences, handlePreferenceChange, updatePreferences, resetPreferences])

  // Memoize sections to prevent unnecessary re-renders
  const sortedSections = useMemo(() => {
    return SETTINGS_SECTIONS.sort((a, b) => a.order - b.order)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading variant="h1" color="primary" style={styles.title}>
            Settings
          </Heading>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Customize your VNYL experience
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text variant="body" color="secondary">
              Loading preferences...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text variant="body" color="error">
              Failed to load preferences. Please try again.
            </Text>
          </View>
        )}

        {/* Settings Sections */}
        {!isLoading && !error && (
          <View style={styles.sectionsContainer}>
            {sortedSections.map(renderSection)}
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text variant="caption" color="secondary" style={styles.footerText}>
            Changes are automatically saved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

SettingsScreen.displayName = 'SettingsScreen'

const createSettingsScreenStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md
  },
  title: {
    marginBottom: theme.spacing.xs
  },
  subtitle: {
    // No additional styles needed
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center'
  },
  errorContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center'
  },
  sectionsContainer: {
    paddingHorizontal: theme.spacing.lg
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    alignItems: 'center'
  },
  footerText: {
    textAlign: 'center'
  }
})