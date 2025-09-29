import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { NavigationHeader, SettingsCard } from '@/src/presentation/components/atoms'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function ProvidersSettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const styles = createStyles(theme)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader
        title={t('settings.providers.title')}
        showBackButton
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsCard
          title={t('settings.providers.tmdb.title')}
          description={t('settings.providers.tmdb.description')}
          icon="film-outline"
          onPress={() => router.push('/settings/tmdb')}
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