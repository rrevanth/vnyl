/**
 * ProgressiveLoadingIndicator Component
 *
 * Visual indicator for progressive loading stages featuring:
 * - Multi-stage loading visualization with progress bars
 * - Stage-by-stage completion status
 * - Smooth animations and transitions
 * - Error state handling with retry options
 * - Collapsible detailed view
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { LoadingStage } from '@/src/presentation/features/shared/hooks/useEnhancedInfoLoader'

interface ProgressiveLoadingIndicatorProps {
  /** Loading stages */
  loadingStages: LoadingStage[]
  /** Overall progress (0-100) */
  overallProgress: number
  /** Whether loading is in progress */
  isLoading: boolean
  /** Whether loading is complete */
  isComplete: boolean
  /** Whether any stage has an error */
  hasError: boolean
  /** Retry function for failed stages */
  onRetry?: () => void
  /** Variant for different display styles */
  variant?: 'compact' | 'detailed' | 'minimal'
  /** Whether to show stage details */
  showStageDetails?: boolean
  /** Test ID for testing */
  testID?: string
}

export const ProgressiveLoadingIndicator: React.FC<ProgressiveLoadingIndicatorProps> = observer(({
  loadingStages,
  overallProgress,
  isLoading,
  isComplete,
  hasError,
  onRetry,
  variant = 'compact',
  showStageDetails = false,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  const [expanded, setExpanded] = useState(showStageDetails)

  // Don't render if no stages or completed without errors
  if (loadingStages.length === 0 || (isComplete && !hasError)) {
    return null
  }

  // Get current active stage
  const activeStage = loadingStages.find(stage => !stage.isComplete && !stage.error)
  const completedStages = loadingStages.filter(stage => stage.isComplete).length
  const errorStages = loadingStages.filter(stage => stage.error).length

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer} testID={testID}>
        {isLoading && (
          <View style={styles.minimalContent}>
            <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
            <Text style={styles.minimalText}>
              {activeStage?.name || t('common.loading')}
            </Text>
          </View>
        )}
        {hasError && (
          <Pressable style={styles.minimalError} onPress={onRetry}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.status.error} />
            <Text style={styles.minimalErrorText}>{t('common.tap_to_retry')}</Text>
          </Pressable>
        )}
      </View>
    )
  }

  // Render compact variant
  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer} testID={testID}>
        <View style={styles.compactHeader}>
          <View style={styles.compactProgress}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${overallProgress}%`,
                    backgroundColor: hasError ?
                      theme.colors.status.error :
                      theme.colors.interactive.primary
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{overallProgress}%</Text>
          </View>

          <View style={styles.compactStatus}>
            {isLoading && (
              <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
            )}
            {hasError && (
              <Pressable onPress={onRetry} style={styles.retryButton}>
                <Ionicons name="refresh" size={18} color={theme.colors.status.error} />
              </Pressable>
            )}
            {isComplete && (
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.status.success} />
            )}
          </View>
        </View>

        <View style={styles.compactInfo}>
          <Text style={styles.stageText}>
            {activeStage?.name || (isComplete ?
              t('progressive_loading.all_complete') :
              t('progressive_loading.loading')
            )}
          </Text>
          <Text style={styles.stageCount}>
            {completedStages} of {loadingStages.length} {t('progressive_loading.stages_complete')}
          </Text>
        </View>

        {loadingStages.length > 1 && (
          <Pressable
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandText}>
              {expanded ? t('common.show_less') : t('common.show_details')}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.text.secondary}
            />
          </Pressable>
        )}

        {expanded && (
          <View style={styles.stagesList}>
            {loadingStages.map((stage, index) => (
              <View key={stage.id} style={styles.stageItem}>
                <View style={styles.stageIcon}>
                  {stage.isComplete && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.colors.status.success}
                    />
                  )}
                  {stage.error && (
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={theme.colors.status.error}
                    />
                  )}
                  {!stage.isComplete && !stage.error && (
                    <>
                      {stage.progress > 0 ? (
                        <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                      ) : (
                        <View style={styles.pendingDot} />
                      )}
                    </>
                  )}
                </View>

                <View style={styles.stageContent}>
                  <Text style={[
                    styles.stageItemName,
                    stage.error && { color: theme.colors.status.error },
                    stage.isComplete && { color: theme.colors.status.success }
                  ]}>
                    {stage.name}
                  </Text>
                  {stage.progress > 0 && stage.progress < 100 && (
                    <Text style={styles.stageProgress}>{stage.progress}%</Text>
                  )}
                  {stage.error && (
                    <Text style={styles.stageError}>
                      {stage.error.message || t('common.error_occurred')}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  // Render detailed variant
  return (
    <View style={styles.detailedContainer} testID={testID}>
      <View style={styles.detailedHeader}>
        <Text style={styles.detailedTitle}>
          {t('progressive_loading.enhanced_info')}
        </Text>
        <View style={styles.detailedStats}>
          <Text style={styles.statsText}>
            {t('progressive_loading.progress_stats')}: {completedStages}/{loadingStages.length} complete, {errorStages} errors
          </Text>
        </View>
      </View>

      <View style={styles.overallProgress}>
        <Text style={styles.overallProgressLabel}>
          {t('progressive_loading.overall_progress')}
        </Text>
        <View style={styles.overallProgressBar}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${overallProgress}%`,
                  backgroundColor: hasError ?
                    theme.colors.status.error :
                    theme.colors.interactive.primary
                }
              ]}
            />
          </View>
          <Text style={styles.overallProgressText}>{overallProgress}%</Text>
        </View>
      </View>

      <View style={styles.detailedStagesList}>
        {loadingStages.map((stage, index) => (
          <View key={stage.id} style={styles.detailedStageItem}>
            <View style={styles.detailedStageHeader}>
              <View style={styles.detailedStageIcon}>
                {stage.isComplete && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.status.success}
                  />
                )}
                {stage.error && (
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.status.error}
                  />
                )}
                {!stage.isComplete && !stage.error && (
                  <>
                    {stage.progress > 0 ? (
                      <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
                    ) : (
                      <View style={styles.detailedPendingDot} />
                    )}
                  </>
                )}
              </View>

              <View style={styles.detailedStageContent}>
                <Text style={[
                  styles.detailedStageName,
                  stage.error && { color: theme.colors.status.error },
                  stage.isComplete && { color: theme.colors.status.success }
                ]}>
                  {stage.name}
                </Text>

                {stage.progress > 0 && stage.progress < 100 && (
                  <View style={styles.stageProgressContainer}>
                    <View style={styles.stageProgressBar}>
                      <View style={[
                        styles.stageProgressFill,
                        { width: `${stage.progress}%` }
                      ]} />
                    </View>
                    <Text style={styles.stageProgressText}>{stage.progress}%</Text>
                  </View>
                )}

                {stage.error && (
                  <Text style={styles.detailedStageError}>
                    {stage.error.message || t('common.error_occurred')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {hasError && onRetry && (
        <Pressable style={styles.detailedRetryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color={theme.colors.text.onColor} />
          <Text style={styles.detailedRetryText}>
            {t('progressive_loading.retry_failed_stages')}
          </Text>
        </Pressable>
      )}
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  // Minimal variant
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimalText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  minimalError: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimalErrorText: {
    color: theme.colors.status.error,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },

  // Compact variant
  compactContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  compactProgress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 2,
    marginRight: theme.spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '600',
    minWidth: moderateScale(35),
  },
  compactStatus: {
    marginLeft: theme.spacing.sm,
  },
  retryButton: {
    padding: theme.spacing.xs / 2,
  },
  compactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  stageText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(13),
    fontWeight: '500',
    flex: 1,
  },
  stageCount: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
  },
  expandText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginRight: theme.spacing.xs,
  },

  // Stages list
  stagesList: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  stageIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.secondary,
    opacity: 0.5,
  },
  stageContent: {
    flex: 1,
  },
  stageItemName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  stageProgress: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(11),
    fontWeight: '500',
    marginTop: theme.spacing.xs / 2,
  },
  stageError: {
    color: theme.colors.status.error,
    fontSize: moderateScale(11),
    fontWeight: '400',
    marginTop: theme.spacing.xs / 2,
  },

  // Detailed variant
  detailedContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  detailedHeader: {
    marginBottom: theme.spacing.md,
  },
  detailedTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  detailedStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '500',
  },

  // Overall progress
  overallProgress: {
    marginBottom: theme.spacing.lg,
  },
  overallProgressLabel: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  overallProgressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallProgressText: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    minWidth: moderateScale(40),
  },

  // Detailed stages
  detailedStagesList: {
    gap: theme.spacing.sm,
  },
  detailedStageItem: {
    paddingVertical: theme.spacing.xs,
  },
  detailedStageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailedStageIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  detailedPendingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.text.secondary,
    opacity: 0.5,
  },
  detailedStageContent: {
    flex: 1,
  },
  detailedStageName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(15),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  stageProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  stageProgressBar: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 1.5,
    marginRight: theme.spacing.xs,
  },
  stageProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: 1.5,
  },
  stageProgressText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '600',
    minWidth: moderateScale(35),
  },
  detailedStageError: {
    color: theme.colors.status.error,
    fontSize: moderateScale(13),
    fontWeight: '400',
    lineHeight: moderateScale(18),
  },

  // Retry button
  detailedRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.status.error,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  detailedRetryText: {
    color: theme.colors.text.onColor,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
})

ProgressiveLoadingIndicator.displayName = 'ProgressiveLoadingIndicator'