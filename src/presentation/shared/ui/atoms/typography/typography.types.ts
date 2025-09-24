import { TextProps } from 'react-native'

export type TextVariant = 'body' | 'bodyBold' | 'caption' | 'small'
export type HeadingVariant = 'h1' | 'h2' | 'h3'
export type TextColor = 'primary' | 'secondary' | 'inverse' | 'error' | 'success'
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface BaseTextProps extends Omit<TextProps, 'style'> {
  /**
   * Text color variant
   * @default 'primary'
   */
  color?: TextColor

  /**
   * Text alignment
   * @default 'left'
   */
  align?: TextAlign

  /**
   * Number of lines to display
   */
  numberOfLines?: number

  /**
   * Custom style overrides
   */
  style?: object

  /**
   * Text content
   */
  children: React.ReactNode
}

export interface TextComponentProps extends BaseTextProps {
  /**
   * Typography variant
   * @default 'body'
   */
  variant?: TextVariant
}

export interface HeadingProps extends BaseTextProps {
  /**
   * Heading variant
   * @default 'h1'
   */
  variant?: HeadingVariant

  /**
   * Custom letter spacing
   */
  letterSpacing?: number
}