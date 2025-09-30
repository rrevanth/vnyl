/**
 * BehindTheScenesSection Component
 *
 * Behind-the-scenes information and production trivia display for media detail screen featuring:
 * - Production trivia and interesting facts
 * - Making-of information and behind-the-scenes stories
 * - Director and producer insights
 * - Filming challenges and creative decisions
 * - Enhanced visual presentation with categorized information
 */

import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface BehindTheScenesItem {
  /** Item ID */
  id: string
  /** Title/headline */
  title: string
  /** Description/content */
  description: string
  /** Category */
  category: 'production' | 'casting' | 'filming' | 'post_production' | 'creative' | 'technical' | 'anecdote'
  /** Associated person (director, actor, etc.) */
  person?: string
  /** Person role */
  personRole?: string
  /** Related image URL */
  imageUrl?: string
  /** Source of information */
  source?: string
  /** Interest level (1-5) */
  interestLevel?: number
}

export interface MakingOfInfo {
  /** Behind-the-scenes items */
  items?: BehindTheScenesItem[]
  /** Production budget breakdown */
  budgetBreakdown?: {
    category: string
    amount: number
    percentage: number
  }[]
  /** Filming timeline */
  filmingTimeline?: {
    phase: string
    startDate: string
    endDate: string
    location?: string
    description?: string
  }[]
  /** Creative decisions */
  creativeDecisions?: {
    decision: string
    reasoning: string
    alternativeConsidered?: string
    decisionMaker: string
  }[]
}

interface BehindTheScenesSectionProps {
  /** Media item */
  media: CatalogItem
  /** Behind-the-scenes information */
  makingOfInfo?: MakingOfInfo
  /** Whether behind-the-scenes data is loading */
  isLoading?: boolean
  /** Whether behind-the-scenes data is fully loaded */
  isFullyLoaded?: boolean
  /** Test ID for testing */
  testID?: string
}

/**
 * Category configuration
 */
const CATEGORY_CONFIG = {
  production: {
    icon: 'videocam' as const,
    titleKey: 'media_detail.production_stories',
    color: '#4ECDC4'
  },
  casting: {
    icon: 'people' as const,
    titleKey: 'media_detail.casting_stories',
    color: '#FF6B6B'
  },
  filming: {
    icon: 'camera' as const,
    titleKey: 'media_detail.filming_stories',
    color: '#45B7D1'
  },
  post_production: {
    icon: 'construct' as const,
    titleKey: 'media_detail.post_production_stories',
    color: '#F9CA24'
  },
  creative: {
    icon: 'bulb' as const,
    titleKey: 'media_detail.creative_decisions',
    color: '#6C5CE7'
  },
  technical: {
    icon: 'settings' as const,
    titleKey: 'media_detail.technical_challenges',
    color: '#A8E6CF'
  },
  anecdote: {
    icon: 'chatbubble' as const,
    titleKey: 'media_detail.fun_anecdotes',
    color: '#FD79A8'
  }
} as const

/**
 * Get category configuration
 */
const getCategoryConfig = (category: BehindTheScenesItem['category']) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.anecdote
}

export const BehindTheScenesSection: React.FC<BehindTheScenesSectionProps> = observer(({
  media,
  makingOfInfo,
  isLoading = false,
  isFullyLoaded = false,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // State for showing more items
  const [showAllItems, setShowAllItems] = useState(false)

  // Organize items by category and priority
  const organizedItems = useMemo(() => {
    if (!makingOfInfo?.items || makingOfInfo.items.length === 0) return null

    // Sort by interest level (highest first), then by category
    const sortedItems = [...makingOfInfo.items].sort((a, b) => {
      const aLevel = a.interestLevel || 3
      const bLevel = b.interestLevel || 3
      if (aLevel !== bLevel) return bLevel - aLevel
      return a.category.localeCompare(b.category)
    })

    // Group by category
    const categorized = sortedItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, BehindTheScenesItem[]>)

    return categorized
  }, [makingOfInfo?.items])

  // Display subset for initial view
  const displayItems = useMemo(() => {
    if (!organizedItems) return null
    if (showAllItems) return organizedItems

    // Show first 8 items across categories
    const limited: Record<string, BehindTheScenesItem[]> = {}
    let itemCount = 0
    const maxItems = 8

    for (const [category, items] of Object.entries(organizedItems)) {
      if (itemCount >= maxItems) break

      const remainingSlots = maxItems - itemCount
      limited[category] = items.slice(0, remainingSlots)
      itemCount += limited[category].length
    }

    return limited
  }, [organizedItems, showAllItems])

  // Don't render if no making-of info and not loading
  if (!makingOfInfo && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && !makingOfInfo) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('media_detail.behind_the_scenes')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('media_detail.loading_behind_scenes')}
          </Text>
        </View>
      </View>
    )
  }

  const hasItems = displayItems && Object.keys(displayItems).length > 0
  const hasTimeline = makingOfInfo?.filmingTimeline && makingOfInfo.filmingTimeline.length > 0
  const hasCreativeDecisions = makingOfInfo?.creativeDecisions && makingOfInfo.creativeDecisions.length > 0

  if (!hasItems && !hasTimeline && !hasCreativeDecisions) {
    return null
  }

  const totalItems = makingOfInfo?.items?.length || 0
  const hasMoreItems = !showAllItems && totalItems > 8

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('media_detail.behind_the_scenes')}</Text>

      {/* Behind-the-Scenes Summary */}
      {hasItems && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryContent}>
            <Ionicons
              name="film"
              size={24}
              color={theme.colors.interactive.primary}
            />
            <Text style={styles.summaryText}>
              {t('media_detail.behind_scenes_summary')} ({totalItems})
            </Text>
          </View>
        </View>
      )}

      {/* Filming Timeline */}
      {hasTimeline && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.filming_timeline')}</Text>
          <View style={styles.timelineContainer}>
            {makingOfInfo.filmingTimeline!.map((phase, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={theme.colors.interactive.primary}
                  />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelinePhase}>{phase.phase}</Text>
                  <Text style={styles.timelineDates}>
                    {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                  </Text>
                  {phase.location && (
                    <Text style={styles.timelineLocation}>{phase.location}</Text>
                  )}
                  {phase.description && (
                    <Text style={styles.timelineDescription}>{phase.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Behind-the-Scenes Stories by Category */}
      {hasItems && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.entries(displayItems!).map(([category, categoryItems]) => {
            const categoryConfig = getCategoryConfig(category as BehindTheScenesItem['category'])

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

                <View style={styles.itemsContainer}>
                  {categoryItems.map((item) => (
                    <View key={item.id} style={styles.storyItem}>
                      {item.imageUrl && (
                        <View style={styles.storyImageContainer}>
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.storyImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}

                      <View style={styles.storyContent}>
                        <View style={styles.storyHeader}>
                          <Text style={styles.storyTitle}>{item.title}</Text>
                          {(item.interestLevel || 0) >= 4 && (
                            <Ionicons
                              name="star"
                              size={16}
                              color={theme.colors.status.warning}
                            />
                          )}
                        </View>

                        <Text style={styles.storyDescription}>
                          {item.description}
                        </Text>

                        {(item.person || item.source) && (
                          <View style={styles.storyFooter}>
                            {item.person && (
                              <Text style={styles.storyPerson}>
                                {item.personRole ? `${item.personRole}: ` : ''}{item.person}
                              </Text>
                            )}
                            {item.source && (
                              <Text style={styles.storySource}>
                                {t('media_detail.source')}: {item.source}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )
          })}

          {/* Show More Button */}
          {hasMoreItems && (
            <View style={styles.showMoreContainer}>
              <Pressable
                style={styles.showMoreButton}
                onPress={() => setShowAllItems(true)}
              >
                <Text style={styles.showMoreText}>
                  {t('media_detail.show_more_behind_scenes')} ({totalItems - 8})
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
          {showAllItems && totalItems > 8 && (
            <View style={styles.showMoreContainer}>
              <Pressable
                style={styles.showMoreButton}
                onPress={() => setShowAllItems(false)}
              >
                <Text style={styles.showMoreText}>
                  {t("media_detail.show_less_behind_scenes")}
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
      )}

      {/* Creative Decisions */}
      {hasCreativeDecisions && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.creative_decisions')}</Text>
          <View style={styles.decisionsContainer}>
            {makingOfInfo.creativeDecisions!.map((decision, index) => (
              <View key={index} style={styles.decisionItem}>
                <View style={styles.decisionHeader}>
                  <Ionicons
                    name="bulb"
                    size={20}
                    color={theme.colors.interactive.primary}
                  />
                  <Text style={styles.decisionTitle}>{decision.decision}</Text>
                </View>
                <Text style={styles.decisionReasoning}>{decision.reasoning}</Text>
                {decision.alternativeConsidered && (
                  <Text style={styles.decisionAlternative}>
                    {t('media_detail.alternative_considered')}: {decision.alternativeConsidered}
                  </Text>
                )}
                <Text style={styles.decisionMaker}>
                  — {decision.decisionMaker}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('media_detail.loading_more_behind_scenes')}
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

  // Filming Timeline
  timelineContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  timelineMarker: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelinePhase: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  timelineDates: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  timelineLocation: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  timelineDescription: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '400',
    lineHeight: moderateScale(18),
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
  itemsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },

  // Story Items
  storyItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  storyImageContainer: {
    width: moderateScale(80),
    height: moderateScale(60),
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyContent: {
    flex: 1,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  storyTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  storyDescription: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: moderateScale(20),
    marginBottom: theme.spacing.sm,
  },
  storyFooter: {
    gap: theme.spacing.xs,
  },
  storyPerson: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(13),
    fontWeight: '500',
    fontStyle: 'italic',
  },
  storySource: {
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

  // Creative Decisions
  decisionsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  decisionItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  decisionTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  decisionReasoning: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: moderateScale(20),
    marginBottom: theme.spacing.sm,
  },
  decisionAlternative: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '400',
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
  decisionMaker: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    textAlign: 'right',
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

BehindTheScenesSection.displayName = 'BehindTheScenesSection'