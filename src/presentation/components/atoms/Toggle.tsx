import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

export interface ToggleProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export const Toggle: React.FC<ToggleProps> = observer(({
  value,
  onValueChange,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, value, disabled)

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value)
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.track,
        pressed && !disabled && styles.pressed
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={styles.thumb} />
    </Pressable>
  )
})

const createStyles = (theme: Theme, value: boolean, disabled: boolean) => StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: value
      ? (disabled ? theme.colors.interactive.disabled : theme.colors.interactive.primary)
      : (disabled ? theme.colors.interactive.disabled : theme.colors.border.primary),
    justifyContent: 'center',
    paddingHorizontal: 2,
    ...theme.shadows.xs
  },
  pressed: {
    opacity: 0.8
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background.primary,
    alignSelf: value ? 'flex-end' : 'flex-start',
    ...theme.shadows.sm
  }
})