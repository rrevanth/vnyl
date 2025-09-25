import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme, useThemeMode } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useThemeActions } from '@/src/presentation/features/settings/hooks'
import { useThemePreference } from '@/src/presentation/shared/providers'
import {
  SettingsSection,
  PreferenceToggle,
  PreferenceSelector
} from '@/src/presentation/features/settings/components'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function ThemeScreen() {
  const theme = useTheme()
  const themeMode = useThemeMode()
  const { t } = useTranslation()
  const { setDarkMode, setHighContrast, setAdaptToContent, setAccentColor } = useThemeActions()
  const themePreference = useThemePreference()
  const styles = createStyles(theme)

  const accentColorOptions = [
    { label: t('colors.blue'), value: '#007AFF' },
    { label: t('colors.green'), value: '#34C759' },
    { label: t('colors.purple'), value: '#5856D6' },
    { label: t('colors.red'), value: '#FF3B30' },
    { label: t('colors.orange'), value: '#FF9500' }
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title={t('settings.theme.appearance')}
          description={t('settings.theme.description')}
        >
          <PreferenceToggle
            title={t('settings.theme.dark_mode')}
            value={themeMode === 'dark'}
            onValueChange={setDarkMode}
          />

          <PreferenceSelector
            title={t('settings.theme.accent_color')}
            value={themePreference.accentColor || "#007AFF"}
            options={accentColorOptions}
            onValueChange={setAccentColor}
          />

          <PreferenceToggle
            title={t('settings.theme.high_contrast')}
            value={themePreference.highContrast}
            onValueChange={setHighContrast}
          />

          <PreferenceToggle
            title={t('settings.theme.adapt_to_content')}
            value={themePreference.adaptToContent}
            onValueChange={setAdaptToContent}
          />
        </SettingsSection>
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
  }
})