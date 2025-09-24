import { PressableProps } from 'react-native'

export type SettingRowVariant = 'default' | 'switch' | 'button' | 'navigation'

export interface SettingRowProps extends Omit<PressableProps, 'style' | 'children'> {
  /**
   * Main label text for the setting
   */
  label: string

  /**
   * Optional description text below the label
   */
  description?: string

  /**
   * Variant determines the type of control on the right
   * @default 'default'
   */
  variant?: SettingRowVariant

  /**
   * Switch-specific props
   */
  switchProps?: {
    value: boolean
    onValueChange: (value: boolean) => void
    disabled?: boolean
  }

  /**
   * Button-specific props
   */
  buttonProps?: {
    title: string
    onPress: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
  }

  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode

  /**
   * Custom content to display on the right (overrides variant behavior)
   */
  rightContent?: React.ReactNode

  /**
   * Whether to show chevron for navigation rows
   * @default true (when variant is 'navigation')
   */
  showChevron?: boolean

  /**
   * Whether the row is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Custom container style overrides
   */
  containerStyle?: object

  /**
   * Custom content style overrides
   */
  contentStyle?: object

  /**
   * Accessibility label for the entire row
   */
  accessibilityLabel?: string

  /**
   * Accessibility hint for the row action
   */
  accessibilityHint?: string
}