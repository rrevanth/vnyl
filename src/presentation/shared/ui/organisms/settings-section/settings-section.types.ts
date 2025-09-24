import { ViewProps } from 'react-native'

export interface SettingsSectionProps extends Omit<ViewProps, 'style'> {
  /**
   * Section title
   */
  title: string

  /**
   * Optional section description
   */
  description?: string

  /**
   * Section content - typically SettingRow components
   */
  children: React.ReactNode

  /**
   * Optional action button in header
   */
  headerAction?: {
    title: string
    onPress: () => void
  }

  /**
   * Whether to show the header
   * @default true
   */
  showHeader?: boolean

  /**
   * Custom header style overrides
   */
  headerStyle?: object

  /**
   * Custom content container style overrides
   */
  contentStyle?: object

  /**
   * Custom container style overrides
   */
  containerStyle?: object

  /**
   * Whether to add bottom margin after the section
   * @default true
   */
  bottomMargin?: boolean

  /**
   * Spacing between header and content
   */
  headerContentSpacing?: number

  /**
   * Whether to add a divider line above the section
   * @default false
   */
  showTopDivider?: boolean

  /**
   * Whether to add a divider line below the section
   * @default false
   */
  showBottomDivider?: boolean

  /**
   * Accessibility label for the section
   */
  accessibilityLabel?: string
}