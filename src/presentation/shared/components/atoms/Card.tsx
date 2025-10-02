/**
 * Card Atom Component
 * Flexible card container with variants and interactive states
 */

import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'

// Types
export interface CardProps {
  // Content
  children: React.ReactNode
  
  // Appearance
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  // Interaction
  onPress?: () => void
  onLongPress?: () => void
  pressable?: boolean
  
  // State
  disabled?: boolean
  selected?: boolean
  
  // Accessibility
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: 'button' | 'none'
  testID?: string
  
  // Style overrides
  style?: any
}

export const Card: React.FC<CardProps> = observer(({
  children,
  variant = 'elevated',
  padding = 'md',
  radius = 'md',
  onPress,
  onLongPress,
  pressable = !!onPress || !!onLongPress,
  disabled = false,
  selected = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  testID,
  style,
}) => {
  // Determine if card should be interactive
  const isInteractive = pressable && !disabled
  
  // Handle press events
  const handlePress = () => {
    if (isInteractive && onPress) {
      onPress()
    }
  }
  
  const handleLongPress = () => {
    if (isInteractive && onLongPress) {
      onLongPress()
    }
  }
  
  // Choose component type based on interactivity
  const Component = isInteractive ? Pressable : View
  
  const cardStyles = [
    styles.card,
    styles[`card_${variant}` as keyof typeof styles],
    styles[`padding_${padding}` as keyof typeof styles],
    styles[`radius_${radius}` as keyof typeof styles],
    disabled && styles.card_disabled,
    selected && styles.card_selected,
    style,
  ]
  
  const commonProps = {
    style: cardStyles,
    testID,
  }
  
  if (isInteractive) {
    return (
      <Pressable
        {...commonProps}
        style={({ pressed }) => [
          ...cardStyles,
          pressed && styles.card_pressed,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled,
          selected,
        }}
      >
        {children}
      </Pressable>
    )
  }
  
  return (
    <View
      {...commonProps}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </View>
  )
})

const styles = StyleSheet.create({
  // Base card styles
  card: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  
  // Card variants
  card_elevated: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  card_outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  card_filled: {
    backgroundColor: '#F8F9FA',
  },
  
  card_glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  // Padding variants
  padding_none: {
    padding: 0,
  },
  
  padding_xs: {
    padding: 4,
  },
  
  padding_sm: {
    padding: 8,
  },
  
  padding_md: {
    padding: 16,
  },
  
  padding_lg: {
    padding: 20,
  },
  
  padding_xl: {
    padding: 24,
  },
  
  // Radius variants
  radius_none: {
    borderRadius: 0,
  },
  
  radius_sm: {
    borderRadius: 4,
  },
  
  radius_md: {
    borderRadius: 8,
  },
  
  radius_lg: {
    borderRadius: 12,
  },
  
  radius_xl: {
    borderRadius: 16,
  },
  
  radius_full: {
    borderRadius: 9999,
  },
  
  // Card states
  card_disabled: {
    opacity: 0.5,
  },
  
  card_selected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  
  card_pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
})

Card.displayName = 'Card'