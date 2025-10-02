// Custom DI container pattern
import { 
  IApiService, 
  ILoggingService, 
  ApiResponse,
  ApiError 
} from '@/src/domain/services'
import { TOKENS } from '@/src/infrastructure/di/tokens'

/**
 * TMDB API data source for fetching media and person data
 * Handles all direct interactions with TMDB API endpoints
 */
export class TMDBDataSource {
  constructor(
    private readonly apiService: IApiService,
    private readonly logger: ILoggingService
  ) {}

  // Movie operations
  async getMovie(movieId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching movie details', { movieId })
      return await this.apiService.get(`/movie/${movieId}?append_to_response=credits,videos,images,external_ids,keywords,recommendations,similar`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch movie details', errorInstance, { movieId })
      throw new Error(`Failed to fetch movie ${movieId}: ${errorInstance.message}`)
    }
  }

  async getMovieCredits(movieId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/${movieId}/credits`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch movie credits', errorInstance, { movieId })
      throw new Error(`Failed to fetch movie credits for ${movieId}: ${errorInstance.message}`)
    }
  }

  async getMovieRecommendations(movieId: string, page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/${movieId}/recommendations?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch movie recommendations', errorInstance, { movieId, page })
      throw new Error(`Failed to fetch movie recommendations for ${movieId}: ${errorInstance.message}`)
    }
  }

  async getSimilarMovies(movieId: string, page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/${movieId}/similar?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch similar movies', errorInstance, { movieId, page })
      throw new Error(`Failed to fetch similar movies for ${movieId}: ${errorInstance.message}`)
    }
  }

  // TV Series operations
  async getTVSeries(seriesId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching TV series details', { seriesId })
      return await this.apiService.get(`/tv/${seriesId}?append_to_response=credits,videos,images,external_ids,keywords,recommendations,similar`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TV series details', errorInstance, { seriesId })
      throw new Error(`Failed to fetch TV series ${seriesId}: ${errorInstance.message}`)
    }
  }

  async getTVSeriesCredits(seriesId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/tv/${seriesId}/credits`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TV series credits', errorInstance, { seriesId })
      throw new Error(`Failed to fetch TV series credits for ${seriesId}: ${errorInstance.message}`)
    }
  }

  async getSeasonDetails(seriesId: string, seasonNumber: number): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/tv/${seriesId}/season/${seasonNumber}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch season details', errorInstance, { seriesId, seasonNumber })
      throw new Error(`Failed to fetch season ${seasonNumber} for series ${seriesId}: ${errorInstance.message}`)
    }
  }

  async getEpisodeDetails(seriesId: string, seasonNumber: number, episodeNumber: number): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch episode details', errorInstance, { seriesId, seasonNumber, episodeNumber })
      throw new Error(`Failed to fetch episode ${episodeNumber} of season ${seasonNumber} for series ${seriesId}: ${errorInstance.message}`)
    }
  }

  // Person operations
  async getPerson(personId: string): Promise<ApiResponse<any>> {
    try {
      this.logger.debug('Fetching person details', { personId })
      return await this.apiService.get(`/person/${personId}?append_to_response=combined_credits,external_ids,images,translations`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch person details', errorInstance, { personId })
      throw new Error(`Failed to fetch person ${personId}: ${errorInstance.message}`)
    }
  }

  async getPersonMovieCredits(personId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/person/${personId}/movie_credits`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch person movie credits', errorInstance, { personId })
      throw new Error(`Failed to fetch movie credits for person ${personId}: ${errorInstance.message}`)
    }
  }

  async getPersonTVCredits(personId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/person/${personId}/tv_credits`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch person TV credits', errorInstance, { personId })
      throw new Error(`Failed to fetch TV credits for person ${personId}: ${errorInstance.message}`)
    }
  }

  async getPersonCombinedCredits(personId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/person/${personId}/combined_credits`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch person combined credits', errorInstance, { personId })
      throw new Error(`Failed to fetch combined credits for person ${personId}: ${errorInstance.message}`)
    }
  }

  async getPersonImages(personId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/person/${personId}/images`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch person images', errorInstance, { personId })
      throw new Error(`Failed to fetch images for person ${personId}: ${errorInstance.message}`)
    }
  }

  // Search operations
  async searchMovies(query: string, page = 1): Promise<ApiResponse<any>> {
    try {
      const encodedQuery = encodeURIComponent(query)
      return await this.apiService.get(`/search/movie?query=${encodedQuery}&page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to search movies', errorInstance, { query, page })
      throw new Error(`Failed to search movies with query "${query}": ${errorInstance.message}`)
    }
  }

  async searchTV(query: string, page = 1): Promise<ApiResponse<any>> {
    try {
      const encodedQuery = encodeURIComponent(query)
      return await this.apiService.get(`/search/tv?query=${encodedQuery}&page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to search TV series', errorInstance, { query, page })
      throw new Error(`Failed to search TV series with query "${query}": ${errorInstance.message}`)
    }
  }

  async searchPeople(query: string, page = 1): Promise<ApiResponse<any>> {
    try {
      const encodedQuery = encodeURIComponent(query)
      return await this.apiService.get(`/search/person?query=${encodedQuery}&page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to search people', errorInstance, { query, page })
      throw new Error(`Failed to search people with query "${query}": ${errorInstance.message}`)
    }
  }

  async multiSearch(query: string, page = 1): Promise<ApiResponse<any>> {
    try {
      const encodedQuery = encodeURIComponent(query)
      return await this.apiService.get(`/search/multi?query=${encodedQuery}&page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to perform multi search', errorInstance, { query, page })
      throw new Error(`Failed to perform multi search with query "${query}": ${errorInstance.message}`)
    }
  }

  // Discovery operations
  async getPopularMovies(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/popular?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch popular movies', errorInstance, { page })
      throw new Error(`Failed to fetch popular movies: ${errorInstance.message}`)
    }
  }

  async getPopularTV(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/tv/popular?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch popular TV series', errorInstance, { page })
      throw new Error(`Failed to fetch popular TV series: ${errorInstance.message}`)
    }
  }

  async getPopularPeople(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/person/popular?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch popular people', errorInstance, { page })
      throw new Error(`Failed to fetch popular people: ${errorInstance.message}`)
    }
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/trending/movie/${timeWindow}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch trending movies', errorInstance, { timeWindow })
      throw new Error(`Failed to fetch trending movies: ${errorInstance.message}`)
    }
  }

  async getTrendingTV(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/trending/tv/${timeWindow}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch trending TV series', errorInstance, { timeWindow })
      throw new Error(`Failed to fetch trending TV series: ${errorInstance.message}`)
    }
  }

  async getTrendingPeople(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/trending/person/${timeWindow}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch trending people', errorInstance, { timeWindow })
      throw new Error(`Failed to fetch trending people: ${errorInstance.message}`)
    }
  }

  async getTopRatedMovies(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/top_rated?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch top rated movies', errorInstance, { page })
      throw new Error(`Failed to fetch top rated movies: ${errorInstance.message}`)
    }
  }

  async getTopRatedTV(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/tv/top_rated?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch top rated TV series', errorInstance, { page })
      throw new Error(`Failed to fetch top rated TV series: ${errorInstance.message}`)
    }
  }

  async getNowPlayingMovies(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/now_playing?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch now playing movies', errorInstance, { page })
      throw new Error(`Failed to fetch now playing movies: ${errorInstance.message}`)
    }
  }

  async getUpcomingMovies(page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/movie/upcoming?page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch upcoming movies', errorInstance, { page })
      throw new Error(`Failed to fetch upcoming movies: ${errorInstance.message}`)
    }
  }

  // Collection operations
  async getCollection(collectionId: number): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/collection/${collectionId}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch collection', errorInstance, { collectionId })
      throw new Error(`Failed to fetch collection ${collectionId}: ${errorInstance.message}`)
    }
  }

  // Genre operations
  async getMoviesByGenre(genreId: number, page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/discover/movie?with_genres=${genreId}&page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch movies by genre', errorInstance, { genreId, page })
      throw new Error(`Failed to fetch movies for genre ${genreId}: ${errorInstance.message}`)
    }
  }

  async getTVByGenre(genreId: number, page = 1): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/discover/tv?with_genres=${genreId}&page=${page}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TV series by genre', errorInstance, { genreId, page })
      throw new Error(`Failed to fetch TV series for genre ${genreId}: ${errorInstance.message}`)
    }
  }

  // External ID operations
  async findByIMDBId(imdbId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/find/${imdbId}?external_source=imdb_id`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to find content by IMDB ID', errorInstance, { imdbId })
      throw new Error(`Failed to find content by IMDB ID ${imdbId}: ${errorInstance.message}`)
    }
  }

  async findByTVDBId(tvdbId: string): Promise<ApiResponse<any>> {
    try {
      return await this.apiService.get(`/find/${tvdbId}?external_source=tvdb_id`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to find content by TVDB ID', errorInstance, { tvdbId })
      throw new Error(`Failed to find content by TVDB ID ${tvdbId}: ${errorInstance.message}`)
    }
  }
}