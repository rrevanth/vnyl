import { SwitchProps as RNSwitchProps } from 'react-native'

export interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor'> {
  /**
   * The value of the switch. If true the switch will be turned on.
   * @default false
   */
  value?: boolean

  /**
   * Invoked with the new value when the value changes.
   */
  onValueChange?: (value: boolean) => void

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Size variant of the switch
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Custom accessible label
   */
  accessibilityLabel?: string

  /**
   * Custom track colors override
   */
  trackColorOverride?: {
    false: string
    true: string
  }

  /**
   * Custom thumb color override
   */
  thumbColorOverride?: string
}