import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { SettingsCard } from '@/src/presentation/features/settings/components/SettingsCard'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function SettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const styles = createStyles(theme)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsCard
          title={t('settings.theme.title')}
          description={t('settings.theme.description')}
          iconName="palette"
          onPress={() => router.push('/settings/theme')}
        />

        <SettingsCard
          title={t('settings.locale.title')}
          description={t('settings.locale.description')}
          iconName="language"
          onPress={() => router.push('/settings/locale')}
        />

        <SettingsCard
          title={t('settings.display.title')}
          description={t('settings.display.description')}
          iconName="format-size"
          onPress={() => router.push('/settings/display')}
        />

        <SettingsCard
          title={t('providers.title')}
          description={t('providers.description')}
          iconName="cloud"
          onPress={() => router.push('/settings/providers')}
        />

        <SettingsCard
          title={t('settings.about.title')}
          description={t('settings.about.description')}
          iconName="information"
          onPress={() => router.push('/settings/about')}
        />
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