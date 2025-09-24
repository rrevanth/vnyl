import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

export type AuthenticationType = 'bearer' | 'apikey' | 'default' | 'none'

export interface StatusHeaderProps {
  title: string
  authenticationType: AuthenticationType
  isHealthy?: boolean
  statusText?: string
  healthIndicator?: boolean
}

export const StatusHeader: React.FC<StatusHeaderProps> = observer(({
  title,
  authenticationType,
  isHealthy = false,
  statusText,
  healthIndicator = true
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const getAuthenticationTypeLabel = (type: AuthenticationType): string => {
    switch (type) {
      case 'bearer':
        return 'Bearer Token'
      case 'apikey':
        return 'API Key'
      case 'default':
        return 'Default API Key'
      case 'none':
      default:
        return 'Not Configured'
    }
  }

  const getAuthenticationIcon = (type: AuthenticationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'bearer':
        return 'shield-checkmark'
      case 'apikey':
        return 'key'
      case 'default':
        return 'key-outline'
      case 'none':
      default:
        return 'shield-outline'
    }
  }

  const getAuthenticationColor = (type: AuthenticationType): string => {
    switch (type) {
      case 'bearer':
        return theme.colors.status.success
      case 'apikey':
        return theme.colors.status.info
      case 'default':
        return theme.colors.status.warning
      case 'none':
      default:
        return theme.colors.status.error
    }
  }

  const getHealthStatusColor = (): string => {
    return isHealthy ? theme.colors.status.success : theme.colors.status.error
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {healthIndicator && (
          <View style={styles.healthIndicatorContainer}>
            <View style={[
              styles.healthIndicator,
              { backgroundColor: getHealthStatusColor() }
            ]} />
          </View>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.authenticationInfo}>
          <Ionicons
            name={getAuthenticationIcon(authenticationType)}
            size={16}
            color={getAuthenticationColor(authenticationType)}
            style={styles.authIcon}
          />
          <Text style={[
            styles.authTypeText,
            { color: getAuthenticationColor(authenticationType) }
          ]}>
            {getAuthenticationTypeLabel(authenticationType)}
          </Text>
        </View>

        {statusText && (
          <Text style={styles.statusText}>{statusText}</Text>
        )}
      </View>
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    ...theme.shadows.sm
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as any,
    color: theme.colors.text.primary
  },
  healthIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  authenticationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  authIcon: {
    marginRight: theme.spacing.xs
  },
  authTypeText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: theme.typography.bodySmall.fontWeight as any
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    flexShrink: 1
  }
})