import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface NavigationHeaderProps {
  title: string
  onBackPress?: () => void
  rightElement?: React.ReactNode
  showBackButton?: boolean
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  onBackPress,
  rightElement,
  showBackButton = true
}) => {
  const theme = useTheme()
  const router = useRouter()
  const styles = createStyles(theme)

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else if (router.canGoBack()) {
      router.back()
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        {/* Left Side - Back Button */}
        <View style={styles.leftContainer}>
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
                color={theme.colors.interactive.primary}
              />
            </Pressable>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Side - Optional Element */}
        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      </View>
    </SafeAreaView>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.primary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  backButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginLeft: -theme.spacing.xs // Adjust for visual alignment
  },
  backButtonPressed: {
    opacity: 0.6,
    backgroundColor: theme.colors.interactive.tertiary
  },
  title: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight as any,
    color: theme.colors.text.primary,
    textAlign: 'center'
  }
})