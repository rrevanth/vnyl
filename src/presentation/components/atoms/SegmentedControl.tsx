import React from 'react'
import { View, Text, Pressable } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[]
  selectedValue: T
  onValueChange: (value: T) => void
  disabled?: boolean
}

export const SegmentedControl = observer(<T extends string>({
  options,
  selectedValue,
  onValueChange,
  disabled = false
}: SegmentedControlProps<T>) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.segment,
              isFirst && styles.segmentFirst,
              isLast && styles.segmentLast,
              isSelected && styles.segmentSelected,
              pressed && styles.segmentPressed,
              disabled && styles.segmentDisabled
            ]}
            onPress={() => !disabled && onValueChange(option.value)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={option.label}
          >
            <Text style={[
              styles.segmentText,
              isSelected && styles.segmentTextSelected,
              disabled && styles.segmentTextDisabled
            ]}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}) as <T extends string>(props: SegmentedControlProps<T>) => React.ReactElement

interface SegmentedControlStyles {
  container: ViewStyle
  segment: ViewStyle
  segmentFirst: ViewStyle
  segmentLast: ViewStyle
  segmentSelected: ViewStyle
  segmentPressed: ViewStyle
  segmentDisabled: ViewStyle
  segmentText: TextStyle
  segmentTextSelected: TextStyle
  segmentTextDisabled: TextStyle
}

const createStyles = (theme: Theme): SegmentedControlStyles => ({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm
  },
  segmentFirst: {
    marginRight: theme.spacing.xs / 2
  },
  segmentLast: {
    marginLeft: theme.spacing.xs / 2
  },
  segmentSelected: {
    backgroundColor: theme.colors.interactive.primary,
    ...theme.shadows.sm
  },
  segmentPressed: {
    opacity: 0.8
  },
  segmentDisabled: {
    opacity: 0.5
  },
  segmentText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.primary
  },
  segmentTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: '600' as TextStyle['fontWeight']
  },
  segmentTextDisabled: {
    color: theme.colors.text.disabled
  }
})