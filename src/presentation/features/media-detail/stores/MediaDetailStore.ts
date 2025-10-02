/**
 * Media Detail Feature Store
 * Manages detailed media information, related content, and user interactions
 */

import { observable, ObservableObject } from '@legendapp/state'

// Media detail interfaces
export interface MediaDetails {
  id: string
  type: 'movie' | 'tv'
  title: string
  originalTitle?: string
  tagline?: string
  overview: string
  releaseDate: string
  runtime?: number
  status: 'released' | 'in_production' | 'planned' | 'cancelled'
  
  // Ratings and scores
  rating: {
    average: number
    count: number
    distribution: Record<string, number>
  }
  userRating?: number
  
  // Visual assets
  images: {
    posterUrl?: string
    backdropUrl?: string
    logoUrl?: string
    stillUrls: string[]
    posterUrls: string[]
    backdropUrls: string[]
  }
  
  // Content information
  genres: { id: string; name: string }[]
  keywords: { id: string; name: string }[]
  contentRating: string
  languages: {
    original: string
    spoken: string[]
  }
  countries: string[]
  
  // Production information
  production: {
    companies: { id: string; name: string; logoUrl?: string }[]
    budget?: number
    revenue?: number
    networks?: { id: string; name: string; logoUrl?: string }[]
  }
  
  // TV-specific information
  tvDetails?: {
    numberOfSeasons: number
    numberOfEpisodes: number
    episodeRunTime: number[]
    inProduction: boolean
    firstAirDate: string
    lastAirDate?: string
    nextEpisodeToAir?: {
      id: string
      name: string
      airDate: string
      seasonNumber: number
      episodeNumber: number
    }
    lastEpisodeToAir?: {
      id: string
      name: string
      airDate: string
      seasonNumber: number
      episodeNumber: number
    }
    createdBy: { id: string; name: string; profileUrl?: string }[]
    seasons: {
      id: string
      seasonNumber: number
      name: string
      overview: string
      airDate: string
      episodeCount: number
      posterUrl?: string
    }[]
  }
  
  // External IDs
  externalIds: {
    imdb?: string
    tmdb?: string
    tvdb?: string
    facebook?: string
    twitter?: string
    instagram?: string
  }
  
  // Watch providers
  watchProviders: {
    link?: string
    providers: Record<string, {
      flatrate?: { id: string; name: string; logoUrl: string }[]
      rent?: { id: string; name: string; logoUrl: string }[]
      buy?: { id: string; name: string; logoUrl: string }[]
    }>
  }
  
  // User state
  userState: {
    isInWatchlist: boolean
    isFavorite: boolean
    watchProgress?: {
      progressPercent: number
      lastWatchedAt: string
      currentPosition: number
      duration: number
    }
    downloadStatus?: 'not_downloaded' | 'downloading' | 'downloaded' | 'failed'
  }
}

export interface CastMember {
  id: string
  name: string
  character: string
  profileUrl?: string
  order: number
  episodeCount?: number
}

export interface CrewMember {
  id: string
  name: string
  job: string
  department: string
  profileUrl?: string
}

export interface MediaVideo {
  id: string
  key: string
  name: string
  site: 'YouTube' | 'Vimeo'
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers'
  size: 360 | 480 | 720 | 1080
  official: boolean
  publishedAt: string
}

export interface Review {
  id: string
  author: string
  authorDetails: {
    name?: string
    username: string
    avatarUrl?: string
    rating?: number
  }
  content: string
  createdAt: string
  updatedAt: string
  url: string
}

export interface Recommendation {
  id: string
  title: string
  type: 'movie' | 'tv'
  posterUrl?: string
  backdropUrl?: string
  rating: number
  releaseDate: string
  overview: string
  genres: string[]
  similarity: number
}

export interface Season {
  id: string
  seasonNumber: number
  name: string
  overview: string
  airDate: string
  episodeCount: number
  posterUrl?: string
  episodes: Episode[]
  isLoading: boolean
  hasLoaded: boolean
  error?: string
}

export interface Episode {
  id: string
  episodeNumber: number
  name: string
  overview: string
  airDate: string
  runtime?: number
  stillUrl?: string
  rating: {
    average: number
    count: number
  }
  userRating?: number
  watched: boolean
  watchProgress?: {
    progressPercent: number
    lastWatchedAt: string
  }
  guestStars: {
    id: string
    name: string
    character: string
    profileUrl?: string
  }[]
  crew: {
    id: string
    name: string
    job: string
    department: string
    profileUrl?: string
  }[]
}

export interface MediaDetailState {
  // Core media information
  media: MediaDetails | null
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
  
  // Related content
  cast: CastMember[]
  crew: CrewMember[]
  videos: MediaVideo[]
  images: {
    posters: string[]
    backdrops: string[]
    stills: string[]
  }
  reviews: Review[]
  recommendations: Recommendation[]
  similar: Recommendation[]
  
  // TV-specific content
  seasons: Season[]
  selectedSeasonNumber: number | null
  currentEpisode: Episode | null
  
  // Loading states
  loadingStates: {
    cast: boolean
    crew: boolean
    videos: boolean
    images: boolean
    reviews: boolean
    recommendations: boolean
    similar: boolean
    seasons: boolean
    episodes: boolean
  }
  
  // Error states
  errors: {
    cast: string | null
    crew: string | null
    videos: string | null
    images: string | null
    reviews: string | null
    recommendations: string | null
    similar: string | null
    seasons: string | null
    episodes: string | null
  }
  
  // UI state
  ui: {
    activeTab: 'overview' | 'episodes' | 'cast' | 'videos' | 'images' | 'reviews'
    expandedSections: string[]
    imageViewerVisible: boolean
    selectedImageIndex: number
    videoPlayerVisible: boolean
    selectedVideoId: string | null
    reviewsExpanded: Record<string, boolean>
    seasonsExpanded: Record<number, boolean>
    showAllCast: boolean
    showAllCrew: boolean
  }
  
  // User interactions
  interactions: {
    liked: boolean
    shared: boolean
    addedToWatchlist: boolean
    downloaded: boolean
    rating: number | null
    review: string | null
    lastInteractionAt: string | null
  }
  
  // Stream selection
  streaming: {
    availableSources: {
      id: string
      name: string
      quality: '720p' | '1080p' | '4K'
      type: 'stream' | 'download'
      url: string
      size?: number
      isOfficial: boolean
      subtitles: {
        language: string
        url: string
      }[]
    }[]
    selectedSourceId: string | null
    isLoadingSources: boolean
    sourcesError: string | null
  }
  
  // Cache and performance
  cache: {
    ttl: number
    lastFetch: string | null
    prefetchedData: Record<string, any>
    backgroundRefresh: boolean
  }
}

// Initial state
const initialState: MediaDetailState = {
  media: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  cast: [],
  crew: [],
  videos: [],
  images: {
    posters: [],
    backdrops: [],
    stills: [],
  },
  reviews: [],
  recommendations: [],
  similar: [],
  
  seasons: [],
  selectedSeasonNumber: null,
  currentEpisode: null,
  
  loadingStates: {
    cast: false,
    crew: false,
    videos: false,
    images: false,
    reviews: false,
    recommendations: false,
    similar: false,
    seasons: false,
    episodes: false,
  },
  
  errors: {
    cast: null,
    crew: null,
    videos: null,
    images: null,
    reviews: null,
    recommendations: null,
    similar: null,
    seasons: null,
    episodes: null,
  },
  
  ui: {
    activeTab: 'overview',
    expandedSections: ['overview', 'cast'],
    imageViewerVisible: false,
    selectedImageIndex: 0,
    videoPlayerVisible: false,
    selectedVideoId: null,
    reviewsExpanded: {},
    seasonsExpanded: {},
    showAllCast: false,
    showAllCrew: false,
  },
  
  interactions: {
    liked: false,
    shared: false,
    addedToWatchlist: false,
    downloaded: false,
    rating: null,
    review: null,
    lastInteractionAt: null,
  },
  
  streaming: {
    availableSources: [],
    selectedSourceId: null,
    isLoadingSources: false,
    sourcesError: null,
  },
  
  cache: {
    ttl: 600000, // 10 minutes
    lastFetch: null,
    prefetchedData: {},
    backgroundRefresh: true,
  },
}

// Create observable store
export const mediaDetailStore = observable<MediaDetailState>(initialState)

// Store actions
export const mediaDetailActions = {
  // Media actions
  setMedia: (media: MediaDetails) => {
    mediaDetailStore.media.set(media)
    mediaDetailStore.isLoading.set(false)
    mediaDetailStore.error.set(null)
    mediaDetailStore.lastUpdated.set(new Date().toISOString())
    
    // Initialize TV-specific state
    if (media.type === 'tv' && media.tvDetails) {
      const seasonsData = media.tvDetails.seasons.map(season => ({
        ...season,
        episodes: [],
        isLoading: false,
        hasLoaded: false,
      }))
      mediaDetailStore.seasons.set(seasonsData)
      if (seasonsData.length > 0) {
        mediaDetailStore.selectedSeasonNumber.set(1)
      }
    }
  },
  
  setLoading: (loading: boolean) => {
    mediaDetailStore.isLoading.set(loading)
    if (loading) {
      mediaDetailStore.error.set(null)
    }
  },
  
  setError: (error: string) => {
    mediaDetailStore.error.set(error)
    mediaDetailStore.isLoading.set(false)
  },
  
  // Cast and crew actions
  setCast: (cast: CastMember[]) => {
    mediaDetailStore.cast.set(cast)
    mediaDetailStore.loadingStates.cast.set(false)
    mediaDetailStore.errors.cast.set(null)
  },
  
  setCrew: (crew: CrewMember[]) => {
    mediaDetailStore.crew.set(crew)
    mediaDetailStore.loadingStates.crew.set(false)
    mediaDetailStore.errors.crew.set(null)
  },
  
  setCastLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.cast.set(loading)
    if (loading) {
      mediaDetailStore.errors.cast.set(null)
    }
  },
  
  setCrewLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.crew.set(loading)
    if (loading) {
      mediaDetailStore.errors.crew.set(null)
    }
  },
  
  setCastError: (error: string) => {
    mediaDetailStore.errors.cast.set(error)
    mediaDetailStore.loadingStates.cast.set(false)
  },
  
  setCrewError: (error: string) => {
    mediaDetailStore.errors.crew.set(error)
    mediaDetailStore.loadingStates.crew.set(false)
  },
  
  // Videos actions
  setVideos: (videos: MediaVideo[]) => {
    mediaDetailStore.videos.set(videos)
    mediaDetailStore.loadingStates.videos.set(false)
    mediaDetailStore.errors.videos.set(null)
  },
  
  setVideosLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.videos.set(loading)
    if (loading) {
      mediaDetailStore.errors.videos.set(null)
    }
  },
  
  setVideosError: (error: string) => {
    mediaDetailStore.errors.videos.set(error)
    mediaDetailStore.loadingStates.videos.set(false)
  },
  
  // Images actions
  setImages: (images: { posters: string[]; backdrops: string[]; stills: string[] }) => {
    mediaDetailStore.images.set(images)
    mediaDetailStore.loadingStates.images.set(false)
    mediaDetailStore.errors.images.set(null)
  },
  
  setImagesLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.images.set(loading)
    if (loading) {
      mediaDetailStore.errors.images.set(null)
    }
  },
  
  setImagesError: (error: string) => {
    mediaDetailStore.errors.images.set(error)
    mediaDetailStore.loadingStates.images.set(false)
  },
  
  // Reviews actions
  setReviews: (reviews: Review[]) => {
    mediaDetailStore.reviews.set(reviews)
    mediaDetailStore.loadingStates.reviews.set(false)
    mediaDetailStore.errors.reviews.set(null)
  },
  
  setReviewsLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.reviews.set(loading)
    if (loading) {
      mediaDetailStore.errors.reviews.set(null)
    }
  },
  
  setReviewsError: (error: string) => {
    mediaDetailStore.errors.reviews.set(error)
    mediaDetailStore.loadingStates.reviews.set(false)
  },
  
  // Recommendations actions
  setRecommendations: (recommendations: Recommendation[]) => {
    mediaDetailStore.recommendations.set(recommendations)
    mediaDetailStore.loadingStates.recommendations.set(false)
    mediaDetailStore.errors.recommendations.set(null)
  },
  
  setSimilar: (similar: Recommendation[]) => {
    mediaDetailStore.similar.set(similar)
    mediaDetailStore.loadingStates.similar.set(false)
    mediaDetailStore.errors.similar.set(null)
  },
  
  setRecommendationsLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.recommendations.set(loading)
    if (loading) {
      mediaDetailStore.errors.recommendations.set(null)
    }
  },
  
  setSimilarLoading: (loading: boolean) => {
    mediaDetailStore.loadingStates.similar.set(loading)
    if (loading) {
      mediaDetailStore.errors.similar.set(null)
    }
  },
  
  setRecommendationsError: (error: string) => {
    mediaDetailStore.errors.recommendations.set(error)
    mediaDetailStore.loadingStates.recommendations.set(false)
  },
  
  setSimilarError: (error: string) => {
    mediaDetailStore.errors.similar.set(error)
    mediaDetailStore.loadingStates.similar.set(false)
  },
  
  // Seasons and episodes actions
  setSelectedSeason: (seasonNumber: number) => {
    mediaDetailStore.selectedSeasonNumber.set(seasonNumber)
  },
  
  setSeasonEpisodes: (seasonNumber: number, episodes: Episode[]) => {
    const currentSeasons = mediaDetailStore.seasons.get()
    const updatedSeasons = currentSeasons.map(season =>
      season.seasonNumber === seasonNumber
        ? { ...season, episodes, hasLoaded: true, isLoading: false, error: undefined }
        : season
    )
    mediaDetailStore.seasons.set(updatedSeasons)
    mediaDetailStore.loadingStates.episodes.set(false)
    mediaDetailStore.errors.episodes.set(null)
  },
  
  setSeasonLoading: (seasonNumber: number, loading: boolean) => {
    const currentSeasons = mediaDetailStore.seasons.get()
    const updatedSeasons = currentSeasons.map(season =>
      season.seasonNumber === seasonNumber
        ? { ...season, isLoading: loading, error: loading ? undefined : season.error }
        : season
    )
    mediaDetailStore.seasons.set(updatedSeasons)
    mediaDetailStore.loadingStates.episodes.set(loading)
    if (loading) {
      mediaDetailStore.errors.episodes.set(null)
    }
  },
  
  setSeasonError: (seasonNumber: number, error: string) => {
    const currentSeasons = mediaDetailStore.seasons.get()
    const updatedSeasons = currentSeasons.map(season =>
      season.seasonNumber === seasonNumber
        ? { ...season, error, isLoading: false }
        : season
    )
    mediaDetailStore.seasons.set(updatedSeasons)
    mediaDetailStore.loadingStates.episodes.set(false)
    mediaDetailStore.errors.episodes.set(error)
  },
  
  setCurrentEpisode: (episode: Episode | null) => {
    mediaDetailStore.currentEpisode.set(episode)
  },
  
  updateEpisodeWatchProgress: (episodeId: string, progress: { progressPercent: number; lastWatchedAt: string }) => {
    const currentSeasons = mediaDetailStore.seasons.get()
    const updatedSeasons = currentSeasons.map(season => ({
      ...season,
      episodes: season.episodes.map(episode =>
        episode.id === episodeId
          ? { ...episode, watchProgress: progress, watched: progress.progressPercent >= 90 }
          : episode
      ),
    }))
    mediaDetailStore.seasons.set(updatedSeasons)
  },
  
  // UI actions
  setActiveTab: (tab: MediaDetailState['ui']['activeTab']) => {
    mediaDetailStore.ui.activeTab.set(tab)
  },
  
  toggleSectionExpanded: (sectionId: string) => {
    const expanded = mediaDetailStore.ui.expandedSections.get()
    if (expanded.includes(sectionId)) {
      mediaDetailStore.ui.expandedSections.set(expanded.filter(id => id !== sectionId))
    } else {
      mediaDetailStore.ui.expandedSections.set([...expanded, sectionId])
    }
  },
  
  setImageViewerVisible: (visible: boolean, imageIndex = 0) => {
    mediaDetailStore.ui.imageViewerVisible.set(visible)
    mediaDetailStore.ui.selectedImageIndex.set(imageIndex)
  },
  
  setVideoPlayerVisible: (visible: boolean, videoId: string | null = null) => {
    mediaDetailStore.ui.videoPlayerVisible.set(visible)
    mediaDetailStore.ui.selectedVideoId.set(videoId)
  },
  
  toggleReviewExpanded: (reviewId: string) => {
    const expanded = mediaDetailStore.ui.reviewsExpanded.get()
    mediaDetailStore.ui.reviewsExpanded.set({
      ...expanded,
      [reviewId]: !expanded[reviewId],
    })
  },
  
  toggleSeasonExpanded: (seasonNumber: number) => {
    const expanded = mediaDetailStore.ui.seasonsExpanded.get()
    mediaDetailStore.ui.seasonsExpanded.set({
      ...expanded,
      [seasonNumber]: !expanded[seasonNumber],
    })
  },
  
  toggleShowAllCast: () => {
    mediaDetailStore.ui.showAllCast.set(!mediaDetailStore.ui.showAllCast.get())
  },
  
  toggleShowAllCrew: () => {
    mediaDetailStore.ui.showAllCrew.set(!mediaDetailStore.ui.showAllCrew.get())
  },
  
  // User interaction actions
  toggleLike: () => {
    mediaDetailStore.interactions.liked.set(!mediaDetailStore.interactions.liked.get())
    mediaDetailStore.interactions.lastInteractionAt.set(new Date().toISOString())
  },
  
  toggleWatchlist: () => {
    mediaDetailStore.interactions.addedToWatchlist.set(!mediaDetailStore.interactions.addedToWatchlist.get())
    mediaDetailStore.interactions.lastInteractionAt.set(new Date().toISOString())
  },
  
  setRating: (rating: number | null) => {
    mediaDetailStore.interactions.rating.set(rating)
    mediaDetailStore.interactions.lastInteractionAt.set(new Date().toISOString())
  },
  
  setReview: (review: string | null) => {
    mediaDetailStore.interactions.review.set(review)
    mediaDetailStore.interactions.lastInteractionAt.set(new Date().toISOString())
  },
  
  setShared: (shared: boolean) => {
    mediaDetailStore.interactions.shared.set(shared)
    mediaDetailStore.interactions.lastInteractionAt.set(new Date().toISOString())
  },
  
  setDownloaded: (downloaded: boolean) => {
    mediaDetailStore.interactions.downloaded.set(downloaded)
    mediaDetailStore.interactions.lastInteractionAt.set(new Date().toISOString())
  },
  
  // Streaming actions
  setAvailableSources: (sources: MediaDetailState['streaming']['availableSources']) => {
    mediaDetailStore.streaming.availableSources.set(sources)
    mediaDetailStore.streaming.isLoadingSources.set(false)
    mediaDetailStore.streaming.sourcesError.set(null)
  },
  
  setSelectedSource: (sourceId: string | null) => {
    mediaDetailStore.streaming.selectedSourceId.set(sourceId)
  },
  
  setSourcesLoading: (loading: boolean) => {
    mediaDetailStore.streaming.isLoadingSources.set(loading)
    if (loading) {
      mediaDetailStore.streaming.sourcesError.set(null)
    }
  },
  
  setSourcesError: (error: string) => {
    mediaDetailStore.streaming.sourcesError.set(error)
    mediaDetailStore.streaming.isLoadingSources.set(false)
  },
  
  // Cache actions
  updateCache: (key: string, data: any) => {
    const currentCache = mediaDetailStore.cache.prefetchedData.get()
    mediaDetailStore.cache.prefetchedData.set({
      ...currentCache,
      [key]: data,
    })
  },
  
  setCacheLastFetch: () => {
    mediaDetailStore.cache.lastFetch.set(new Date().toISOString())
  },
  
  setBackgroundRefresh: (enabled: boolean) => {
    mediaDetailStore.cache.backgroundRefresh.set(enabled)
  },
  
  // Reset store
  reset: () => {
    mediaDetailStore.set(initialState)
  },
  
  // Reset for new media
  resetForNewMedia: () => {
    mediaDetailStore.set({
      ...initialState,
      cache: {
        ...initialState.cache,
        backgroundRefresh: mediaDetailStore.cache.backgroundRefresh.get(),
      },
    })
  },
}

// Computed values
export const mediaDetailComputed = {
  // Media computed
  get hasMedia() {
    return !!mediaDetailStore.media.get()
  },
  
  get isMovie() {
    return mediaDetailStore.media.get()?.type === 'movie'
  },
  
  get isTVShow() {
    return mediaDetailStore.media.get()?.type === 'tv'
  },
  
  get mediaTitle() {
    return mediaDetailStore.media.get()?.title || ''
  },
  
  get mediaYear() {
    const releaseDate = mediaDetailStore.media.get()?.releaseDate
    return releaseDate ? new Date(releaseDate).getFullYear() : null
  },
  
  get isLoading() {
    return mediaDetailStore.isLoading.get()
  },
  
  get hasError() {
    return !!mediaDetailStore.error.get()
  },
  
  // Cast and crew computed
  get displayCast() {
    const cast = mediaDetailStore.cast.get()
    const showAll = mediaDetailStore.ui.showAllCast.get()
    return showAll ? cast : cast.slice(0, 10)
  },
  
  get displayCrew() {
    const crew = mediaDetailStore.crew.get()
    const showAll = mediaDetailStore.ui.showAllCrew.get()
    return showAll ? crew : crew.slice(0, 10)
  },
  
  get hasMoreCast() {
    return mediaDetailStore.cast.get().length > 10
  },
  
  get hasMoreCrew() {
    return mediaDetailStore.crew.get().length > 10
  },
  
  get directors() {
    return mediaDetailStore.crew.get().filter(member => member.job === 'Director')
  },
  
  get writers() {
    return mediaDetailStore.crew.get().filter(member => 
      member.job === 'Writer' || member.job === 'Screenplay' || member.job === 'Story'
    )
  },
  
  get producers() {
    return mediaDetailStore.crew.get().filter(member => 
      member.job === 'Producer' || member.job === 'Executive Producer'
    )
  },
  
  // Videos computed
  get trailers() {
    return mediaDetailStore.videos.get().filter(video => video.type === 'Trailer')
  },
  
  get teasers() {
    return mediaDetailStore.videos.get().filter(video => video.type === 'Teaser')
  },
  
  get clips() {
    return mediaDetailStore.videos.get().filter(video => video.type === 'Clip')
  },
  
  get featurettes() {
    return mediaDetailStore.videos.get().filter(video => 
      video.type === 'Featurette' || video.type === 'Behind the Scenes'
    )
  },
  
  // TV show computed
  get selectedSeason() {
    const selectedNumber = mediaDetailStore.selectedSeasonNumber.get()
    const seasons = mediaDetailStore.seasons.get()
    return seasons.find(season => season.seasonNumber === selectedNumber) || null
  },
  
  get selectedSeasonEpisodes() {
    return mediaDetailComputed.selectedSeason?.episodes || []
  },
  
  get hasSeasons() {
    return mediaDetailStore.seasons.get().length > 0
  },
  
  get totalEpisodes() {
    return mediaDetailStore.seasons.get().reduce((total, season) => total + season.episodeCount, 0)
  },
  
  get watchedEpisodes() {
    return mediaDetailStore.seasons.get().reduce((total, season) => 
      total + season.episodes.filter(episode => episode.watched).length, 0
    )
  },
  
  get watchProgress() {
    const total = mediaDetailComputed.totalEpisodes
    const watched = mediaDetailComputed.watchedEpisodes
    return total > 0 ? (watched / total) * 100 : 0
  },
  
  // Images computed
  get totalImages() {
    const images = mediaDetailStore.images.get()
    return images.posters.length + images.backdrops.length + images.stills.length
  },
  
  get allImages() {
    const images = mediaDetailStore.images.get()
    return [
      ...images.posters.map(url => ({ url, type: 'poster' })),
      ...images.backdrops.map(url => ({ url, type: 'backdrop' })),
      ...images.stills.map(url => ({ url, type: 'still' })),
    ]
  },
  
  // Reviews computed
  get hasReviews() {
    return mediaDetailStore.reviews.get().length > 0
  },
  
  get averageReviewRating() {
    const reviews = mediaDetailStore.reviews.get()
    const ratingsWithValues = reviews
      .map(review => review.authorDetails.rating)
      .filter((rating): rating is number => rating !== undefined)
    
    if (ratingsWithValues.length === 0) return null
    
    const sum = ratingsWithValues.reduce((total, rating) => total + rating, 0)
    return sum / ratingsWithValues.length
  },
  
  // Recommendations computed
  get hasRecommendations() {
    return mediaDetailStore.recommendations.get().length > 0
  },
  
  get hasSimilar() {
    return mediaDetailStore.similar.get().length > 0
  },
  
  get combinedRecommendations() {
    const recommendations = mediaDetailStore.recommendations.get()
    const similar = mediaDetailStore.similar.get()
    return [...recommendations, ...similar].slice(0, 20)
  },
  
  // UI computed
  get isOverviewActive() {
    return mediaDetailStore.ui.activeTab.get() === 'overview'
  },
  
  get isEpisodesActive() {
    return mediaDetailStore.ui.activeTab.get() === 'episodes'
  },
  
  get isCastActive() {
    return mediaDetailStore.ui.activeTab.get() === 'cast'
  },
  
  get isVideosActive() {
    return mediaDetailStore.ui.activeTab.get() === 'videos'
  },
  
  get isImagesActive() {
    return mediaDetailStore.ui.activeTab.get() === 'images'
  },
  
  get isReviewsActive() {
    return mediaDetailStore.ui.activeTab.get() === 'reviews'
  },
  
  // Interactions computed
  get hasUserRating() {
    return mediaDetailStore.interactions.rating.get() !== null
  },
  
  get hasUserReview() {
    return !!mediaDetailStore.interactions.review.get()
  },
  
  get isLiked() {
    return mediaDetailStore.interactions.liked.get()
  },
  
  get isInWatchlist() {
    return mediaDetailStore.interactions.addedToWatchlist.get()
  },
  
  get isDownloaded() {
    return mediaDetailStore.interactions.downloaded.get()
  },
  
  // Streaming computed
  get hasStreamingSources() {
    return mediaDetailStore.streaming.availableSources.get().length > 0
  },
  
  get officialSources() {
    return mediaDetailStore.streaming.availableSources.get().filter(source => source.isOfficial)
  },
  
  get unofficialSources() {
    return mediaDetailStore.streaming.availableSources.get().filter(source => !source.isOfficial)
  },
  
  get selectedSource() {
    const selectedId = mediaDetailStore.streaming.selectedSourceId.get()
    const sources = mediaDetailStore.streaming.availableSources.get()
    return sources.find(source => source.id === selectedId) || null
  },
  
  get streamingQualities() {
    const sources = mediaDetailStore.streaming.availableSources.get()
    const qualities = new Set(sources.map(source => source.quality))
    return Array.from(qualities).sort((a, b) => {
      const order = { '720p': 1, '1080p': 2, '4K': 3 }
      return order[a] - order[b]
    })
  },
  
  // Cache computed
  get isCacheValid() {
    const lastFetch = mediaDetailStore.cache.lastFetch.get()
    const ttl = mediaDetailStore.cache.ttl.get()
    if (!lastFetch) return false
    return Date.now() - new Date(lastFetch).getTime() < ttl
  },
  
  get cacheAge() {
    const lastFetch = mediaDetailStore.cache.lastFetch.get()
    return lastFetch ? Date.now() - new Date(lastFetch).getTime() : 0
  },
  
  // Loading computed
  get isAnyContentLoading() {
    const loadingStates = mediaDetailStore.loadingStates.get()
    return Object.values(loadingStates).some(loading => loading)
  },
  
  get hasAnyErrors() {
    const errors = mediaDetailStore.errors.get()
    return Object.values(errors).some(error => error !== null)
  },
}

// Export types
export type MediaDetailStore = ObservableObject<MediaDetailState>
export type MediaDetailActions = typeof mediaDetailActions
export type MediaDetailComputed = typeof mediaDetailComputed