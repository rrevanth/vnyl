/**
 * ProductionInfoSection Component
 *
 * Production information display for media detail screen featuring:
 * - Production companies and distributors with logos
 * - Filming locations with geographic context
 * - Budget and box office information (when available)
 * - Production timeline and release strategy
 * - Enhanced visual presentation with professional layout
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
import type { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

export interface ProductionCompany {
  /** Company ID */
  id: string
  /** Company name */
  name: string
  /** Company logo URL */
  logoUrl?: string
  /** Company role (production, distribution, etc.) */
  role: 'production' | 'distribution' | 'financing' | 'co_production'
  /** Country of origin */
  country?: string
}

export interface FilmingLocation {
  /** Location ID */
  id: string
  /** Location name */
  name: string
  /** Location type */
  type: 'city' | 'country' | 'studio' | 'landmark' | 'region'
  /** Country */
  country?: string
  /** Coordinates for mapping */
  coordinates?: { latitude: number; longitude: number }
  /** Description of what was filmed there */
  description?: string
}

export interface ProductionInfo {
  /** Production companies */
  companies?: ProductionCompany[]
  /** Filming locations */
  locations?: FilmingLocation[]
  /** Production budget */
  budget?: number
  /** Box office earnings */
  boxOffice?: {
    worldwide?: number
    domestic?: number
    international?: number
  }
  /** Production dates */
  productionDates?: {
    start?: string
    end?: string
  }
  /** Release strategy */
  releaseStrategy?: {
    type: 'theatrical' | 'streaming' | 'limited' | 'festival' | 'direct_to_video'
    description?: string
  }
}

interface ProductionInfoSectionProps {
  /** Media item */
  media: CatalogItem
  /** Production information data */
  productionInfo?: ProductionInfo
  /** Whether production info is loading */
  isLoading?: boolean
  /** Whether production info is fully loaded */
  isFullyLoaded?: boolean
  /** Callback when company is pressed */
  onCompanyPress?: (company: ProductionCompany) => void
  /** Callback when location is pressed */
  onLocationPress?: (location: FilmingLocation) => void
  /** Test ID for testing */
  testID?: string
}

/**
 * Format currency amount
 */
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return `$${amount.toLocaleString()}`
}

/**
 * Get company role icon
 */
const getCompanyRoleIcon = (role: ProductionCompany['role']): keyof typeof Ionicons.glyphMap => {
  switch (role) {
    case 'production': return 'videocam'
    case 'distribution': return 'share'
    case 'financing': return 'card'
    case 'co_production': return 'people'
    default: return 'business'
  }
}

/**
 * Get location type icon
 */
const getLocationIcon = (type: FilmingLocation['type']): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'city': return 'location'
    case 'country': return 'globe'
    case 'studio': return 'videocam'
    case 'landmark': return 'star'
    case 'region': return 'map'
    default: return 'location-outline'
  }
}

export const ProductionInfoSection: React.FC<ProductionInfoSectionProps> = observer(({
  media,
  productionInfo,
  isLoading = false,
  isFullyLoaded = false,
  onCompanyPress,
  onLocationPress,
  testID
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)

  // Organize companies by role
  const organizedCompanies = useMemo(() => {
    if (!productionInfo?.companies || productionInfo.companies.length === 0) return null

    const grouped = productionInfo.companies.reduce((acc, company) => {
      if (!acc[company.role]) {
        acc[company.role] = []
      }
      acc[company.role].push(company)
      return acc
    }, {} as Record<string, ProductionCompany[]>)

    return grouped
  }, [productionInfo?.companies])

  // Financial summary
  const financialSummary = useMemo(() => {
    if (!productionInfo?.budget && !productionInfo?.boxOffice) return null

    const summary: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = []

    if (productionInfo.budget) {
      summary.push({
        label: t('media_detail.budget'),
        value: formatCurrency(productionInfo.budget),
        icon: 'wallet'
      })
    }

    if (productionInfo.boxOffice?.worldwide) {
      summary.push({
        label: t('media_detail.box_office_worldwide'),
        value: formatCurrency(productionInfo.boxOffice.worldwide),
        icon: 'globe'
      })
    }

    if (productionInfo.boxOffice?.domestic) {
      summary.push({
        label: t('media_detail.box_office_domestic'),
        value: formatCurrency(productionInfo.boxOffice.domestic),
        icon: 'home'
      })
    }

    return summary
  }, [productionInfo, t])

  // Don't render if no production info and not loading
  if (!productionInfo && !isLoading) {
    return null
  }

  // Loading state
  if (isLoading && !isFullyLoaded && !productionInfo) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.sectionTitle}>{t('media_detail.production_info')}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.loadingText}>
            {t('media_detail.loading_production_info')}
          </Text>
        </View>
      </View>
    )
  }

  const hasCompanies = organizedCompanies && Object.keys(organizedCompanies).length > 0
  const hasLocations = productionInfo?.locations && productionInfo.locations.length > 0
  const hasFinancials = financialSummary && financialSummary.length > 0
  const hasProductionDates = productionInfo?.productionDates

  if (!hasCompanies && !hasLocations && !hasFinancials && !hasProductionDates) {
    return null
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.sectionTitle}>{t('media_detail.production_info')}</Text>

      {/* Financial Summary */}
      {hasFinancials && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.financial_info')}</Text>
          <View style={styles.financialContainer}>
            {financialSummary!.map((item, index) => (
              <View key={index} style={styles.financialItem}>
                <View style={styles.financialIcon}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={theme.colors.interactive.primary}
                  />
                </View>
                <View style={styles.financialContent}>
                  <Text style={styles.financialLabel}>{item.label}</Text>
                  <Text style={styles.financialValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Production Timeline */}
      {hasProductionDates && productionInfo.productionDates && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.production_timeline')}</Text>
          <View style={styles.timelineContainer}>
            {productionInfo.productionDates.start && (
              <View style={styles.timelineItem}>
                <Ionicons
                  name="play-circle"
                  size={20}
                  color={theme.colors.status.success}
                />
                <Text style={styles.timelineLabel}>{t('media_detail.production_start')}</Text>
                <Text style={styles.timelineValue}>
                  {new Date(productionInfo.productionDates.start).toLocaleDateString()}
                </Text>
              </View>
            )}
            {productionInfo.productionDates.end && (
              <View style={styles.timelineItem}>
                <Ionicons
                  name="stop-circle"
                  size={20}
                  color={theme.colors.status.warning}
                />
                <Text style={styles.timelineLabel}>{t('media_detail.production_end')}</Text>
                <Text style={styles.timelineValue}>
                  {new Date(productionInfo.productionDates.end).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Production Companies */}
      {hasCompanies && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.production_companies')}</Text>
          {Object.entries(organizedCompanies!).map(([role, companies]) => (
            <View key={role} style={styles.companyGroup}>
              <View style={styles.companyGroupHeader}>
                <Ionicons
                  name={getCompanyRoleIcon(role as ProductionCompany['role'])}
                  size={18}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.companyGroupTitle}>
                  {t(`media_detail.company_role_${role}`)}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.companiesScroll}
                contentContainerStyle={styles.companiesContent}
              >
                {companies.map((company) => (
                  <Pressable
                    key={company.id}
                    style={styles.companyCard}
                    onPress={() => onCompanyPress?.(company)}
                  >
                    <View style={styles.companyLogoContainer}>
                      {company.logoUrl ? (
                        <Image
                          source={{ uri: company.logoUrl }}
                          style={styles.companyLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.companyLogoPlaceholder}>
                          <Ionicons
                            name="business"
                            size={24}
                            color={theme.colors.text.secondary}
                          />
                        </View>
                      )}
                    </View>
                    <Text style={styles.companyName} numberOfLines={2}>
                      {company.name}
                    </Text>
                    {company.country && (
                      <Text style={styles.companyCountry} numberOfLines={1}>
                        {company.country}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      {/* Filming Locations */}
      {hasLocations && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.filming_locations')}</Text>
          <View style={styles.locationsContainer}>
            {productionInfo.locations!.map((location) => (
              <Pressable
                key={location.id}
                style={styles.locationItem}
                onPress={() => onLocationPress?.(location)}
              >
                <View style={styles.locationIcon}>
                  <Ionicons
                    name={getLocationIcon(location.type)}
                    size={20}
                    color={theme.colors.interactive.primary}
                  />
                </View>
                <View style={styles.locationContent}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  {location.country && (
                    <Text style={styles.locationCountry}>{location.country}</Text>
                  )}
                  {location.description && (
                    <Text style={styles.locationDescription} numberOfLines={2}>
                      {location.description}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.text.secondary}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Release Strategy */}
      {productionInfo?.releaseStrategy && (
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>{t('media_detail.release_strategy')}</Text>
          <View style={styles.releaseContainer}>
            <View style={styles.releaseItem}>
              <Ionicons
                name="calendar"
                size={20}
                color={theme.colors.interactive.primary}
              />
              <View style={styles.releaseContent}>
                <Text style={styles.releaseType}>
                  {t(`media_detail.release_type_${productionInfo.releaseStrategy.type}`)}
                </Text>
                {productionInfo.releaseStrategy.description && (
                  <Text style={styles.releaseDescription}>
                    {productionInfo.releaseStrategy.description}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Progressive loading indicator */}
      {isLoading && isFullyLoaded && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={theme.colors.interactive.primary} />
          <Text style={styles.progressText}>
            {t('media_detail.loading_more_production')}
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

  // Financial Information
  financialContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  financialIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  financialContent: {
    flex: 1,
  },
  financialLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
  financialValue: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(18),
    fontWeight: '700',
  },

  // Production Timeline
  timelineContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  timelineLabel: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  timelineValue: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  // Production Companies
  companyGroup: {
    marginBottom: theme.spacing.md,
  },
  companyGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  companyGroupTitle: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  companiesScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  companiesContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  companyCard: {
    width: moderateScale(120),
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  companyLogoContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  companyLogo: {
    width: moderateScale(50),
    height: moderateScale(50),
  },
  companyLogoPlaceholder: {
    width: moderateScale(50),
    height: moderateScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(12),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    lineHeight: moderateScale(16),
  },
  companyCountry: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(11),
    fontWeight: '400',
    textAlign: 'center',
  },

  // Filming Locations
  locationsContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  locationIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  locationCountry: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: theme.spacing.xs / 2,
  },
  locationDescription: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(13),
    fontWeight: '400',
    lineHeight: moderateScale(18),
  },

  // Release Strategy
  releaseContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  releaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  releaseContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  releaseType: {
    color: theme.colors.text.primary,
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  releaseDescription: {
    color: theme.colors.text.secondary,
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: moderateScale(20),
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

ProductionInfoSection.displayName = 'ProductionInfoSection'