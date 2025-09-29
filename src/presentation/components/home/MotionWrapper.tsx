/**
 * MotionWrapper Component
 * 
 * Wrapper for Legend Motion to handle React 19 compatibility issues
 */

/* @jsxImportSource react */

import React from 'react'
import { Motion } from '@legendapp/motion'
import type { ViewProps } from 'react-native'

interface MotionWrapperProps extends ViewProps {
  initial?: any
  animate?: any
  transition?: any
  children: React.ReactNode
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  initial,
  animate,
  transition,
  children,
  style,
  ...props
}) => {
  // Use React.createElement to bypass JSX transform issues
  return React.createElement(
    Motion.View as any,
    {
      initial,
      animate,
      transition,
      style,
      ...props
    },
    children
  )
}