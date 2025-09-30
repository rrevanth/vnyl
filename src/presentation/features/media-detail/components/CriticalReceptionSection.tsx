/**
 * CriticalReceptionSection Component
 *
 * Critical reception and reviews display for media detail screen featuring:
 * - Aggregated review scores from multiple sources
 * - Critical consensus and audience reception
 * - Professional critic quotes and highlights
 * - Awards recognition and accolades
 * - Review distribution and sentiment analysis
 */

import React, { useMemo } from 'react'
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
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface ReviewScore {
  /** Source name (e.g., "Rotten Tomatoes", "Metacritic", "IMDb") */
  source: string
  /** Score value */
  score: number
  /** Maximum possible score */
  maxScore: number
  /** Score display format (percentage, rating, etc.) */
  format: 'percentage' | 'rating' | 'stars'
  /** Critics vs audience designation */
  type: 'critics' | 'audience'
  /** Review count */
  reviewCount?: number
}

export interface CriticReview {
  /** Review ID */
  id: string
  /** Critic name */
  criticName: string
  /** Publication name */
  publication: string
  /** Review quote/excerpt */
  quote: string
  /** Full review URL */
  reviewUrl?: string
  /** Review score (if numeric) */
  score?: number
  /** Review date */
  date?: string
  /** Whether this is a "top critic" */
  isTopCritic?: boolean
}

export interface CriticalConsensus {
  /** Overall consensus text */
  consensus: string
  /** Consensus category */
  category: 'universal_acclaim' | 'positive' | 'mixed' | 'negative' | 'universal_panning'
  /** Key themes mentioned in reviews */
  themes?: string[]
  /** Sentiment score (-1 to 1) */
  sentimentScore?: number
}

export interface CriticalReception {
  /** Review scores from various sources */
  scores?: ReviewScore[]
  /** Critical consensus */
  consensus?: CriticalConsensus
  /** Featured critic reviews */
  featuredReviews?: CriticReview[]
  /** Awards and recognition */
  awards?: {
    name: string
    category?: string
    result: 'won' | 'nominated'
    year?: number
  }[]
  /** Review distribution by rating */
  reviewDistribution?: {
    positive: number
    mixed: number
    negative: number
  }
}

interface CriticalReceptionSectionProps {
  /** Media item */
  media: CatalogItem
  /** Critical reception data */
  criticalReception?: CriticalReception
  /** Whether reception data is loading */
  isLoading?: boolean
  /** Whether reception data is fully loaded */
  isFullyLoaded?: boolean
  /** Callback when review is pressed */
  onReviewPress?: (review: CriticReview) => void
  /** Test ID for testing */
  testID?: string
}

/**
 * Format score display
 */
const formatScore = (score: ReviewScore): string => {
  switch (score.format) {
    case 'percentage':
      return `${Math.round(score.score)}%`
    case 'rating':
      return `${score.score.toFixed(1)}/${score.maxScore}`
    case 'stars':
      return `${score.score.toFixed(1)}★`
    default:
      return score.score.toString()
  }
}

/**
 * Get score color based on value
 */
const getScoreColor = (score: ReviewScore): string => {
  const percentage = (score.score / score.maxScore) * 100
  if (percentage >= 80) return '#4CAF50'
  if (percentage >= 60) return '#FF9800'
  if (percentage >= 40) return '#FF5722'
  return '#F44336'
}

/**
 * Get consensus color
 */
const getConsensusColor = (category: CriticalConsensus['category']): string => {
  switch (category) {
    case 'universal_acclaim': return '#4CAF50'
    case 'positive': return '#8BC34A'
    case 'mixed': return '#FF9800'
    case 'negative': return '#FF5722'
    case 'universal_panning': return '#F44336'
    default: return '#757575'
  }
}

/**
 * Get source icon
 */
const getSourceIcon = (source: string): keyof typeof Ionicons.glyphMap => {
  const lowerSource = source.toLowerCase()
  if (lowerSource.includes('rotten')) return 'leaf'
  if (lowerSource.includes('metacritic')) return 'analytics'
  if (lowerSource.includes('imdb')) return 'film'
  if (lowerSource.includes('critic')) return 'newspaper'
  return 'star'
}

export const CriticalReceptionSection: React.FC<CriticalReceptionSectionProps> = observer(({
  media,
  criticalReception,
  isLoading = false,
  isFullyLoaded = false,
  onReviewPress,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize scores by type
  const organizedScores = useMemo(() => {
    if (!criticalReception?.scores || criticalReception.scores.length === 0) return null

    const critics = criticalReception.scores.filter(s => s.type === 'critics')
    const audience = criticalReception.scores.filter(s => s.type === 'audience')

    return { critics, audience }
  }, [criticalReception?.scores])

  // Calculate overall sentiment
  const overallSentiment = useMemo(() => {
    if (!criticalReception?.scores || criticalReception.scores.length === 0) return null

    const totalScore = criticalReception.scores.reduce((sum, score) => {
      return sum + (score.score / score.maxScore)
    }, 0)

    const averageScore = totalScore / criticalReception.scores.length
    const percentage = Math.round(averageScore * 100)

    let sentiment: string
    let color: string

    if (percentage >= 80) {
      sentiment = t('media_detail.universal_acclaim')
      color = '#4CAF50'
    } else if (percentage >= 60) {
      sentiment = t('media_detail.positive_reviews')
      color = '#8BC34A'
    } else if (percentage >= 40) {
      sentiment = t('media_detail.mixed_reviews')
      color = '#FF9800'
    } else if (percentage >= 20) {
      sentiment = t('media_detail.negative_reviews')
      color = '#FF5722'
    } else {
      sentiment = t('media_detail.universal_panning')
      color = '#F44336'
    }

    return { percentage, sentiment, color }
  }, [criticalReception?.scores, t])

  // Don't render if no reception data and not loading
  if (!criticalReception && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && !criticalReception) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('media_detail.critical_reception')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('media_detail.loading_reviews')}
          </Text>
        </View>
      </View>
    )
  }

  const hasScores = organizedScores && (organizedScores.critics.length > 0 || organizedScores.audience.length > 0)
  const hasConsensus = criticalReception?.consensus
  const hasReviews = criticalReception?.featuredReviews && criticalReception.featuredReviews.length > 0
  const hasAwards = criticalReception?.awards && criticalReception.awards.length > 0

  if (!hasScores && !hasConsensus && !hasReviews && !hasAwards) {
    return null
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('media_detail.critical_reception')}</Text>

      {/* Overall Sentiment */}
      {overallSentiment && (
        <View style={styles.sentimentContainer}>
          <View style={styles.sentimentHeader}>
            <View style={[
              styles.sentimentScore,
              { backgroundColor: overallSentiment.color + '20' }
            ]}>
              <Text style={[
                styles.sentimentPercentage,
                { color: overallSentiment.color }
              ]}>
                {overallSentiment.percentage}
              </Text>
            </View>
            <View style={styles.sentimentContent}>
              <Text style={styles.sentimentLabel}>{t('media_detail.overall_reception')}</Text>
              <Text style={[
                styles.sentimentText,
                { color: overallSentiment.color }
              ]}>
                {overallSentiment.sentiment}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Review Scores */}
      {hasScores && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.review_scores')}</Text>

          {/* Critics Scores */}
          {organizedScores!.critics.length > 0 && (
            <View style={styles.scoresGroup}>
              <Text style={styles.scoresGroupTitle}>{t('media_detail.critics_scores')}</Text>
              <View style={styles.scoresContainer}>
                {organizedScores!.critics.map((score, index) => (
                  <View key={index} style={styles.scoreItem}>
                    <View style={styles.scoreHeader}>
                      <Ionicons
                        name={getSourceIcon(score.source)}
                        size={20}
                        color={getScoreColor(score)}
                      />
                      <Text style={styles.sourceText}>{score.source}</Text>
                    </View>
                    <View style={styles.scoreContent}>
                      <Text style={[
                        styles.scoreValue,
                        { color: getScoreColor(score) }
                      ]}>
                        {formatScore(score)}
                      </Text>
                      {score.reviewCount && (
                        <Text style={styles.reviewCount}>
                          {t("media_detail.reviews_count")}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Audience Scores */}
          {organizedScores!.audience.length > 0 && (
            <View style={styles.scoresGroup}>
              <Text style={styles.scoresGroupTitle}>{t('media_detail.audience_scores')}</Text>
              <View style={styles.scoresContainer}>
                {organizedScores!.audience.map((score, index) => (
                  <View key={index} style={styles.scoreItem}>
                    <View style={styles.scoreHeader}>
                      <Ionicons
                        name={getSourceIcon(score.source)}
                        size={20}
                        color={getScoreColor(score)}
                      />
                      <Text style={styles.sourceText}>{score.source}</Text>
                    </View>
                    <View style={styles.scoreContent}>
                      <Text style={[
                        styles.scoreValue,
                        { color: getScoreColor(score) }
                      ]}>
                        {formatScore(score)}
                      </Text>
                      {score.reviewCount && (
                        <Text style={styles.reviewCount}>
                          {t("media_detail.reviews_count")}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Critical Consensus */}
      {hasConsensus && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.critical_consensus')}</Text>
          <View style={styles.consensusContainer}>
            <View style={styles.consensusHeader}>
              <View style={[
                styles.consensusBadge,
                { backgroundColor: getConsensusColor(criticalReception.consensus?.category || 'mixed') + '20' }
              ]}>
                <Text style={[
                  styles.consensusCategory,
                  { color: getConsensusColor(criticalReception.consensus?.category || 'mixed') }
                ]}>
                  {t(`media_detail.consensus_${criticalReception.consensus?.category || 'mixed'}`)}
                </Text>
              </View>
            </View>
            <Text style={styles.consensusText}>
              {criticalReception.consensus?.consensus}
            </Text>
            {criticalReception.consensus?.themes && criticalReception.consensus?.themes.length > 0 && (
              <View style={styles.themesContainer}>
                <Text style={styles.themesTitle}>{t('media_detail.common_themes')}</Text>
                <View style={styles.themesRow}>
                  {criticalReception.consensus?.themes.map((theme, index) => (
                    <View key={index} style={styles.themeChip}>
                      <Text style={styles.themeText}>{theme}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Featured Reviews */}
      {hasReviews && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.featured_reviews')}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {criticalReception.featuredReviews!.map((review) => (
              <Pressable
                key={review.id}
                style={styles.reviewItem}
                onPress={() => onReviewPress?.(review)}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewCritic}>
                    <Text style={styles.criticName}>{review.criticName}</Text>
                    <Text style={styles.publicationName}>{review.publication}</Text>
                    {review.isTopCritic && (
                      <View style={styles.topCriticBadge}>
                        <Text style={styles.topCriticText}>{t('media_detail.top_critic')}</Text>
                      </View>
                    )}
                  </View>
                  {review.score && (
                    <Text style={styles.reviewScore}>{review.score}/10</Text>
                  )}
                </View>
                <Text style={styles.reviewQuote}>&ldquo;{review.quote}&rdquo;</Text>
                {review.date && (
                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Awards Recognition */}
      {hasAwards && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.awards_recognition')}</Text>
          <View style={styles.awardsContainer}>
            {criticalReception.awards!.map((award, index) => (
              <View key={index} style={styles.awardItem}>
                <Ionicons
                  name={award.result === 'won' ? 'trophy' : 'star-outline'}
                  size={18}
                  color={award.result === 'won' ?
                    theme.colors.status.warning :
                    theme.colors.text.secondary
                  }
                />
                <View style={styles.awardContent}>
                  <Text style={styles.awardName}>{award.name}</Text>
                  {award.category && (
                    <Text style={styles.awardCategory}>{award.category}</Text>
                  )}
                  <Text style={[
                    styles.awardResult,
                    { color: award.result === 'won' ?
                      theme.colors.status.warning :
                      theme.colors.text.secondary
                    }
                  ]}>
                    {t(`media_detail.award_${award.result}`)}
                    {award.year && ` (${award.year})`}
                  </Text>
                </View>
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
            {t('media_detail.loading_more_reviews')}
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

  // Overall Sentiment
  sentimentContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sentimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentScore: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sentimentPercentage: {
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  sentimentContent: {
    flex: 1,
  },
  sentimentLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
  sentimentText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
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

  // Review Scores
  scoresGroup: {
    marginBottom: theme.spacing.md,
  },
  scoresGroupTitle: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  scoresContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  scoreContent: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  reviewCount: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginTop: theme.spacing.xs / 2,
  },

  // Critical Consensus
  consensusContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  consensusHeader: {
    marginBottom: theme.spacing.md,
  },
  consensusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  consensusCategory: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  consensusText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '400',
    lineHeight: moderateScale(24),
    marginBottom: theme.spacing.md,
  },
  themesContainer: {
    marginTop: theme.spacing.sm,
  },
  themesTitle: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeChip: {
    backgroundColor: theme.colors.interactive.primary + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  themeText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },

  // Featured Reviews
  reviewItem: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reviewCritic: {
    flex: 1,
  },
  criticName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  publicationName: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  topCriticBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.status.success + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  topCriticText: {
    color: theme.colors.status.success,
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  reviewScore: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  reviewQuote: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(15),
    fontWeight: '400',
    lineHeight: moderateScale(22),
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
  reviewDate: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
  },

  // Awards Recognition
  awardsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  awardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  awardContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  awardName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  awardCategory: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
  awardResult: {
    fontSize: moderateScale(13),
    fontWeight: '600',
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

CriticalReceptionSection.displayName = 'CriticalReceptionSection'