/**
 * SkeletonLoader Component
 *
 * Professional skeleton loading states for person detail screen:
 * - Shimmer animation effects
 * - Multiple layout variants
 * - Performance optimized with native animations
 * - Accessibility compliant loading states
 */

import React, { useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

const { width: screenWidth } = Dimensions.get('window')

interface SkeletonLoaderProps {
  /**
   * Layout variant
   */
  variant?: 'hero' | 'info' | 'filmography' | 'list-item' | 'grid'

  /**
   * Number of items to show (for list/grid variants)
   */
  itemCount?: number

  /**
   * Animation speed (ms)
   */
  animationSpeed?: number

  /**
   * Custom width override
   */
  width?: number

  /**
   * Custom height override
   */
  height?: number
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = observer(({
  variant = 'info',
  itemCount = 3,
  animationSpeed = 1500,
  width,
  height
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  // Shimmer animation
  const shimmerValue = useMemo(() => new Animated.Value(0), [])

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: animationSpeed,
          useNativeDriver: true
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: animationSpeed,
          useNativeDriver: true
        })
      ])
    )

    shimmerAnimation.start()

    return () => shimmerAnimation.stop()
  }, [animationSpeed, shimmerValue])

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  })

  const SkeletonBox: React.FC<{ style?: any }> = ({ style }) => (
    <View style={[styles.skeletonBase, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          { opacity: shimmerOpacity }
        ]}
      />
    </View>
  )

  switch (variant) {
    case 'hero':
      return (
        <View style={styles.heroContainer}>
          {/* Hero image skeleton */}
          <SkeletonBox style={styles.heroImage} />

          {/* Hero content skeleton */}
          <View style={styles.heroContent}>
            <SkeletonBox style={styles.heroTitle} />
            <View style={styles.heroMetadata}>
              <SkeletonBox style={styles.heroMetadataItem} />
              <SkeletonBox style={styles.heroMetadataItem} />
            </View>
          </View>
        </View>
      )

    case 'info':
      return (
        <View style={styles.infoContainer}>
          <SkeletonBox style={styles.infoTitle} />
          <SkeletonBox style={styles.infoLine} />
          <SkeletonBox style={styles.infoLineShort} />
          <View style={styles.infoSpacing} />
          <SkeletonBox style={styles.infoLine} />
          <SkeletonBox style={styles.infoLineMedium} />
        </View>
      )

    case 'filmography':
      return (
        <View style={styles.filmographyContainer}>
          <SkeletonBox style={styles.sectionTitle} />
          <View style={styles.filmographyGrid}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <View key={index} style={styles.filmographyItem}>
                <SkeletonBox style={styles.posterImage} />
                <SkeletonBox style={styles.itemTitle} />
                <SkeletonBox style={styles.itemSubtitle} />
              </View>
            ))}
          </View>
        </View>
      )

    case 'list-item':
      return (
        <View style={styles.listContainer}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <View key={index} style={styles.listItem}>
              <SkeletonBox style={styles.listAvatar} />
              <View style={styles.listContent}>
                <SkeletonBox style={styles.listTitle} />
                <SkeletonBox style={styles.listSubtitle} />
              </View>
            </View>
          ))}
        </View>
      )

    case 'grid':
      return (
        <View style={styles.gridContainer}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <View key={index} style={styles.gridItem}>
              <SkeletonBox style={[styles.gridImage, width && height && { width, height }]} />
              <SkeletonBox style={styles.gridTitle} />
            </View>
          ))}
        </View>
      )

    default:
      return <SkeletonBox style={styles.defaultSkeleton} />
  }
})

const createStyles = (theme: Theme) => StyleSheet.create({
  // Base skeleton styles
  skeletonBase: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.sm,
    overflow: 'hidden'
  },
  shimmer: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary
  },

  // Hero variant
  heroContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg
  },
  heroImage: {
    width: screenWidth - (theme.spacing.md * 2),
    height: moderateScale(200),
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg
  },
  heroContent: {
    alignItems: 'center'
  },
  heroTitle: {
    width: moderateScale(200),
    height: moderateScale(32),
    marginBottom: theme.spacing.sm
  },
  heroMetadata: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  heroMetadataItem: {
    width: moderateScale(80),
    height: moderateScale(16)
  },

  // Info variant
  infoContainer: {
    padding: theme.spacing.md
  },
  infoTitle: {
    width: moderateScale(150),
    height: moderateScale(24),
    marginBottom: theme.spacing.md
  },
  infoLine: {
    width: '100%',
    height: moderateScale(16),
    marginBottom: theme.spacing.sm
  },
  infoLineShort: {
    width: '70%',
    height: moderateScale(16),
    marginBottom: theme.spacing.sm
  },
  infoLineMedium: {
    width: '85%',
    height: moderateScale(16),
    marginBottom: theme.spacing.sm
  },
  infoSpacing: {
    height: theme.spacing.md
  },

  // Filmography variant
  filmographyContainer: {
    padding: theme.spacing.md
  },
  sectionTitle: {
    width: moderateScale(120),
    height: moderateScale(24),
    marginBottom: theme.spacing.md
  },
  filmographyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  filmographyItem: {
    width: moderateScale(120),
    alignItems: 'center'
  },
  posterImage: {
    width: moderateScale(120),
    height: moderateScale(180),
    marginBottom: theme.spacing.xs,
    borderRadius: theme.radius.md
  },
  itemTitle: {
    width: moderateScale(100),
    height: moderateScale(14),
    marginBottom: theme.spacing.xs
  },
  itemSubtitle: {
    width: moderateScale(80),
    height: moderateScale(12)
  },

  // List variant
  listContainer: {
    padding: theme.spacing.md
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  listAvatar: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    marginRight: theme.spacing.md
  },
  listContent: {
    flex: 1
  },
  listTitle: {
    width: '80%',
    height: moderateScale(16),
    marginBottom: theme.spacing.xs
  },
  listSubtitle: {
    width: '60%',
    height: moderateScale(14)
  },

  // Grid variant
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  gridItem: {
    width: moderateScale(100),
    alignItems: 'center'
  },
  gridImage: {
    width: moderateScale(100),
    height: moderateScale(150),
    marginBottom: theme.spacing.xs,
    borderRadius: theme.radius.md
  },
  gridTitle: {
    width: moderateScale(80),
    height: moderateScale(14)
  },

  // Default
  defaultSkeleton: {
    width: '100%',
    height: moderateScale(50),
    margin: theme.spacing.md
  }
})