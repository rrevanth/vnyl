/**
 * CatalogItem Component
 * 
 * Individual catalog item component with Legend Motion animations
 * Displays movie/TV show items from catalogs with comprehensive theming
 */

/* @jsxImportSource react */

import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Image } from 'expo-image'
// import { useTranslation } from '@/src/presentation/shared/i18n' // Removed since no translations needed
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { CatalogItem as CatalogItemEntity } from '@/src/domain/entities/media/catalog-item.entity'
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
}

export const CatalogItem: React.FC<CatalogItemProps> = observer(({
  item,
  onPress,
  onLongPress,
  index,
  isFirstItem = false,
  isLastItem = false,
  isNewItem = false,
  animationDelay = 0
}) => {
  // const { t } = useTranslation() // Removed since no translations needed
  const theme = useTheme()
  const styles = createStyles(theme, isFirstItem, isLastItem)

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

  const handlePress = () => {
    onPress(item)
  }

  const handleLongPress = () => {
    onLongPress?.(item)
  }

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim }
    ]
  }

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
            <Image
              source={{ uri: item.posterUrl || undefined }}
              style={styles.posterImage}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            />
            
          </View>
          
          {/* Content Info */}
          <View style={styles.contentInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            
            {item.releaseDate && (
              <Text style={styles.releaseDate}>
                {new Date(item.releaseDate).getFullYear()}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
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
    width: '100%',
    height: scale(200),
    backgroundColor: theme.colors.background.tertiary,
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
})