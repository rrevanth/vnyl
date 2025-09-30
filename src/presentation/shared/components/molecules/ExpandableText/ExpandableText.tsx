/**
 * ExpandableText
 *
 * Molecular component for expandable text content (overviews, biographies).
 * Handles text truncation with expand/collapse functionality.
 *
 * Used in detail screens for long text content.
 */

import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface ExpandableTextProps {
  /**
   * Text content to display
   */
  text: string

  /**
   * Number of lines to show when collapsed
   */
  numberOfLines?: number

  /**
   * Whether the text is currently expanded
   */
  expanded?: boolean

  /**
   * Callback when expand/collapse state changes
   */
  onToggle?: (expanded: boolean) => void

  /**
   * Text style variant
   * - body: Standard body text
   * - caption: Smaller caption text
   * - overview: Specialized for movie/TV overviews
   */
  variant?: 'body' | 'caption' | 'overview'

  /**
   * Whether to show on dark background
   */
  onDark?: boolean

  /**
   * Custom expand/collapse labels
   */
  expandLabel?: string
  collapseLabel?: string

  /**
   * Test ID for testing
   */
  testID?: string
}

const ExpandableTextImpl: React.FC<ExpandableTextProps> = ({
  text,
  numberOfLines = 3,
  expanded: controlledExpanded,
  onToggle,
  variant = 'body',
  onDark = false,
  expandLabel,
  collapseLabel,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme, variant, onDark)

  // Internal state for uncontrolled usage
  const [internalExpanded, setInternalExpanded] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded

    if (onToggle) {
      onToggle(newExpanded)
    } else {
      setInternalExpanded(newExpanded)
    }
  }, [isExpanded, onToggle])

  // Check if text needs truncation
  const needsTruncation = text.length > 150 // Rough estimate

  if (!text.trim()) {
    return null
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text
        style={styles.text}
        numberOfLines={isExpanded ? undefined : numberOfLines}
      >
        {text}
      </Text>

      {needsTruncation && (
        <Pressable
          style={styles.toggleButton}
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={
            isExpanded
              ? collapseLabel || t('common.show_less')
              : expandLabel || t('common.show_more')
          }
        >
          <Text style={styles.toggleText}>
            {isExpanded
              ? collapseLabel || t('common.show_less')
              : expandLabel || t('common.show_more')
            }
          </Text>
        </Pressable>
      )}
    </View>
  )
}

export const ExpandableText = React.memo(observer(ExpandableTextImpl))

const createStyles = (
  theme: Theme,
  variant: ExpandableTextProps['variant'],
  onDark: boolean
) => {
  // Variant-based typography
  const getTypography = () => {
    switch (variant) {
      case 'caption':
        return theme.typography.caption
      case 'overview':
        return {
          fontSize: moderateScale(15),
          lineHeight: moderateScale(22),
          fontWeight: '400',
        }
      default: // body
        return theme.typography.body
    }
  }

  const typography = getTypography()

  const textColor = onDark
    ? theme.colors.text.onColor
    : theme.colors.text.primary

  const toggleColor = onDark
    ? theme.colors.interactive.primary
    : theme.colors.interactive.primary

  return StyleSheet.create({
    container: {
      alignSelf: 'stretch',
    },
    text: {
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      fontWeight: typography.fontWeight as any,
      color: textColor,
      ...(onDark && {
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }),
    },
    toggleButton: {
      marginTop: theme.spacing.xs,
      alignSelf: 'flex-start',
    },
    toggleText: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: toggleColor,
      ...(onDark && {
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }),
    },
  })
}