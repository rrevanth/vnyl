import React from 'react'
import { Switch as RNSwitch, Platform, View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { SwitchProps } from './switch.types'

export const Switch: React.FC<SwitchProps> = observer(({
  value = false,
  onValueChange,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  trackColorOverride,
  thumbColorOverride,
  ...switchProps
}) => {
  const { theme } = useTheme()
  const styles = createSwitchStyles(theme, size)

  const trackColor = React.useMemo(() => {
    if (trackColorOverride) return trackColorOverride

    return {
      false: disabled ? theme.colors.interactive.disabled : theme.colors.switch.trackFalse,
      true: disabled ? theme.colors.interactive.disabled : theme.colors.switch.trackTrue
    }
  }, [theme, disabled, trackColorOverride])

  const thumbColor = React.useMemo(() => {
    if (thumbColorOverride) return thumbColorOverride

    if (disabled) {
      return theme.colors.text.secondary
    }

    return value ? theme.colors.switch.thumbActive : theme.colors.switch.thumbInactive
  }, [theme, value, disabled, thumbColorOverride])

  const handleValueChange = (newValue: boolean) => {
    if (disabled) return
    onValueChange?.(newValue)
  }

  return (
    <View style={styles.container}>
      <RNSwitch
        {...switchProps}
        value={value}
        onValueChange={handleValueChange}
        trackColor={trackColor}
        thumbColor={thumbColor}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="switch"
        accessibilityState={{
          checked: value,
          disabled
        }}
        style={styles.switch}
      />
    </View>
  )
})

Switch.displayName = 'Switch'

const createSwitchStyles = (theme: any, size: 'sm' | 'md' | 'lg') => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  switch: {
    transform: Platform.select({
      ios: [
        {
          scaleX: size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1
        },
        {
          scaleY: size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : 1
        }
      ],
      android: [
        {
          scaleX: size === 'sm' ? 0.9 : size === 'lg' ? 1.1 : 1
        },
        {
          scaleY: size === 'sm' ? 0.9 : size === 'lg' ? 1.1 : 1
        }
      ]
    })
  }
})