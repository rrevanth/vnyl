/**
 * CatalogItem Component
 * 
 * Individual catalog item component with Legend Motion animations
 * Displays movie/TV show items from catalogs with comprehensive theming
 */

/* @jsxImportSource react */

import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { observer } from '@legendapp/state/react'
import { PosterImage } from '@/src/presentation/components/atoms'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { CatalogItem as CatalogItemEntity } from '@/src/domain/entities/media/catalog-item.entity'
import { useLazyLoadingPerformance, useProgressiveImageLoading } from '@/src/presentation/shared/hooks/useLazyLoading'
import { scale, moderateScale } from 'react-native-size-matters'

interface CatalogItemProps {
  item: CatalogItemEntity
  onPress: (item: CatalogItemEntity) => void
  onLongPress?: (item: CatalogItemEntity) => void
  index: number
  isFirstItem?: boolean
  isLastItem?: boolean
  isNewItem?: boolean
  animationDelay?: number
  /** Whether this item was lazy loaded */
  isLazyLoaded?: boolean
  /** Whether item is currently visible in viewport */
  isVisible?: boolean
}

const CatalogItemImpl: React.FC<CatalogItemProps> = ({
  item,
  onPress,
  onLongPress,
  index,
  isFirstItem = false,
  isLastItem = false,
  isNewItem = false,
  animationDelay = 0,
  isLazyLoaded = false,
  isVisible = true
}) => {
  const theme = useTheme()
  const styles = useMemo(() => createStyles(theme, isFirstItem, isLastItem), [theme, isFirstItem, isLastItem])

  // Performance monitoring
  useLazyLoadingPerformance(`CatalogItem-${item.id}`)

  // Progressive image loading
  const { shouldLoadImage, setPriority } = useProgressiveImageLoading()

  // Set priority for first few items
  useEffect(() => {
    setPriority(item.id, index < 5)
  }, [setPriority, item.id, index])

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(isNewItem ? 0 : 1)).current
  const scaleAnim = useRef(new Animated.Value(isNewItem ? 0.8 : 1)).current
  const translateYAnim = useRef(new Animated.Value(isNewItem ? 20 : 0)).current

  // Animate in new items
  useEffect(() => {
    if (isNewItem) {
      const delay = animationDelay
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          delay,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isNewItem, animationDelay, fadeAnim, scaleAnim, translateYAnim])

  const handlePress = useCallback(() => {
    onPress(item)
  }, [onPress, item])

  const handleLongPress = useCallback(() => {
    onLongPress?.(item)
  }, [onLongPress, item])

  const animatedStyle = useMemo(() => ({
    opacity: fadeAnim,
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim }
    ]
  }), [fadeAnim, scaleAnim, translateYAnim])

  // Memoize release year calculation
  const releaseYear = useMemo(() => {
    return item.releaseDate ? new Date(item.releaseDate).getFullYear() : null
  }, [item.releaseDate])

  // Determine image loading priority
  const imagePriority = useMemo(() => {
    if (index < 3) return 10 // High priority for first 3
    if (index < 5) return 8  // Medium-high for next 2
    if (isVisible) return 6  // Medium for visible items
    return 3 // Low for non-visible
  }, [index, isVisible])

  // Only load image if conditions are met
  const shouldRenderImage = shouldLoadImage(item.id, index) || isVisible

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={({ pressed }: { pressed: boolean }) => [
          styles.pressable,
          pressed && styles.pressed
        ]}
      >
        <View>
          {/* Poster Image */}
          <View style={styles.imageContainer}>
            {shouldRenderImage ? (
              <PosterImage
                source={item.posterUrl}
                width={scale(140)}
                height={scale(200)}
                cachePolicy={index < 5 ? "memory-disk" : "disk"}
                quality={index < 3 ? "high" : "medium"}
                showLoadingIndicator={!isLazyLoaded}
                transitionDuration={isLazyLoaded ? 300 : 200}
                priority={imagePriority}
                style={styles.posterImage}
                accessibilityLabel={`${item.title} poster`}
              />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </View>
          
          {/* Content Info */}
          <View style={styles.contentInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            
            {releaseYear && (
              <Text style={styles.releaseDate}>
                {releaseYear}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const CatalogItem = React.memo(observer(CatalogItemImpl), (prevProps, nextProps) => {
  // Custom comparison function for optimal performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.index === nextProps.index &&
    prevProps.isFirstItem === nextProps.isFirstItem &&
    prevProps.isLastItem === nextProps.isLastItem &&
    prevProps.isNewItem === nextProps.isNewItem &&
    prevProps.animationDelay === nextProps.animationDelay &&
    prevProps.isLazyLoaded === nextProps.isLazyLoaded &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onLongPress === nextProps.onLongPress
  )
})

const createStyles = (theme: Theme, isFirstItem: boolean, isLastItem: boolean) => StyleSheet.create({
  container: {
    width: scale(140),
    marginLeft: isFirstItem ? theme.spacing.md : theme.spacing.xs,
    marginRight: isLastItem ? theme.spacing.md : theme.spacing.xs,
  },
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  posterImage: {
    // Removed styles since they're handled by Image component
  },
  contentInfo: {
    paddingTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.xs,
  },
  releaseDate: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '400',
    marginBottom: theme.spacing.xs,
  },
  imagePlaceholder: {
    width: scale(140),
    height: scale(200),
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
    opacity: 0.3,
  },
})