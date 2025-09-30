/**
 * DetailInfoSection
 *
 * Organism component for information sections in detail screens.
 * Displays structured information about media or person with consistent layout.
 *
 * Used for biographical info, technical details, cast info, etc.
 */

import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'

import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { SectionHeader } from '@/src/presentation/shared/components/molecules/SectionHeader'
import { ExpandableText } from '@/src/presentation/shared/components/molecules/ExpandableText'
import { MetadataChip } from '@/src/presentation/shared/components/atoms/MetadataChip'
import { PosterCard } from '@/src/presentation/shared/components/molecules/PosterCard'
import { ProgressIndicator } from '@/src/presentation/shared/components/atoms/ProgressIndicator'

export interface InfoField {
  /**
   * Field label
   */
  label: string

  /**
   * Field value (string or array of strings)
   */
  value: string | string[]

  /**
   * Field type for formatting
   */
  type?: 'text' | 'list' | 'chips' | 'expandable'

  /**
   * Whether field is expandable (for long content)
   */
  expandable?: boolean
}

export interface KnownForItem {
  /**
   * Item ID
   */
  id: string

  /**
   * Item title
   */
  title: string

  /**
   * Poster image URL
   */
  posterUrl?: string

  /**
   * Media type
   */
  mediaType?: string

  /**
   * Release year
   */
  year?: string
}

export interface DetailInfoSectionProps {
  /**
   * Section title
   */
  title: string

  /**
   * Section description
   */
  description?: string

  /**
   * Main biography or overview text
   */
  biography?: string

  /**
   * Whether biography is expanded
   */
  biographyExpanded?: boolean

  /**
   * Handler for biography expand/collapse
   */
  onBiographyToggle?: (expanded: boolean) => void

  /**
   * Information fields to display
   */
  fields: InfoField[]

  /**
   * Known for items (for person details)
   */
  knownFor?: KnownForItem[]

  /**
   * Handler for known for item press
   */
  onKnownForPress?: (item: KnownForItem) => void

  /**
   * Whether content is loading
   */
  loading?: boolean

  /**
   * Loading message
   */
  loadingMessage?: string

  /**
   * Whether content is fully loaded
   */
  isFullyLoaded?: boolean

  /**
   * Test ID for testing
   */
  testID?: string
}

const DetailInfoSectionImpl: React.FC<DetailInfoSectionProps> = ({
  title,
  description,
  biography,
  biographyExpanded = false,
  onBiographyToggle,
  fields,
  knownFor = [],
  onKnownForPress,
  loading = false,
  loadingMessage,
  isFullyLoaded = false,
  testID
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const renderField = (field: InfoField, index: number) => {
    const { label, value, type = 'text' } = field // eslint-disable-line @typescript-eslint/no-unused-vars

    if (!value || (Array.isArray(value) && value.length === 0)) {
      return null // Skip empty fields
    }

    return (
      <View key={index} style={styles.field}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {renderFieldValue(field)}
      </View>
    )
  }

  const renderFieldValue = (field: InfoField) => {
    const { value, type = 'text' } = field

    if (Array.isArray(value)) {
      switch (type) {
        case 'chips':
          return (
            <View style={styles.chipsContainer}>
              {value.map((item, idx) => (
                <View key={idx} style={styles.chip}>
                  <MetadataChip text={item} size="sm" />
                </View>
              ))}
            </View>
          )
        case 'list':
          return (
            <View style={styles.listContainer}>
              {value.map((item, idx) => (
                <Text key={idx} style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )
        default:
          return (
            <Text style={styles.fieldValue}>
              {value.join(', ')}
            </Text>
          )
      }
    }

    if (type === 'expandable') {
      return (
        <ExpandableText
          text={value}
          variant="body"
        />
      )
    }

    return (
      <Text style={styles.fieldValue}>
        {value}
      </Text>
    )
  }

  if (loading && !isFullyLoaded) {
    return (
      <View style={styles.container} testID={testID}>
        <ProgressIndicator
          message={loadingMessage || 'Loading information...'}
          variant="section"
        />
      </View>
    )
  }

  return (
    <View style={styles.container} testID={testID}>
      <SectionHeader
        title={title}
        subtitle={description}
        size="md"
      />

      {/* Biography/Overview */}
      {biography && (
        <View style={styles.biographySection}>
          <ExpandableText
            text={biography}
            expanded={biographyExpanded}
            onToggle={onBiographyToggle}
            variant="body"
          />
        </View>
      )}

      {/* Information Fields */}
      {fields.length > 0 && (
        <View style={styles.fieldsSection}>
          {fields.map(renderField)}
        </View>
      )}

      {/* Known For Section */}
      {knownFor.length > 0 && (
        <View style={styles.knownForSection}>
          <Text style={styles.knownForTitle}>Known For</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.knownForScroll}
            contentContainerStyle={styles.knownForContent}
          >
            {knownFor.map((item, index) => (
              <View key={item.id} style={styles.knownForItem}>
                <PosterCard
                  imageUrl={item.posterUrl}
                  aspectRatio="poster"
                  size="sm"
                  onPress={() => onKnownForPress?.(item)}
                  accessibilityLabel={item.title}
                />
                <Text style={styles.knownForItemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.year && (
                  <Text style={styles.knownForItemYear}>
                    {item.year}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

export const DetailInfoSection = React.memo(observer(DetailInfoSectionImpl))

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
  },
  biographySection: {
    marginBottom: theme.spacing.lg,
  },
  fieldsSection: {
    marginBottom: theme.spacing.lg,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  fieldValue: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.text.secondary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  listContainer: {
    paddingLeft: theme.spacing.sm,
  },
  listItem: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs / 2,
  },
  knownForSection: {
    marginBottom: theme.spacing.lg,
  },
  knownForTitle: {
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  knownForScroll: {
    marginHorizontal: -theme.spacing.md, // Extend to screen edges
  },
  knownForContent: {
    paddingHorizontal: theme.spacing.md,
  },
  knownForItem: {
    width: moderateScale(100),
    marginRight: theme.spacing.sm,
  },
  knownForItemTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    lineHeight: moderateScale(16),
  },
  knownForItemYear: {
    fontSize: moderateScale(11),
    fontWeight: '400',
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs / 2,
  },
})