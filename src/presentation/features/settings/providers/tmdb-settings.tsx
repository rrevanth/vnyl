import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useDI } from '@/src/presentation/shared/providers'
import { SettingRow, SectionHeader, Button, Input, Toggle, NavigationHeader } from '@/src/presentation/components'
import { StatusHeader } from '@/src/presentation/components/atoms/StatusHeader'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { UpdateTMDBConfigUseCase } from '@/src/domain/usecases'
import { IUserPreferenceService, ILoggingService } from '@/src/domain/services'
import { TMDBApiClient } from '@/src/infrastructure/api/implementations/tmdb-api-client.service'
import { TMDB_LANGUAGES, TMDB_REGIONS, DEFAULT_TMDB_CONFIG } from '@/src/domain/entities'
import type { TMDBConfig } from '@/src/domain/entities'
import type { Theme } from '@/src/presentation/shared/theme'
import type { AuthenticationType } from '@/src/presentation/components/atoms/StatusHeader'

export default observer(function TMDBSettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  // DI Services
  const { resolve } = useDI()
  const updateTMDBConfigUseCase = resolve<UpdateTMDBConfigUseCase>(TOKENS.UPDATE_TMDB_CONFIG_USE_CASE)
  const userPreferenceService = resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)
  const tmdbApiClient = resolve<TMDBApiClient>(TOKENS.TMDB_API_CLIENT)
  const logger = resolve<ILoggingService>(TOKENS.LOGGING_SERVICE)

  // State
  const currentConfig = userPreferenceService.getTMDBConfig()
  const defaultApiKey = userPreferenceService.getDefaultTMDBApiKey()
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '')
  const [bearerToken, setBearerToken] = useState(currentConfig.bearerToken || '')
  const [language, setLanguage] = useState(currentConfig.language)
  const [region, setRegion] = useState(currentConfig.region)
  const [includeAdult, setIncludeAdult] = useState(currentConfig.includeAdult)
  const [isLoading, setIsLoading] = useState(false)

  const handleValidateAndSave = async () => {
    try {
      setIsLoading(true)
      logger.info('Validating and saving TMDB configuration', { hasApiKey: !!apiKey, hasBearerToken: !!bearerToken })

      const newConfig: Partial<TMDBConfig> = {
        apiKey: apiKey.trim(),
        bearerToken: bearerToken.trim(),
        language,
        region,
        includeAdult
      }

      // First save the configuration
      await updateTMDBConfigUseCase.execute(newConfig)
      await tmdbApiClient.refreshConfiguration()

      // Then test the connection
      const result = await tmdbApiClient.testConnection()

      if (result.success) {
        Alert.alert(
          t('providers.tmdb.validateSave.success.title'),
          t('providers.tmdb.validateSave.success.message'),
          [{ text: t('common.done'), style: 'default' }]
        )
        logger.info('TMDB configuration validated and saved successfully')
      } else {
        Alert.alert(
          t('providers.tmdb.validateSave.error.title'),
          result.error || t('providers.tmdb.validateSave.error.message'),
          [{ text: t('common.retry'), style: 'default' }]
        )
        logger.error('TMDB configuration validation failed', new Error(result.error))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to validate and save TMDB configuration', error instanceof Error ? error : new Error(errorMessage))

      Alert.alert(
        t('providers.tmdb.validateSave.error.title'),
        t('providers.tmdb.validateSave.error.message'),
        [{ text: t('common.retry'), style: 'default' }]
      )
    } finally {
      setIsLoading(false)
    }
  }


  const handleLanguageSelect = () => {
    const languageOptions = TMDB_LANGUAGES.map(lang => ({
      text: `${lang.name} (${lang.code})`,
      onPress: () => setLanguage(lang.code),
      style: language === lang.code ? 'destructive' as const : 'default' as const
    }))

    Alert.alert(
      t('providers.tmdb.language.title'),
      '',
      [
        ...languageOptions,
        { text: t('common.cancel'), style: 'cancel' }
      ]
    )
  }

  const handleRegionSelect = () => {
    const regionOptions = TMDB_REGIONS.map(reg => ({
      text: `${reg.name} (${reg.code})`,
      onPress: () => setRegion(reg.code),
      style: region === reg.code ? 'destructive' as const : 'default' as const
    }))

    Alert.alert(
      t('providers.tmdb.region.title'),
      '',
      [
        ...regionOptions,
        { text: t('common.cancel'), style: 'cancel' }
      ]
    )
  }

  const resetToDefaults = () => {
    Alert.alert(
      t('providers.tmdb.reset.title'),
      t('providers.tmdb.reset.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('providers.tmdb.reset.confirm'),
          style: 'destructive',
          onPress: () => {
            setApiKey('')
            setBearerToken('')
            setLanguage(DEFAULT_TMDB_CONFIG.language)
            setRegion(DEFAULT_TMDB_CONFIG.region)
            setIncludeAdult(DEFAULT_TMDB_CONFIG.includeAdult)
          }
        }
      ]
    )
  }

  const getCurrentLanguageName = () => {
    const lang = TMDB_LANGUAGES.find(l => l.code === language)
    return lang ? `${lang.name} (${lang.code})` : language
  }

  const getCurrentRegionName = () => {
    const reg = TMDB_REGIONS.find(r => r.code === region)
    return reg ? `${reg.name} (${reg.code})` : region
  }

  const isConfigValid = (apiKey.trim().length > 0 || bearerToken.trim().length > 0 || defaultApiKey.length > 0)
  const configStatus = tmdbApiClient.getConfigurationStatus()

  // Determine authentication type and health status
  const getAuthenticationType = (): AuthenticationType => {
    if (bearerToken.trim()) return 'bearer'
    if (apiKey.trim()) return 'apikey'
    if (defaultApiKey) return 'default'
    return 'none'
  }

  const getHealthStatus = (): boolean => {
    return configStatus.hasApiKey || configStatus.hasBearerToken
  }

  const getStatusText = (): string => {
    if (bearerToken.trim()) {
      return t('providers.tmdb.header.status.bearerConfigured')
    }
    if (apiKey.trim()) {
      return t('providers.tmdb.header.status.apiKeyConfigured')
    }
    if (defaultApiKey) {
      return t('providers.tmdb.header.status.defaultKeyActive')
    }
    return t('providers.tmdb.header.status.notConfigured')
  }

  return (
    <View style={styles.container}>
      <NavigationHeader
        title={t('providers.tmdb.title')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Status */}
        <StatusHeader
          title={t('providers.tmdb.header.title')}
          authenticationType={getAuthenticationType()}
          isHealthy={getHealthStatus()}
          statusText={getStatusText()}
        />

        {/* Configuration Form */}
        <SectionHeader title={t('providers.tmdb.form.title')} />

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Input
              label={t('providers.tmdb.form.bearerToken')}
              value={bearerToken}
              onChangeText={setBearerToken}
              placeholder={t('providers.tmdb.form.bearerTokenPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('providers.tmdb.form.apiKey')}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder={t('providers.tmdb.form.apiKeyPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <SettingRow
            title={t('providers.tmdb.form.language')}
            description={getCurrentLanguageName()}
            onPress={handleLanguageSelect}
            showChevron
          />

          <SettingRow
            title={t('providers.tmdb.form.region')}
            description={getCurrentRegionName()}
            onPress={handleRegionSelect}
            showChevron
          />

          <SettingRow
            title={t('providers.tmdb.form.includeAdult')}
            description={t('providers.tmdb.form.includeAdultDescription')}
            renderRight={() => (
              <Toggle
                value={includeAdult}
                onValueChange={setIncludeAdult}
              />
            )}
          />
        </View>

        {/* Primary Action */}
        <View style={styles.actionSection}>
          <Button
            title={t('providers.tmdb.actions.validateAndSave')}
            onPress={handleValidateAndSave}
            variant="primary"
            disabled={!isConfigValid || isLoading}
            size="lg"
            fullWidth
          />

          <Button
            title={t('providers.tmdb.actions.reset')}
            onPress={resetToDefaults}
            variant="ghost"
            size="sm"
          />
        </View>
      </ScrollView>
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
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
  formContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  inputContainer: {
    marginBottom: theme.spacing.md
  },
  actionSection: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
    alignItems: 'center'
  }
})