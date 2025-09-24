import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useDI } from '@/src/presentation/shared/providers'
import { SettingRow, SectionHeader, NavigationHeader } from '@/src/presentation/components'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { IUserPreferenceService } from '@/src/domain/services'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function ProvidersScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const router = useRouter()
  const styles = createStyles(theme)

  // DI Services
  const { resolve } = useDI()
  const userPreferenceService = resolve<IUserPreferenceService>(TOKENS.USER_PREFERENCE_SERVICE)

  // Get configuration status for all providers
  const isTMDBConfigured = userPreferenceService.isTMDBConfigured()

  const handleTMDBPress = () => {
    router.push('/settings/providers/tmdb')
  }

  const getProviderStatus = (isConfigured: boolean): string => {
    return isConfigured
      ? t('providers.status.configured')
      : t('providers.status.notConfigured')
  }

  const getProviderStatusColor = (isConfigured: boolean) => {
    return isConfigured
      ? theme.colors.status.success
      : theme.colors.status.error
  }

  return (
    <View style={styles.container}>
      <NavigationHeader
        title={t('providers.title')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Database Providers */}
        <SectionHeader title={t('providers.sections.database')} />

        <SettingRow
          title="The Movie Database (TMDB)"
          description={getProviderStatus(isTMDBConfigured)}
          onPress={handleTMDBPress}
          showChevron
          renderRight={() => (
            <View style={[styles.statusIndicator, {
              backgroundColor: getProviderStatusColor(isTMDBConfigured)
            }]} />
          )}
        />

        {/* Future Providers Section */}
        <SectionHeader title={t('providers.sections.streaming')} />

        <SettingRow
          title="Streaming Providers"
          description={t('providers.comingSoon')}
          disabled
        />

        <SectionHeader title={t('providers.sections.tracking')} />

        <SettingRow
          title="Tracking Providers"
          description={t('providers.comingSoon')}
          disabled
        />

        {/* Information Section */}
        <SectionHeader title={t('providers.sections.info')} />

        <View style={styles.infoContainer}>
          <SettingRow
            title={t('providers.info.title')}
            description={t('providers.info.description')}
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
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: theme.spacing.sm
  },
  infoContainer: {
    marginTop: theme.spacing.md
  }
})