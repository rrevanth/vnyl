import { InputProps } from '@/src/presentation/shared/ui/atoms/input'

export interface FormFieldProps extends Omit<InputProps, 'accessibilityLabel'> {
  /**
   * Field label text
   */
  label: string

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean

  /**
   * Custom label style overrides
   */
  labelStyle?: object

  /**
   * Whether to show the label
   * @default true
   */
  showLabel?: boolean

  /**
   * Custom spacing between label and input
   */
  labelSpacing?: number

  /**
   * Layout direction for label and input
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal'

  /**
   * Custom container style for the entire form field
   */
  fieldContainerStyle?: object
}