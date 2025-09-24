import React from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { SettingsSection } from '@/src/presentation/shared/ui/organisms/settings-section'
import type { PreferenceSectionProps } from '../model/settings.types'

export const PreferenceSection: React.FC<PreferenceSectionProps> = observer(({
  title,
  description,
  icon,
  children,
  headerAction,
  showDivider = false,
  containerStyle,
  ...sectionProps
}) => {
  const { theme } = useTheme()
  const styles = createPreferenceSectionStyles(theme)

  return (
    <SettingsSection
      {...sectionProps}
      title={title}
      description={description}
      headerAction={headerAction}
      showBottomDivider={showDivider}
      containerStyle={[styles.container, containerStyle]}
      accessibilityLabel={`${title} preferences section`}
    >
      <View style={styles.content}>
        {children}
      </View>
    </SettingsSection>
  )
})

PreferenceSection.displayName = 'PreferenceSection'

const createPreferenceSectionStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  content: {
    gap: theme.spacing.xs
  }
})