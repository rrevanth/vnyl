import { ViewProps } from 'react-native'

export interface PreferenceFormField {
  /**
   * Unique identifier for the field
   */
  id: string

  /**
   * Field type
   */
  type: 'text' | 'email' | 'password' | 'number' | 'switch' | 'select'

  /**
   * Field label
   */
  label: string

  /**
   * Current field value
   */
  value: any

  /**
   * Placeholder text for input fields
   */
  placeholder?: string

  /**
   * Whether the field is required
   */
  required?: boolean

  /**
   * Whether the field is disabled
   */
  disabled?: boolean

  /**
   * Validation error message
   */
  error?: string

  /**
   * Success message
   */
  successMessage?: string

  /**
   * Helper text
   */
  helperText?: string

  /**
   * Options for select fields
   */
  options?: {
    label: string
    value: any
  }[]

  /**
   * Custom validation function
   */
  validate?: (value: any) => string | undefined
}

export interface PreferenceFormProps extends Omit<ViewProps, 'style'> {
  /**
   * Form title
   */
  title?: string

  /**
   * Form description
   */
  description?: string

  /**
   * Form fields configuration
   */
  fields: PreferenceFormField[]

  /**
   * Form values object
   */
  values: Record<string, any>

  /**
   * Validation errors object
   */
  errors?: Record<string, string>

  /**
   * Field value change handler
   */
  onFieldChange: (fieldId: string, value: any) => void

  /**
   * Form submission handler
   */
  onSubmit?: () => void

  /**
   * Form reset handler
   */
  onReset?: () => void

  /**
   * Whether the form is in loading state
   * @default false
   */
  loading?: boolean

  /**
   * Whether to show submit button
   * @default true
   */
  showSubmitButton?: boolean

  /**
   * Whether to show reset button
   * @default false
   */
  showResetButton?: boolean

  /**
   * Custom submit button title
   * @default 'Save'
   */
  submitButtonTitle?: string

  /**
   * Custom reset button title
   * @default 'Reset'
   */
  resetButtonTitle?: string

  /**
   * Whether to validate on field change
   * @default true
   */
  validateOnChange?: boolean

  /**
   * Custom container style overrides
   */
  containerStyle?: object

  /**
   * Custom form style overrides
   */
  formStyle?: object

  /**
   * Custom button container style overrides
   */
  buttonContainerStyle?: object

  /**
   * Spacing between form fields
   */
  fieldSpacing?: number

  /**
   * Whether to show form header
   * @default true (when title is provided)
   */
  showHeader?: boolean
}