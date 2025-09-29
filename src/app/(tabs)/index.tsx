import React from 'react'
import { observer } from '@legendapp/state/react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/src/presentation/shared/theme'
import { HomeScreenContent } from '@/src/presentation/components/home/HomeScreenContent'
import { StyleSheet } from 'react-native'
import type { Theme } from '@/src/presentation/shared/theme/types'

export default observer(function HomeScreen() {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HomeScreenContent />
    </SafeAreaView>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
})