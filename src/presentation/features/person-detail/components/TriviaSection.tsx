/**
 * TriviaSection Component
 *
 * Trivia and interesting facts display for person detail screen featuring:
 * - Curated trivia and behind-the-scenes facts
 * - Categorized interesting information
 * - Fun facts and lesser-known details
 * - Enhanced visual presentation with icons
 * - Progressive loading with expandable content
 */

import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface TriviaItem {
  /** Trivia ID */
  id: string
  /** Trivia text */
  text: string
  /** Trivia category */
  category: 'personal' | 'career' | 'behind_scenes' | 'achievement' | 'collaboration' | 'fun_fact'
  /** Source or verification info */
  source?: string
  /** Related work or project */
  relatedWork?: string
  /** Significance or interest level (1-5) */
  interestLevel?: number
  /** Whether this is verified information */
  verified?: boolean
}

interface TriviaSectionProps {
  /** Person data */
  person: PersonCatalogItem
  /** Trivia items data */
  trivia?: TriviaItem[]
  /** Whether trivia data is loading */
  isLoading?: boolean
  /** Whether trivia data is fully loaded */
  isFullyLoaded?: boolean
  /** Test ID for testing */
  testID?: string
}

/**
 * Trivia category configuration
 */
const TRIVIA_CATEGORIES = {
  personal: {
    icon: 'person' as const,
    titleKey: 'person_detail.trivia_personal',
    color: '#FF6B6B'
  },
  career: {
    icon: 'briefcase' as const,
    titleKey: 'person_detail.trivia_career',
    color: '#4ECDC4'
  },
  behind_scenes: {
    icon: 'camera' as const,
    titleKey: 'person_detail.trivia_behind_scenes',
    color: '#45B7D1'
  },
  achievement: {
    icon: 'trophy' as const,
    titleKey: 'person_detail.trivia_achievement',
    color: '#F9CA24'
  },
  collaboration: {
    icon: 'people' as const,
    titleKey: 'person_detail.trivia_collaboration',
    color: '#6C5CE7'
  },
  fun_fact: {
    icon: 'happy' as const,
    titleKey: 'person_detail.trivia_fun_fact',
    color: '#FD79A8'
  }
} as const

/**
 * Get trivia category configuration
 */
const getTriviaCategory = (category: TriviaItem['category']) => {
  return TRIVIA_CATEGORIES[category] || TRIVIA_CATEGORIES.fun_fact
}

export const TriviaSection: React.FC<TriviaSectionProps> = observer(({
  person,
  trivia = [],
  isLoading = false,
  isFullyLoaded = false,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // State for showing more trivia
  const [showAllTrivia, setShowAllTrivia] = useState(false)

  // Organize trivia by category and priority
  const organizedTrivia = useMemo(() => {
    if (trivia.length === 0) return null

    // Sort by interest level (highest first), then by category
    const sortedTrivia = [...trivia].sort((a, b) => {
      const aLevel = a.interestLevel || 3
      const bLevel = b.interestLevel || 3
      if (aLevel !== bLevel) return bLevel - aLevel
      return a.category.localeCompare(b.category)
    })

    // Group by category
    const categorized = sortedTrivia.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, TriviaItem[]>)

    return categorized
  }, [trivia])

  // Display subset for initial view
  const displayTrivia = useMemo(() => {
    if (!organizedTrivia) return null
    if (showAllTrivia) return organizedTrivia

    // Show first 6 items across categories
    const limited: Record<string, TriviaItem[]> = {}
    let itemCount = 0
    const maxItems = 6

    for (const [category, items] of Object.entries(organizedTrivia)) {
      if (itemCount >= maxItems) break

      const remainingSlots = maxItems - itemCount
      limited[category] = items.slice(0, remainingSlots)
      itemCount += limited[category].length
    }

    return limited
  }, [organizedTrivia, showAllTrivia])

  // Don't render if no trivia and not loading
  if (trivia.length === 0 && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && trivia.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('person_detail.trivia_facts')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('person_detail.loading_trivia')}
          </Text>
        </View>
      </View>
    )
  }

  if (!displayTrivia) return null

  const hasMoreTrivia = !showAllTrivia && trivia.length > 6

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('person_detail.trivia_facts')}</Text>

      {/* Trivia Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryContent}>
          <Ionicons
            name="bulb"
            size={24}
            color={theme.colors.interactive.primary}
          />
          <Text style={styles.summaryText}>
            {t('person_detail.trivia_summary')} {trivia.length} interesting facts
          </Text>
        </View>
      </View>

      {/* Trivia by Category */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(displayTrivia).map(([category, categoryTrivia]) => {
          const categoryConfig = getTriviaCategory(category as TriviaItem['category'])

          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: `${categoryConfig.color}20` }
                ]}>
                  <Ionicons
                    name={categoryConfig.icon}
                    size={20}
                    color={categoryConfig.color}
                  />
                </View>
                <Text style={styles.categoryTitle}>
                  {t(categoryConfig.titleKey)}
                </Text>
              </View>

              <View style={styles.triviaContainer}>
                {categoryTrivia.map((item, index) => (
                  <View key={item.id} style={styles.triviaItem}>
                    <View style={styles.triviaHeader}>
                      <View style={styles.triviaIndicator}>
                        {item.verified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.colors.status.success}
                          />
                        )}
                        {(item.interestLevel || 0) >= 4 && (
                          <Ionicons
                            name="star"
                            size={14}
                            color={theme.colors.status.warning}
                            style={{ marginLeft: theme.spacing.xs }}
                          />
                        )}
                      </View>
                    </View>

                    <Text style={styles.triviaText}>{item.text}</Text>

                    {(item.source || item.relatedWork) && (
                      <View style={styles.triviaFooter}>
                        {item.relatedWork && (
                          <Text style={styles.triviaRelated}>
                            {t('person_detail.related_to')}: {item.relatedWork}
                          </Text>
                        )}
                        {item.source && (
                          <Text style={styles.triviaSource}>
                            {t('person_detail.source')}: {item.source}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        {/* Show More Button */}
        {hasMoreTrivia && (
          <View style={styles.showMoreContainer}>
            <Pressable
              style={styles.showMoreButton}
              onPress={() => setShowAllTrivia(true)}
            >
              <Text style={styles.showMoreText}>
                {t('person_detail.show_more_trivia')} ({trivia.length - 6} more)
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.interactive.primary}
              />
            </Pressable>
          </View>
        )}

        {/* Show Less Button */}
        {showAllTrivia && trivia.length > 6 && (
          <View style={styles.showMoreContainer}>
            <Pressable
              style={styles.showMoreButton}
              onPress={() => setShowAllTrivia(false)}
            >
              <Text style={styles.showMoreText}>
                {t("person_detail.show_less_trivia")}
              </Text>
              <Ionicons
                name="chevron-up"
                size={20}
                color={theme.colors.interactive.primary}
              />
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('person_detail.loading_more_trivia')}
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

  // Summary Section
  summaryContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },

  // Category Sections
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  categoryTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(18),
    fontWeight: '600',
    flex: 1,
  },
  triviaContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },

  // Trivia Items
  triviaItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  triviaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  triviaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triviaText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(15),
    fontWeight: '400',
    lineHeight: moderateScale(22),
    marginBottom: theme.spacing.sm,
  },
  triviaFooter: {
    gap: theme.spacing.xs,
  },
  triviaRelated: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(13),
    fontWeight: '500',
    fontStyle: 'italic',
  },
  triviaSource: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '400',
  },

  // Show More/Less
  showMoreContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
  },
  showMoreText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginRight: theme.spacing.xs,
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

TriviaSection.displayName = 'TriviaSection'