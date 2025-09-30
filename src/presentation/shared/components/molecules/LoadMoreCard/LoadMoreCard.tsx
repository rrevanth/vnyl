/**
 * LoadMoreCard
 *
 * Molecular component for load more functionality in catalog rows.
 * Displays a card that triggers loading more content.
 *
 * Used in detail screens for paginated content loading.
 */

import React from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale, scale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface LoadMoreCardProps {
  /**
   * Handler for load more action
   */
  onLoadMore: () => void

  /**
   * Whether loading is in progress
   */
  loading?: boolean

  /**
   * Whether there are more items to load
   */
  hasMore?: boolean

  /**
   * Size variant to match surrounding content
   * - sm: Small card for compact layouts
   * - md: Medium card (default)
   * - lg: Large card for emphasis
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Custom loading text
   */
  loadingText?: string

  /**
   * Custom load more text
   */
  loadMoreText?: string

  /**
   * Custom no more text
   */
  noMoreText?: string

  /**
   * Test ID for testing
   */
  testID?: string
}

const LoadMoreCardImpl: React.FC<LoadMoreCardProps> = ({
  onLoadMore,
  loading = false,
  hasMore = true,
  size = 'md',
  loadingText,
  loadMoreText,
  noMoreText,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme, size, loading, hasMore)

  const handlePress = () => {
    if (!loading && hasMore) {
      onLoadMore()
    }
  }

  const getText = () => {
    if (loading) {
      return loadingText || t('common.loading')
    }
    if (!hasMore) {
      return noMoreText || t('common.no_more')
    }
    return loadMoreText || t('common.load_more')
  }

  const getIcon = () => {
    if (loading) {
      return null // Will show ActivityIndicator instead
    }
    if (!hasMore) {
      return 'checkmark-circle-outline'
    }
    return 'add-circle-outline'
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={handlePress}
      disabled={loading || !hasMore}
      accessibilityRole="button"
      accessibilityLabel={getText()}
      accessibilityState={{
        disabled: loading || !hasMore,
        busy: loading
      }}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.interactive.primary}
            style={styles.icon}
          />
        ) : (
          <Ionicons
            name={getIcon() as keyof typeof Ionicons.glyphMap}
            size={getIconSize(size)}
            color={styles.text.color}
            style={styles.icon}
          />
        )}
        <Text style={styles.text} numberOfLines={2}>
          {getText()}
        </Text>
      </View>
    </Pressable>
  )
}

export const LoadMoreCard = React.memo(observer(LoadMoreCardImpl))

const getIconSize = (size: LoadMoreCardProps['size']): number => {
  switch (size) {
    case 'sm':
      return moderateScale(16)
    case 'lg':
      return moderateScale(24)
    default:
      return moderateScale(20)
  }
}

const createStyles = (
  theme: Theme,
  size: LoadMoreCardProps['size'],
  loading: boolean,
  hasMore: boolean
) => {
  // Size-based dimensions
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          width: scale(80),
          height: scale(120),
          padding: theme.spacing.xs,
          fontSize: moderateScale(11),
          lineHeight: moderateScale(14),
        }
      case 'lg':
        return {
          width: scale(120),
          height: scale(180),
          padding: theme.spacing.sm,
          fontSize: moderateScale(14),
          lineHeight: moderateScale(18),
        }
      default: // md
        return {
          width: scale(100),
          height: scale(150),
          padding: theme.spacing.sm,
          fontSize: moderateScale(12),
          lineHeight: moderateScale(16),
        }
    }
  }

  const dimensions = getDimensions()

  // State-based colors
  const getColors = () => {
    if (!hasMore) {
      return {
        backgroundColor: theme.colors.background.tertiary,
        textColor: theme.colors.text.secondary,
        borderColor: theme.colors.border.secondary,
      }
    }
    if (loading) {
      return {
        backgroundColor: theme.colors.background.secondary,
        textColor: theme.colors.text.secondary,
        borderColor: theme.colors.interactive.primary,
      }
    }
    return {
      backgroundColor: theme.colors.background.secondary,
      textColor: theme.colors.interactive.primary,
      borderColor: theme.colors.interactive.primary,
    }
  }

  const colors = getColors()

  return StyleSheet.create({
    container: {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: colors.backgroundColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderStyle: hasMore ? 'dashed' : 'solid',
      borderRadius: theme.radius.md,
      padding: dimensions.padding,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      marginBottom: theme.spacing.xs,
    },
    text: {
      fontSize: dimensions.fontSize,
      lineHeight: dimensions.lineHeight,
      fontWeight: '500',
      color: colors.textColor,
      textAlign: 'center',
    },
  })
}