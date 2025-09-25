import React from 'react'
import { View, Text, Pressable } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface SettingsCardProps {
  title: string
  description?: string
  icon?: keyof typeof Ionicons.glyphMap
  onPress?: () => void
  disabled?: boolean
  children?: React.ReactNode
}

export const SettingsCard: React.FC<SettingsCardProps> = observer(({
  title,
  description,
  icon,
  onPress,
  disabled = false,
  children
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const CardComponent = onPress ? Pressable : View

  return (
    <CardComponent
      style={({ pressed }) => [
        styles.container,
        onPress && pressed && styles.containerPressed,
        disabled && styles.containerDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled }}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={24}
              color={disabled ? theme.colors.text.disabled : theme.colors.interactive.primary}
            />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={[styles.title, disabled && styles.titleDisabled]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
              {description}
            </Text>
          )}
        </View>

        {children && (
          <View style={styles.rightContent}>
            {children}
          </View>
        )}

        {onPress && !children && (
          <View style={styles.chevronContainer}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={disabled ? theme.colors.text.disabled : theme.colors.text.tertiary}
            />
          </View>
        )}
      </View>
    </CardComponent>
  )
})

interface SettingsCardStyles {
  container: ViewStyle
  containerPressed: ViewStyle
  containerDisabled: ViewStyle
  content: ViewStyle
  iconContainer: ViewStyle
  textContainer: ViewStyle
  rightContent: ViewStyle
  chevronContainer: ViewStyle
  title: TextStyle
  titleDisabled: TextStyle
  description: TextStyle
  descriptionDisabled: TextStyle
}

const createStyles = (theme: Theme): SettingsCardStyles => ({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.sm
  },
  containerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  containerDisabled: {
    opacity: 0.5
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md
  },
  textContainer: {
    flex: 1
  },
  rightContent: {
    marginLeft: theme.spacing.md
  },
  chevronContainer: {
    marginLeft: theme.spacing.sm
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as TextStyle['fontWeight'],
    fontFamily: theme.typography.body.fontFamily,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  titleDisabled: {
    color: theme.colors.text.disabled
  },
  description: {
    fontSize: theme.typography.caption.fontSize,
    fontFamily: theme.typography.caption.fontFamily,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  descriptionDisabled: {
    color: theme.colors.text.disabled
  }
})