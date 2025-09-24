import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { Heading, Text } from '@/src/presentation/shared/ui/atoms/typography'
import { Button } from '@/src/presentation/shared/ui/atoms/button'
import { Input } from '@/src/presentation/shared/ui/atoms/input'
import { SectionHeader } from '@/src/presentation/shared/ui/molecules/section-header'

interface SearchScope {
  id: string
  label: string
  icon: string
}

interface SearchSuggestion {
  id: string
  query: string
  type: 'history' | 'trending'
}

interface SearchFilter {
  id: string
  label: string
  active: boolean
}

const SearchScreen: React.FC = observer(() => {
  const { theme } = useTheme()
  const styles = createStyles(theme)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedScope, setSelectedScope] = useState('all')
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([
    { id: 'vinyl', label: 'Vinyl Only', active: false },
    { id: 'available', label: 'Available', active: false },
    { id: 'recent', label: 'Recent Releases', active: false }
  ])

  const searchScopes: SearchScope[] = [
    { id: 'all', label: 'All', icon: '🔍' },
    { id: 'albums', label: 'Albums', icon: '💿' },
    { id: 'artists', label: 'Artists', icon: '🎤' },
    { id: 'tracks', label: 'Tracks', icon: '🎵' },
    { id: 'genres', label: 'Genres', icon: '🎼' }
  ]

  const searchSuggestions: SearchSuggestion[] = [
    { id: '1', query: 'Pink Floyd', type: 'history' },
    { id: '2', query: 'The Beatles', type: 'history' },
    { id: '3', query: 'Led Zeppelin', type: 'trending' },
    { id: '4', query: 'Queen', type: 'trending' },
    { id: '5', query: 'Bob Dylan', type: 'history' }
  ]

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    const results = [
      {
        id: '1',
        type: 'album',
        title: 'Dark Side of the Moon',
        artist: 'Pink Floyd',
        year: 1973,
        genre: 'Progressive Rock',
        available: true
      },
      {
        id: '2',
        type: 'artist',
        name: 'Pink Floyd',
        albumCount: 15,
        topGenre: 'Progressive Rock'
      },
      {
        id: '3',
        type: 'album',
        title: 'The Wall',
        artist: 'Pink Floyd',
        year: 1979,
        genre: 'Progressive Rock',
        available: false
      }
    ]

    // Simulate API call
    setTimeout(() => {
      if (searchQuery.toLowerCase().includes('pink floyd')) {
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
      setIsSearching(false)
    }, 1000)
  }, [searchQuery])

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  const handleScopeSelect = (scopeId: string) => {
    setSelectedScope(scopeId)
  }

  const handleFilterToggle = (filterId: string) => {
    setSearchFilters(prev =>
      prev.map(filter =>
        filter.id === filterId
          ? { ...filter, active: !filter.active }
          : filter
      )
    )
  }

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.query)
  }

  const renderSearchResult = ({ item }: { item: any }) => {
    if (item.type === 'album') {
      return (
        <View style={styles.searchResultItem}>
          <View style={styles.albumCover}>
            <Text variant="caption" color="secondary">💿</Text>
          </View>
          <View style={styles.resultInfo}>
            <Text variant="bodyBold" color="primary" numberOfLines={1}>
              {item.title}
            </Text>
            <Text variant="body" color="secondary" numberOfLines={1}>
              {item.artist} • {item.year}
            </Text>
            <Text variant="caption" color="secondary">
              {item.genre} • {item.available ? 'Available' : 'Out of Stock'}
            </Text>
          </View>
          <View style={styles.resultActions}>
            <Button
              title={item.available ? "Add" : "Notify"}
              variant={item.available ? "primary" : "outline"}
              size="sm"
              onPress={() => {}}
            />
          </View>
        </View>
      )
    }

    if (item.type === 'artist') {
      return (
        <View style={styles.searchResultItem}>
          <View style={styles.albumCover}>
            <Text variant="caption" color="secondary">🎤</Text>
          </View>
          <View style={styles.resultInfo}>
            <Text variant="bodyBold" color="primary" numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="body" color="secondary">
              {item.albumCount} albums
            </Text>
            <Text variant="caption" color="secondary">
              {item.topGenre}
            </Text>
          </View>
          <View style={styles.resultActions}>
            <Button
              title="View"
              variant="outline"
              size="sm"
              onPress={() => {}}
            />
          </View>
        </View>
      )
    }

    return null
  }

  const showResults = searchQuery.length > 0 && (isSearching || searchResults.length > 0)
  const showSuggestions = searchQuery.length === 0
  const showEmptyState = searchQuery.length > 0 && !isSearching && searchResults.length === 0

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading variant="h1" color="primary">
            Search
          </Heading>
          <Text variant="body" color="secondary">
            Discover vinyl records, artists, and albums
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search for music..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            clearable
            onClear={handleClearSearch}
            rightIcon={
              <Pressable onPress={handleSearch} style={styles.searchButton}>
                <Text variant="caption" color="primary">🔍</Text>
              </Pressable>
            }
          />
        </View>

        {/* Search Scopes */}
        <View style={styles.scopesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scopesContainer}
          >
            {searchScopes.map((scope) => (
              <Pressable
                key={scope.id}
                style={[
                  styles.scopeChip,
                  selectedScope === scope.id && styles.scopeChipActive
                ]}
                onPress={() => handleScopeSelect(scope.id)}
                accessibilityRole="button"
                accessibilityLabel={`Search in ${scope.label}`}
              >
                <Text variant="caption" style={styles.scopeIcon}>
                  {scope.icon}
                </Text>
                <Text
                  variant="caption"
                  color={selectedScope === scope.id ? "inverse" : "secondary"}
                >
                  {scope.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Filters */}
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {searchFilters.map((filter) => (
              <Pressable
                key={filter.id}
                style={[
                  styles.filterChip,
                  filter.active && styles.filterChipActive
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

        {/* Search Suggestions */}
        {showSuggestions && (
          <View style={styles.section}>
            <SectionHeader
              title="Search Suggestions"
              subtitle="Recent searches and trending topics"
            />
            <View style={styles.suggestionsGrid}>
              {searchSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(suggestion)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search for ${suggestion.query}`}
                >
                  <Text variant="caption" color="secondary">
                    {suggestion.type === 'history' ? '🕒' : '📈'}
                  </Text>
                  <Text variant="body" color="primary">
                    {suggestion.query}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {suggestion.type === 'history' ? 'Recent' : 'Trending'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Loading State */}
        {isSearching && (
          <View style={styles.section}>
            <View style={styles.loadingState}>
              <Text variant="body" color="secondary" align="center">
                Searching...
              </Text>
            </View>
          </View>
        )}

        {/* Search Results */}
        {showResults && !isSearching && (
          <View style={styles.section}>
            <SectionHeader
              title={`Search Results (${searchResults.length})`}
              subtitle={`Results for "${searchQuery}"`}
            />
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.resultsContainer}
            />
          </View>
        )}

        {/* Empty State */}
        {showEmptyState && (
          <View style={styles.section}>
            <View style={styles.emptyState}>
              <Heading variant="h3" color="secondary" align="center">
                No Results Found
              </Heading>
              <Text variant="body" color="secondary" align="center">
                Try adjusting your search terms or filters
              </Text>
              <Button
                title="Clear Search"
                variant="outline"
                size="sm"
                onPress={handleClearSearch}
                style={styles.clearButton}
              />
            </View>
          </View>
        )}

        {/* Feature Placeholder */}
        {!showResults && !isSearching && searchQuery.length === 0 && (
          <View style={styles.section}>
            <View style={styles.placeholderContainer}>
              <Text variant="bodyBold" color="primary" align="center">
                🔍 Enhanced Search Features
              </Text>
              <View style={styles.featureList}>
                <Text variant="body" color="secondary">• Advanced filters by genre, year, and condition</Text>
                <Text variant="body" color="secondary">• Real-time search suggestions</Text>
                <Text variant="body" color="secondary">• Barcode scanning for quick lookup</Text>
                <Text variant="body" color="secondary">• Price tracking and availability alerts</Text>
                <Text variant="body" color="secondary">• Save searches and get notifications</Text>
                <Text variant="body" color="secondary">• Integration with major vinyl databases</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
})

export default SearchScreen

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
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md
  },
  searchButton: {
    padding: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scopesSection: {
    marginBottom: theme.spacing.md
  },
  scopesContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  scopeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.xs / 2
  },
  scopeChipActive: {
    backgroundColor: theme.colors.interactive.primary,
    borderColor: theme.colors.interactive.primary
  },
  scopeIcon: {
    fontSize: 12
  },
  filtersSection: {
    marginBottom: theme.spacing.lg
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm
  },
  filterChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  filterChipActive: {
    backgroundColor: theme.colors.interactive.secondary,
    borderColor: theme.colors.interactive.secondary
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  },
  suggestionsGrid: {
    gap: theme.spacing.sm
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.sm
  },
  loadingState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  resultsContainer: {
    gap: theme.spacing.sm
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  albumCover: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xs / 2
  },
  resultActions: {
    marginLeft: theme.spacing.sm
  },
  emptyState: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    gap: theme.spacing.sm
  },
  clearButton: {
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