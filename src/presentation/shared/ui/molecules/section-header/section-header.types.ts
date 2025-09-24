export interface SectionHeaderProps {
  /**
   * Section title text
   */
  title: string

  /**
   * Optional subtitle or description text
   */
  subtitle?: string

  /**
   * Optional action button on the right
   */
  action?: {
    title: string
    onPress: () => void
  }

  /**
   * Custom title style overrides
   */
  titleStyle?: object

  /**
   * Custom subtitle style overrides
   */
  subtitleStyle?: object

  /**
   * Custom container style overrides
   */
  containerStyle?: object

  /**
   * Whether to add bottom margin
   * @default true
   */
  bottomMargin?: boolean

  /**
   * Custom spacing between title and subtitle
   */
  titleSubtitleSpacing?: number

  /**
   * Accessibility label for the section
   */
  accessibilityLabel?: string
}