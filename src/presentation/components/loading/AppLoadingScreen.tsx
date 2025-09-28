/**
 * App Loading Screen Component
 * 
 * Displays while DI container initializes and catalogs load incrementally.
 * Shows loading progress, provider status, and smooth transitions.
 */

import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { observer } from '@legendapp/state/react'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import { moderateScale } from 'react-native-size-matters'

interface AppLoadingScreenProps {
  onLoadingComplete?: () => void
}


export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = observer(({
  onLoadingComplete
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    'Initializing logging service...',
    'Setting up storage...',
    'Loading user preferences...',
    'Preparing catalog services...',
    'Connecting to providers...'
  ]

  useEffect(() => {
    // Simple progressive loading simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 20
        setCurrentStep(Math.floor(newProgress / 20))
        
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onLoadingComplete?.()
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 300) // Complete in 1.5 seconds

    return () => clearInterval(interval)
  }, [onLoadingComplete])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>VNYL</Text>
          <Text style={styles.tagline}>{t('home.discover_content')}</Text>
        </View>

        {/* Loading Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${progress}%` }
            ]} />
          </View>
          
          <Text style={styles.progressText}>
            {Math.round(progress)}% {t('common.loading')}
          </Text>
        </View>

        {/* Loading Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((stepLabel, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[
                styles.stepIndicator,
                index < currentStep && styles.stepCompleted,
                index === currentStep && styles.stepActive
              ]}>
                {index < currentStep ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <View style={styles.stepDot} />
                )}
              </View>
              
              <Text style={[
                styles.stepLabel,
                index < currentStep && styles.stepLabelCompleted,
                index === currentStep && styles.stepLabelActive
              ]}>
                {stepLabel}
              </Text>
            </View>
          ))}
        </View>

        {/* Completion Message */}
        {progress >= 100 && (
          <View style={styles.completionSection}>
            <Text style={styles.completionText}>
              Ready to explore!
            </Text>
          </View>
        )}
      </View>
    </View>
  )
})

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  appTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(48),
    fontWeight: '800',
    letterSpacing: moderateScale(2),
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
    fontWeight: '400',
  },
  progressSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    width: '100%',
    height: moderateScale(8),
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: moderateScale(4),
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: moderateScale(4),
  },
  progressText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontWeight: '500',
  },
  stepsContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stepIndicator: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepActive: {
    borderColor: theme.colors.interactive.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  stepCompleted: {
    backgroundColor: theme.colors.interactive.primary,
    borderColor: theme.colors.interactive.primary,
  },
  stepDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.text.secondary,
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  stepLabel: {
    flex: 1,
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '400',
  },
  stepLabelActive: {
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  stepLabelCompleted: {
    color: theme.colors.text.secondary,
    fontWeight: '400',
  },
  completionSection: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  completionText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(18),
    fontWeight: '600',
    textAlign: 'center',
  },
})