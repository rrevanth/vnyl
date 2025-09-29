/**
 * Minimal Loading Screen Component
 * 
 * Simple loading screen that doesn't depend on DI services.
 * Shows while DI container initializes, then switches to full app with providers.
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { moderateScale } from 'react-native-size-matters'

interface MinimalLoadingScreenProps {
  progress?: number
}

export const MinimalLoadingScreen: React.FC<MinimalLoadingScreenProps> = ({
  progress = 0
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>VNYL</Text>
          <Text style={styles.tagline}>Discover amazing movies and TV shows</Text>
        </View>

        {/* Loading Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${Math.max(10, progress)}%` }
            ]} />
          </View>
          
          <Text style={styles.progressText}>
            Initializing app...
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark background
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
    marginBottom: moderateScale(60),
  },
  appTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(48),
    fontWeight: '800',
    letterSpacing: moderateScale(2),
    marginBottom: moderateScale(12),
  },
  tagline: {
    color: '#8E8E93',
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontWeight: '400',
  },
  progressSection: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: moderateScale(8),
    backgroundColor: '#2C2C2E',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
    marginBottom: moderateScale(16),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: moderateScale(4),
  },
  progressText: {
    color: '#8E8E93',
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontWeight: '500',
  },
})