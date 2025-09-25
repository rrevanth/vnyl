import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface SettingsCardProps {
  title: string
  description: string
  iconName: string
  onPress: () => void
  disabled?: boolean
}

export const SettingsCard: React.FC<SettingsCardProps> = observer(({
  title,
  description,
  iconName,
  onPress,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title} - ${description}`}
      accessibilityHint="Tap to open settings section"
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </Pressable>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.6
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  iconContainer: {
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.text.secondary,
    fontWeight: '300'
  }
})