/**
 * CapabilityToggle Component
 * 
 * Reusable toggle component specifically designed for provider capabilities.
 * Features:
 * - Dynamic i18n integration with fallbacks
 * - Provider-specific customization
 * - Loading and disabled states
 * - Accessibility compliance
 * - Theme integration with light/dark mode support
 * 
 * @author Claude Code
 * @version 1.0.0
 */

import React from 'react'
import { View, Text, Switch, ActivityIndicator } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'
import type { Theme } from '@/src/presentation/shared/theme'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'

interface CapabilityToggleProps {
  capability: ProviderCapability
  enabled: boolean
  onToggle: (capability: ProviderCapability, enabled: boolean) => void
  providerId: string
  disabled?: boolean
  loading?: boolean
}

export const CapabilityToggle: React.FC<CapabilityToggleProps> = observer(({
  capability,
  enabled,
  onToggle,
  providerId,
  disabled = false,
  loading = false
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const styles = createStyles(theme)

  // Dynamic i18n key generation with fallbacks
  const getCapabilityTitle = (): string => {
    // Provider-specific title (highest priority)
    const providerSpecificKey = `providers.${providerId}.capabilities.${capability}.title`
    // Generic capability title (fallback)
    const genericKey = `providers.capabilities.${capability}.title`
    
    // Try provider-specific first, then generic, then capability name as last resort
    try {
      const providerSpecific = t(providerSpecificKey as any)
      if (providerSpecific !== providerSpecificKey) {
        return providerSpecific
      }
    } catch {
      // Provider-specific translation not found, continue to generic
    }

    try {
      const generic = t(genericKey as any)
      if (generic !== genericKey) {
        return generic
      }
    } catch {
      // Generic translation not found, continue to fallback
    }

    // Final fallback: capitalize the capability enum value
    return capability.charAt(0).toUpperCase() + capability.slice(1)
  }

  const getCapabilityDescription = (): string => {
    // Provider-specific description (highest priority)
    const providerSpecificKey = `providers.${providerId}.capabilities.${capability}.description`
    // Generic capability description (fallback)
    const genericKey = `providers.capabilities.${capability}.description`
    
    // Try provider-specific first, then generic, then return empty string as last resort
    try {
      const providerSpecific = t(providerSpecificKey as any)
      if (providerSpecific !== providerSpecificKey) {
        return providerSpecific
      }
    } catch {
      // Provider-specific translation not found, continue to generic
    }

    try {
      const generic = t(genericKey as any)
      if (generic !== genericKey) {
        return generic
      }
    } catch {
      // Generic translation not found, return empty string
    }

    // Return empty string if no translation found
    return ''
  }

  const handleToggle = (value: boolean) => {
    if (!disabled && !loading) {
      onToggle(capability, value)
    }
  }

  const title = getCapabilityTitle()
  const description = getCapabilityDescription()
  const accessibilityLabel = `Toggle ${title} capability`
  const accessibilityHint = description ? `${description}. Currently ${enabled ? 'enabled' : 'disabled'}` : `Currently ${enabled ? 'enabled' : 'disabled'}`

  return (
    <View style={[styles.container, (disabled || loading) && styles.containerDisabled]}>
      <View style={styles.content}>
        <Text style={[styles.title, (disabled || loading) && styles.titleDisabled]}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, (disabled || loading) && styles.descriptionDisabled]}>
            {description}
          </Text>
        ) : null}
      </View>
      
      <View style={styles.toggleContainer}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.interactive.primary}
            style={styles.loadingIndicator}
          />
        ) : (
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            disabled={disabled}
            trackColor={{
              false: theme.colors.background.tertiary,
              true: theme.colors.interactive.primary
            }}
            thumbColor={theme.colors.background.primary}
            ios_backgroundColor={theme.colors.background.tertiary}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ 
              checked: enabled, 
              disabled: disabled || loading 
            }}
            accessibilityRole="switch"
          />
        )}
      </View>
    </View>
  )
})

interface CapabilityToggleStyles {
  container: ViewStyle
  containerDisabled: ViewStyle
  content: ViewStyle
  title: TextStyle
  titleDisabled: TextStyle
  description: TextStyle
  descriptionDisabled: TextStyle
  toggleContainer: ViewStyle
  loadingIndicator: ViewStyle
}

const createStyles = (theme: Theme): CapabilityToggleStyles => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    minHeight: 60 // Ensure adequate touch target
  },
  containerDisabled: {
    opacity: 0.5
  },
  content: {
    flex: 1,
    marginRight: theme.spacing.md
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  titleDisabled: {
    color: theme.colors.text.disabled || theme.colors.text.secondary
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  descriptionDisabled: {
    color: theme.colors.text.disabled || theme.colors.text.secondary
  },
  toggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 51, // iOS Switch width
    minHeight: 31  // iOS Switch height
  },
  loadingIndicator: {
    // No additional styles needed, ActivityIndicator handles its own sizing
  }
})