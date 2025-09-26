/**
 * TMDB Account Settings Screen
 * 
 * Handles TMDB provider account configuration including:
 * - Bearer token authentication
 * - API key configuration
 * - Language preferences
 * - Adult content settings
 * - Navigation to capabilities management
 */

import React, { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { NavigationHeader, TextInput, Button, Select, SettingsToggle } from '@/src/presentation/components'
import { useSettingsActions } from '@/src/presentation/shared/hooks/useSettingsActions'
import type { Theme } from '@/src/presentation/shared/theme'
import type { TMDBSettings } from '@/src/domain/entities'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'

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

export default observer(function TMDBAccountSettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
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

  // Track changes - always allow saves when there are changes
  const hasChanges =
    bearerToken !== (currentTMDBSettings.bearerToken || '') ||
    apiKey !== (currentTMDBSettings.apiKey || '') ||
    language !== currentTMDBSettings.language ||
    includeAdult !== currentTMDBSettings.includeAdult

  // Check if user provided custom credentials
  const hasCustomCredentials = bearerToken.trim() !== '' || apiKey.trim() !== ''

  // Validate custom credentials using TMDB API
  const validateCustomCredentials = useCallback(async (testSettings: TMDBSettings): Promise<{ isValid: boolean; error?: string }> => {
    try {
      // Test credentials by calling a simple TMDB endpoint
      const url = 'https://api.themoviedb.org/3/configuration'
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      let requestUrl = url
      
      // Add authentication based on what user provided
      if (testSettings.bearerToken) {
        headers['Authorization'] = `Bearer ${testSettings.bearerToken}`
      } else if (testSettings.apiKey) {
        requestUrl = `${url}?api_key=${testSettings.apiKey}`
      }
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers
      })
      
      if (response.ok) {
        return { isValid: true }
      } else {
        const errorData = await response.json().catch(() => ({ status_message: 'Unknown error' }))
        return { 
          isValid: false, 
          error: errorData.status_message || `HTTP ${response.status}: Invalid credentials` 
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      return { isValid: false, error: `Validation failed: ${errorMessage}` }
    }
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    
    try {
      const newTMDBSettings: TMDBSettings = {
        bearerToken: bearerToken.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        language,
        includeAdult,
        // Preserve existing capability settings or use defaults
        capabilitySettings: currentTMDBSettings.capabilitySettings || {
          [ProviderCapability.METADATA]: { enabled: true },
          [ProviderCapability.CATALOG]: { enabled: true },
          [ProviderCapability.SEARCH]: { enabled: true },
          [ProviderCapability.STREAM]: { enabled: false },
          [ProviderCapability.RECOMMENDATION]: { enabled: true },
          [ProviderCapability.COLLECTION]: { enabled: false },
          [ProviderCapability.WATCHLIST]: { enabled: false },
          [ProviderCapability.PROGRESS]: { enabled: false },
          [ProviderCapability.RATING]: { enabled: true },
          [ProviderCapability.IMAGE]: { enabled: true },
          [ProviderCapability.VIDEO]: { enabled: true },
          [ProviderCapability.SUBTITLE]: { enabled: false }
        }
      }

      // If user provided custom credentials, validate them first
      if (hasCustomCredentials) {
        const validationResult = await validateCustomCredentials(newTMDBSettings)
        
        if (!validationResult.isValid) {
          Alert.alert(
            t('settings.providers.tmdb.validation_error_title'),
            validationResult.error || t('settings.providers.tmdb.validation_error_message')
          )
          return
        }
      }

      // Save settings (will use environment credentials if no custom ones provided)
      await updateProviderSettings({
        tmdbSettings: newTMDBSettings
      })

      Alert.alert(
        t('settings.providers.tmdb.save_success_title'),
        t('settings.providers.tmdb.save_success_message')
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      Alert.alert(
        t('common.error'),
        t('settings.providers.tmdb.save_error_message') + ': ' + errorMessage
      )
    } finally {
      setSaving(false)
    }
  }, [bearerToken, apiKey, language, includeAdult, hasCustomCredentials, validateCustomCredentials, updateProviderSettings, t, currentTMDBSettings.capabilitySettings])

  const handleNavigateToCapabilities = useCallback(() => {
    router.push('/settings/providers/tmdb/capabilities')
  }, [router])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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

          <Select
            label={t('settings.providers.tmdb.language')}
            description={t('settings.providers.tmdb.language_description')}
            options={LANGUAGE_OPTIONS}
            selectedValue={language}
            onValueChange={setLanguage}
          />

          <View style={styles.settingContainer}>
            <SettingsToggle
              title={t('settings.providers.tmdb.include_adult')}
              description={t('settings.providers.tmdb.include_adult_description')}
              value={includeAdult}
              onValueChange={setIncludeAdult}
            />
          </View>
        </View>

        {/* Capabilities Management Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.capabilities_section_title')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.providers.tmdb.capabilities_section_description')}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.capabilitiesCard,
              pressed && styles.capabilitiesCardPressed
            ]}
            onPress={handleNavigateToCapabilities}
            accessibilityRole="button"
            accessibilityLabel={t('settings.providers.tmdb.manage_capabilities')}
          >
            <View style={styles.capabilitiesContent}>
              <Text style={styles.capabilitiesTitle}>
                {t('settings.providers.tmdb.manage_capabilities')}
              </Text>
              <Text style={styles.capabilitiesDescription}>
                {t('settings.providers.tmdb.manage_capabilities_description')}
              </Text>
            </View>
            <Text style={styles.capabilitiesArrow}>›</Text>
          </Pressable>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={hasCustomCredentials ? t('settings.providers.tmdb.validate_and_save') : t('common.save')}
            onPress={handleSave}
            disabled={!hasChanges}
            loading={saving}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

interface TMDBAccountSettingsStyles {
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
  capabilitiesCard: ViewStyle
  capabilitiesCardPressed: ViewStyle
  capabilitiesContent: ViewStyle
  capabilitiesTitle: TextStyle
  capabilitiesDescription: TextStyle
  capabilitiesArrow: TextStyle
  buttonContainer: ViewStyle
}

const createStyles = (theme: Theme): TMDBAccountSettingsStyles => StyleSheet.create({
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
  capabilitiesCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm
  },
  capabilitiesCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  capabilitiesContent: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  capabilitiesTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as TextStyle['fontWeight'],
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  capabilitiesDescription: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  capabilitiesArrow: {
    fontSize: theme.typography.heading2.fontSize,
    color: theme.colors.text.tertiary,
    fontWeight: '300' as TextStyle['fontWeight']
  },
  buttonContainer: {
    marginTop: theme.spacing.md
  }
})