import React from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { Heading, Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import type { SectionHeaderProps } from './section-header.types'

export const SectionHeader: React.FC<SectionHeaderProps> = observer(({
  title,
  subtitle,
  action,
  titleStyle,
  subtitleStyle,
  containerStyle,
  bottomMargin = true,
  titleSubtitleSpacing,
  accessibilityLabel
}) => {
  const { theme } = useTheme()
  const styles = createSectionHeaderStyles(theme, bottomMargin, titleSubtitleSpacing)

  return (
    <View
      style={[styles.container, containerStyle]}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.textContainer}>
        <Heading
          variant="h3"
          color="primary"
          style={[styles.title, titleStyle]}
        >
          {title}
        </Heading>

        {subtitle && (
          <Text
            variant="caption"
            color="secondary"
            style={[styles.subtitle, subtitleStyle]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {action && (
        <View style={styles.actionContainer}>
          <Button
            title={action.title}
            onPress={action.onPress}
            variant="ghost"
            size="sm"
          />
        </View>
      )}
    </View>
  )
})

SectionHeader.displayName = 'SectionHeader'

const createSectionHeaderStyles = (
  theme: any,
  bottomMargin: boolean,
  titleSubtitleSpacing?: number
) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs / 2,
    marginBottom: bottomMargin ? theme.spacing.md : 0
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  title: {
    // Title styles are handled by the Heading component
  },
  subtitle: {
    marginTop: titleSubtitleSpacing ?? theme.spacing.xs / 2
  },
  actionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  }
})