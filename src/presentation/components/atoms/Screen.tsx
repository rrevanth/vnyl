import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { NavigationHeader } from './NavigationHeader'

interface ScreenProps {
  title: string
  showBackButton?: boolean
  onBackPress?: () => void
  rightElement?: React.ReactNode
}

export const Screen: React.FC<ScreenProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightElement
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader
        title={title}
        showBackButton={showBackButton}
        onBackPress={onBackPress}
        rightElement={rightElement}
      />
      <View style={styles.content}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading1.fontSize,
    fontWeight: theme.typography.heading1.fontWeight,
  } as TextStyle,
})