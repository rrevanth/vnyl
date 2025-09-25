import React from 'react'
import { View, Text, Switch } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface SettingsToggleProps {
  title: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export const SettingsToggle: React.FC<SettingsToggleProps> = observer(({
  title,
  description,
  value,
  onValueChange,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.content}>
        <Text style={[styles.title, disabled && styles.titleDisabled]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.background.tertiary,
          true: theme.colors.interactive.primary
        }}
        thumbColor={theme.colors.background.primary}
        ios_backgroundColor={theme.colors.background.tertiary}
        accessibilityLabel={`Toggle ${title}`}
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  )
})

interface SettingsToggleStyles {
  container: ViewStyle
  containerDisabled: ViewStyle
  content: ViewStyle
  title: TextStyle
  titleDisabled: TextStyle
  description: TextStyle
  descriptionDisabled: TextStyle
}

const createStyles = (theme: Theme): SettingsToggleStyles => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md
  },
  containerDisabled: {
    opacity: 0.5
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  titleDisabled: {
    color: theme.colors.text.disabled
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  descriptionDisabled: {
    color: theme.colors.text.disabled
  }
})