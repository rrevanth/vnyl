import { PressableProps } from 'react-native'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /**
   * Button text content
   */
  title: string

  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Size variant of the button
   * @default 'md'
   */
  size?: ButtonSize

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean

  /**
   * Loading state - shows activity indicator
   * @default false
   */
  loading?: boolean

  /**
   * Optional icon to display before text
   */
  leftIcon?: React.ReactNode

  /**
   * Optional icon to display after text
   */
  rightIcon?: React.ReactNode

  /**
   * Custom style overrides
   */
  style?: object

  /**
   * Custom text style overrides
   */
  textStyle?: object
}