import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme'
import type { TextStyle } from 'react-native'

export interface SectionHeaderProps {
  title: string
  description?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = observer(({
  title,
  description
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      <Text style={styles.title as TextStyle}>{title}</Text>
      {description && (
        <Text style={styles.description as TextStyle}>{description}</Text>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg
  },
  title: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  } as TextStyle,
  description: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.caption.lineHeight
  } as TextStyle
})