import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface PreferenceSliderProps {
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

export const PreferenceSlider: React.FC<PreferenceSliderProps> = observer(({
  title,
  description,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  formatValue = (value: number) => value.toString(),
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  // For now, we'll create a simple increment/decrement interface
  // In a real implementation, you might want to use a proper Slider component
  const handleDecrement = () => {
    if (disabled || value <= minimumValue) return
    const newValue = Math.max(minimumValue, value - step)
    onValueChange(newValue)
  }

  const handleIncrement = () => {
    if (disabled || value >= maximumValue) return
    const newValue = Math.min(maximumValue, value + step)
    onValueChange(newValue)
  }

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.headerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
        <Text style={styles.value}>{formatValue(value)}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text
          style={[
            styles.button,
            (disabled || value <= minimumValue) && styles.buttonDisabled
          ]}
          onPress={handleDecrement}
        >
          -
        </Text>

        <View style={styles.trackContainer}>
          <View style={styles.track}>
            <View
              style={[
                styles.progress,
                {
                  width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`
                }
              ]}
            />
            <View
              style={[
                styles.thumb,
                {
                  left: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`
                }
              ]}
            />
          </View>
        </View>

        <Text
          style={[
            styles.button,
            (disabled || value >= maximumValue) && styles.buttonDisabled
          ]}
          onPress={handleIncrement}
        >
          +
        </Text>
      </View>
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs
  },
  disabled: {
    opacity: 0.6
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
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
  value: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.interactive.primary
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  button: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.interactive.primary,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: theme.radius.sm
  },
  buttonDisabled: {
    backgroundColor: theme.colors.interactive.disabled,
    color: theme.colors.text.secondary
  },
  trackContainer: {
    flex: 1,
    height: 32,
    justifyContent: 'center'
  },
  track: {
    height: 4,
    backgroundColor: theme.colors.border.primary,
    borderRadius: 2,
    position: 'relative'
  },
  progress: {
    height: 4,
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: 2
  },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: 8,
    marginLeft: -8
  }
})