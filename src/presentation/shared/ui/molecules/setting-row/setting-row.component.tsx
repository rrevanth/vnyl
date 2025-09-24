import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import { Switch } from '@/src/presentation/shared/ui/atoms/switch'
import type { SettingRowProps } from './setting-row.types'

export const SettingRow: React.FC<SettingRowProps> = observer(({
  label,
  description,
  variant = 'default',
  switchProps,
  buttonProps,
  leftIcon,
  rightContent,
  showChevron = variant === 'navigation',
  disabled = false,
  containerStyle,
  contentStyle,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  ...pressableProps
}) => {
  const { theme } = useTheme()
  const styles = createSettingRowStyles(theme, disabled)

  const isInteractive = variant === 'navigation' || onPress

  const renderRightContent = () => {
    if (rightContent) {
      return rightContent
    }

    switch (variant) {
      case 'switch':
        if (switchProps) {
          return (
            <Switch
              value={switchProps.value}
              onValueChange={switchProps.onValueChange}
              disabled={disabled || switchProps.disabled}
            />
          )
        }
        break

      case 'button':
        if (buttonProps) {
          return (
            <Button
              title={buttonProps.title}
              onPress={buttonProps.onPress}
              variant={buttonProps.variant || 'outline'}
              size="sm"
              disabled={disabled || buttonProps.disabled}
            />
          )
        }
        break

      case 'navigation':
        if (showChevron) {
          return (
            <Text variant="body" color="secondary" style={styles.chevron}>
              ›
            </Text>
          )
        }
        break

      default:
        return null
    }

    return null
  }

  const RowComponent = isInteractive ? Pressable : View

  const rowProps = isInteractive
    ? {
        ...pressableProps,
        onPress,
        accessibilityRole: 'button' as const,
        accessibilityLabel: accessibilityLabel || label,
        accessibilityHint,
        accessibilityState: { disabled },
        hitSlop: theme.hitSlop.sm
      }
    : {}

  return (
    <RowComponent
      {...rowProps}
      style={({ pressed }: any) => [
        styles.container,
        isInteractive && pressed && !disabled && styles.pressed,
        containerStyle
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            variant="bodyBold"
            color={disabled ? 'secondary' : 'primary'}
            numberOfLines={1}
          >
            {label}
          </Text>
          {description && (
            <Text
              variant="caption"
              color="secondary"
              numberOfLines={2}
              style={styles.description}
            >
              {description}
            </Text>
          )}
        </View>

        <View style={styles.rightContainer}>
          {renderRightContent()}
        </View>
      </View>
    </RowComponent>
  )
})

SettingRow.displayName = 'SettingRow'

const createSettingRowStyles = (theme: any, disabled: boolean) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    marginVertical: theme.spacing.xs / 2,
    opacity: disabled ? 0.6 : 1
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }]
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    minHeight: 56
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  description: {
    marginTop: theme.spacing.xs / 2
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: theme.spacing.xs
  }
})