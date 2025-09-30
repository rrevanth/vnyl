/**
 * SocialMediaSection Component
 *
 * Social media links and presence display for person detail screen featuring:
 * - Verified social media profiles with platform icons
 * - Social media statistics and follower counts
 * - Professional links (IMDb, official websites)
 * - Enhanced visual presentation with branded colors
 * - Security-conscious external link handling
 */

import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native'
import { observer } from '@legendapp/state/react'
import { moderateScale } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'
import type { Theme } from '@/src/presentation/shared/theme/types'
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface SocialMediaProfile {
  /** Profile ID */
  id: string
  /** Platform name */
  platform: 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin' | 'imdb' | 'website'
  /** Profile URL */
  url: string
  /** Profile username/handle */
  username?: string
  /** Whether this is a verified profile */
  verified?: boolean
  /** Follower count */
  followers?: number
  /** Profile description/bio */
  description?: string
  /** Last update time */
  lastUpdated?: string
}

interface SocialMediaSectionProps {
  /** Person data */
  person: PersonCatalogItem
  /** Social media profiles data */
  profiles?: SocialMediaProfile[]
  /** Whether social media data is loading */
  isLoading?: boolean
  /** Whether social media data is fully loaded */
  isFullyLoaded?: boolean
  /** Test ID for testing */
  testID?: string
}

/**
 * Social media platform configuration
 */
const PLATFORM_CONFIG = {
  twitter: {
    name: 'Twitter',
    icon: 'logo-twitter' as const,
    color: '#1DA1F2',
    baseUrl: 'https://twitter.com/'
  },
  instagram: {
    name: 'Instagram',
    icon: 'logo-instagram' as const,
    color: '#E4405F',
    baseUrl: 'https://instagram.com/'
  },
  facebook: {
    name: 'Facebook',
    icon: 'logo-facebook' as const,
    color: '#1877F2',
    baseUrl: 'https://facebook.com/'
  },
  youtube: {
    name: 'YouTube',
    icon: 'logo-youtube' as const,
    color: '#FF0000',
    baseUrl: 'https://youtube.com/'
  },
  tiktok: {
    name: 'TikTok',
    icon: 'musical-notes' as const,
    color: '#000000',
    baseUrl: 'https://tiktok.com/@'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'logo-linkedin' as const,
    color: '#0077B5',
    baseUrl: 'https://linkedin.com/in/'
  },
  imdb: {
    name: 'IMDb',
    icon: 'film' as const,
    color: '#F5C518',
    baseUrl: 'https://imdb.com/name/'
  },
  website: {
    name: 'Official Website',
    icon: 'globe' as const,
    color: '#666666',
    baseUrl: ''
  }
} as const

/**
 * Format follower count for display
 */
const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

/**
 * Validate URL safety
 */
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = observer(({
  person,
  profiles = [],
  isLoading = false,
  isFullyLoaded = false,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize profiles by type
  const organizedProfiles = useMemo(() => {
    if (profiles.length === 0) return null

    const social = profiles.filter(p =>
      ['twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'linkedin'].includes(p.platform)
    )
    const professional = profiles.filter(p =>
      ['imdb', 'website'].includes(p.platform)
    )

    return { social, professional }
  }, [profiles])

  // Handle profile press
  const handleProfilePress = async (profile: SocialMediaProfile) => {
    if (!isValidUrl(profile.url)) {
      Alert.alert(
        t('person_detail.invalid_url_title'),
        t('person_detail.invalid_url_message'),
        [{ text: t('common.ok'), style: 'default' }]
      )
      return
    }

    try {
      const supported = await Linking.canOpenURL(profile.url)
      if (supported) {
        Alert.alert(
          t('person_detail.external_link_title'),
          `${t('person_detail.external_link_message')} ${PLATFORM_CONFIG[profile.platform].name}`,
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.open'),
              style: 'default',
              onPress: () => Linking.openURL(profile.url)
            }
          ]
        )
      } else {
        Alert.alert(
          t('person_detail.unsupported_url_title'),
          t('person_detail.unsupported_url_message'),
          [{ text: t('common.ok'), style: 'default' }]
        )
      }
    } catch {
      // Error handling for user feedback only - specific error details not needed
      Alert.alert(
        t('person_detail.link_error_title'),
        t('person_detail.link_error_message'),
        [{ text: t('common.ok'), style: 'default' }]
      )
    }
  }

  // Don't render if no profiles and not loading
  if (profiles.length === 0 && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && profiles.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('person_detail.social_media')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('person_detail.loading_social_media')}
          </Text>
        </View>
      </View>
    )
  }

  if (!organizedProfiles) return null

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('person_detail.social_media')}</Text>

      {/* Social Media Profiles */}
      {organizedProfiles.social.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('person_detail.social_profiles')}</Text>
          <View style={styles.profilesContainer}>
            {organizedProfiles.social.map((profile) => {
              const config = PLATFORM_CONFIG[profile.platform]
              return (
                <Pressable
                  key={profile.id}
                  style={styles.profileItem}
                  onPress={() => handleProfilePress(profile)}
                >
                  <View style={[
                    styles.profileIcon,
                    { backgroundColor: `${config.color}15` }
                  ]}>
                    <Ionicons
                      name={config.icon}
                      size={24}
                      color={config.color}
                    />
                  </View>

                  <View style={styles.profileContent}>
                    <View style={styles.profileHeader}>
                      <Text style={styles.platformName}>{config.name}</Text>
                      {profile.verified && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={theme.colors.status.success}
                        />
                      )}
                    </View>

                    {profile.username && (
                      <Text style={styles.profileUsername}>@{profile.username}</Text>
                    )}

                    {profile.followers && (
                      <Text style={styles.followerCount}>
                        {formatFollowerCount(profile.followers)} {t('person_detail.followers')}
                      </Text>
                    )}

                    {profile.description && (
                      <Text style={styles.profileDescription} numberOfLines={2}>
                        {profile.description}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              )
            })}
          </View>
        </View>
      )}

      {/* Professional Links */}
      {organizedProfiles.professional.length > 0 && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('person_detail.professional_links')}</Text>
          <View style={styles.profilesContainer}>
            {organizedProfiles.professional.map((profile) => {
              const config = PLATFORM_CONFIG[profile.platform]
              return (
                <Pressable
                  key={profile.id}
                  style={styles.profileItem}
                  onPress={() => handleProfilePress(profile)}
                >
                  <View style={[
                    styles.profileIcon,
                    { backgroundColor: `${config.color}15` }
                  ]}>
                    <Ionicons
                      name={config.icon}
                      size={24}
                      color={config.color}
                    />
                  </View>

                  <View style={styles.profileContent}>
                    <Text style={styles.platformName}>{config.name}</Text>
                    {profile.description && (
                      <Text style={styles.profileDescription} numberOfLines={1}>
                        {profile.description}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="open-outline"
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              )
            })}
          </View>
        </View>
      )}

      {/* Security Note */}
      <View style={styles.securityNote}>
        <Ionicons
          name="shield-checkmark"
          size={16}
          color={theme.colors.text.secondary}
        />
        <Text style={styles.securityText}>
          {t('person_detail.external_links_security')}
        </Text>
      </View>

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('person_detail.loading_more_social')}
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
  profilesContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },

  // Profile Items
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  profileIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileContent: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  platformName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  profileUsername: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  followerCount: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  profileDescription: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '400',
    lineHeight: moderateScale(18),
  },

  // Security Note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  securityText: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '400',
    marginLeft: theme.spacing.xs,
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

SocialMediaSection.displayName = 'SocialMediaSection'