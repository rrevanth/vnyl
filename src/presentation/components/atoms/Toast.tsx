import React, { useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  visible: boolean
  duration?: number
  onHide?: () => void
}

/**
 * Toast component for non-intrusive notifications
 * 
 * @example
 * ```tsx
 * <Toast
 *   message="Settings saved successfully"
 *   type="success"
 *   visible={showToast}
 *   onHide={() => setShowToast(false)}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = observer(({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onHide
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, type)
  const translateY = useRef(new Animated.Value(100)).current
  const opacity = useRef(new Animated.Value(0)).current

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      onHide?.()
    })
  }, [translateY, opacity, onHide])

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start()

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      hideToast()
    }
  }, [visible, duration, hideToast, translateY, opacity])

  if (!visible) {
    return null
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            transform: [{ translateY }],
            opacity
          }
        ]}
      >
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  )
})

interface ToastStyles {
  container: ViewStyle
  toast: ViewStyle
  message: TextStyle
}

const createStyles = (theme: Theme, type: 'success' | 'error' | 'info'): ToastStyles => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.status?.success || '#4CAF50'
      case 'error':
        return theme.colors.status?.error || '#F44336'
      case 'info':
      default:
        return theme.colors.interactive.primary
    }
  }

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 100,
      left: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 9999,
      alignItems: 'center'
    },
    toast: {
      backgroundColor: getBackgroundColor(),
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      maxWidth: Dimensions.get('window').width - (theme.spacing.md * 2),
      ...theme.shadows.md
    },
    message: {
      color: theme.colors.text.onColor,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as TextStyle['fontWeight'],
      textAlign: 'center'
    }
  })
}