import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface PreferenceToggleProps {
  title: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export const PreferenceToggle: React.FC<PreferenceToggleProps> = observer(({
  title,
  description,
  value,
  onValueChange,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, !!description)

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.border.primary,
          true: theme.colors.interactive.primary
        }}
        thumbColor={value ? theme.colors.background.primary : theme.colors.background.secondary}
        ios_backgroundColor={theme.colors.border.primary}
        accessibilityLabel={`${title} toggle`}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  )
})

const createStyles = (theme: Theme, hasDescription: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs
  },
  disabled: {
    opacity: 0.6
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: hasDescription ? theme.spacing.xs / 2 : 0
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  }
})