import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { NavigationHeader, Select, SettingsSlider, SettingsToggle } from '@/src/presentation/components'
import { useSettingsActions } from '@/src/presentation/shared/hooks/useSettingsActions'
import { FONT_SIZE_OPTIONS, FONT_FAMILIES } from '@/src/presentation/shared/constants/settings'
import type { Theme } from '@/src/presentation/shared/theme'
import type { FontSize } from '@/src/domain/entities'

export default observer(function DisplaySettingsScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  const {
    displaySettings,
    updateFontSize,
    updateFontFamily,
    updateLineHeight,
    updateCompactMode
  } = useSettingsActions()

  // Prepare options for Select components
  const fontSizeSelectOptions = FONT_SIZE_OPTIONS.map(size => ({
    label: size.label,
    value: size.value
  }))

  const fontFamilySelectOptions = FONT_FAMILIES.map(font => ({
    label: font.name,
    value: font.value
  }))

  // Type-safe wrapper functions for Select components
  const handleFontSizeChange = (value: string) => {
    updateFontSize(value as FontSize)
  }

  const handleFontFamilyChange = (value: string) => {
    updateFontFamily(value)
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader
        title={t('settings.display.title')}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.display.typography')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.display.typography_description')}
          </Text>

          <Select
            label={t('settings.display.font_size')}
            options={fontSizeSelectOptions}
            selectedValue={displaySettings.fontSize}
            onValueChange={handleFontSizeChange}
          />

          <Select
            label={t('settings.display.font_family')}
            options={fontFamilySelectOptions}
            selectedValue={displaySettings.fontFamily || 'system'}
            onValueChange={handleFontFamilyChange}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.display.spacing')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.display.spacing_description')}
          </Text>

          <SettingsSlider
            title={t('settings.display.line_height')}
            description={t('settings.display.line_height_description')}
            value={displaySettings.lineHeight}
            minimumValue={1.0}
            maximumValue={2.0}
            step={0.1}
            onValueChange={updateLineHeight}
            formatValue={(val) => `${val.toFixed(1)}x`}
          />

          <View style={styles.settingSpacing} />

          <SettingsToggle
            title={t('settings.display.compact_mode')}
            description={t('settings.display.compact_mode_description')}
            value={displaySettings.compactMode}
            onValueChange={updateCompactMode}
          />
        </View>

        {/* Typography preview section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.display.preview')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('settings.display.preview_description')}
          </Text>

          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <Text style={[styles.previewHeading, {
                fontFamily: displaySettings.fontFamily === 'system' ? undefined : displaySettings.fontFamily,
                lineHeight: theme.typography.heading2.lineHeight * displaySettings.lineHeight / 1.3
              }]}>
                {t('settings.display.preview_heading')}
              </Text>

              <Text style={[styles.previewBody, {
                fontFamily: displaySettings.fontFamily === 'system' ? undefined : displaySettings.fontFamily,
                lineHeight: theme.typography.body.lineHeight * displaySettings.lineHeight / 1.3
              }]}>
                {t('settings.display.preview_body')}
              </Text>

              <Text style={[styles.previewCaption, {
                fontFamily: displaySettings.fontFamily === 'system' ? undefined : displaySettings.fontFamily,
                lineHeight: theme.typography.caption.lineHeight * displaySettings.lineHeight / 1.3
              }]}>
                {t('settings.display.preview_caption')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

interface DisplaySettingsStyles {
  container: ViewStyle
  scrollView: ViewStyle
  scrollContent: ViewStyle
  section: ViewStyle
  sectionTitle: TextStyle
  sectionDescription: TextStyle
  settingSpacing: ViewStyle
  previewContainer: ViewStyle
  previewCard: ViewStyle
  previewHeading: TextStyle
  previewBody: TextStyle
  previewCaption: TextStyle
}

const createStyles = (theme: Theme): DisplaySettingsStyles => StyleSheet.create({
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
  settingSpacing: {
    height: theme.spacing.sm
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
  previewHeading: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md
  },
  previewBody: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md
  },
  previewCaption: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.text.secondary
  }
})