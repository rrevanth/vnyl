import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'
import type { TextStyle } from 'react-native'

export interface SettingRowProps {
  title: string
  description?: string
  onPress?: () => void
  renderRight?: () => React.ReactNode
  showChevron?: boolean
  disabled?: boolean
}

export const SettingRow: React.FC<SettingRowProps> = observer(({
  title,
  description,
  onPress,
  renderRight,
  showChevron = false,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, disabled)

  const Component = onPress && !disabled ? Pressable : View

  return (
    <Component
      style={({ pressed }) => [
        styles.container,
        onPress && !disabled && pressed && styles.pressed
      ]}
      onPress={disabled ? undefined : onPress}
      accessibilityRole={onPress && !disabled ? 'button' : undefined}
      accessibilityLabel={title}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title as TextStyle}>{title}</Text>
          {description && (
            <Text style={styles.description as TextStyle}>{description}</Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {renderRight && renderRight()}
          {showChevron && (
            <Text style={styles.chevron as TextStyle}>›</Text>
          )}
        </View>
      </View>
    </Component>
  )
})

const createStyles = (theme: Theme, disabled?: boolean) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
    opacity: disabled ? 0.5 : 1
  },
  pressed: {
    opacity: 0.7
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    minHeight: 56
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: 2
  } as TextStyle,
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary
  } as TextStyle,
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.text.tertiary,
    fontWeight: '300'
  } as TextStyle
})