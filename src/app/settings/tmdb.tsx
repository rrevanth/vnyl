import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { NavigationHeader, Button, Select, SettingsToggle, TextInput } from '@/src/presentation/components/atoms'
import { useTMDBSettings } from '@/src/presentation/shared/hooks/useTMDBSettings'
import { TMDB_LANGUAGE_OPTIONS, TMDB_COUNTRY_OPTIONS, TMDB_IMAGE_QUALITY_OPTIONS } from '@/src/domain/entities'
import type { Theme } from '@/src/presentation/shared/theme'
import type { TMDBSettings } from '@/src/domain/entities'

export default observer(function TMDBSettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  const {
    settings,
    // updateSettings, // Not used in this component - we manage local state
    testConnection,
    saveSettings,
    isTesting,
    isSaving,
    loadSettings
  } = useTMDBSettings()

  const [localSettings, setLocalSettings] = useState<TMDBSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings)
    setHasChanges(false)
  }, [settings])

  const handleLocalChange = useCallback((changes: Partial<TMDBSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...changes }))
    setHasChanges(true)
  }, [])

  const handleValidateConnection = useCallback(async () => {
    try {
      const success = await testConnection()
      
      Alert.alert(
        t('settings.providers.tmdb.test_connection'),
        success 
          ? t('settings.providers.tmdb.validation.connection_success')
          : t('settings.providers.tmdb.validation.connection_failed'),
        [{ text: t('common.close') }]
      )
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      Alert.alert(
        t('common.error'),
        errorInstance.message,
        [{ text: t('common.close') }]
      )
    }
  }, [testConnection, t])

  const handleSaveSettings = useCallback(async () => {
    try {
      await saveSettings(localSettings)
      setHasChanges(false)
      
      Alert.alert(
        t('common.success'),
        t('settings.providers.tmdb.validation.settings_saved'),
        [{ text: t('common.close') }]
      )
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      Alert.alert(
        t('common.error'),
        errorInstance.message,
        [{ text: t('common.close') }]
      )
    }
  }, [localSettings, saveSettings, t])

  // Determine connection status and API key hierarchy
  const getConnectionStatus = () => {
    if (localSettings.bearerToken) {
      return {
        status: 'connected',
        keyType: 'custom_bearer_token',
        message: t('settings.providers.tmdb.status.connected_bearer_token')
      }
    } else if (localSettings.apiKey) {
      return {
        status: 'connected',
        keyType: 'custom_api_key',
        message: t('settings.providers.tmdb.status.connected_api_key')
      }
    } else {
      return {
        status: 'connected',
        keyType: 'default_api_key',
        message: t('settings.providers.tmdb.status.connected_default')
      }
    }
  }

  const connectionStatus = getConnectionStatus()

  // Prepare select options
  const languageOptions = TMDB_LANGUAGE_OPTIONS.map(lang => ({
    label: lang.name,
    value: lang.code
  }))

  const countryOptions = TMDB_COUNTRY_OPTIONS.map(country => ({
    label: country.name,
    value: country.code
  }))

  const imageQualityOptions = TMDB_IMAGE_QUALITY_OPTIONS.map(quality => ({
    label: quality.name,
    value: quality.value
  }))

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
        {/* Connection Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, styles.connectedDot]} />
              <Text style={styles.statusText}>
                {connectionStatus.message}
              </Text>
            </View>
          </View>
          
          <Text style={styles.statusDescription}>
            {t('settings.providers.tmdb.status.hierarchy_description')}
          </Text>
          
          <View style={styles.hierarchyList}>
            <Text style={[styles.hierarchyItem, localSettings.bearerToken && styles.activeHierarchy]}>
              1. {t('settings.providers.tmdb.status.custom_bearer_token')}
            </Text>
            <Text style={[styles.hierarchyItem, !localSettings.bearerToken && localSettings.apiKey && styles.activeHierarchy]}>
              2. {t('settings.providers.tmdb.status.custom_api_key')}
            </Text>
            <Text style={[styles.hierarchyItem, !localSettings.bearerToken && !localSettings.apiKey && styles.activeHierarchy]}>
              3. {t('settings.providers.tmdb.status.default_api_key')}
            </Text>
          </View>
        </View>

        {/* Authentication Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.authentication')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.providers.tmdb.authentication_description')}
          </Text>

          <TextInput
            label={t('settings.providers.tmdb.bearer_token')}
            description={t('settings.providers.tmdb.bearer_token_description')}
            value={localSettings.bearerToken || ''}
            onChangeText={(value) => handleLocalChange({ bearerToken: value.trim() || undefined })}
            placeholder={t('settings.providers.tmdb.bearer_token_placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label={t('settings.providers.tmdb.api_key')}
            description={t('settings.providers.tmdb.api_key_description')}
            value={localSettings.apiKey || ''}
            onChangeText={(value) => handleLocalChange({ apiKey: value.trim() || undefined })}
            placeholder={t('settings.providers.tmdb.api_key_placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Regional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.regional_settings')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.providers.tmdb.regional_description')}
          </Text>

          <Select
            label={t('settings.providers.tmdb.language')}
            description={t('settings.providers.tmdb.language_description')}
            options={languageOptions}
            selectedValue={localSettings.language}
            onValueChange={(value) => handleLocalChange({ language: value })}
            placeholder={t('settings.providers.tmdb.language_placeholder')}
          />

          <Select
            label={t('settings.providers.tmdb.country')}
            description={t('settings.providers.tmdb.country_description')}
            options={countryOptions}
            selectedValue={localSettings.country}
            onValueChange={(value) => handleLocalChange({ country: value, region: value })}
            placeholder={t('settings.providers.tmdb.country_placeholder')}
          />
        </View>

        {/* Content & Media Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.content_settings')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.providers.tmdb.content_description')}
          </Text>

          <Select
            label={t('settings.providers.tmdb.image_quality')}
            description={t('settings.providers.tmdb.image_quality_description')}
            options={imageQualityOptions}
            selectedValue={localSettings.imageQuality}
            onValueChange={(value) => handleLocalChange({ imageQuality: value as TMDBSettings['imageQuality'] })}
            placeholder={t('settings.providers.tmdb.image_quality_placeholder')}
          />

          <SettingsToggle
            title={t('settings.providers.tmdb.include_adult')}
            description={t('settings.providers.tmdb.include_adult_description')}
            value={localSettings.includeAdult}
            onValueChange={(value) => handleLocalChange({ includeAdult: value })}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title={t('settings.providers.tmdb.validate_connection')}
            onPress={handleValidateConnection}
            variant="outline"
            disabled={isTesting}
            loading={isTesting}
          />

          <Button
            title={t('settings.providers.tmdb.save_settings')}
            onPress={handleSaveSettings}
            variant="primary"
            disabled={!hasChanges || isSaving}
            loading={isSaving}
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
  statusCard: ViewStyle
  statusHeader: ViewStyle
  statusIndicator: ViewStyle
  statusDot: ViewStyle
  connectedDot: ViewStyle
  statusText: TextStyle
  statusDescription: TextStyle
  hierarchyList: ViewStyle
  hierarchyItem: TextStyle
  activeHierarchy: TextStyle
  section: ViewStyle
  sectionTitle: TextStyle
  sectionDescription: TextStyle
  actionsSection: ViewStyle
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
  statusCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  statusHeader: {
    marginBottom: theme.spacing.sm
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm
  },
  connectedDot: {
    backgroundColor: theme.colors.status.success
  },
  statusText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary
  },
  statusDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: theme.spacing.sm
  },
  hierarchyList: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm
  },
  hierarchyItem: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: theme.spacing.xs
  },
  activeHierarchy: {
    color: theme.colors.status.success,
    fontWeight: '600' as TextStyle['fontWeight']
  },
  section: {
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  sectionDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: theme.spacing.md
  },
  actionsSection: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  }
})