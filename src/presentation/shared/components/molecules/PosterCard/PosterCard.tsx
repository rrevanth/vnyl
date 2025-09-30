/**
 * PosterCard
 *
 * Molecular component for displaying media posters and person profile images.
 * Handles different aspect ratios, placeholder states, and loading states.
 *
 * Used throughout detail screens for consistent image display.
 */

import React from 'react'
import { View, Image, StyleSheet, Pressable } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { moderateScale, scale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface PosterCardProps {
  /**
   * Image URL to display
   */
  imageUrl?: string

  /**
   * Aspect ratio of the image
   * - poster: Standard movie/TV poster (2:3)
   * - profile: Square profile image (1:1)
   * - backdrop: Wide backdrop image (16:9)
   * - square: Square image (1:1)
   */
  aspectRatio?: 'poster' | 'profile' | 'backdrop' | 'square'

  /**
   * Size variant
   * - xs: Extra small (for lists)
   * - sm: Small (for grids)
   * - md: Medium (default)
   * - lg: Large (for hero sections)
   * - xl: Extra large (for detail screens)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Whether the image is loading
   */
  loading?: boolean

  /**
   * Press handler for the image
   */
  onPress?: () => void

  /**
   * Accessibility label
   */
  accessibilityLabel?: string

  /**
   * Test ID for testing
   */
  testID?: string
}

const PosterCardImpl: React.FC<PosterCardProps> = ({
  imageUrl,
  aspectRatio = 'poster',
  size = 'md',
  loading = false,
  onPress,
  accessibilityLabel,
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, aspectRatio, size)

  const showPlaceholder = !imageUrl || loading

  const content = (
    <View style={styles.container} testID={testID}>
      {showPlaceholder ? (
        <View style={styles.placeholder}>
          <Ionicons
            name={getPlaceholderIcon(aspectRatio)}
            size={getPlaceholderIconSize(size)}
            color={theme.colors.text.tertiary}
          />
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Ionicons
            name="hourglass-outline"
            size={getPlaceholderIconSize(size)}
            color={theme.colors.text.onColor}
          />
        </View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </Pressable>
    )
  }

  return content
}

export const PosterCard = React.memo(observer(PosterCardImpl))

const getPlaceholderIcon = (aspectRatio: PosterCardProps['aspectRatio']): keyof typeof Ionicons.glyphMap => {
  switch (aspectRatio) {
    case 'profile':
      return 'person-outline'
    case 'backdrop':
      return 'image-outline'
    default:
      return 'film-outline'
  }
}

const getPlaceholderIconSize = (size: PosterCardProps['size']): number => {
  switch (size) {
    case 'xs':
      return moderateScale(16)
    case 'sm':
      return moderateScale(20)
    case 'md':
      return moderateScale(24)
    case 'lg':
      return moderateScale(32)
    case 'xl':
      return moderateScale(40)
    default:
      return moderateScale(24)
  }
}

const createStyles = (
  theme: Theme,
  aspectRatio: PosterCardProps['aspectRatio'],
  size: PosterCardProps['size']
) => {
  // Size-based dimensions
  const getDimensions = () => {
    const baseDimensions = {
      xs: { width: scale(60), baseHeight: scale(90) },
      sm: { width: scale(80), baseHeight: scale(120) },
      md: { width: scale(100), baseHeight: scale(150) },
      lg: { width: scale(120), baseHeight: scale(180) },
      xl: { width: scale(150), baseHeight: scale(225) },
    }

    const base = baseDimensions[size!]

    // Adjust height based on aspect ratio
    let height: number
    switch (aspectRatio) {
      case 'profile':
      case 'square':
        height = base.width // 1:1 ratio
        break
      case 'backdrop':
        height = base.width * (9/16) // 16:9 ratio
        break
      default: // poster
        height = base.baseHeight // 2:3 ratio
    }

    return { width: base.width, height }
  }

  const dimensions = getDimensions()

  return StyleSheet.create({
    pressable: {
      alignSelf: 'flex-start',
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    container: {
      width: dimensions.width,
      height: dimensions.height,
      borderRadius: aspectRatio === 'profile' ? theme.radius.full : theme.radius.md,
      backgroundColor: theme.colors.background.tertiary,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.tertiary,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
}