import React from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface PreferenceSelectorOption {
  label: string
  value: string
}

interface PreferenceSelectorProps {
  title: string
  description?: string
  value: string
  options: PreferenceSelectorOption[]
  onValueChange: (value: string) => void
  disabled?: boolean
}

export const PreferenceSelector: React.FC<PreferenceSelectorProps> = observer(({
  title,
  description,
  value,
  options,
  onValueChange,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption?.label ?? value

  const handlePress = () => {
    if (disabled) return

    const alertActions = options.map(option => ({
      text: option.label,
      onPress: () => onValueChange(option.value),
      style: option.value === value ? 'destructive' as const : 'default' as const
    }))

    alertActions.push({
      text: 'Cancel',
      style: 'cancel' as any,
      onPress: () => {}
    })

    Alert.alert(title, description, alertActions as any)
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title} - ${displayValue}`}
      accessibilityHint="Tap to change selection"
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{displayValue}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
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
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
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
    marginBottom: theme.spacing.xs / 2
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  value: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs
  },
  chevron: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    fontWeight: '300'
  }
})