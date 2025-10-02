/**
 * Button Atom Component
 * Versatile button component with variants, sizes, and states
 */

import React from 'react'
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'

// Types
export interface ButtonProps {
  // Content
  title?: string
  children?: React.ReactNode
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  
  // State
  disabled?: boolean
  loading?: boolean
  
  // Icon support
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconOnly?: boolean
  
  // Behavior
  onPress?: () => void
  onLongPress?: () => void
  
  // Accessibility
  accessibilityLabel?: string
  accessibilityHint?: string
  testID?: string
  
  // Style overrides
  style?: any
  textStyle?: any
}

export const Button: React.FC<ButtonProps> = observer(({
  title,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  textStyle,
}) => {
  // Determine content to display
  const displayText = title || (typeof children === 'string' ? children : undefined)
  const hasText = !iconOnly && (displayText || React.isValidElement(children))
  const hasLeftIcon = !!leftIcon && !loading
  const hasRightIcon = !!rightIcon && !loading
  
  // Handle press with loading and disabled states
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress()
    }
  }
  
  const handleLongPress = () => {
    if (!disabled && !loading && onLongPress) {
      onLongPress()
    }
  }
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}` as keyof typeof styles],
        styles[`button_${size}` as keyof typeof styles],
        fullWidth && styles.button_fullWidth,
        disabled && styles.button_disabled,
        pressed && !disabled && !loading && styles.button_pressed,
        style,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || displayText}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
    >
      <View style={[
        styles.content,
        iconOnly && styles.content_iconOnly,
        hasText && (hasLeftIcon || hasRightIcon) && styles.content_withIcons,
      ]}>
        {/* Loading indicator */}
        {loading && (
          <ActivityIndicator
            size={size === 'sm' ? 'small' : 'small'}
            color="#FFFFFF"
            style={[
              styles.loader,
              hasText && styles.loader_withText,
            ]}
          />
        )}
        
        {/* Left icon */}
        {hasLeftIcon && (
          <View style={[
            styles.icon,
            styles.icon_left,
            hasText && styles.icon_withText,
          ]}>
            {leftIcon}
          </View>
        )}
        
        {/* Text content */}
        {hasText && (
          <Text
            style={[
              styles.text,
              styles[`text_${variant}` as keyof typeof styles],
              styles[`text_${size}` as keyof typeof styles],
              disabled && styles.text_disabled,
              textStyle,
            ]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {displayText || children}
          </Text>
        )}
        
        {/* Right icon */}
        {hasRightIcon && (
          <View style={[
            styles.icon,
            styles.icon_right,
            hasText && styles.icon_withText,
          ]}>
            {rightIcon}
          </View>
        )}
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Button variants
  button_primary: {
    backgroundColor: '#007AFF',
  },
  
  button_secondary: {
    backgroundColor: '#5856D6',
  },
  
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: '#E2E8F0',
  },
  
  button_ghost: {
    backgroundColor: 'transparent',
  },
  
  button_destructive: {
    backgroundColor: '#FF3B30',
  },
  
  // Button sizes
  button_sm: {
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  
  button_md: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  
  button_lg: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  
  button_xl: {
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  
  // Button states
  button_fullWidth: {
    width: '100%',
  },
  
  button_disabled: {
    opacity: 0.5,
  },
  
  button_pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  // Content layout
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  
  content_iconOnly: {
    aspectRatio: 1,
  },
  
  content_withIcons: {
    paddingHorizontal: 4,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  
  // Text variants
  text_primary: {
    color: '#FFFFFF',
  },
  
  text_secondary: {
    color: '#FFFFFF',
  },
  
  text_outline: {
    color: '#000000',
  },
  
  text_ghost: {
    color: '#007AFF',
  },
  
  text_destructive: {
    color: '#FFFFFF',
  },
  
  // Text sizes
  text_sm: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  text_md: {
    fontSize: 16,
    lineHeight: 20,
  },
  
  text_lg: {
    fontSize: 18,
    lineHeight: 22,
  },
  
  text_xl: {
    fontSize: 20,
    lineHeight: 24,
  },
  
  text_disabled: {
    opacity: 0.7,
  },
  
  // Icon styles
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  icon_left: {
    marginRight: 8,
  },
  
  icon_right: {
    marginLeft: 8,
  },
  
  icon_withText: {
    flex: 0,
  },
  
  // Loader styles
  loader: {
    marginRight: 0,
  },
  
  loader_withText: {
    marginRight: 8,
  },
})

Button.displayName = 'Button'