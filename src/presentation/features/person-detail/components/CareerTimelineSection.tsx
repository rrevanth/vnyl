/**
 * CareerTimelineSection Component
 *
 * Career timeline and milestones display for person detail screen featuring:
 * - Chronological career progression with key moments
 * - Visual timeline with milestone markers
 * - Career phases and breakthrough moments
 * - Interactive timeline navigation
 * - Professional achievements organization
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
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface CareerMilestone {
  /** Milestone ID */
  id: string
  /** Milestone year */
  year: number
  /** Milestone title */
  title: string
  /** Milestone description */
  description?: string
  /** Milestone type */
  type: 'debut' | 'breakthrough' | 'award' | 'collaboration' | 'genre_change' | 'other'
  /** Associated work/project */
  workTitle?: string
  /** Work poster URL */
  workPosterUrl?: string
  /** Significance level (1-5) */
  significance?: number
}

interface CareerTimelineSectionProps {
  /** Person data */
  person: PersonCatalogItem
  /** Career milestones data */
  milestones?: CareerMilestone[]
  /** Whether timeline data is loading */
  isLoading?: boolean
  /** Whether timeline data is fully loaded */
  isFullyLoaded?: boolean
  /** Callback when milestone work is pressed */
  onMilestoneWorkPress?: (workTitle: string, year: number) => void
  /** Test ID for testing */
  testID?: string
}

/**
 * Milestone icons for different types
 */
const getMilestoneIcon = (type: CareerMilestone['type']): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'debut': return 'play-circle'
    case 'breakthrough': return 'rocket'
    case 'award': return 'trophy'
    case 'collaboration': return 'people'
    case 'genre_change': return 'swap-horizontal'
    default: return 'star'
  }
}

/**
 * Get milestone color based on significance
 */
const getMilestoneColor = (theme: Theme, significance: number = 3): string => {
  if (significance >= 5) return theme.colors.status.success
  if (significance >= 4) return theme.colors.interactive.primary
  if (significance >= 3) return theme.colors.status.warning
  return theme.colors.text.secondary
}

/**
 * Calculate career phases from milestones
 */
const getCareerPhases = (milestones: CareerMilestone[]): {
  early: CareerMilestone[]
  established: CareerMilestone[]
  mature: CareerMilestone[]
} => {
  if (milestones.length === 0) return { early: [], established: [], mature: [] }

  const sortedMilestones = [...milestones].sort((a, b) => a.year - b.year)
  const firstYear = sortedMilestones[0].year
  const lastYear = sortedMilestones[sortedMilestones.length - 1].year
  const careerSpan = lastYear - firstYear

  const earlyEndYear = firstYear + Math.floor(careerSpan * 0.3)
  const establishedEndYear = firstYear + Math.floor(careerSpan * 0.7)

  return {
    early: sortedMilestones.filter(m => m.year <= earlyEndYear),
    established: sortedMilestones.filter(m => m.year > earlyEndYear && m.year <= establishedEndYear),
    mature: sortedMilestones.filter(m => m.year > establishedEndYear)
  }
}

export const CareerTimelineSection: React.FC<CareerTimelineSectionProps> = observer(({
  person,
  milestones = [],
  isLoading = false,
  isFullyLoaded = false,
  onMilestoneWorkPress,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize milestones by career phases
  const careerPhases = useMemo(() => getCareerPhases(milestones), [milestones])

  // Career statistics
  const careerStats = useMemo(() => {
    if (milestones.length === 0) return null

    const sortedMilestones = [...milestones].sort((a, b) => a.year - b.year)
    const firstYear = sortedMilestones[0].year
    const lastYear = sortedMilestones[sortedMilestones.length - 1].year
    const careerSpan = lastYear - firstYear + 1

    const breakthroughs = milestones.filter(m => m.type === 'breakthrough').length
    const awards = milestones.filter(m => m.type === 'award').length
    const majorMilestones = milestones.filter(m => (m.significance || 3) >= 4).length

    return {
      careerSpan,
      firstYear,
      lastYear,
      breakthroughs,
      awards,
      majorMilestones,
      totalMilestones: milestones.length
    }
  }, [milestones])

  // Don't render if no milestones and not loading
  if (milestones.length === 0 && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && milestones.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('person_detail.career_timeline')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('person_detail.loading_timeline')}
          </Text>
        </View>
      </View>
    )
  }

  if (!careerStats) return null

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('person_detail.career_timeline')}</Text>

      {/* Career Overview */}
      <View style={styles.overviewContainer}>
        <View style={styles.overviewHeader}>
          <Text style={styles.careerSpan}>
            {careerStats.firstYear} - {careerStats.lastYear}
          </Text>
          <Text style={styles.careerDuration}>
            {t("person_detail.career_years")}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{careerStats.majorMilestones}</Text>
            <Text style={styles.statLabel}>{t('person_detail.major_milestones')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{careerStats.breakthroughs}</Text>
            <Text style={styles.statLabel}>{t('person_detail.breakthroughs')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{careerStats.awards}</Text>
            <Text style={styles.statLabel}>{t('person_detail.award_milestones')}</Text>
          </View>
        </View>
      </View>

      {/* Career Phases Timeline */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Early Career */}
        {careerPhases.early.length > 0 && (
          <View style={styles.phaseSection}>
            <Text style={styles.phaseTitle}>{t('person_detail.early_career')}</Text>
            <View style={styles.milestonesContainer}>
              {careerPhases.early.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={styles.timelineColumn}>
                    <View style={styles.yearContainer}>
                      <Text style={styles.milestoneYear}>{milestone.year}</Text>
                    </View>
                    <View style={[
                      styles.milestoneMarker,
                      { backgroundColor: getMilestoneColor(theme, milestone.significance) }
                    ]}>
                      <Ionicons
                        name={getMilestoneIcon(milestone.type)}
                        size={16}
                        color={theme.colors.text.onColor}
                      />
                    </View>
                    {index < careerPhases.early.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    {milestone.description && (
                      <Text style={styles.milestoneDescription}>
                        {milestone.description}
                      </Text>
                    )}
                    {milestone.workTitle && (
                      <Text
                        style={styles.milestoneWork}
                        onPress={() => onMilestoneWorkPress?.(milestone.workTitle!, milestone.year)}
                      >
                        {t('person_detail.in_work')}: {milestone.workTitle}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Established Career */}
        {careerPhases.established.length > 0 && (
          <View style={styles.phaseSection}>
            <Text style={styles.phaseTitle}>{t('person_detail.established_career')}</Text>
            <View style={styles.milestonesContainer}>
              {careerPhases.established.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={styles.timelineColumn}>
                    <View style={styles.yearContainer}>
                      <Text style={styles.milestoneYear}>{milestone.year}</Text>
                    </View>
                    <View style={[
                      styles.milestoneMarker,
                      { backgroundColor: getMilestoneColor(theme, milestone.significance) }
                    ]}>
                      <Ionicons
                        name={getMilestoneIcon(milestone.type)}
                        size={16}
                        color={theme.colors.text.onColor}
                      />
                    </View>
                    {index < careerPhases.established.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    {milestone.description && (
                      <Text style={styles.milestoneDescription}>
                        {milestone.description}
                      </Text>
                    )}
                    {milestone.workTitle && (
                      <Text
                        style={styles.milestoneWork}
                        onPress={() => onMilestoneWorkPress?.(milestone.workTitle!, milestone.year)}
                      >
                        {t('person_detail.in_work')}: {milestone.workTitle}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mature Career */}
        {careerPhases.mature.length > 0 && (
          <View style={styles.phaseSection}>
            <Text style={styles.phaseTitle}>{t('person_detail.mature_career')}</Text>
            <View style={styles.milestonesContainer}>
              {careerPhases.mature.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={styles.timelineColumn}>
                    <View style={styles.yearContainer}>
                      <Text style={styles.milestoneYear}>{milestone.year}</Text>
                    </View>
                    <View style={[
                      styles.milestoneMarker,
                      { backgroundColor: getMilestoneColor(theme, milestone.significance) }
                    ]}>
                      <Ionicons
                        name={getMilestoneIcon(milestone.type)}
                        size={16}
                        color={theme.colors.text.onColor}
                      />
                    </View>
                    {index < careerPhases.mature.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    {milestone.description && (
                      <Text style={styles.milestoneDescription}>
                        {milestone.description}
                      </Text>
                    )}
                    {milestone.workTitle && (
                      <Text
                        style={styles.milestoneWork}
                        onPress={() => onMilestoneWorkPress?.(milestone.workTitle!, milestone.year)}
                      >
                        {t('person_detail.in_work')}: {milestone.workTitle}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('person_detail.loading_more_timeline')}
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

  // Career Overview
  overviewContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  careerSpan: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(28),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  careerDuration: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(24),
    fontWeight: '700',
    lineHeight: moderateScale(30),
  },
  statLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },

  // Career Phases
  phaseSection: {
    marginBottom: theme.spacing.xl,
  },
  phaseTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    letterSpacing: -0.2,
  },
  milestonesContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },

  // Timeline Items
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  timelineColumn: {
    width: moderateScale(80),
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  yearContainer: {
    marginBottom: theme.spacing.xs,
  },
  milestoneYear: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  milestoneMarker: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border.primary,
    marginTop: theme.spacing.sm,
  },

  // Milestone Content
  milestoneContent: {
    flex: 1,
    paddingTop: theme.spacing.xs,
  },
  milestoneTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  milestoneDescription: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: moderateScale(20),
    marginBottom: theme.spacing.xs,
  },
  milestoneWork: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontStyle: 'italic',
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

CareerTimelineSection.displayName = 'CareerTimelineSection'