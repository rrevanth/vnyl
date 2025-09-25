import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import {
  SettingsSection,
  PreferenceToggle
} from '@/src/presentation/features/settings/components'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function ProvidersScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title={t('providers.sections.database')}
          description="Configure your preferred media database providers"
        >
          <PreferenceToggle
            title="TMDB"
            description="The Movie Database integration"
            value={true}
            onValueChange={() => {}}
            disabled
          />

          <PreferenceToggle
            title="IMDB"
            description="Internet Movie Database integration"
            value={false}
            onValueChange={() => {}}
            disabled
          />
        </SettingsSection>

        <SettingsSection
          title={t('providers.sections.streaming')}
          description="Configure streaming service providers"
        >
          <PreferenceToggle
            title="Netflix"
            description="Netflix streaming integration"
            value={false}
            onValueChange={() => {}}
            disabled
          />

          <PreferenceToggle
            title="Disney+"
            description="Disney Plus streaming integration"
            value={false}
            onValueChange={() => {}}
            disabled
          />
        </SettingsSection>

        <SettingsSection
          title={t('providers.sections.tracking')}
          description="Configure tracking providers"
        >
          <PreferenceToggle
            title="Trakt"
            description="Trakt.tv tracking integration"
            value={false}
            onValueChange={() => {}}
            disabled
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