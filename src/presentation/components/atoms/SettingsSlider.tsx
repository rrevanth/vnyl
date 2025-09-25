import React, { useCallback } from 'react'
import { View, Text, Pressable } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface SettingsSliderProps {
  title: string
  description?: string
  value: number
  minimumValue: number
  maximumValue: number
  step?: number
  onValueChange: (value: number) => void
  formatValue?: (value: number) => string
  disabled?: boolean
}

export const SettingsSlider: React.FC<SettingsSliderProps> = observer(({
  title,
  description,
  value,
  minimumValue,
  maximumValue,
  step = 0.1,
  onValueChange,
  formatValue = (val: number) => val.toFixed(1),
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const handleDecrease = useCallback(() => {
    const newValue = Math.max(minimumValue, value - step)
    onValueChange(newValue)
  }, [value, minimumValue, step, onValueChange])

  const handleIncrease = useCallback(() => {
    const newValue = Math.min(maximumValue, value + step)
    onValueChange(newValue)
  }, [value, maximumValue, step, onValueChange])

  const progress = (value - minimumValue) / (maximumValue - minimumValue)

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, disabled && styles.titleDisabled]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
              {description}
            </Text>
          )}
        </View>
        <Text style={[styles.valueText, disabled && styles.valueTextDisabled]}>
          {formatValue(value)}
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled
          ]}
          onPress={handleDecrease}
          disabled={disabled || value <= minimumValue}
          accessibilityRole="button"
          accessibilityLabel="Decrease value"
        >
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>−</Text>
        </Pressable>

        <View style={styles.trackContainer}>
          <View style={styles.track} />
          <View style={[styles.progress, { width: `${progress * 100}%` }]} />
          <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled
          ]}
          onPress={handleIncrease}
          disabled={disabled || value >= maximumValue}
          accessibilityRole="button"
          accessibilityLabel="Increase value"
        >
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>+</Text>
        </Pressable>
      </View>
    </View>
  )
})

interface SettingsSliderStyles {
  container: ViewStyle
  containerDisabled: ViewStyle
  header: ViewStyle
  titleContainer: ViewStyle
  title: TextStyle
  titleDisabled: TextStyle
  description: TextStyle
  descriptionDisabled: TextStyle
  valueText: TextStyle
  valueTextDisabled: TextStyle
  sliderContainer: ViewStyle
  button: ViewStyle
  buttonPressed: ViewStyle
  buttonDisabled: ViewStyle
  buttonText: TextStyle
  buttonTextDisabled: TextStyle
  trackContainer: ViewStyle
  track: ViewStyle
  progress: ViewStyle
  thumb: ViewStyle
}

const createStyles = (theme: Theme): SettingsSliderStyles => ({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md
  },
  containerDisabled: {
    opacity: 0.5
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  titleContainer: {
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
  },
  valueText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.interactive.primary,
    minWidth: 40,
    textAlign: 'right'
  },
  valueTextDisabled: {
    color: theme.colors.text.disabled
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: theme.colors.interactive.primary
  },
  buttonDisabled: {
    opacity: 0.3
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: theme.colors.text.primary
  },
  buttonTextDisabled: {
    color: theme.colors.text.disabled
  },
  trackContainer: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative'
  },
  track: {
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.xs
  },
  progress: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.xs
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.interactive.primary,
    marginLeft: -10,
    marginTop: -8,
    ...theme.shadows.sm
  }
})