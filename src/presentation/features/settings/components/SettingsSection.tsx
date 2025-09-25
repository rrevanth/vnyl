import React from 'react'
import { View, Text, StyleSheet, type TextStyle } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'

interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export const SettingsSection: React.FC<SettingsSectionProps> = observer(({
  title,
  description,
  children
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  header: {
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md
  },
  title: {
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  } as TextStyle,
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  },
  content: {
    gap: theme.spacing.xs
  }
})