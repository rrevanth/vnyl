import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { SettingRow, SectionHeader, NavigationHeader } from '@/src/presentation/components'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function ProvidersScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

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
        {/* Future Providers Section */}
        <SectionHeader title={t('providers.sections.database')} />

        <SettingRow
          title="Media Database Providers"
          description={t('providers.comingSoon')}
          disabled
        />

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
  infoContainer: {
    marginTop: theme.spacing.md
  }
})