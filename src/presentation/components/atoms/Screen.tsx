import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/src/presentation/shared/theme'
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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.heading1.fontSize,
    fontWeight: theme.typography.heading1.fontWeight,
  },
})