/**
 * LazyContainer Component
 * 
 * Wrapper component that provides lazy loading capabilities for child components
 * Supports viewport detection, intersection observation, and performance monitoring
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'

interface LazyContainerProps {
  children: React.ReactNode
  /** Whether this container is currently visible in viewport */
  isVisible?: boolean
  /** Callback when container becomes visible */
  onVisible?: () => void
  /** Callback when container becomes invisible */
  onInvisible?: () => void
  /** Minimum time to stay rendered after becoming invisible (ms) */
  unloadDelay?: number
  /** Whether to render placeholder when not visible */
  renderPlaceholder?: boolean
  /** Custom placeholder component */
  placeholder?: React.ReactNode
  /** Loading state */
  isLoading?: boolean
  /** Height of the container for placeholder sizing */
  height?: number
  /** Animation configuration */
  animationConfig?: {
    duration: number
    type: 'fade' | 'scale' | 'slide'
  }
}

const LazyContainerImpl: React.FC<LazyContainerProps> = ({
  children,
  isVisible = true,
  onVisible,
  onInvisible,
  unloadDelay = 1000,
  renderPlaceholder = true,
  placeholder,
  isLoading = false,
  height,
  animationConfig = { duration: 200, type: 'fade' }
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, height)
  
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [, setHasBeenVisible] = useState(isVisible)
  const unloadTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const wasVisibleRef = useRef(isVisible)

  // Handle visibility changes
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      // Became visible
      if (unloadTimeoutRef.current) {
        clearTimeout(unloadTimeoutRef.current)
        unloadTimeoutRef.current = undefined
      }
      setShouldRender(true)
      setHasBeenVisible(true)
      onVisible?.()
    } else if (!isVisible && wasVisibleRef.current) {
      // Became invisible
      onInvisible?.()
      
      if (unloadDelay > 0) {
        unloadTimeoutRef.current = setTimeout(() => {
          setShouldRender(false)
        }, unloadDelay) as NodeJS.Timeout
      } else {
        setShouldRender(false)
      }
    }
    
    wasVisibleRef.current = isVisible
  }, [isVisible, onVisible, onInvisible, unloadDelay])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (unloadTimeoutRef.current) {
        clearTimeout(unloadTimeoutRef.current)
      }
    }
  }, [])

  const renderContent = useCallback(() => {
    if (shouldRender) {
      return children
    }

    if (renderPlaceholder) {
      return placeholder || <View style={styles.placeholder} />
    }

    return null
  }, [shouldRender, children, renderPlaceholder, placeholder, styles.placeholder])

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  )
}

export const LazyContainer = React.memo(observer(LazyContainerImpl))

const createStyles = (theme: Theme, height?: number) => StyleSheet.create({
  container: {
    ...(height && { height })
  },
  placeholder: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
    height: height || 200,
    width: '100%',
    opacity: 0.3
  }
})