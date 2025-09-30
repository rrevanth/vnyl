/**
 * SectionHeader
 *
 * Molecular component for consistent section titles in detail screens.
 * Supports optional "See All" action and loading states.
 *
 * Used throughout detail screens for content section headers.
 */

import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface SectionHeaderProps {
  /**
   * Section title
   */
  title: string

  /**
   * Optional subtitle
   */
  subtitle?: string

  /**
   * Whether to show "See All" action
   */
  showSeeAll?: boolean

  /**
   * Handler for "See All" action
   */
  onSeeAll?: () => void

  /**
   * Custom "See All" text
   */
  seeAllText?: string

  /**
   * Whether section is loading
   */
  loading?: boolean

  /**
   * Item count to display (optional)
   */
  count?: number

  /**
   * Size variant
   * - sm: Small header for subsections
   * - md: Medium header (default)
   * - lg: Large header for main sections
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Test ID for testing
   */
  testID?: string
}

const SectionHeaderImpl: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showSeeAll = false,
  onSeeAll,
  seeAllText,
  loading = false,
  count,
  size = 'md',
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme, size)

  const handleSeeAll = () => {
    if (onSeeAll && !loading) {
      onSeeAll()
    }
  }

  const getTitle = () => {
    if (count !== undefined && count > 0) {
      return `${title} (${count})`
    }
    return title
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {getTitle()}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {showSeeAll && onSeeAll && (
        <Pressable
          style={({ pressed }) => [
            styles.seeAllButton,
            pressed && styles.seeAllPressed
          ]}
          onPress={handleSeeAll}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={seeAllText || t('common.see_all')}
          accessibilityState={{ disabled: loading }}
        >
          <Text style={styles.seeAllText}>
            {seeAllText || t('common.see_all')}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={moderateScale(16)}
            color={styles.seeAllText.color}
            style={styles.seeAllIcon}
          />
        </Pressable>
      )}
    </View>
  )
}

export const SectionHeader = React.memo(observer(SectionHeaderImpl))

const createStyles = (
  theme: Theme,
  size: SectionHeaderProps['size']
) => {
  // Size-based typography
  const getTypography = () => {
    switch (size) {
      case 'sm':
        return {
          title: {
            fontSize: theme.typography.heading3.fontSize,
            lineHeight: theme.typography.heading3.lineHeight,
            fontWeight: theme.typography.heading3.fontWeight,
          },
          subtitle: {
            fontSize: moderateScale(12),
            lineHeight: moderateScale(16),
            fontWeight: '400',
          },
          seeAll: {
            fontSize: moderateScale(12),
            lineHeight: moderateScale(16),
            fontWeight: '500',
          },
        }
      case 'lg':
        return {
          title: {
            fontSize: theme.typography.heading1.fontSize,
            lineHeight: theme.typography.heading1.lineHeight,
            fontWeight: theme.typography.heading1.fontWeight,
          },
          subtitle: {
            fontSize: theme.typography.body.fontSize,
            lineHeight: theme.typography.body.lineHeight,
            fontWeight: '400',
          },
          seeAll: {
            fontSize: theme.typography.body.fontSize,
            lineHeight: theme.typography.body.lineHeight,
            fontWeight: '500',
          },
        }
      default: // md
        return {
          title: {
            fontSize: theme.typography.heading2.fontSize,
            lineHeight: theme.typography.heading2.lineHeight,
            fontWeight: theme.typography.heading2.fontWeight,
          },
          subtitle: {
            fontSize: moderateScale(14),
            lineHeight: moderateScale(18),
            fontWeight: '400',
          },
          seeAll: {
            fontSize: moderateScale(14),
            lineHeight: moderateScale(18),
            fontWeight: '500',
          },
        }
    }
  }

  const typography = getTypography()

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    titleContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    title: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs / 2,
    },
    subtitle: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight as any,
      color: theme.colors.text.secondary,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      borderRadius: theme.radius.sm,
    },
    seeAllPressed: {
      opacity: 0.7,
      backgroundColor: theme.colors.background.tertiary,
    },
    seeAllText: {
      fontSize: typography.seeAll.fontSize,
      lineHeight: typography.seeAll.lineHeight,
      fontWeight: typography.seeAll.fontWeight as any,
      color: theme.colors.interactive.primary,
    },
    seeAllIcon: {
      marginLeft: theme.spacing.xs / 2,
    },
  })
}