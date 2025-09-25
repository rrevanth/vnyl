import React from 'react'
import { View, ScrollView, StyleSheet, Text, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import {
  SettingsSection,
  SettingsCard
} from '@/src/presentation/features/settings/components'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function AboutScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      }
    } catch (error) {
      // Handle error gracefully
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title={t('settings.about.title')}
          description={t('settings.about.description')}
        >
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.version')}</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.about.build')}</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </SettingsSection>

        <SettingsSection
          title="Legal"
        >
          <SettingsCard
            title={t('settings.about.privacy_policy')}
            description="How we handle your data"
            iconName="shield"
            onPress={() => handleLinkPress('https://example.com/privacy')}
          />

          <SettingsCard
            title={t('settings.about.terms_of_service')}
            description="Terms and conditions"
            iconName="document"
            onPress={() => handleLinkPress('https://example.com/terms')}
          />

          <SettingsCard
            title={t('settings.about.license')}
            description="Open source licenses"
            iconName="code"
            onPress={() => handleLinkPress('https://example.com/licenses')}
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for media lovers
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 VNYL. All rights reserved.
          </Text>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs
  },
  infoLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text.primary
  },
  infoValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '400'
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg
  },
  footerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs
  },
  footerSubtext: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  }
})