import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import type { ViewStyle, TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface NavigationHeaderProps {
  title: string
  showBackButton?: boolean
  onBackPress?: () => void
  rightElement?: React.ReactNode
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = observer(({
  title,
  showBackButton = false,
  onBackPress,
  rightElement
}) => {
  const theme = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const styles = createStyles(theme, insets.top)

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed
              ]}
              onPress={handleBackPress}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={theme.colors.text.primary}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {rightElement}
        </View>
      </View>
    </View>
  )
})

interface HeaderStyles {
  container: ViewStyle
  header: ViewStyle
  leftSection: ViewStyle
  centerSection: ViewStyle
  rightSection: ViewStyle
  backButton: ViewStyle
  backButtonPressed: ViewStyle
  title: TextStyle
}

const createStyles = (theme: Theme, topInset: number): HeaderStyles => ({
  container: {
    backgroundColor: theme.colors.background.primary,
    paddingTop: topInset,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.primary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm
  },
  backButtonPressed: {
    opacity: 0.7,
    backgroundColor: theme.colors.background.secondary
  },
  title: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.text.primary,
    textAlign: 'center'
  }
})