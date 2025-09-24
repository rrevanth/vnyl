import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { userPreferencesComputed, userStoreActions } from '@/src/presentation/shared/stores'
import { Heading, Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import { SectionHeader } from '@/src/presentation/shared/ui/molecules/section-header'

interface LibraryViewOption {
  id: 'grid' | 'list'
  label: string
  icon: string
}

interface LibrarySort {
  id: string
  label: string
  active: boolean
}

interface LibraryFilter {
  id: string
  label: string
  active: boolean
}

interface MediaItem {
  id: string
  type: 'album' | 'single' | 'compilation'
  title: string
  artist: string
  year: number
  genre: string
  condition: 'mint' | 'excellent' | 'good' | 'fair'
  value: number
  dateAdded: string
  coverUrl?: string
}

const LibraryScreen: React.FC = observer(() => {
  const { theme } = useTheme()
  const styles = createStyles(theme)

  // Get user preferences for library layout
  const homeLayout = userPreferencesComputed.homeLayout.get()

  const [viewOption, setViewOption] = useState<'grid' | 'list'>(homeLayout as 'grid' | 'list')
  const [sortOptions, setSortOptions] = useState<LibrarySort[]>([
    { id: 'recent', label: 'Recently Added', active: true },
    { id: 'alphabetical', label: 'Alphabetical', active: false },
    { id: 'artist', label: 'By Artist', active: false },
    { id: 'year', label: 'By Year', active: false },
    { id: 'genre', label: 'By Genre', active: false },
    { id: 'value', label: 'By Value', active: false }
  ])

  const [filterOptions, setFilterOptions] = useState<LibraryFilter[]>([
    { id: 'vinyl', label: 'Vinyl Only', active: false },
    { id: 'mint', label: 'Mint Condition', active: false },
    { id: 'recent', label: 'Added This Month', active: false },
    { id: 'highValue', label: 'High Value ($50+)', active: false }
  ])

  const [showProgress, setShowProgress] = useState(false)

  const viewOptions: LibraryViewOption[] = [
    { id: 'grid', label: 'Grid', icon: '⊞' },
    { id: 'list', label: 'List', icon: '☰' }
  ]

  // Mock library data
  const libraryItems: MediaItem[] = [
    {
      id: '1',
      type: 'album',
      title: 'Dark Side of the Moon',
      artist: 'Pink Floyd',
      year: 1973,
      genre: 'Progressive Rock',
      condition: 'excellent',
      value: 85,
      dateAdded: '2024-01-15'
    },
    {
      id: '2',
      type: 'album',
      title: 'Abbey Road',
      artist: 'The Beatles',
      year: 1969,
      genre: 'Rock',
      condition: 'mint',
      value: 120,
      dateAdded: '2024-01-10'
    },
    {
      id: '3',
      type: 'single',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      year: 1975,
      genre: 'Rock',
      condition: 'good',
      value: 45,
      dateAdded: '2024-01-08'
    }
  ]

  const libraryStats = {
    totalRecords: libraryItems.length,
    totalArtists: new Set(libraryItems.map(item => item.artist)).size,
    totalGenres: new Set(libraryItems.map(item => item.genre)).size,
    totalValue: libraryItems.reduce((sum, item) => sum + item.value, 0),
    newestAddition: libraryItems.sort((a, b) =>
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )[0]?.title || 'None',
    mostValuable: libraryItems.sort((a, b) => b.value - a.value)[0]?.title || 'None'
  }

  const handleImportCollection = () => {
    setShowProgress(true)
    // Simulate import process
    setTimeout(() => {
      setShowProgress(false)
    }, 3000)
  }

  const handleScanRecord = () => {
    // This would navigate to a barcode scanner screen when implemented
  }

  const handleViewOptionChange = (option: 'grid' | 'list') => {
    setViewOption(option)
    // Update user preferences
    userStoreActions.setHomeLayout(option)
  }

  const handleSortChange = (sortId: string) => {
    setSortOptions(prev =>
      prev.map(sort => ({
        ...sort,
        active: sort.id === sortId
      }))
    )
  }

  const handleFilterToggle = (filterId: string) => {
    setFilterOptions(prev =>
      prev.map(filter =>
        filter.id === filterId
          ? { ...filter, active: !filter.active }
          : filter
      )
    )
  }

  const renderLibraryItem = ({ item }: { item: MediaItem }) => {
    if (viewOption === 'grid') {
      return (
        <View style={styles.gridItem}>
          <View style={styles.albumCoverLarge}>
            <Text variant="caption" color="secondary">
              {item.type === 'album' ? '💿' : '🎵'}
            </Text>
          </View>
          <View style={styles.gridItemInfo}>
            <Text variant="bodyBold" color="primary" numberOfLines={2} align="center">
              {item.title}
            </Text>
            <Text variant="caption" color="secondary" numberOfLines={1} align="center">
              {item.artist}
            </Text>
            <Text variant="small" color="secondary" align="center">
              ${item.value}
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.listItem}>
        <View style={styles.albumCover}>
          <Text variant="caption" color="secondary">
            {item.type === 'album' ? '💿' : '🎵'}
          </Text>
        </View>
        <View style={styles.listItemInfo}>
          <Text variant="bodyBold" color="primary" numberOfLines={1}>
            {item.title}
          </Text>
          <Text variant="body" color="secondary" numberOfLines={1}>
            {item.artist} • {item.year}
          </Text>
          <Text variant="caption" color="secondary">
            {item.genre} • {item.condition} • ${item.value}
          </Text>
        </View>
        <View style={styles.listItemActions}>
          <Button
            title="Details"
            variant="ghost"
            size="sm"
            onPress={() => {}}
          />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading variant="h1" color="primary">
            My Library
          </Heading>
          <Text variant="body" color="secondary">
            Your personal vinyl collection
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Manage your collection"
          />
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionButton}
              onPress={handleImportCollection}
              accessibilityRole="button"
              accessibilityLabel="Import existing collection"
            >
              <Text variant="bodyBold" color="secondary">📎</Text>
              <Text variant="bodyBold" color="primary">Import Collection</Text>
              <Text variant="caption" color="secondary" align="center">
                From Discogs, CSV, or other formats
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={handleScanRecord}
              accessibilityRole="button"
              accessibilityLabel="Scan record barcode"
            >
              <Text variant="bodyBold" color="secondary">📷</Text>
              <Text variant="bodyBold" color="primary">Scan Record</Text>
              <Text variant="caption" color="secondary" align="center">
                Add records by scanning barcodes
              </Text>
            </Pressable>
          </View>

          {showProgress && (
            <View style={styles.progressContainer}>
              <Text variant="body" color="primary" align="center">
                Importing collection... Please wait
              </Text>
            </View>
          )}
        </View>

        {/* Collection Statistics */}
        <View style={styles.section}>
          <SectionHeader
            title="Collection Statistics"
            subtitle="Overview of your vinyl library"
          />
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Heading variant="h2" color="primary" align="center">
                {libraryStats.totalRecords}
              </Heading>
              <Text variant="caption" color="secondary" align="center">
                Records
              </Text>
            </View>
            <View style={styles.statCard}>
              <Heading variant="h2" color="primary" align="center">
                {libraryStats.totalArtists}
              </Heading>
              <Text variant="caption" color="secondary" align="center">
                Artists
              </Text>
            </View>
            <View style={styles.statCard}>
              <Heading variant="h2" color="primary" align="center">
                {libraryStats.totalGenres}
              </Heading>
              <Text variant="caption" color="secondary" align="center">
                Genres
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Text variant="bodyBold" color="primary">Total Estimated Value</Text>
              <Heading variant="h3" color="primary">${libraryStats.totalValue}</Heading>
            </View>
            <View style={styles.detailCard}>
              <Text variant="bodyBold" color="primary">Most Recent</Text>
              <Text variant="body" color="secondary">{libraryStats.newestAddition}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text variant="bodyBold" color="primary">Most Valuable</Text>
              <Text variant="body" color="secondary">{libraryStats.mostValuable}</Text>
            </View>
          </View>
        </View>

        {/* Collection Management */}
        <View style={styles.section}>
          <SectionHeader
            title="Collection Management"
            subtitle="Organize and view your records"
          />

          {/* View Options */}
          <View style={styles.viewOptionsContainer}>
            <Text variant="bodyBold" color="primary">View:</Text>
            <View style={styles.viewOptionsButtons}>
              {viewOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.viewOptionButton,
                    viewOption === option.id && styles.viewOptionButtonActive
                  ]}
                  onPress={() => handleViewOptionChange(option.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${option.label} view`}
                >
                  <Text variant="caption" color="secondary">
                    {option.icon}
                  </Text>
                  <Text
                    variant="caption"
                    color={viewOption === option.id ? "inverse" : "secondary"}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <Text variant="bodyBold" color="primary">Sort By:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortButtons}
            >
              {sortOptions.map((sort) => (
                <Pressable
                  key={sort.id}
                  style={[
                    styles.sortButton,
                    sort.active && styles.sortButtonActive
                  ]}
                  onPress={() => handleSortChange(sort.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${sort.label}`}
                >
                  <Text
                    variant="caption"
                    color={sort.active ? "inverse" : "secondary"}
                  >
                    {sort.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Filter Options */}
          <View style={styles.filterContainer}>
            <Text variant="bodyBold" color="primary">Filters:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterButtons}
            >
              {filterOptions.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    filter.active && styles.filterButtonActive
                  ]}
                  onPress={() => handleFilterToggle(filter.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle ${filter.label} filter`}
                >
                  <Text
                    variant="caption"
                    color={filter.active ? "inverse" : "secondary"}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Library Items */}
        <View style={styles.section}>
          <SectionHeader
            title={`Your Collection (${libraryItems.length})`}
            subtitle={`Viewing in ${viewOption} format`}
          />

          {libraryItems.length > 0 ? (
            <FlatList
              data={libraryItems}
              renderItem={renderLibraryItem}
              keyExtractor={(item) => item.id}
              numColumns={viewOption === 'grid' ? 2 : 1}
              key={viewOption} // Force re-render when view changes
              scrollEnabled={false}
              contentContainerStyle={
                viewOption === 'grid' ? styles.gridContainer : styles.listContainer
              }
              columnWrapperStyle={viewOption === 'grid' ? styles.gridRow : undefined}
            />
          ) : (
            <View style={styles.emptyLibrary}>
              <Heading variant="h3" color="secondary" align="center">
                Your Library is Empty
              </Heading>
              <Text variant="body" color="secondary" align="center">
                Start building your collection by adding records
              </Text>
              <Button
                title="Add First Record"
                variant="primary"
                size="md"
                onPress={handleScanRecord}
                style={styles.addButton}
              />
            </View>
          )}
        </View>

        {/* Feature Placeholder */}
        <View style={styles.section}>
          <View style={styles.placeholderContainer}>
            <Text variant="bodyBold" color="primary" align="center">
              📚 Advanced Library Features
            </Text>
            <View style={styles.featureList}>
              <Text variant="body" color="secondary">• Condition tracking with photos</Text>
              <Text variant="body" color="secondary">• Price history and market trends</Text>
              <Text variant="body" color="secondary">• Want list and wishlist management</Text>
              <Text variant="body" color="secondary">• Collection backup and sync</Text>
              <Text variant="body" color="secondary">• Insurance valuation reports</Text>
              <Text variant="body" color="secondary">• Social sharing and discovery</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
})

export default LibraryScreen

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.sm
  },
  progressContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    alignItems: 'center'
  },
  detailsGrid: {
    gap: theme.spacing.sm
  },
  detailCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  viewOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm
  },
  viewOptionsButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  },
  viewOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.xs / 2
  },
  viewOptionButtonActive: {
    backgroundColor: theme.colors.interactive.primary,
    borderColor: theme.colors.interactive.primary
  },
  sortContainer: {
    marginBottom: theme.spacing.md
  },
  sortButtons: {
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  sortButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  sortButtonActive: {
    backgroundColor: theme.colors.interactive.secondary,
    borderColor: theme.colors.interactive.secondary
  },
  filterContainer: {
    marginBottom: theme.spacing.md
  },
  filterButtons: {
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  filterButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  filterButtonActive: {
    backgroundColor: theme.colors.interactive.primary,
    borderColor: theme.colors.interactive.primary
  },
  gridContainer: {
    gap: theme.spacing.sm
  },
  gridRow: {
    gap: theme.spacing.sm,
    justifyContent: 'space-between'
  },
  gridItem: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.sm,
    maxWidth: '48%'
  },
  gridItemInfo: {
    alignItems: 'center',
    gap: theme.spacing.xs / 2
  },
  listContainer: {
    gap: theme.spacing.sm
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  listItemInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xs / 2
  },
  listItemActions: {
    marginLeft: theme.spacing.sm
  },
  albumCover: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  albumCoverLarge: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyLibrary: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.md
  },
  addButton: {
    marginTop: theme.spacing.sm
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  featureList: {
    marginTop: theme.spacing.md,
    alignItems: 'flex-start',
    gap: theme.spacing.xs
  }
})