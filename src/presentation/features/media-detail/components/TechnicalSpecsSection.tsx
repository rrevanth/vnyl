/**
 * TechnicalSpecsSection Component
 *
 * Technical specifications display for media detail screen featuring:
 * - Video quality information (resolution, HDR, frame rate)
 * - Audio format specifications (Dolby Atmos, DTS, channels)
 * - Runtime details with precise timing information
 * - Content advisory information and ratings explanations
 * - Enhanced visual presentation with technical icons
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface VideoSpecs {
  /** Resolution (e.g., "4K", "1080p", "720p") */
  resolution?: string
  /** Aspect ratio (e.g., "16:9", "2.35:1") */
  aspectRatio?: string
  /** Frame rate (e.g., "24 fps", "60 fps") */
  frameRate?: string
  /** HDR format (e.g., "HDR10", "Dolby Vision") */
  hdrFormat?: string
  /** Color space (e.g., "Rec. 2020", "DCI-P3") */
  colorSpace?: string
  /** Bitrate */
  bitrate?: string
}

export interface AudioSpecs {
  /** Audio format (e.g., "Dolby Atmos", "DTS-X") */
  format?: string
  /** Channel configuration (e.g., "5.1", "7.1", "Stereo") */
  channels?: string
  /** Sample rate (e.g., "48 kHz", "96 kHz") */
  sampleRate?: string
  /** Bitrate */
  bitrate?: string
  /** Language options */
  languages?: string[]
}

export interface ContentAdvisory {
  /** MPAA rating (e.g., "PG-13", "R") */
  mpaaRating?: string
  /** TV rating (e.g., "TV-MA", "TV-PG") */
  tvRating?: string
  /** Content warnings */
  contentWarnings?: string[]
  /** Rating reason */
  ratingReason?: string
  /** Age recommendation */
  ageRecommendation?: number
}

export interface TechnicalSpecs {
  /** Video specifications */
  video?: VideoSpecs
  /** Audio specifications */
  audio?: AudioSpecs
  /** Runtime in minutes */
  runtime?: number
  /** Detailed runtime breakdown for TV series */
  runtimeDetails?: {
    averageEpisodeLength?: number
    totalSeasons?: number
    totalEpisodes?: number
  }
  /** Content advisory information */
  contentAdvisory?: ContentAdvisory
  /** File size (for digital releases) */
  fileSize?: string
  /** Subtitle languages */
  subtitleLanguages?: string[]
}

interface TechnicalSpecsSectionProps {
  /** Media item */
  media: CatalogItem
  /** Technical specifications data */
  technicalSpecs?: TechnicalSpecs
  /** Whether specs are loading */
  isLoading?: boolean
  /** Whether specs are fully loaded */
  isFullyLoaded?: boolean
  /** Test ID for testing */
  testID?: string
}

/**
 * Format runtime display
 */
const formatRuntime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Get rating color based on MPAA rating
 */
const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'G': return '#4CAF50'
    case 'PG': return '#FF9800'
    case 'PG-13': return '#FF5722'
    case 'R': return '#F44336'
    case 'NC-17': return '#9C27B0'
    default: return '#757575'
  }
}

/**
 * Get TV rating color
 */
const getTVRatingColor = (rating: string): string => {
  switch (rating) {
    case 'TV-Y':
    case 'TV-G': return '#4CAF50'
    case 'TV-PG': return '#FF9800'
    case 'TV-14': return '#FF5722'
    case 'TV-MA': return '#F44336'
    default: return '#757575'
  }
}

export const TechnicalSpecsSection: React.FC<TechnicalSpecsSectionProps> = observer(({
  media,
  technicalSpecs,
  isLoading = false,
  isFullyLoaded = false,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize specs into categories
  const specCategories = useMemo(() => {
    if (!technicalSpecs) return null

    const categories: {
      title: string
      icon: keyof typeof Ionicons.glyphMap
      items: { label: string; value: string }[]
    }[] = []

    // Video Specifications
    if (technicalSpecs.video) {
      const videoItems: { label: string; value: string }[] = []

      if (technicalSpecs.video.resolution) {
        videoItems.push({
          label: t('media_detail.resolution'),
          value: technicalSpecs.video.resolution
        })
      }

      if (technicalSpecs.video.aspectRatio) {
        videoItems.push({
          label: t('media_detail.aspect_ratio'),
          value: technicalSpecs.video.aspectRatio
        })
      }

      if (technicalSpecs.video.frameRate) {
        videoItems.push({
          label: t('media_detail.frame_rate'),
          value: technicalSpecs.video.frameRate
        })
      }

      if (technicalSpecs.video.hdrFormat) {
        videoItems.push({
          label: t('media_detail.hdr_format'),
          value: technicalSpecs.video.hdrFormat
        })
      }

      if (technicalSpecs.video.colorSpace) {
        videoItems.push({
          label: t('media_detail.color_space'),
          value: technicalSpecs.video.colorSpace
        })
      }

      if (videoItems.length > 0) {
        categories.push({
          title: t('media_detail.video_specs'),
          icon: 'videocam',
          items: videoItems
        })
      }
    }

    // Audio Specifications
    if (technicalSpecs.audio) {
      const audioItems: { label: string; value: string }[] = []

      if (technicalSpecs.audio.format) {
        audioItems.push({
          label: t('media_detail.audio_format'),
          value: technicalSpecs.audio.format
        })
      }

      if (technicalSpecs.audio.channels) {
        audioItems.push({
          label: t('media_detail.audio_channels'),
          value: technicalSpecs.audio.channels
        })
      }

      if (technicalSpecs.audio.sampleRate) {
        audioItems.push({
          label: t('media_detail.sample_rate'),
          value: technicalSpecs.audio.sampleRate
        })
      }

      if (technicalSpecs.audio.languages && technicalSpecs.audio.languages.length > 0) {
        audioItems.push({
          label: t('media_detail.audio_languages'),
          value: technicalSpecs.audio.languages.join(', ')
        })
      }

      if (audioItems.length > 0) {
        categories.push({
          title: t('media_detail.audio_specs'),
          icon: 'volume-high',
          items: audioItems
        })
      }
    }

    // Runtime Information
    const runtimeItems: { label: string; value: string }[] = []

    if (technicalSpecs.runtime) {
      runtimeItems.push({
        label: t('media_detail.runtime'),
        value: formatRuntime(technicalSpecs.runtime)
      })
    }

    if (technicalSpecs.runtimeDetails?.averageEpisodeLength) {
      runtimeItems.push({
        label: t('media_detail.avg_episode_length'),
        value: formatRuntime(technicalSpecs.runtimeDetails.averageEpisodeLength)
      })
    }

    if (technicalSpecs.runtimeDetails?.totalSeasons) {
      runtimeItems.push({
        label: t('media_detail.total_seasons'),
        value: technicalSpecs.runtimeDetails.totalSeasons.toString()
      })
    }

    if (technicalSpecs.runtimeDetails?.totalEpisodes) {
      runtimeItems.push({
        label: t('media_detail.total_episodes'),
        value: technicalSpecs.runtimeDetails.totalEpisodes.toString()
      })
    }

    if (runtimeItems.length > 0) {
      categories.push({
        title: t('media_detail.runtime_info'),
        icon: 'time',
        items: runtimeItems
      })
    }

    // Other Technical Details
    const otherItems: { label: string; value: string }[] = []

    if (technicalSpecs.fileSize) {
      otherItems.push({
        label: t('media_detail.file_size'),
        value: technicalSpecs.fileSize
      })
    }

    if (technicalSpecs.subtitleLanguages && technicalSpecs.subtitleLanguages.length > 0) {
      otherItems.push({
        label: t('media_detail.subtitle_languages'),
        value: technicalSpecs.subtitleLanguages.join(', ')
      })
    }

    if (otherItems.length > 0) {
      categories.push({
        title: t('media_detail.other_specs'),
        icon: 'information-circle',
        items: otherItems
      })
    }

    return categories.length > 0 ? categories : null
  }, [technicalSpecs, t])

  // Don't render if no specs and not loading
  if (!technicalSpecs && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && !technicalSpecs) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('media_detail.technical_specs')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('media_detail.loading_specs')}
          </Text>
        </View>
      </View>
    )
  }

  const hasContentAdvisory = technicalSpecs?.contentAdvisory
  const hasSpecs = specCategories && specCategories.length > 0

  if (!hasContentAdvisory && !hasSpecs) {
    return null
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('media_detail.technical_specs')}</Text>

      {/* Content Advisory */}
      {hasContentAdvisory && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.content_advisory')}</Text>
          <View style={styles.advisoryContainer}>
            <View style={styles.ratingsRow}>
              {technicalSpecs.contentAdvisory?.mpaaRating && (
                <View style={[
                  styles.ratingBadge,
                  { backgroundColor: getRatingColor(technicalSpecs.contentAdvisory?.mpaaRating) + '20' }
                ]}>
                  <Text style={[
                    styles.ratingText,
                    { color: getRatingColor(technicalSpecs.contentAdvisory?.mpaaRating) }
                  ]}>
                    {technicalSpecs.contentAdvisory?.mpaaRating}
                  </Text>
                </View>
              )}

              {technicalSpecs.contentAdvisory?.tvRating && (
                <View style={[
                  styles.ratingBadge,
                  { backgroundColor: getTVRatingColor(technicalSpecs.contentAdvisory?.tvRating) + '20' }
                ]}>
                  <Text style={[
                    styles.ratingText,
                    { color: getTVRatingColor(technicalSpecs.contentAdvisory?.tvRating) }
                  ]}>
                    {technicalSpecs.contentAdvisory?.tvRating}
                  </Text>
                </View>
              )}

              {technicalSpecs.contentAdvisory?.ageRecommendation && (
                <View style={styles.ageBadge}>
                  <Text style={styles.ageText}>
                    {t("media_detail.age_plus")}
                  </Text>
                </View>
              )}
            </View>

            {technicalSpecs.contentAdvisory?.ratingReason && (
              <Text style={styles.ratingReason}>
                {technicalSpecs.contentAdvisory?.ratingReason}
              </Text>
            )}

            {technicalSpecs.contentAdvisory?.contentWarnings &&
             technicalSpecs.contentAdvisory?.contentWarnings.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={styles.warningsTitle}>{t('media_detail.content_warnings')}</Text>
                <View style={styles.warningsList}>
                  {technicalSpecs.contentAdvisory?.contentWarnings.map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <Ionicons
                        name="warning"
                        size={14}
                        color={theme.colors.status.warning}
                      />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Technical Specifications */}
      {hasSpecs && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {specCategories!.map((category, categoryIndex) => (
            <View key={categoryIndex} style={styles.specCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={theme.colors.interactive.primary}
                />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </View>

              <View style={styles.specsContainer}>
                {category.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.specItem}>
                    <Text style={styles.specLabel}>{item.label}</Text>
                    <Text style={styles.specValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('media_detail.loading_more_specs')}
          </Text>
        </View>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(24),
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: theme.spacing.md,
  },

  // Subsections
  subsection: {
    marginBottom: theme.spacing.lg,
  },
  subsectionTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },

  // Content Advisory
  advisoryContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  ratingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  ratingBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  ratingText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  ageBadge: {
    backgroundColor: theme.colors.text.secondary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  ageText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  ratingReason: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    lineHeight: moderateScale(20),
    marginBottom: theme.spacing.sm,
  },
  warningsContainer: {
    marginTop: theme.spacing.sm,
  },
  warningsTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  warningsList: {
    gap: theme.spacing.xs,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
    flex: 1,
  },

  // Technical Specifications
  specCategory: {
    marginBottom: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  specsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  specLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    flex: 1,
  },
  specValue: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },

  // Loading States
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  progressText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
})

TechnicalSpecsSection.displayName = 'TechnicalSpecsSection'