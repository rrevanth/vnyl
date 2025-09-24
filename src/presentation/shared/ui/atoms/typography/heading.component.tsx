import React from 'react'
import { Text as RNText, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { HeadingProps, HeadingVariant, TextColor, TextAlign } from './typography.types'

export const Heading: React.FC<HeadingProps> = observer(({
  variant = 'h1',
  color = 'primary',
  align = 'left',
  letterSpacing,
  numberOfLines,
  style,
  children,
  ...textProps
}) => {
  const { theme } = useTheme()
  const styles = createHeadingStyles(theme, variant, color, align, letterSpacing)

  return (
    <RNText
      {...textProps}
      style={[styles.heading, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  )
})

Heading.displayName = 'Heading'

const getTextColor = (theme: any, color: TextColor) => {
  switch (color) {
    case 'primary':
      return theme.colors.text.primary
    case 'secondary':
      return theme.colors.text.secondary
    case 'inverse':
      return theme.colors.text.inverse
    case 'error':
      return theme.colors.input.error
    case 'success':
      return theme.colors.interactive.success
    default:
      return theme.colors.text.primary
  }
}

const getHeadingStyle = (theme: any, variant: HeadingVariant) => {
  switch (variant) {
    case 'h1':
      return theme.typography.heading1
    case 'h2':
      return theme.typography.heading2
    case 'h3':
      return theme.typography.heading3
    default:
      return theme.typography.heading1
  }
}

const createHeadingStyles = (
  theme: any,
  variant: HeadingVariant,
  color: TextColor,
  align: TextAlign,
  letterSpacing?: number
) => StyleSheet.create({
  heading: {
    ...getHeadingStyle(theme, variant),
    color: getTextColor(theme, color),
    textAlign: align,
    ...(letterSpacing && { letterSpacing })
  }
})