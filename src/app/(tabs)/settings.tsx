import React from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { useTheme, useThemeMode, useThemeActions } from '@/src/presentation/shared/theme'
import { useTranslation, useLocale, useLocaleActions } from '@/src/presentation/shared/i18n'
import { useDI } from '@/src/presentation/shared/providers'
import { SettingRow, Toggle, SectionHeader, Button } from '@/src/presentation/components'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { IUserPreferenceService } from '@/src/domain/services'
import type { Theme, ThemeMode } from '@/src/presentation/shared/theme'
import type { Locale } from '@/src/presentation/shared/i18n'

export default observer(function SettingsScreen() {
  const theme = useTheme()
  const themeMode = useThemeMode()
  const { toggleTheme } = useThemeActions()
  const { t } = useTranslation()
  const locale = useLocale()
  const { setLocale } = useLocaleActions()
  const router = useRouter()
  const styles = createStyles(theme)

  // DI Services
  const { resolve } = useDI()
  const userPreferenceService = resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language.title'),
      '',
      [
        {
          text: t('settings.language.english'),
          onPress: () => setLocale('en'),
          style: locale === 'en' ? 'destructive' : 'default'
        },
        {
          text: t('settings.language.spanish'),
          onPress: () => setLocale('es'),
          style: locale === 'es' ? 'destructive' : 'default'
        },
        {
          text: t('common.cancel'),
          style: 'cancel'
        }
      ]
    )
  }

  const handleProvidersPress = () => {
    router.push('/settings/providers')
  }

  const getLanguageDisplayName = (currentLocale: Locale): string => {
    switch (currentLocale) {
      case 'en':
        return t('settings.language.english')
      case 'es':
        return t('settings.language.spanish')
      default:
        return t('settings.language.english')
    }
  }

  const getThemeDisplayName = (currentMode: ThemeMode): string => {
    switch (currentMode) {
      case 'light':
        return t('settings.theme.light')
      case 'dark':
        return t('settings.theme.dark')
      default:
        return t('settings.theme.light')
    }
  }

  const getProviderStatus = (): string => {
    const isTMDBConfigured = userPreferenceService.isTMDBConfigured()

    if (isTMDBConfigured) {
      return t('providers.status.configured')
    }

    return t('providers.status.notConfigured')
  }

  const getProviderStatusColor = () => {
    const isTMDBConfigured = userPreferenceService.isTMDBConfigured()
    return isTMDBConfigured ? theme.colors.status.success : theme.colors.status.error
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <SectionHeader
          title={t('settings.theme.title')}
        />

        <SettingRow
          title={t('settings.theme.title')}
          description={getThemeDisplayName(themeMode)}
          renderRight={() => (
            <Toggle
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
            />
          )}
        />

        {/* Language Section */}
        <SectionHeader
          title={t('settings.language.title')}
        />

        <SettingRow
          title={t('settings.language.title')}
          description={getLanguageDisplayName(locale)}
          onPress={handleLanguageChange}
          showChevron
        />

        {/* Providers Section */}
        <SectionHeader
          title={t('providers.title')}
        />

        <SettingRow
          title={t('providers.title')}
          description={getProviderStatus()}
          onPress={handleProvidersPress}
          showChevron
          renderRight={() => (
            <View style={[styles.statusIndicator, {
              backgroundColor: getProviderStatusColor()
            }]} />
          )}
        />

        {/* About Section */}
        <SectionHeader
          title={t('settings.about.title')}
        />

        <SettingRow
          title={t('settings.about.version')}
          description="1.0.0"
        />

        {/* Development Section */}
        <View style={styles.developmentSection}>
          <Button
            title="Reset App Data"
            onPress={() => {
              Alert.alert(
                'Reset App Data',
                'This will reset all app preferences and data. Are you sure?',
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: () => {
                      // Reset logic would go here
                      Alert.alert('Reset Complete', 'App data has been reset.')
                    }
                  }
                ]
              )
            }}
            variant="outline"
            size="sm"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: theme.spacing.sm
  },
  developmentSection: {
    marginTop: theme.spacing.xl,
    alignItems: 'center'
  }
})