import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { NavigationHeader, TextInput, Button, SegmentedControl, SettingsToggle } from '@/src/presentation/components'
import { useSettingsActions } from '@/src/presentation/shared/hooks/useSettingsActions'
import type { Theme } from '@/src/presentation/shared/theme'
import type { TMDBSettings } from '@/src/domain/entities'

// Common language options for TMDB
const LANGUAGE_OPTIONS = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' },
  { label: 'Italian', value: 'it-IT' },
  { label: 'Portuguese', value: 'pt-BR' },
  { label: 'Japanese', value: 'ja-JP' },
  { label: 'Korean', value: 'ko-KR' },
  { label: 'Chinese', value: 'zh-CN' }
]

export default observer(function TMDBSettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  const {
    preferences,
    updateProviderSettings
  } = useSettingsActions()

  const currentTMDBSettings = preferences.providerSettings?.tmdbSettings || {
    language: 'en-US',
    includeAdult: false
  }

  // Form state
  const [bearerToken, setBearerToken] = useState(currentTMDBSettings.bearerToken || '')
  const [apiKey, setApiKey] = useState(currentTMDBSettings.apiKey || '')
  const [language, setLanguage] = useState(currentTMDBSettings.language)
  const [includeAdult, setIncludeAdult] = useState(currentTMDBSettings.includeAdult)
  const [saving, setSaving] = useState(false)

  // Check if using defaults (no custom config)
  const isUsingDefaults = !currentTMDBSettings.bearerToken && !currentTMDBSettings.apiKey

  // Basic validation
  const isValid = bearerToken.trim() !== '' || apiKey.trim() !== ''
  const hasChanges =
    bearerToken !== (currentTMDBSettings.bearerToken || '') ||
    apiKey !== (currentTMDBSettings.apiKey || '') ||
    language !== currentTMDBSettings.language ||
    includeAdult !== currentTMDBSettings.includeAdult

  const handleSave = useCallback(async () => {
    if (!isValid) {
      Alert.alert(
        t('settings.providers.tmdb.validation_error_title'),
        t('settings.providers.tmdb.validation_error_message')
      )
      return
    }

    setSaving(true)
    try {
      const newTMDBSettings: TMDBSettings = {
        bearerToken: bearerToken.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        language,
        includeAdult
      }

      await updateProviderSettings({
        tmdbSettings: newTMDBSettings
      })

      Alert.alert(
        t('settings.providers.tmdb.save_success_title'),
        t('settings.providers.tmdb.save_success_message')
      )
    } catch {
      Alert.alert(
        t('common.error'),
        t('settings.providers.tmdb.save_error_message')
      )
    } finally {
      setSaving(false)
    }
  }, [bearerToken, apiKey, language, includeAdult, isValid, updateProviderSettings, t])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader
        title={t('settings.providers.tmdb.title')}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>
            {isUsingDefaults
              ? t('settings.providers.tmdb.using_defaults')
              : t('settings.providers.tmdb.using_custom_config')
            }
          </Text>
          <Text style={styles.statusDescription}>
            {isUsingDefaults
              ? t('settings.providers.tmdb.defaults_description')
              : t('settings.providers.tmdb.custom_config_description')
            }
          </Text>
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.authentication')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.providers.tmdb.authentication_description')}
          </Text>

          <TextInput
            label={t('settings.providers.tmdb.bearer_token')}
            value={bearerToken}
            onChangeText={setBearerToken}
            placeholder={t('settings.providers.tmdb.bearer_token_placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            description={t('settings.providers.tmdb.bearer_token_description')}
          />

          <TextInput
            label={t('settings.providers.tmdb.api_key')}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder={t('settings.providers.tmdb.api_key_placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            description={t('settings.providers.tmdb.api_key_description')}
          />
        </View>

        {/* Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.configuration')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.providers.tmdb.configuration_description')}
          </Text>

          <View style={styles.settingContainer}>
            <Text style={styles.settingLabel}>
              {t('settings.providers.tmdb.language')}
            </Text>
            <Text style={styles.settingDescription}>
              {t('settings.providers.tmdb.language_description')}
            </Text>

            <SegmentedControl
              options={LANGUAGE_OPTIONS.slice(0, 3)} // Show first 3 options for now
              selectedValue={language}
              onValueChange={setLanguage}
            />
          </View>

          <View style={styles.settingContainer}>
            <SettingsToggle
              title={t('settings.providers.tmdb.include_adult')}
              description={t('settings.providers.tmdb.include_adult_description')}
              value={includeAdult}
              onValueChange={setIncludeAdult}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={t('common.save')}
            onPress={handleSave}
            disabled={!isValid || !hasChanges}
            loading={saving}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

interface TMDBSettingsStyles {
  container: ViewStyle
  scrollView: ViewStyle
  scrollContent: ViewStyle
  statusSection: ViewStyle
  statusTitle: TextStyle
  statusDescription: TextStyle
  section: ViewStyle
  sectionTitle: TextStyle
  sectionDescription: TextStyle
  settingContainer: ViewStyle
  settingLabel: TextStyle
  settingDescription: TextStyle
  buttonContainer: ViewStyle
}

const createStyles = (theme: Theme): TMDBSettingsStyles => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl
  },
  statusSection: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  statusTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as TextStyle['fontWeight'],
    fontFamily: theme.typography.heading3.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  statusDescription: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  section: {
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as TextStyle['fontWeight'],
    fontFamily: theme.typography.heading3.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  sectionDescription: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: theme.spacing.md
  },
  settingContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  settingLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  settingDescription: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: theme.spacing.md
  },
  buttonContainer: {
    marginTop: theme.spacing.md
  }
})