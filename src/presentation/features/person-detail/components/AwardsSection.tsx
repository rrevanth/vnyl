/**
 * AwardsSection Component
 *
 * Professional awards and nominations display for person detail screen featuring:
 * - Emmy, Oscar, Golden Globe awards with proper categorization
 * - Nomination vs Win status with visual indicators
 * - Award timeline organization by year
 * - Enhanced accessibility and responsive layout
 * - Progressive loading with graceful degradation
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

export interface Award {
  /** Award ID */
  id: string
  /** Award name (e.g., "Academy Award", "Emmy Award") */
  name: string
  /** Award category (e.g., "Best Actor", "Outstanding Drama Series") */
  category: string
  /** Award year */
  year: number
  /** Whether this was a win or nomination */
  isWin: boolean
  /** Associated work/project title */
  workTitle?: string
  /** Award organization (e.g., "Academy of Motion Picture Arts and Sciences") */
  organization?: string
  /** Award ceremony name (e.g., "92nd Academy Awards") */
  ceremony?: string
}

interface AwardsSectionProps {
  /** Person data */
  person: PersonCatalogItem
  /** Awards data */
  awards?: Award[]
  /** Whether awards data is loading */
  isLoading?: boolean
  /** Whether awards data is fully loaded */
  isFullyLoaded?: boolean
  /** Test ID for testing */
  testID?: string
}

/**
 * Award type categories for better organization
 */
const AWARD_CATEGORIES = {
  MAJOR: ['Academy Award', 'Emmy Award', 'Golden Globe Award', 'BAFTA Award', 'SAG Award'],
  FILM: ['Critics Choice Award', 'Independent Spirit Award', 'Cannes Film Festival'],
  TV: ['People\'s Choice Award', 'Teen Choice Award', 'MTV Movie & TV Award'],
  OTHER: [] // Catch-all for other awards
} as const

/**
 * Award icons for different types
 */
const getAwardIcon = (awardName: string): keyof typeof Ionicons.glyphMap => {
  if (awardName.includes('Academy') || awardName.includes('Oscar')) return 'trophy'
  if (awardName.includes('Emmy')) return 'tv'
  if (awardName.includes('Golden Globe')) return 'globe'
  if (awardName.includes('BAFTA')) return 'film'
  if (awardName.includes('SAG')) return 'people'
  return 'star'
}

/**
 * Get award category for organization
 */
const getAwardCategory = (awardName: string): 'MAJOR' | 'FILM' | 'TV' | 'OTHER' => {
  if (AWARD_CATEGORIES.MAJOR.some(major => awardName.includes(major.split(' ')[0]))) return 'MAJOR'
  if (AWARD_CATEGORIES.FILM.some(film => awardName.includes(film.split(' ')[0]))) return 'FILM'
  if (AWARD_CATEGORIES.TV.some(tv => awardName.includes(tv.split(' ')[0]))) return 'TV'
  return 'OTHER'
}

export const AwardsSection: React.FC<AwardsSectionProps> = observer(({
  person,
  awards = [],
  isLoading = false,
  isFullyLoaded = false,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize awards by category and year
  const organizedAwards = useMemo(() => {
    if (awards.length === 0) return null

    // Group by category
    const categorized = awards.reduce((acc, award) => {
      const category = getAwardCategory(award.name)
      if (!acc[category]) acc[category] = []
      acc[category].push(award)
      return acc
    }, {} as Record<string, Award[]>)

    // Sort each category by year (most recent first)
    Object.keys(categorized).forEach(category => {
      categorized[category].sort((a, b) => b.year - a.year)
    })

    return categorized
  }, [awards])

  // Awards summary statistics
  const awardStats = useMemo(() => {
    const wins = awards.filter(award => award.isWin).length
    const nominations = awards.filter(award => !award.isWin).length
    const majorWins = awards.filter(award =>
      award.isWin && getAwardCategory(award.name) === 'MAJOR'
    ).length

    return { wins, nominations, majorWins, total: awards.length }
  }, [awards])

  // Don't render if no awards and not loading
  if (awards.length === 0 && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && awards.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('person_detail.awards_nominations')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('person_detail.loading_awards')}
          </Text>
        </View>
      </View>
    )
  }

  if (!organizedAwards) return null

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('person_detail.awards_nominations')}</Text>

      {/* Awards Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{awardStats.wins}</Text>
            <Text style={styles.statLabel}>{t('person_detail.wins')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{awardStats.nominations}</Text>
            <Text style={styles.statLabel}>{t('person_detail.nominations')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{awardStats.majorWins}</Text>
            <Text style={styles.statLabel}>{t('person_detail.major_awards')}</Text>
          </View>
        </View>
      </View>

      {/* Awards by Category */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(organizedAwards).map(([category, categoryAwards]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {t(`person_detail.award_category_${category.toLowerCase()}`)}
            </Text>
            <View style={styles.awardsContainer}>
              {categoryAwards.map((award, index) => (
                <View key={award.id || index} style={styles.awardItem}>
                  <View style={styles.awardIconContainer}>
                    <Ionicons
                      name={getAwardIcon(award.name)}
                      size={24}
                      color={award.isWin ?
                        theme.colors.status.warning :
                        theme.colors.text.secondary
                      }
                    />
                  </View>

                  <View style={styles.awardContent}>
                    <View style={styles.awardHeader}>
                      <Text style={styles.awardName}>{award.name}</Text>
                      <View style={[
                        styles.statusBadge,
                        award.isWin ? styles.winBadge : styles.nominationBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          award.isWin ? styles.winText : styles.nominationText
                        ]}>
                          {award.isWin ? t('person_detail.win') : t('person_detail.nomination')}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.awardCategory}>{award.category}</Text>

                    {award.workTitle && (
                      <Text style={styles.awardWork}>
                        {t('person_detail.for_work')}: {award.workTitle}
                      </Text>
                    )}

                    <View style={styles.awardMeta}>
                      <Text style={styles.awardYear}>{award.year}</Text>
                      {award.ceremony && (
                        <Text style={styles.awardCeremony}>{award.ceremony}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('person_detail.loading_more_awards')}
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

  // Awards Summary
  summaryContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(28),
    fontWeight: '700',
    lineHeight: moderateScale(34),
  },
  statLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },

  // Category Sections
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(20),
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    letterSpacing: -0.2,
  },
  awardsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },

  // Award Items
  awardItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  awardIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  awardContent: {
    flex: 1,
  },
  awardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  awardName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm,
  },

  // Status Badges
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.sm,
  },
  winBadge: {
    backgroundColor: `${theme.colors.status.warning}20`,
  },
  nominationBadge: {
    backgroundColor: `${theme.colors.text.secondary}20`,
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  winText: {
    color: theme.colors.status.warning,
  },
  nominationText: {
    color: theme.colors.text.secondary,
  },

  // Award Details
  awardCategory: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(15),
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  awardWork: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '400',
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  awardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awardYear: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  awardCeremony: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '400',
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

AwardsSection.displayName = 'AwardsSection'