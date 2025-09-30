/**
 * ServiceBadge
 *
 * Atomic component for displaying streaming service availability badges.
 * Shows service name with optional logo and availability status.
 *
 * Used in MediaDetail screens to show where content can be watched.
 */

import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

export interface ServiceBadgeProps {
  /**
   * Name of the streaming service
   */
  serviceName: string

  /**
   * Optional logo URL for the service
   */
  logoUrl?: string

  /**
   * Availability status
   * - available: Content is available (default)
   * - coming_soon: Content coming soon
   * - rent: Available for rent/purchase
   * - subscription: Requires subscription
   */
  status?: 'available' | 'coming_soon' | 'rent' | 'subscription'

  /**
   * Visual variant
   * - default: Standard service badge
   * - compact: Smaller version for space-constrained layouts
   * - featured: Emphasized version for primary services
   */
  variant?: 'default' | 'compact' | 'featured'

  /**
   * Whether to show on a dark background
   */
  onDark?: boolean

  /**
   * Test ID for testing
   */
  testID?: string
}

const ServiceBadgeImpl: React.FC<ServiceBadgeProps> = ({
  serviceName,
  logoUrl,
  status = 'available',
  variant = 'default',
  onDark = false,
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, variant, status, onDark)

  return (
    <View style={styles.container} testID={testID}>
      {logoUrl && (
        <Image
          source={{ uri: logoUrl }}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <Text style={styles.serviceName} numberOfLines={1}>
        {serviceName}
      </Text>
      {status !== 'available' && (
        <Text style={styles.statusText} numberOfLines={1}>
          {getStatusLabel(status)}
        </Text>
      )}
    </View>
  )
}

export const ServiceBadge = React.memo(observer(ServiceBadgeImpl))

const getStatusLabel = (status: ServiceBadgeProps['status']): string => {
  switch (status) {
    case 'coming_soon':
      return 'Soon'
    case 'rent':
      return 'Rent'
    case 'subscription':
      return 'Sub'
    default:
      return ''
  }
}

const createStyles = (
  theme: Theme,
  variant: ServiceBadgeProps['variant'],
  status: ServiceBadgeProps['status'],
  onDark: boolean
) => {
  // Variant-based dimensions
  const dimensions = {
    compact: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs / 2,
      logoSize: moderateScale(12),
      fontSize: moderateScale(10),
      lineHeight: moderateScale(12),
      statusFontSize: moderateScale(9),
    },
    default: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      logoSize: moderateScale(16),
      fontSize: moderateScale(12),
      lineHeight: moderateScale(16),
      statusFontSize: moderateScale(10),
    },
    featured: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      logoSize: moderateScale(20),
      fontSize: moderateScale(14),
      lineHeight: moderateScale(18),
      statusFontSize: moderateScale(11),
    }
  }

  // Status-based colors
  const getColors = () => {
    const base = onDark ? {
      defaultBg: 'rgba(255,255,255,0.15)',
      defaultText: theme.colors.text.onColor,
      border: 'rgba(255,255,255,0.2)',
    } : {
      defaultBg: theme.colors.background.secondary,
      defaultText: theme.colors.text.primary,
      border: theme.colors.border.secondary,
    }

    switch (status) {
      case 'available':
        return {
          backgroundColor: variant === 'featured' ? theme.colors.status.success : base.defaultBg,
          textColor: variant === 'featured' ? theme.colors.text.onColor : base.defaultText,
          statusColor: theme.colors.status.success,
          borderColor: variant === 'featured' ? theme.colors.status.success : base.border,
        }
      case 'coming_soon':
        return {
          backgroundColor: base.defaultBg,
          textColor: base.defaultText,
          statusColor: theme.colors.status.info,
          borderColor: theme.colors.status.info,
        }
      case 'rent':
        return {
          backgroundColor: base.defaultBg,
          textColor: base.defaultText,
          statusColor: theme.colors.status.warning,
          borderColor: theme.colors.status.warning,
        }
      case 'subscription':
        return {
          backgroundColor: base.defaultBg,
          textColor: base.defaultText,
          statusColor: theme.colors.interactive.primary,
          borderColor: theme.colors.interactive.primary,
        }
      default:
        return {
          backgroundColor: base.defaultBg,
          textColor: base.defaultText,
          statusColor: base.defaultText,
          borderColor: base.border,
        }
    }
  }

  const colors = getColors()
  const dims = dimensions[variant!]

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
      borderWidth: variant === 'featured' ? 0 : 1,
      borderColor: colors.borderColor,
      paddingHorizontal: dims.paddingHorizontal,
      paddingVertical: dims.paddingVertical,
      borderRadius: theme.radius.sm,
      alignSelf: 'flex-start',
      ...((variant === 'featured' || status === 'available') && theme.shadows.xs),
    },
    logo: {
      width: dims.logoSize,
      height: dims.logoSize,
      marginRight: theme.spacing.xs,
    },
    serviceName: {
      fontSize: dims.fontSize,
      lineHeight: dims.lineHeight,
      fontWeight: variant === 'featured' ? '600' : '500',
      color: colors.textColor,
      flex: 1,
    },
    statusText: {
      fontSize: dims.statusFontSize,
      lineHeight: dims.statusFontSize + 2,
      fontWeight: '600',
      color: colors.statusColor,
      marginLeft: theme.spacing.xs,
      textTransform: 'uppercase',
    },
  })
}