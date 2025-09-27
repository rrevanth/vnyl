/**
 * TMDB Capabilities Management Screen
 * 
 * Manages provider capability settings for TMDB including:
 * - Dynamic capability loading
 * - Enable/disable individual capabilities
 * - Save/reset functionality with proper error handling
 * - Loading states and user feedback
 */

import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { Button, CapabilityToggle } from '@/src/presentation/components'
import { useDI } from '@/src/presentation/shared/hooks/use-di'
import { GetProviderCapabilitiesUseCase } from '@/src/domain/usecases/get-provider-capabilities.usecase'
import { UpdateProviderCapabilitiesUseCase } from '@/src/domain/usecases/update-provider-capabilities.usecase'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { useSettingsActions } from '@/src/presentation/shared/hooks/useSettingsActions'
import type { Theme } from '@/src/presentation/shared/theme'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'
import type { CapabilityConfig } from '@/src/domain/entities'

export default observer(function TMDBCapabilitiesScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  // Dependency injection
  const getProviderCapabilitiesUseCase = useDI<GetProviderCapabilitiesUseCase>(TOKENS.GET_PROVIDER_CAPABILITIES_USE_CASE)
  const updateProviderCapabilitiesUseCase = useDI<UpdateProviderCapabilitiesUseCase>(TOKENS.UPDATE_PROVIDER_CAPABILITIES_USE_CASE)

  // Settings state
  const { preferences } = useSettingsActions()
  const currentTMDBSettings = preferences.providerSettings?.tmdbSettings

  // Component state
  const [availableCapabilities, setAvailableCapabilities] = useState<ProviderCapability[]>([])
  const [capabilitySettings, setCapabilitySettings] = useState<Partial<Record<ProviderCapability, CapabilityConfig>>>({})
  const [originalSettings, setOriginalSettings] = useState<Partial<Record<ProviderCapability, CapabilityConfig>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load available capabilities and current settings
  const loadCapabilities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get available capabilities for TMDB provider
      const capabilities = await getProviderCapabilitiesUseCase.execute('tmdb')
      setAvailableCapabilities(capabilities)

      // Initialize settings from current user preferences or defaults
      const currentSettings = currentTMDBSettings?.capabilitySettings || {}
      const initialSettings: Partial<Record<ProviderCapability, CapabilityConfig>> = {}

      // Create settings for all available capabilities
      capabilities.forEach((capability: ProviderCapability) => {
        initialSettings[capability] = currentSettings[capability] || {
          enabled: getDefaultCapabilityState(capability)
        }
      })

      setCapabilitySettings({ ...initialSettings })
      setOriginalSettings({ ...initialSettings })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      console.error('Failed to load capabilities:', error)
    } finally {
      setLoading(false)
    }
  }, [getProviderCapabilitiesUseCase, currentTMDBSettings?.capabilitySettings])

  // Get default state for a capability
  const getDefaultCapabilityState = (capability: ProviderCapability): boolean => {
    // Default enabled capabilities for TMDB
    const defaultEnabled = [
      ProviderCapability.METADATA,
      ProviderCapability.CATALOG,
      ProviderCapability.SEARCH,
      ProviderCapability.RECOMMENDATION,
      ProviderCapability.RATING,
      ProviderCapability.IMAGE,
      ProviderCapability.VIDEO
    ]

    return defaultEnabled.includes(capability)
  }

  // Load capabilities on mount
  useEffect(() => {
    loadCapabilities()
  }, [loadCapabilities])

  // Check if settings have changed
  const hasChanges = React.useMemo(() => {
    return availableCapabilities.some(capability => {
      const current = capabilitySettings[capability]?.enabled
      const original = originalSettings[capability]?.enabled
      return current !== original
    })
  }, [availableCapabilities, capabilitySettings, originalSettings])

  // Handle capability toggle
  const handleCapabilityToggle = useCallback((capability: ProviderCapability, enabled: boolean) => {
    setCapabilitySettings(prev => ({
      ...prev,
      [capability]: {
        ...prev[capability],
        enabled
      }
    }))
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setSaving(true)
      setError(null)

      // Create settings object with only available capabilities
      const settingsToSave: Partial<Record<ProviderCapability, CapabilityConfig>> = {}
      availableCapabilities.forEach((capability: ProviderCapability) => {
        settingsToSave[capability] = capabilitySettings[capability]!
      })

      // Update provider capabilities
      await updateProviderCapabilitiesUseCase.execute('tmdb', settingsToSave as Record<ProviderCapability, CapabilityConfig>)

      // Update original settings to reflect saved state
      setOriginalSettings({ ...capabilitySettings })

      Alert.alert(
        t('settings.providers.tmdb.capabilities_save_success_title'),
        t('settings.providers.tmdb.capabilities_save_success_message')
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      Alert.alert(
        t('common.error'),
        t('settings.providers.tmdb.capabilities_save_error_message') + ': ' + errorMessage
      )
    } finally {
      setSaving(false)
    }
  }, [availableCapabilities, capabilitySettings, updateProviderCapabilitiesUseCase, t])

  // Handle reset
  const handleReset = useCallback(() => {
    Alert.alert(
      t('settings.providers.tmdb.capabilities_reset_title'),
      t('settings.providers.tmdb.capabilities_reset_message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: () => {
            setCapabilitySettings({ ...originalSettings })
          }
        }
      ]
    )
  }, [originalSettings, t])

  // Handle retry on error
  const handleRetry = useCallback(() => {
    loadCapabilities()
  }, [loadCapabilities])

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('settings.providers.tmdb.loading_capabilities')}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state
  if (error && availableCapabilities.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            {t('settings.providers.tmdb.capabilities_error_title')}
          </Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title={t('common.retry')}
            onPress={handleRetry}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>
            {t('settings.providers.tmdb.capabilities_header_title')}
          </Text>
          <Text style={styles.headerDescription}>
            {t('settings.providers.tmdb.capabilities_header_description')}
          </Text>
        </View>

        {/* Error message if there was an error but we have some capabilities */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Capabilities List */}
        <View style={styles.capabilitiesSection}>
          <Text style={styles.sectionTitle}>
            {t('settings.providers.tmdb.available_capabilities')}
          </Text>
          
          {availableCapabilities.map(capability => {
            const isEnabled = capabilitySettings[capability]?.enabled ?? false

            return (
              <View key={capability} style={styles.capabilityContainer}>
                <CapabilityToggle
                  capability={capability}
                  enabled={isEnabled}
                  onToggle={handleCapabilityToggle}
                  providerId="tmdb"
                  disabled={saving}
                  loading={false}
                />
              </View>
            )
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button
                title={t('common.reset')}
                onPress={handleReset}
                variant="outline"
                disabled={!hasChanges || saving}
                fullWidth
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button
                title={t('common.save')}
                onPress={handleSave}
                disabled={!hasChanges}
                loading={saving}
                fullWidth
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

interface TMDBCapabilitiesStyles {
  container: ViewStyle
  scrollView: ViewStyle
  scrollContent: ViewStyle
  loadingContainer: ViewStyle
  loadingText: TextStyle
  errorContainer: ViewStyle
  errorTitle: TextStyle
  errorMessage: TextStyle
  errorBanner: ViewStyle
  errorBannerText: TextStyle
  headerSection: ViewStyle
  headerTitle: TextStyle
  headerDescription: TextStyle
  capabilitiesSection: ViewStyle
  sectionTitle: TextStyle
  capabilityContainer: ViewStyle
  buttonContainer: ViewStyle
  buttonRow: ViewStyle
  buttonHalf: ViewStyle
}

const createStyles = (theme: Theme): TMDBCapabilitiesStyles => StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  loadingText: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  errorTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as TextStyle['fontWeight'],
    fontFamily: theme.typography.heading3.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: theme.typography.body.lineHeight
  },
  errorBanner: {
    backgroundColor: theme.colors.status?.error || '#FF453A',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  errorBannerText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.inverse,
    textAlign: 'center'
  },
  headerSection: {
    marginBottom: theme.spacing.lg
  },
  headerTitle: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as TextStyle['fontWeight'],
    fontFamily: theme.typography.heading2.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  headerDescription: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.body.lineHeight
  },
  capabilitiesSection: {
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as TextStyle['fontWeight'],
    fontFamily: theme.typography.heading3.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md
  },
  capabilityContainer: {
    marginBottom: theme.spacing.sm
  },
  buttonContainer: {
    marginTop: theme.spacing.md
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  buttonHalf: {
    flex: 1
  }
})