import React from 'react'
import { Text as RNText, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { TextComponentProps, TextVariant, TextColor, TextAlign } from './typography.types'

export const Text: React.FC<TextComponentProps> = observer(({
  variant = 'body',
  color = 'primary',
  align = 'left',
  numberOfLines,
  style,
  children,
  ...textProps
}) => {
  const { theme } = useTheme()
  const styles = createTextStyles(theme, variant, color, align)

  return (
    <RNText
      {...textProps}
      style={[styles.text, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  )
})

Text.displayName = 'Text'

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

const getTypographyStyle = (theme: any, variant: TextVariant) => {
  switch (variant) {
    case 'body':
      return theme.typography.body
    case 'bodyBold':
      return theme.typography.bodyBold
    case 'caption':
      return theme.typography.caption
    case 'small':
      return theme.typography.small
    default:
      return theme.typography.body
  }
}

const createTextStyles = (
  theme: any,
  variant: TextVariant,
  color: TextColor,
  align: TextAlign
) => StyleSheet.create({
  text: {
    ...getTypographyStyle(theme, variant),
    color: getTextColor(theme, color),
    textAlign: align
  }
})