/**
 * TMDB API client implementation
 * Provides access to The Movie Database API with Bearer token authentication
 */

import { AxiosApiService, AxiosClientConfig } from '@/src/infrastructure/api/axios'
import { IApiService } from '@/src/domain/services/api.service.interface'

export interface TMDBConfig {
  apiKey: string
  baseURL?: string
  enableLogging?: boolean
  timeout?: number
  retries?: number
}

export class TMDBApiClient {
  private apiService: IApiService

  constructor(config: TMDBConfig) {
    const axiosConfig: AxiosClientConfig = {
      baseURL: config.baseURL || 'https://api.themoviedb.org/3',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      retryDelay: 1000,
      bearerToken: config.apiKey, // TMDB uses Bearer token authentication
      enableLogging: config.enableLogging ?? __DEV__,
    }

    this.apiService = new AxiosApiService(axiosConfig)
    
    // Enable caching for TMDB responses (5 minutes default)
    this.apiService.enableCache(5 * 60 * 1000)
  }

  /**
   * Get the underlying API service for direct access
   */
  getApiService(): IApiService {
    return this.apiService
  }

  /**
   * Search for movies
   */
  async searchMovies(query: string, page = 1, language = 'en-US') {
    return this.apiService.get('/search/movie', {
      params: {
        query,
        page,
        language,
        include_adult: false,
      },
      cache: true,
      cacheTTL: 10 * 60 * 1000, // Cache search results for 10 minutes
    })
  }

  /**
   * Search for TV shows
   */
  async searchTvShows(query: string, page = 1, language = 'en-US') {
    return this.apiService.get('/search/tv', {
      params: {
        query,
        page,
        language,
        include_adult: false,
      },
      cache: true,
      cacheTTL: 10 * 60 * 1000,
    })
  }

  /**
   * Search for people
   */
  async searchPeople(query: string, page = 1, language = 'en-US') {
    return this.apiService.get('/search/person', {
      params: {
        query,
        page,
        language,
        include_adult: false,
      },
      cache: true,
      cacheTTL: 10 * 60 * 1000,
    })
  }

  /**
   * Get movie details
   */
  async getMovieDetails(movieId: number, language = 'en-US', appendToResponse?: string) {
    return this.apiService.get(`/movie/${movieId}`, {
      params: {
        language,
        ...(appendToResponse && { append_to_response: appendToResponse }),
      },
      cache: true,
      cacheTTL: 60 * 60 * 1000, // Cache movie details for 1 hour
    })
  }

  /**
   * Get TV show details
   */
  async getTvShowDetails(tvId: number, language = 'en-US', appendToResponse?: string) {
    return this.apiService.get(`/tv/${tvId}`, {
      params: {
        language,
        ...(appendToResponse && { append_to_response: appendToResponse }),
      },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get person details
   */
  async getPersonDetails(personId: number, language = 'en-US', appendToResponse?: string) {
    return this.apiService.get(`/person/${personId}`, {
      params: {
        language,
        ...(appendToResponse && { append_to_response: appendToResponse }),
      },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get trending content
   */
  async getTrending(mediaType: 'all' | 'movie' | 'tv' | 'person', timeWindow: 'day' | 'week' = 'week') {
    return this.apiService.get(`/trending/${mediaType}/${timeWindow}`, {
      cache: true,
      cacheTTL: 30 * 60 * 1000, // Cache trending for 30 minutes
    })
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page = 1, language = 'en-US', region?: string) {
    return this.apiService.get('/movie/popular', {
      params: {
        page,
        language,
        ...(region && { region }),
      },
      cache: true,
      cacheTTL: 30 * 60 * 1000,
    })
  }

  /**
   * Get popular TV shows
   */
  async getPopularTvShows(page = 1, language = 'en-US') {
    return this.apiService.get('/tv/popular', {
      params: {
        page,
        language,
      },
      cache: true,
      cacheTTL: 30 * 60 * 1000,
    })
  }

  /**
   * Get movie recommendations
   */
  async getMovieRecommendations(movieId: number, page = 1, language = 'en-US') {
    return this.apiService.get(`/movie/${movieId}/recommendations`, {
      params: {
        page,
        language,
      },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get TV show recommendations
   */
  async getTvShowRecommendations(tvId: number, page = 1, language = 'en-US') {
    return this.apiService.get(`/tv/${tvId}/recommendations`, {
      params: {
        page,
        language,
      },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get movie credits
   */
  async getMovieCredits(movieId: number, language = 'en-US') {
    return this.apiService.get(`/movie/${movieId}/credits`, {
      params: { language },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get TV show credits
   */
  async getTvShowCredits(tvId: number, language = 'en-US') {
    return this.apiService.get(`/tv/${tvId}/credits`, {
      params: { language },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get person movie credits
   */
  async getPersonMovieCredits(personId: number, language = 'en-US') {
    return this.apiService.get(`/person/${personId}/movie_credits`, {
      params: { language },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get person TV credits
   */
  async getPersonTvCredits(personId: number, language = 'en-US') {
    return this.apiService.get(`/person/${personId}/tv_credits`, {
      params: { language },
      cache: true,
      cacheTTL: 60 * 60 * 1000,
    })
  }

  /**
   * Get configuration data
   */
  async getConfiguration() {
    return this.apiService.get('/configuration', {
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000, // Cache config for 24 hours
    })
  }

  /**
   * Get genre list for movies
   */
  async getMovieGenres(language = 'en-US') {
    return this.apiService.get('/genre/movie/list', {
      params: { language },
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000,
    })
  }

  /**
   * Get genre list for TV shows
   */
  async getTvGenres(language = 'en-US') {
    return this.apiService.get('/genre/tv/list', {
      params: { language },
      cache: true,
      cacheTTL: 24 * 60 * 60 * 1000,
    })
  }

  /**
   * Discover movies with filters
   */
  async discoverMovies(filters: {
    page?: number
    language?: string
    region?: string
    sortBy?: string
    genreIds?: number[]
    year?: number
    releaseDateGte?: string
    releaseDateLte?: string
    voteAverageGte?: number
    voteAverageLte?: number
    withCast?: number[]
    withCrew?: number[]
    withCompanies?: number[]
    withKeywords?: number[]
  } = {}) {
    const params: Record<string, any> = {
      page: filters.page || 1,
      language: filters.language || 'en-US',
      sort_by: filters.sortBy || 'popularity.desc',
      include_adult: false,
      include_video: false,
    }

    if (filters.region) params.region = filters.region
    if (filters.genreIds?.length) params.with_genres = filters.genreIds.join(',')
    if (filters.year) params.year = filters.year
    if (filters.releaseDateGte) params['release_date.gte'] = filters.releaseDateGte
    if (filters.releaseDateLte) params['release_date.lte'] = filters.releaseDateLte
    if (filters.voteAverageGte) params['vote_average.gte'] = filters.voteAverageGte
    if (filters.voteAverageLte) params['vote_average.lte'] = filters.voteAverageLte
    if (filters.withCast?.length) params.with_cast = filters.withCast.join(',')
    if (filters.withCrew?.length) params.with_crew = filters.withCrew.join(',')
    if (filters.withCompanies?.length) params.with_companies = filters.withCompanies.join(',')
    if (filters.withKeywords?.length) params.with_keywords = filters.withKeywords.join(',')

    return this.apiService.get('/discover/movie', {
      params,
      cache: true,
      cacheTTL: 15 * 60 * 1000, // Cache discover results for 15 minutes
    })
  }

  /**
   * Discover TV shows with filters
   */
  async discoverTvShows(filters: {
    page?: number
    language?: string
    sortBy?: string
    genreIds?: number[]
    firstAirDateYear?: number
    firstAirDateGte?: string
    firstAirDateLte?: string
    voteAverageGte?: number
    voteAverageLte?: number
    withCast?: number[]
    withCrew?: number[]
    withCompanies?: number[]
    withKeywords?: number[]
    withNetworks?: number[]
  } = {}) {
    const params: Record<string, any> = {
      page: filters.page || 1,
      language: filters.language || 'en-US',
      sort_by: filters.sortBy || 'popularity.desc',
      include_adult: false,
    }

    if (filters.genreIds?.length) params.with_genres = filters.genreIds.join(',')
    if (filters.firstAirDateYear) params.first_air_date_year = filters.firstAirDateYear
    if (filters.firstAirDateGte) params['first_air_date.gte'] = filters.firstAirDateGte
    if (filters.firstAirDateLte) params['first_air_date.lte'] = filters.firstAirDateLte
    if (filters.voteAverageGte) params['vote_average.gte'] = filters.voteAverageGte
    if (filters.voteAverageLte) params['vote_average.lte'] = filters.voteAverageLte
    if (filters.withCast?.length) params.with_cast = filters.withCast.join(',')
    if (filters.withCrew?.length) params.with_crew = filters.withCrew.join(',')
    if (filters.withCompanies?.length) params.with_companies = filters.withCompanies.join(',')
    if (filters.withKeywords?.length) params.with_keywords = filters.withKeywords.join(',')
    if (filters.withNetworks?.length) params.with_networks = filters.withNetworks.join(',')

    return this.apiService.get('/discover/tv', {
      params,
      cache: true,
      cacheTTL: 15 * 60 * 1000,
    })
  }

  /**
   * Health check for TMDB API
   */
  async healthCheck() {
    return this.apiService.ping('/configuration')
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.apiService.cleanup()
  }
}