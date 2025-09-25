import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation, useLocale } from '@/src/presentation/shared/i18n'
import { useLocaleActions } from '@/src/presentation/features/settings/hooks'
import {
  SettingsSection,
  PreferenceSelector
} from '@/src/presentation/features/settings/components'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function LocaleScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const locale = useLocale()
  const { setLanguage, setRegion, setDateFormat, setTimeFormat, setCurrency } = useLocaleActions()
  const styles = createStyles(theme)

  const languageOptions = [
    { label: t('settings.language.english'), value: 'en' },
    { label: t('settings.language.spanish'), value: 'es' }
  ]

  const regionOptions = [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'Spain', value: 'ES' },
    { label: 'Mexico', value: 'MX' }
  ]

  const dateFormatOptions = [
    { label: 'ISO (YYYY-MM-DD)', value: 'iso' },
    { label: 'US (MM/DD/YYYY)', value: 'us' },
    { label: 'European (DD/MM/YYYY)', value: 'eu' }
  ]

  const timeFormatOptions = [
    { label: '12-hour (AM/PM)', value: '12h' },
    { label: '24-hour', value: '24h' }
  ]

  const currencyOptions = [
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'British Pound (GBP)', value: 'GBP' },
    { label: 'Canadian Dollar (CAD)', value: 'CAD' },
    { label: 'Mexican Peso (MXN)', value: 'MXN' }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title={t('settings.locale.language')}
        >
          <PreferenceSelector
            title={t('settings.locale.language')}
            value={locale}
            options={languageOptions}
            onValueChange={(value) => setLanguage(value as 'en' | 'es')}
          />

          <PreferenceSelector
            title={t('settings.locale.region')}
            value="US"
            options={regionOptions}
            onValueChange={setRegion}
          />
        </SettingsSection>

        <SettingsSection
          title={t('settings.locale.date_format')}
        >
          <PreferenceSelector
            title={t('settings.locale.date_format')}
            value="iso"
            options={dateFormatOptions}
            onValueChange={(value) => setDateFormat(value as 'iso' | 'us' | 'eu')}
          />

          <PreferenceSelector
            title={t('settings.locale.time_format')}
            value="12h"
            options={timeFormatOptions}
            onValueChange={(value) => setTimeFormat(value as '12h' | '24h')}
          />
        </SettingsSection>

        <SettingsSection
          title={t('settings.locale.currency')}
        >
          <PreferenceSelector
            title={t('settings.locale.currency')}
            value="USD"
            options={currencyOptions}
            onValueChange={setCurrency}
          />
        </SettingsSection>
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
  }
})