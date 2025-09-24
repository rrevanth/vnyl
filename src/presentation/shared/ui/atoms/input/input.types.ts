import { TextInputProps } from 'react-native'

export type InputVariant = 'default' | 'filled' | 'outlined'
export type InputSize = 'sm' | 'md' | 'lg'
export type InputState = 'default' | 'error' | 'success' | 'focused'

export interface InputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /**
   * Visual variant of the input
   * @default 'filled'
   */
  variant?: InputVariant

  /**
   * Size variant of the input
   * @default 'md'
   */
  size?: InputSize

  /**
   * Current validation state
   * @default 'default'
   */
  state?: InputState

  /**
   * Error message to display
   */
  error?: string

  /**
   * Success message to display
   */
  successMessage?: string

  /**
   * Helper text to display below input
   */
  helperText?: string

  /**
   * Whether the input should take full width
   * @default true
   */
  fullWidth?: boolean

  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode

  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode

  /**
   * Custom container style overrides
   */
  containerStyle?: object

  /**
   * Custom input style overrides
   */
  inputStyle?: object

  /**
   * Callback when input gains focus
   */
  onFocus?: () => void

  /**
   * Callback when input loses focus
   */
  onBlur?: () => void

  /**
   * Whether to show clear button when input has value
   * @default false
   */
  clearable?: boolean

  /**
   * Callback when clear button is pressed
   */
  onClear?: () => void
}