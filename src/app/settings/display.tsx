import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useDisplayActions } from '@/src/presentation/features/settings/hooks'
import { useDisplaySettings } from '@/src/presentation/shared/providers'
import {
  SettingsSection,
  PreferenceToggle,
  PreferenceSelector,
  PreferenceSlider
} from '@/src/presentation/features/settings/components'
import type { Theme } from '@/src/presentation/shared/theme'

export default observer(function DisplayScreen() {
  const theme = useTheme()
  const { t } = useTranslation()
  const { setFontSize, setFontFamily, setLineHeight, setCompactMode, setAnimationScale } = useDisplayActions()
  const displaySettings = useDisplaySettings()
  const styles = createStyles(theme)

  const fontSizeOptions = [
    { label: t('sizes.small'), value: 'xs' },
    { label: t('sizes.medium'), value: 'md' },
    { label: t('sizes.large'), value: 'lg' },
    { label: t('sizes.extra_large'), value: 'xl' }
  ]

  const fontFamilyOptions = [
    { label: 'System Default', value: 'system' },
    { label: 'SF Pro', value: 'SF Pro' },
    { label: 'Helvetica Neue', value: 'Helvetica Neue' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Times New Roman', value: 'Times New Roman' }
  ]

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title={t('settings.display.typography')}
        >
          <PreferenceSelector
            title={t('settings.display.font_size')}
            value={displaySettings.fontSize}
            options={fontSizeOptions}
            onValueChange={(value) => setFontSize(value as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')}
          />

          <PreferenceSelector
            title={t('settings.display.font_family')}
            value={displaySettings.fontFamily || 'system'}
            options={fontFamilyOptions}
            onValueChange={setFontFamily}
          />

          <PreferenceSlider
            title={t('settings.display.line_height')}
            value={displaySettings.lineHeight}
            minimumValue={1.0}
            maximumValue={2.0}
            step={0.1}
            onValueChange={setLineHeight}
            formatValue={(val) => `${val.toFixed(1)}x`}
          />
        </SettingsSection>

        <SettingsSection
          title={t('settings.display.layout')}
        >
          <PreferenceToggle
            title={t('settings.display.compact_mode')}
            description="Reduce spacing and padding for denser layouts"
            value={displaySettings.compactMode}
            onValueChange={setCompactMode}
          />

          <PreferenceSlider
            title={t('settings.display.animation_scale')}
            description="Adjust animation speed throughout the app"
            value={displaySettings.animationScale}
            minimumValue={0.0}
            maximumValue={2.0}
            step={0.1}
            onValueChange={setAnimationScale}
            formatValue={(val) => {
              if (val === 0) return 'Off'
              if (val < 1) return `${Math.round(val * 100)}% (Slower)`
              if (val > 1) return `${Math.round(val * 100)}% (Faster)`
              return 'Normal'
            }}
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