import React from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { SectionHeader } from '@/src/presentation/shared/ui/molecules/section-header'
import type { SettingsSectionProps } from './settings-section.types'

export const SettingsSection: React.FC<SettingsSectionProps> = observer(({
  title,
  description,
  children,
  headerAction,
  showHeader = true,
  headerStyle,
  contentStyle,
  containerStyle,
  bottomMargin = true,
  headerContentSpacing,
  showTopDivider = false,
  showBottomDivider = false,
  accessibilityLabel,
  ...viewProps
}) => {
  const { theme } = useTheme()
  const styles = createSettingsSectionStyles(
    theme,
    bottomMargin,
    headerContentSpacing,
    showTopDivider,
    showBottomDivider
  )

  return (
    <View
      {...viewProps}
      style={[styles.container, containerStyle]}
      accessibilityLabel={accessibilityLabel || `${title} section`}
    >
      {showTopDivider && <View style={styles.topDivider} />}

      {showHeader && (
        <SectionHeader
          title={title}
          subtitle={description}
          action={headerAction}
          containerStyle={[styles.header, headerStyle]}
          bottomMargin={false}
        />
      )}

      <View style={[styles.content, contentStyle]}>
        {children}
      </View>

      {showBottomDivider && <View style={styles.bottomDivider} />}
    </View>
  )
})

SettingsSection.displayName = 'SettingsSection'

const createSettingsSectionStyles = (
  theme: any,
  bottomMargin: boolean,
  headerContentSpacing?: number,
  showTopDivider?: boolean,
  showBottomDivider?: boolean
) => StyleSheet.create({
  container: {
    marginBottom: bottomMargin ? theme.spacing.xl : 0
  },
  topDivider: {
    height: 1,
    backgroundColor: theme.colors.border.secondary,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  header: {
    marginBottom: headerContentSpacing ?? theme.spacing.md
  },
  content: {
    // Content container - children will define their own spacing
  },
  bottomDivider: {
    height: 1,
    backgroundColor: theme.colors.border.secondary,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md
  }
})