import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { NavigationHeader, SegmentedControl, ColorPicker } from '@/src/presentation/components'
import { useSettingsActions } from '@/src/presentation/shared/hooks/useSettingsActions'
import { ACCENT_COLORS, THEME_MODE_OPTIONS } from '@/src/presentation/shared/constants/settings'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function ThemeSettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  const {
    themePreference,
    updateThemeMode,
    updateAccentColor
  } = useSettingsActions()

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader
        title={t('settings.theme.title')}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.theme.appearance')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.theme.appearance_description')}
          </Text>

          <View style={styles.settingContainer}>
            <SegmentedControl
              options={THEME_MODE_OPTIONS}
              selectedValue={themePreference.mode}
              onValueChange={updateThemeMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.theme.accent_color')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.theme.accent_color_description')}
          </Text>

          <View style={styles.settingContainer}>
            <ColorPicker
              selectedColor={themePreference.accentColor}
              colors={ACCENT_COLORS}
              onColorSelect={updateAccentColor}
            />
          </View>
        </View>

        {/* Theme preview section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.theme.preview')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.theme.preview_description')}
          </Text>

          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewAvatar, { backgroundColor: themePreference.accentColor || theme.colors.interactive.primary }]} />
                <View style={styles.previewHeaderText}>
                  <Text style={styles.previewTitle}>
                    {t('settings.theme.preview_title')}
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    {t('settings.theme.preview_subtitle')}
                  </Text>
                </View>
              </View>
              <Text style={styles.previewBody}>
                {t('settings.theme.preview_body')}
              </Text>
              <View style={[styles.previewButton, { backgroundColor: themePreference.accentColor || theme.colors.interactive.primary }]}>
                <Text style={styles.previewButtonText}>
                  {t('settings.theme.preview_button')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

interface ThemeSettingsStyles {
  container: ViewStyle
  scrollView: ViewStyle
  scrollContent: ViewStyle
  section: ViewStyle
  sectionTitle: TextStyle
  sectionDescription: TextStyle
  settingContainer: ViewStyle
  previewContainer: ViewStyle
  previewCard: ViewStyle
  previewHeader: ViewStyle
  previewAvatar: ViewStyle
  previewHeaderText: ViewStyle
  previewTitle: TextStyle
  previewSubtitle: TextStyle
  previewBody: TextStyle
  previewButton: ViewStyle
  previewButtonText: TextStyle
}

const createStyles = (theme: Theme): ThemeSettingsStyles => StyleSheet.create({
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
  section: {
    marginBottom: theme.spacing.lg
  },
  sectionTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  sectionDescription: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: theme.spacing.md
  },
  settingContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md
  },
  previewContainer: {
    marginTop: theme.spacing.sm
  },
  previewCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.md
  },
  previewHeaderText: {
    flex: 1
  },
  previewTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  previewSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary
  },
  previewBody: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.md
  },
  previewButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    alignItems: 'center'
  },
  previewButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as TextStyle['fontWeight']
  }
})