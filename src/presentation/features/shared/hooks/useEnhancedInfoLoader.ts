/**
 * useEnhancedInfoLoader Hook
 *
 * Progressive loading system for enhanced information sections featuring:
 * - Staged loading with priority-based information retrieval
 * - Graceful degradation when enhanced data is unavailable
 * - Loading state management with smooth indicators
 * - Error handling with fallback mechanisms
 * - Cache management for improved performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useLogging } from '@/src/infrastructure/di'
import type { CatalogItem, PersonCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'

// Enhanced information types
export interface EnhancedPersonInfo {
  awards?: {
    id: string
    name: string
    category: string
    year: number
    isWin: boolean
    workTitle?: string
  }[]
  careerMilestones?: {
    id: string
    year: number
    title: string
    description?: string
    type: 'debut' | 'breakthrough' | 'award' | 'collaboration' | 'genre_change' | 'other'
    significance?: number
  }[]
  trivia?: {
    id: string
    text: string
    category: 'personal' | 'career' | 'behind_scenes' | 'achievement' | 'collaboration' | 'fun_fact'
    verified?: boolean
  }[]
  socialMedia?: {
    id: string
    platform: 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin' | 'imdb' | 'website'
    url: string
    verified?: boolean
    followers?: number
  }[]
  relatedPeople?: {
    id: string
    name: string
    relationshipType: 'family' | 'collaborator' | 'mentor' | 'mentee' | 'friend' | 'co_star' | 'director' | 'producer'
    collaborationCount?: number
  }[]
}

export interface EnhancedMediaInfo {
  productionInfo?: {
    companies?: {
      id: string
      name: string
      role: 'production' | 'distribution' | 'financing' | 'co_production'
      logoUrl?: string
    }[]
    locations?: {
      id: string
      name: string
      type: 'city' | 'country' | 'studio' | 'landmark' | 'region'
      description?: string
    }[]
    budget?: number
    boxOffice?: {
      worldwide?: number
      domestic?: number
    }
  }
  technicalSpecs?: {
    video?: {
      resolution?: string
      hdrFormat?: string
      frameRate?: string
    }
    audio?: {
      format?: string
      channels?: string
      languages?: string[]
    }
    contentAdvisory?: {
      mpaaRating?: string
      contentWarnings?: string[]
    }
  }
  criticalReception?: {
    scores?: {
      source: string
      score: number
      maxScore: number
      type: 'critics' | 'audience'
    }[]
    consensus?: {
      consensus: string
      category: 'universal_acclaim' | 'positive' | 'mixed' | 'negative' | 'universal_panning'
    }
    featuredReviews?: {
      id: string
      criticName: string
      publication: string
      quote: string
    }[]
  }
  behindTheScenes?: {
    items?: {
      id: string
      title: string
      description: string
      category: 'production' | 'casting' | 'filming' | 'post_production' | 'creative' | 'technical' | 'anecdote'
    }[]
    filmingTimeline?: {
      phase: string
      startDate: string
      endDate: string
    }[]
  }
}

export interface LoadingStage {
  /** Stage identifier */
  id: string
  /** Stage name for display */
  name: string
  /** Stage priority (lower = higher priority) */
  priority: number
  /** Loading progress (0-100) */
  progress: number
  /** Whether stage is complete */
  isComplete: boolean
  /** Stage error (if any) */
  error?: Error
}

interface UseEnhancedInfoLoaderOptions<T> {
  /** Item to load enhanced info for */
  item: T | null
  /** Whether to auto-start loading */
  autoLoad?: boolean
  /** Cache time in milliseconds */
  cacheTime?: number
  /** Stale time in milliseconds */
  staleTime?: number
  /** Enable background refetch */
  backgroundRefetch?: boolean
}

interface EnhancedInfoLoaderResult<T> {
  /** Enhanced information data */
  enhancedInfo: T | null
  /** Current loading stages */
  loadingStages: LoadingStage[]
  /** Overall loading state */
  isLoading: boolean
  /** Whether any stage has an error */
  hasError: boolean
  /** Combined error from all stages */
  error: Error | null
  /** Overall progress (0-100) */
  overallProgress: number
  /** Whether enhancement is complete */
  isComplete: boolean
  /** Retry loading for failed stages */
  retry: () => void
  /** Manually trigger loading */
  load: () => void
  /** Clear all cached data */
  clearCache: () => void
}

/**
 * Mock enhanced info loader for person
 * In a real implementation, this would call actual enhancement APIs
 */
const loadEnhancedPersonInfo = async (person: PersonCatalogItem): Promise<EnhancedPersonInfo> => {
  // Simulate progressive loading with different stages
  const enhancedInfo: EnhancedPersonInfo = {}

  // Stage 1: Awards (highest priority)
  if (Math.random() > 0.3) { // 70% chance of having awards
    enhancedInfo.awards = [
      {
        id: '1',
        name: 'Academy Award',
        category: 'Best Actor',
        year: 2020,
        isWin: true,
        workTitle: 'Sample Movie'
      }
    ]
  }

  // Stage 2: Career milestones
  if (Math.random() > 0.2) { // 80% chance
    enhancedInfo.careerMilestones = [
      {
        id: '1',
        year: 2015,
        title: 'Breakthrough Role',
        description: 'First major film role that launched career',
        type: 'breakthrough',
        significance: 5
      }
    ]
  }

  // Stage 3: Trivia
  if (Math.random() > 0.1) { // 90% chance
    enhancedInfo.trivia = [
      {
        id: '1',
        text: 'Did all their own stunts in the action sequences',
        category: 'behind_scenes',
        verified: true
      }
    ]
  }

  // Stage 4: Social media (lower priority)
  if (Math.random() > 0.4) { // 60% chance
    enhancedInfo.socialMedia = [
      {
        id: '1',
        platform: 'twitter',
        url: 'https://twitter.com/example',
        verified: true,
        followers: 1000000
      }
    ]
  }

  // Stage 5: Related people (lowest priority)
  if (Math.random() > 0.5) { // 50% chance
    enhancedInfo.relatedPeople = [
      {
        id: '1',
        name: 'Frequent Collaborator',
        relationshipType: 'collaborator',
        collaborationCount: 3
      }
    ]
  }

  return enhancedInfo
}

/**
 * Mock enhanced info loader for media
 */
const loadEnhancedMediaInfo = async (media: CatalogItem): Promise<EnhancedMediaInfo> => {
  const enhancedInfo: EnhancedMediaInfo = {}

  // Stage 1: Production info
  if (Math.random() > 0.2) {
    enhancedInfo.productionInfo = {
      companies: [
        {
          id: '1',
          name: 'Example Studios',
          role: 'production'
        }
      ],
      budget: 50000000,
      boxOffice: {
        worldwide: 200000000,
        domestic: 100000000
      }
    }
  }

  // Stage 2: Technical specs
  if (Math.random() > 0.3) {
    enhancedInfo.technicalSpecs = {
      video: {
        resolution: '4K',
        hdrFormat: 'HDR10',
        frameRate: '24 fps'
      },
      audio: {
        format: 'Dolby Atmos',
        channels: '7.1',
        languages: ['English', 'Spanish', 'French']
      }
    }
  }

  // Stage 3: Critical reception
  if (Math.random() > 0.1) {
    enhancedInfo.criticalReception = {
      scores: [
        {
          source: 'Rotten Tomatoes',
          score: 85,
          maxScore: 100,
          type: 'critics'
        }
      ],
      consensus: {
        consensus: 'A well-crafted film with strong performances',
        category: 'positive'
      }
    }
  }

  // Stage 4: Behind the scenes
  if (Math.random() > 0.4) {
    enhancedInfo.behindTheScenes = {
      items: [
        {
          id: '1',
          title: 'Challenging Stunt Sequence',
          description: 'The car chase took 3 weeks to film',
          category: 'filming'
        }
      ]
    }
  }

  return enhancedInfo
}

/**
 * Hook for loading enhanced person information
 */
export const useEnhancedPersonInfo = (
  options: UseEnhancedInfoLoaderOptions<PersonCatalogItem>
): EnhancedInfoLoaderResult<EnhancedPersonInfo> => {
  const logger = useLogging()
  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>([])

  // Initialize loading stages
  useEffect(() => {
    if (options.item) {
      setLoadingStages([
        { id: 'awards', name: 'Awards & Nominations', priority: 1, progress: 0, isComplete: false },
        { id: 'career', name: 'Career Timeline', priority: 2, progress: 0, isComplete: false },
        { id: 'trivia', name: 'Trivia & Facts', priority: 3, progress: 0, isComplete: false },
        { id: 'social', name: 'Social Media', priority: 4, progress: 0, isComplete: false },
        { id: 'related', name: 'Related People', priority: 5, progress: 0, isComplete: false }
      ])
    }
  }, [options.item])

  // Enhanced info query
  const {
    data: enhancedInfo,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['enhanced-person-info', options.item?.id],
    queryFn: async () => {
      if (!options.item) return null

      logger.info('Loading enhanced person information', {
        context: 'enhanced_info_loader',
        personId: options.item.id,
        personName: options.item.title
      })

      // Simulate progressive loading stages
      const updateStage = (stageId: string, progress: number, isComplete: boolean, error?: Error) => {
        setLoadingStages(prev => prev.map(stage =>
          stage.id === stageId
            ? { ...stage, progress, isComplete, error }
            : stage
        ))
      }

      try {
        // Stage 1: Awards (simulate delay)
        updateStage('awards', 50, false)
        await new Promise(resolve => setTimeout(resolve, 500))
        updateStage('awards', 100, true)

        // Stage 2: Career timeline
        updateStage('career', 50, false)
        await new Promise(resolve => setTimeout(resolve, 300))
        updateStage('career', 100, true)

        // Stage 3: Trivia
        updateStage('trivia', 50, false)
        await new Promise(resolve => setTimeout(resolve, 400))
        updateStage('trivia', 100, true)

        // Stage 4: Social media
        updateStage('social', 50, false)
        await new Promise(resolve => setTimeout(resolve, 600))
        updateStage('social', 100, true)

        // Stage 5: Related people
        updateStage('related', 50, false)
        await new Promise(resolve => setTimeout(resolve, 800))
        updateStage('related', 100, true)

        const result = await loadEnhancedPersonInfo(options.item)

        logger.info('Enhanced person information loaded successfully', {
          context: 'enhanced_info_loader',
          personId: options.item.id,
          sectionsLoaded: Object.keys(result).length
        })

        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to load enhanced person information', errorInstance, {
          context: 'enhanced_info_loader',
          personId: options.item.id
        })
        throw errorInstance
      }
    },
    enabled: !!options.item && (options.autoLoad !== false),
    staleTime: options.staleTime || 10 * 60 * 1000, // 10 minutes
    gcTime: options.cacheTime || 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: options.backgroundRefetch ?? false,
    retry: 2
  })

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (loadingStages.length === 0) return 0
    const totalProgress = loadingStages.reduce((sum, stage) => sum + stage.progress, 0)
    return Math.round(totalProgress / loadingStages.length)
  }, [loadingStages])

  // Check if all stages are complete
  const isComplete = useMemo(() => {
    return loadingStages.length > 0 && loadingStages.every(stage => stage.isComplete)
  }, [loadingStages])

  // Check if any stage has an error
  const hasError = useMemo(() => {
    return loadingStages.some(stage => stage.error)
  }, [loadingStages])

  const retry = useCallback(() => {
    // Reset failed stages
    setLoadingStages(prev => prev.map(stage => ({
      ...stage,
      progress: stage.error ? 0 : stage.progress,
      isComplete: stage.error ? false : stage.isComplete,
      error: undefined
    })))
    refetch()
  }, [refetch])

  const load = useCallback(() => {
    refetch()
  }, [refetch])

  const clearCache = useCallback(() => {
    // This would clear the query cache in a real implementation
    logger.info('Clearing enhanced person info cache', {
      context: 'enhanced_info_loader',
      personId: options.item?.id
    })
  }, [logger, options.item])

  return {
    enhancedInfo: enhancedInfo || null,
    loadingStages,
    isLoading,
    hasError,
    error: error || null,
    overallProgress,
    isComplete,
    retry,
    load,
    clearCache
  }
}

/**
 * Hook for loading enhanced media information
 */
export const useEnhancedMediaInfo = (
  options: UseEnhancedInfoLoaderOptions<CatalogItem>
): EnhancedInfoLoaderResult<EnhancedMediaInfo> => {
  const logger = useLogging()
  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>([])

  // Initialize loading stages
  useEffect(() => {
    if (options.item) {
      setLoadingStages([
        { id: 'production', name: 'Production Info', priority: 1, progress: 0, isComplete: false },
        { id: 'technical', name: 'Technical Specs', priority: 2, progress: 0, isComplete: false },
        { id: 'reception', name: 'Critical Reception', priority: 3, progress: 0, isComplete: false },
        { id: 'behind_scenes', name: 'Behind the Scenes', priority: 4, progress: 0, isComplete: false }
      ])
    }
  }, [options.item])

  // Enhanced info query
  const {
    data: enhancedInfo,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['enhanced-media-info', options.item?.id],
    queryFn: async () => {
      if (!options.item) return null

      logger.info('Loading enhanced media information', {
        context: 'enhanced_info_loader',
        mediaId: options.item.id,
        mediaTitle: options.item.title
      })

      // Simulate progressive loading stages
      const updateStage = (stageId: string, progress: number, isComplete: boolean, error?: Error) => {
        setLoadingStages(prev => prev.map(stage =>
          stage.id === stageId
            ? { ...stage, progress, isComplete, error }
            : stage
        ))
      }

      try {
        // Stage 1: Production info
        updateStage('production', 50, false)
        await new Promise(resolve => setTimeout(resolve, 400))
        updateStage('production', 100, true)

        // Stage 2: Technical specs
        updateStage('technical', 50, false)
        await new Promise(resolve => setTimeout(resolve, 300))
        updateStage('technical', 100, true)

        // Stage 3: Critical reception
        updateStage('reception', 50, false)
        await new Promise(resolve => setTimeout(resolve, 600))
        updateStage('reception', 100, true)

        // Stage 4: Behind the scenes
        updateStage('behind_scenes', 50, false)
        await new Promise(resolve => setTimeout(resolve, 700))
        updateStage('behind_scenes', 100, true)

        const result = await loadEnhancedMediaInfo(options.item)

        logger.info('Enhanced media information loaded successfully', {
          context: 'enhanced_info_loader',
          mediaId: options.item.id,
          sectionsLoaded: Object.keys(result).length
        })

        return result
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to load enhanced media information', errorInstance, {
          context: 'enhanced_info_loader',
          mediaId: options.item.id
        })
        throw errorInstance
      }
    },
    enabled: !!options.item && (options.autoLoad !== false),
    staleTime: options.staleTime || 10 * 60 * 1000,
    gcTime: options.cacheTime || 30 * 60 * 1000,
    refetchOnWindowFocus: options.backgroundRefetch ?? false,
    retry: 2
  })

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (loadingStages.length === 0) return 0
    const totalProgress = loadingStages.reduce((sum, stage) => sum + stage.progress, 0)
    return Math.round(totalProgress / loadingStages.length)
  }, [loadingStages])

  // Check if all stages are complete
  const isComplete = useMemo(() => {
    return loadingStages.length > 0 && loadingStages.every(stage => stage.isComplete)
  }, [loadingStages])

  // Check if any stage has an error
  const hasError = useMemo(() => {
    return loadingStages.some(stage => stage.error)
  }, [loadingStages])

  const retry = useCallback(() => {
    setLoadingStages(prev => prev.map(stage => ({
      ...stage,
      progress: stage.error ? 0 : stage.progress,
      isComplete: stage.error ? false : stage.isComplete,
      error: undefined
    })))
    refetch()
  }, [refetch])

  const load = useCallback(() => {
    refetch()
  }, [refetch])

  const clearCache = useCallback(() => {
    logger.info('Clearing enhanced media info cache', {
      context: 'enhanced_info_loader',
      mediaId: options.item?.id
    })
  }, [logger, options.item])

  return {
    enhancedInfo: enhancedInfo || null,
    loadingStages,
    isLoading,
    hasError,
    error: error || null,
    overallProgress,
    isComplete,
    retry,
    load,
    clearCache
  }
}