/**
 * CatalogItem Component
 * 
 * Individual catalog item component with Legend Motion animations
 * Displays movie/TV show items from catalogs with comprehensive theming
 */

/* @jsxImportSource react */

import React from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Image } from 'expo-image'
import { useTranslation } from '@/src/presentation/shared/i18n'
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
}

export const CatalogItem: React.FC<CatalogItemProps> = observer(({
  item,
  onPress,
  onLongPress,
  index,
  isFirstItem = false,
  isLastItem = false
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme, isFirstItem, isLastItem)

  const handlePress = () => {
    onPress(item)
  }

  const handleLongPress = () => {
    onLongPress?.(item)
  }

  return (
    <Animated.View style={styles.container}>
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
            
            {/* Rating Badge */}
            {item.voteAverage && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  {item.voteAverage.toFixed(1)}
                </Text>
              </View>
            )}
            
            {/* Media Type Badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {item.mediaType === 'movie' ? t('media.movie') : t('media.tv')}
              </Text>
            </View>
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
            
            {item.overview && (
              <Text style={styles.overview} numberOfLines={3}>
                {item.overview}
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
  ratingBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: scale(2),
  },
  ratingText: {
    color: theme.colors.text.inverse,
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    bottom: theme.spacing.xs,
    left: theme.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: scale(2),
  },
  typeText: {
    color: theme.colors.text.inverse,
    fontSize: moderateScale(10),
    fontWeight: '500',
    textTransform: 'uppercase',
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
  overview: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    fontWeight: '400',
  },
})