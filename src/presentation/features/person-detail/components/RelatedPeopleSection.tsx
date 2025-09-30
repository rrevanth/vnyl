/**
 * RelatedPeopleSection Component
 *
 * Related people and professional connections display for person detail screen featuring:
 * - Professional collaborators and frequent co-workers
 * - Family members and personal connections (when publicly known)
 * - Industry relationships and mentorships
 * - Visual relationship mapping with connection types
 * - Interactive navigation to related person profiles
 */

import React, { useMemo } from 'react'
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
import type { PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface RelatedPerson {
  /** Person ID */
  id: string
  /** Person name */
  name: string
  /** Profile image URL */
  profileImageUrl?: string
  /** Relationship type */
  relationshipType: 'family' | 'collaborator' | 'mentor' | 'mentee' | 'friend' | 'co_star' | 'director' | 'producer'
  /** Relationship description */
  relationshipDescription?: string
  /** Known profession */
  profession?: string
  /** Number of collaborations */
  collaborationCount?: number
  /** Notable works together */
  notableWorks?: string[]
  /** Years active together */
  activeYears?: string
}

interface RelatedPeopleSectionProps {
  /** Person data */
  person: PersonCatalogItem
  /** Related people data */
  relatedPeople?: RelatedPerson[]
  /** Whether related people data is loading */
  isLoading?: boolean
  /** Whether related people data is fully loaded */
  isFullyLoaded?: boolean
  /** Callback when related person is pressed */
  onRelatedPersonPress?: (person: RelatedPerson) => void
  /** Test ID for testing */
  testID?: string
}

/**
 * Relationship type configuration
 */
const RELATIONSHIP_CONFIG = {
  family: {
    icon: 'home' as const,
    titleKey: 'person_detail.family_connections',
    color: '#FF6B6B',
    priority: 1
  },
  collaborator: {
    icon: 'people' as const,
    titleKey: 'person_detail.collaborators',
    color: '#4ECDC4',
    priority: 2
  },
  mentor: {
    icon: 'school' as const,
    titleKey: 'person_detail.mentors',
    color: '#45B7D1',
    priority: 3
  },
  mentee: {
    icon: 'person-add' as const,
    titleKey: 'person_detail.mentees',
    color: '#96CEB4',
    priority: 4
  },
  co_star: {
    icon: 'star' as const,
    titleKey: 'person_detail.co_stars',
    color: '#FECA57',
    priority: 5
  },
  director: {
    icon: 'videocam' as const,
    titleKey: 'person_detail.directors',
    color: '#FF9FF3',
    priority: 6
  },
  producer: {
    icon: 'briefcase' as const,
    titleKey: 'person_detail.producers',
    color: '#A8E6CF',
    priority: 7
  },
  friend: {
    icon: 'heart' as const,
    titleKey: 'person_detail.friends',
    color: '#FF8A80',
    priority: 8
  }
} as const

/**
 * Get relationship configuration
 */
const getRelationshipConfig = (type: RelatedPerson['relationshipType']) => {
  return RELATIONSHIP_CONFIG[type] || RELATIONSHIP_CONFIG.collaborator
}

export const RelatedPeopleSection: React.FC<RelatedPeopleSectionProps> = observer(({
  person,
  relatedPeople = [],
  isLoading = false,
  isFullyLoaded = false,
  onRelatedPersonPress,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize people by relationship type
  const organizedRelations = useMemo(() => {
    if (relatedPeople.length === 0) return null

    const grouped = relatedPeople.reduce((acc, person) => {
      if (!acc[person.relationshipType]) {
        acc[person.relationshipType] = []
      }
      acc[person.relationshipType].push(person)
      return acc
    }, {} as Record<string, RelatedPerson[]>)

    // Sort groups by priority and sort people within groups by collaboration count
    const sortedGroups = Object.entries(grouped)
      .sort(([a], [b]) => {
        const aConfig = getRelationshipConfig(a as RelatedPerson['relationshipType'])
        const bConfig = getRelationshipConfig(b as RelatedPerson['relationshipType'])
        return aConfig.priority - bConfig.priority
      })
      .reduce((acc, [type, people]) => {
        acc[type] = people.sort((a, b) => (b.collaborationCount || 0) - (a.collaborationCount || 0))
        return acc
      }, {} as Record<string, RelatedPerson[]>)

    return sortedGroups
  }, [relatedPeople])

  // Handle person press
  const handlePersonPress = (relatedPerson: RelatedPerson) => {
    onRelatedPersonPress?.(relatedPerson)
  }

  // Don't render if no related people and not loading
  if (relatedPeople.length === 0 && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && relatedPeople.length === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('person_detail.related_people')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('person_detail.loading_related_people')}
          </Text>
        </View>
      </View>
    )
  }

  if (!organizedRelations) return null

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('person_detail.related_people')}</Text>

      {/* Connections Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryContent}>
          <Ionicons
            name="git-network"
            size={24}
            color={theme.colors.interactive.primary}
          />
          <Text style={styles.summaryText}>
            {t('person_detail.connections_summary')} {relatedPeople.length} connections across {Object.keys(organizedRelations).length} types
          </Text>
        </View>
      </View>

      {/* Related People by Relationship Type */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(organizedRelations).map(([relationshipType, people]) => {
          const config = getRelationshipConfig(relationshipType as RelatedPerson['relationshipType'])

          return (
            <View key={relationshipType} style={styles.relationshipSection}>
              <View style={styles.relationshipHeader}>
                <View style={[
                  styles.relationshipIcon,
                  { backgroundColor: `${config.color}20` }
                ]}>
                  <Ionicons
                    name={config.icon}
                    size={20}
                    color={config.color}
                  />
                </View>
                <Text style={styles.relationshipTitle}>
                  {t(config.titleKey)} ({people.length})
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.peopleScroll}
                contentContainerStyle={styles.peopleContent}
              >
                {people.map((relatedPerson) => (
                  <Pressable
                    key={relatedPerson.id}
                    style={styles.personCard}
                    onPress={() => handlePersonPress(relatedPerson)}
                  >
                    <View style={styles.personImageContainer}>
                      {relatedPerson.profileImageUrl ? (
                        <Image
                          source={{ uri: relatedPerson.profileImageUrl }}
                          style={styles.personImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.personImagePlaceholder}>
                          <Ionicons
                            name="person"
                            size={32}
                            color={theme.colors.text.secondary}
                          />
                        </View>
                      )}
                    </View>

                    <View style={styles.personInfo}>
                      <Text style={styles.personName} numberOfLines={2}>
                        {relatedPerson.name}
                      </Text>

                      {relatedPerson.profession && (
                        <Text style={styles.personProfession} numberOfLines={1}>
                          {relatedPerson.profession}
                        </Text>
                      )}

                      {relatedPerson.relationshipDescription && (
                        <Text style={styles.relationshipDesc} numberOfLines={2}>
                          {relatedPerson.relationshipDescription}
                        </Text>
                      )}

                      {relatedPerson.collaborationCount && relatedPerson.collaborationCount > 1 && (
                        <View style={styles.collaborationBadge}>
                          <Text style={styles.collaborationText}>
                            {relatedPerson.collaborationCount} {t('person_detail.collaborations')}
                          </Text>
                        </View>
                      )}

                      {relatedPerson.notableWorks && relatedPerson.notableWorks.length > 0 && (
                        <Text style={styles.notableWorks} numberOfLines={1}>
                          {t('person_detail.notable')}: {relatedPerson.notableWorks[0]}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )
        })}
      </ScrollView>

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('person_detail.loading_more_relations')}
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

  // Relationship Sections
  relationshipSection: {
    marginBottom: theme.spacing.lg,
  },
  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  relationshipIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  relationshipTitle: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(18),
    fontWeight: '600',
    flex: 1,
  },

  // People Horizontal Scroll
  peopleScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  peopleContent: {
    paddingHorizontal: theme.spacing.lg,
  },

  // Person Cards
  personCard: {
    width: moderateScale(140),
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  personImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  personImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
  },
  personImagePlaceholder: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInfo: {
    alignItems: 'center',
  },
  personName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    lineHeight: moderateScale(18),
  },
  personProfession: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  relationshipDesc: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(11),
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
    lineHeight: moderateScale(14),
  },
  collaborationBadge: {
    backgroundColor: theme.colors.interactive.primary + '20',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  collaborationText: {
    color: theme.colors.interactive.primary,
    fontSize: moderateScale(10),
    fontWeight: '600',
    textAlign: 'center',
  },
  notableWorks: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(10),
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: moderateScale(13),
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

RelatedPeopleSection.displayName = 'RelatedPeopleSection'