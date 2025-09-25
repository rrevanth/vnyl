import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface ColorOption {
  color: string
  name: string
}

interface ColorPickerProps {
  selectedColor?: string
  colors: ColorOption[]
  onColorSelect: (color: string) => void
  disabled?: boolean
}

export const ColorPicker: React.FC<ColorPickerProps> = observer(({
  selectedColor,
  colors,
  onColorSelect,
  disabled = false
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      {colors.map((colorOption, index) => {
        const isSelected = colorOption.color === selectedColor

        return (
          <Pressable
            key={`${colorOption.name}-${index}`}
            style={({ pressed }) => [
              styles.colorButton,
              isSelected && styles.colorButtonSelected,
              pressed && styles.colorButtonPressed,
              disabled && styles.colorButtonDisabled
            ]}
            onPress={() => !disabled && onColorSelect(colorOption.color)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={`${colorOption.name} color`}
          >
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: colorOption.color },
                isSelected && styles.colorSwatchSelected
              ]}
            />
            {isSelected && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>
        )
      })}
    </View>
  )
})

interface ColorPickerStyles {
  container: ViewStyle
  colorButton: ViewStyle
  colorButtonSelected: ViewStyle
  colorButtonPressed: ViewStyle
  colorButtonDisabled: ViewStyle
  colorSwatch: ViewStyle
  colorSwatchSelected: ViewStyle
  checkmark: ViewStyle
  checkmarkText: TextStyle
}

const createStyles = (theme: Theme): ColorPickerStyles => ({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  colorButtonSelected: {
    borderColor: theme.colors.border.focus,
    ...theme.shadows.sm
  },
  colorButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }]
  },
  colorButtonDisabled: {
    opacity: 0.5
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.secondary
  },
  colorSwatchSelected: {
    borderColor: theme.colors.text.inverse
  },
  checkmark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.status.success,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkmarkText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    lineHeight: 12
  }
})