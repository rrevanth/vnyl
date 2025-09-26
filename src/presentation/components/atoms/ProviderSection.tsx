/**
 * Provider Section Component - Display Provider with Catalogs
 * 
 * Groups catalogs by provider with collapsible sections, provider health status,
 * and responsive catalog grid layout.
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
import type { ProviderCatalogGroup } from '@/src/domain/usecases/get-all-catalogs.usecase'
import type { Catalog } from '@/src/domain/entities/provider-capabilities.entity'
import { CatalogCard } from './CatalogCard'

interface ProviderSectionProps {
  providerGroup: ProviderCatalogGroup
  isExpanded: boolean
  onToggleExpansion: (providerId: string) => void
  onCatalogPress?: (catalog: Catalog) => void
  showCompactCards?: boolean
  maxCatalogsPreview?: number
}

export const ProviderSection: React.FC<ProviderSectionProps> = observer(({
  providerGroup,
  isExpanded,
  onToggleExpansion,
  onCatalogPress,
  showCompactCards = false,
  maxCatalogsPreview = 3
}) => {
  const theme = useTheme()
  const { t, formatMessage } = useTranslation()
  const styles = createStyles(theme)

  const handleToggleExpansion = () => {
    onToggleExpansion(providerGroup.providerId)
  }

  const getProviderTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'official':
        return 'shield-checkmark-outline'
      case 'addon':
        return 'extension-puzzle-outline'
      case 'custom':
        return 'settings-outline'
      case 'local':
        return 'folder-outline'
      default:
        return 'server-outline'
    }
  }

  const getHealthStatusColor = (isHealthy: boolean): string => {
    return isHealthy ? theme.colors.status.success : theme.colors.status.error
  }

  const formatResponseTime = (responseTime: number): string => {
    if (responseTime < 1000) {
      return `${Math.round(responseTime)}ms`
    }
    return `${(responseTime / 1000).toFixed(1)}s`
  }

  const catalogsToShow = isExpanded 
    ? providerGroup.catalogs 
    : providerGroup.catalogs.slice(0, maxCatalogsPreview)
  
  const hasMoreCatalogs = providerGroup.catalogs.length > maxCatalogsPreview
  const remainingCount = providerGroup.catalogs.length - maxCatalogsPreview

  return (
    <View style={styles.container}>
      {/* Provider Header */}
      <Pressable
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed
        ]}
        onPress={handleToggleExpansion}
        accessibilityRole="button"
        accessibilityLabel={formatMessage('provider.toggle_expansion', {
          provider: providerGroup.providerName,
          state: isExpanded ? t('common.collapse') : t('common.expand')
        })}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.providerInfo}>
          <View style={[
            styles.providerIconContainer,
            { backgroundColor: getHealthStatusColor(providerGroup.isHealthy) + '20' }
          ]}>
            <Ionicons
              name={getProviderTypeIcon(providerGroup.providerType)}
              size={20}
              color={getHealthStatusColor(providerGroup.isHealthy)}
            />
          </View>
          
          <View style={styles.providerDetails}>
            <View style={styles.providerTitleRow}>
              <Text style={styles.providerName}>
                {providerGroup.providerName}
              </Text>
              
              <View style={[
                styles.healthBadge,
                { backgroundColor: getHealthStatusColor(providerGroup.isHealthy) + '20' }
              ]}>
                <View style={[
                  styles.healthDot,
                  { backgroundColor: getHealthStatusColor(providerGroup.isHealthy) }
                ]} />
                <Text style={[
                  styles.healthText,
                  { color: getHealthStatusColor(providerGroup.isHealthy) }
                ]}>
                  {t(`provider.health.${providerGroup.isHealthy ? 'healthy' : 'unhealthy'}`)}
                </Text>
              </View>
            </View>
            
            <View style={styles.providerMeta}>
              <Text style={styles.catalogCount}>
                {formatMessage('provider.catalog_count', { count: providerGroup.catalogs.length })}
              </Text>
              
              <View style={styles.separator} />
              
              <Text style={styles.responseTime}>
                {formatResponseTime(providerGroup.responseTime)}
              </Text>
              
              <View style={styles.separator} />
              
              <Text style={styles.providerType}>
                {t(`provider.type.${providerGroup.providerType}`)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.expandButton}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.text.tertiary}
          />
        </View>
      </Pressable>

      {/* Error Message */}
      {providerGroup.errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="warning-outline"
            size={16}
            color={theme.colors.status.error}
          />
          <Text style={styles.errorText}>
            {providerGroup.errorMessage}
          </Text>
        </View>
      )}

      {/* Catalogs List */}
      {catalogsToShow.length > 0 && (
        <View style={styles.catalogsList}>
          {catalogsToShow.map(catalog => (
            <CatalogCard
              key={catalog.id}
              catalog={catalog}
              providerName={providerGroup.providerName}
              onPress={onCatalogPress}
              compact={showCompactCards}
            />
          ))}
          
          {/* Show More Button */}
          {!isExpanded && hasMoreCatalogs && (
            <Pressable
              style={({ pressed }) => [
                styles.showMoreButton,
                pressed && styles.showMoreButtonPressed
              ]}
              onPress={handleToggleExpansion}
              accessibilityRole="button"
              accessibilityLabel={formatMessage('provider.show_more_catalogs', {
                count: remainingCount,
                provider: providerGroup.providerName
              })}
            >
              <Text style={styles.showMoreText}>
                {formatMessage('provider.show_more', { count: remainingCount })}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={theme.colors.interactive.primary}
              />
            </Pressable>
          )}
        </View>
      )}

      {/* Empty State */}
      {providerGroup.catalogs.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="library-outline"
            size={32}
            color={theme.colors.text.tertiary}
          />
          <Text style={styles.emptyText}>
            {t('provider.no_catalogs')}
          </Text>
        </View>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  header: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm
  },
  headerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  providerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  providerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  providerDetails: {
    flex: 1
  },
  providerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs
  },
  providerName: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as '600',
    fontFamily: theme.typography.heading3.fontFamily,
    color: theme.colors.text.primary,
    flex: 1
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.xs,
    marginLeft: theme.spacing.sm
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs
  },
  healthText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    fontWeight: '500'
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  catalogCount: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    fontWeight: '500'
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text.tertiary,
    marginHorizontal: theme.spacing.sm
  },
  responseTime: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.tertiary
  },
  providerType: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.tertiary,
    textTransform: 'capitalize'
  },
  expandButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.status.error + '10',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.status.error
  },
  errorText: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.status.error,
    marginLeft: theme.spacing.sm,
    flex: 1
  },
  catalogsList: {
    marginTop: theme.spacing.md
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm
  },
  showMoreButtonPressed: {
    opacity: 0.8
  },
  showMoreText: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.interactive.primary,
    fontWeight: '500',
    marginRight: theme.spacing.sm
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.md
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  }
})