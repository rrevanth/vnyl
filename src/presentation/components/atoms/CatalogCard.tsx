/**
 * Catalog Card Component - Display Individual Catalog Information
 * 
 * Shows catalog metadata including title, description, provider info,
 * and sample items with proper theming and accessibility.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme'
import type { Catalog } from '@/src/domain/entities/provider-capabilities.entity'

interface CatalogCardProps {
  catalog: Catalog
  providerName: string
  onPress?: (catalog: Catalog) => void
  showSampleCount?: boolean
  compact?: boolean
}

export const CatalogCard: React.FC<CatalogCardProps> = observer(({
  catalog,
  providerName,
  onPress,
  showSampleCount = true,
  compact = false
}) => {
  const theme = useTheme()
  const { t, formatMessage } = useTranslation()
  const styles = createStyles(theme, compact)

  const handlePress = () => {
    onPress?.(catalog)
  }

  const getContentTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'movie':
        return 'film-outline'
      case 'tv':
        return 'tv-outline'
      case 'person':
        return 'person-outline'
      case 'collection':
        return 'library-outline'
      default:
        return 'albums-outline'
    }
  }

  const getContentTypeColor = (type: string): string => {
    switch (type) {
      case 'movie':
        return theme.colors.status.info
      case 'tv':
        return theme.colors.status.success
      case 'person':
        return theme.colors.status.warning
      case 'collection':
        return theme.colors.interactive.secondary
      default:
        return theme.colors.text.tertiary
    }
  }

  const formatItemCount = (count?: number): string => {
    if (!count || count === 0) return t('catalog.no_items')
    if (count === 1) return t('catalog.one_item')
    if (count < 1000) return formatMessage('catalog.items_count', { count })
    if (count < 1000000) return formatMessage('catalog.items_k_count', { count: Math.round(count / 100) / 10 })
    return formatMessage('catalog.items_m_count', { count: Math.round(count / 100000) / 10 })
  }

  const CardComponent = onPress ? Pressable : View

  return (
    <CardComponent
      style={({ pressed }) => [
        styles.container,
        onPress && pressed && styles.containerPressed
      ]}
      onPress={handlePress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={formatMessage('catalog.card_accessibility', {
        title: catalog.title,
        provider: providerName,
        type: catalog.type
      })}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getContentTypeIcon(catalog.type)}
            size={compact ? 18 : 24}
            color={getContentTypeColor(catalog.type)}
          />
        </View>
        
        <View style={styles.titleContainer}>
          <Text 
            style={styles.title}
            numberOfLines={compact ? 1 : 2}
            ellipsizeMode="tail"
          >
            {catalog.title}
          </Text>
          
          <View style={styles.metaContainer}>
            <Text style={styles.providerText}>{providerName}</Text>
            <View style={styles.separator} />
            <Text style={styles.typeText}>
              {t(`content_type.${catalog.type}`)}
            </Text>
          </View>
        </View>

        {onPress && (
          <View style={styles.chevronContainer}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </View>
        )}
      </View>

      {!compact && catalog.description && (
        <Text 
          style={styles.description}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {catalog.description}
        </Text>
      )}

      <View style={styles.footer}>
        {showSampleCount && (
          <View style={styles.statsContainer}>
            <Ionicons
              name="library-outline"
              size={14}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.statsText}>
              {formatItemCount(catalog.totalItems)}
            </Text>
          </View>
        )}

        {catalog.pagination.hasMore && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {t('catalog.has_more')}
            </Text>
          </View>
        )}

        {catalog.providerInfo.lastUpdated && (
          <Text style={styles.updatedText}>
            {formatMessage('catalog.updated', {
              date: new Date(catalog.providerInfo.lastUpdated).toLocaleDateString()
            })}
          </Text>
        )}
      </View>
    </CardComponent>
  )
})

const createStyles = (theme: Theme, compact: boolean) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: compact ? theme.spacing.sm : theme.spacing.md,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.sm
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: compact ? theme.spacing.xs : theme.spacing.sm
  },
  iconContainer: {
    width: compact ? 32 : 40,
    height: compact ? 32 : 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: compact ? theme.typography.body.fontSize : theme.typography.heading3.fontSize,
    fontWeight: compact ? '500' : (theme.typography.heading3.fontWeight as '600'),
    fontFamily: compact ? theme.typography.body.fontFamily : theme.typography.heading3.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  providerText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.interactive.primary,
    fontWeight: '500'
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text.tertiary,
    marginHorizontal: theme.spacing.xs
  },
  typeText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize'
  },
  chevronContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center'
  },
  description: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontFamily: theme.typography.bodySmall.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.bodySmall.lineHeight,
    marginBottom: theme.spacing.sm
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statsText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs
  },
  badgeContainer: {
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.radius.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2
  },
  badgeText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.inverse,
    fontWeight: '500'
  },
  updatedText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.tertiary,
    marginLeft: 'auto'
  }
})