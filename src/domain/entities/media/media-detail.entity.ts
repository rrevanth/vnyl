/**
 * Media detail entity for extended media information
 * Contains comprehensive information loaded for detail views
 */

import { 
  MediaType, 
  Genre, 
  LanguageCode, 
  CountryCode, 
  ContentRating, 
  MediaStatus, 
  VideoType, 
  ImageType
} from '@/src/domain/entities/media/content-types'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'

/**
 * Media detail entity
 * Contains comprehensive information for detail views
 */
export interface MediaDetail {
  /** Unique identifier */
  readonly id: string

  /** Media type */
  readonly mediaType: MediaType

  /** Primary title */
  readonly title: string

  /** Original title */
  readonly originalTitle?: string

  /** Detailed overview */
  readonly overview?: string

  /** Tagline */
  readonly tagline?: string

  /** Release date */
  readonly releaseDate?: Date

  /** Runtime in minutes */
  readonly runtime?: number

  /** Vote average (0-10) */
  readonly voteAverage?: number

  /** Total votes */
  readonly voteCount?: number

  /** Popularity score */
  readonly popularity?: number

  /** Budget */
  readonly budget?: number

  /** Revenue */
  readonly revenue?: number

  /** Homepage URL */
  readonly homepage?: string

  /** IMDB ID */
  readonly imdbId?: string

  /** Original language */
  readonly originalLanguage?: LanguageCode

  /** Spoken languages */
  readonly spokenLanguages?: Language[]

  /** Production countries */
  readonly productionCountries?: Country[]

  /** Content rating */
  readonly contentRating?: ContentRating

  /** Media status */
  readonly status?: MediaStatus

  /** Genres */
  readonly genres?: Genre[]

  /** Keywords/tags */
  readonly keywords?: Keyword[]

  /** Production companies */
  readonly productionCompanies?: ProductionCompany[]

  /** Cast information */
  readonly cast?: CastMember[]

  /** Crew information */
  readonly crew?: CrewMember[]

  /** Videos (trailers, clips, etc.) */
  readonly videos?: Video[]

  /** Images (posters, backdrops, etc.) */
  readonly images?: MediaImage[]

  /** Reviews */
  readonly reviews?: Review[]

  /** User ratings */
  readonly ratings?: Rating[]

  /** Recommendations */
  readonly recommendations?: RecommendationItem[]

  /** Similar content */
  readonly similar?: SimilarItem[]

  /** Watch providers */
  readonly watchProviders?: WatchProvider[]

  /** Release information */
  readonly releases?: ReleaseInfo[]

  /** Translations */
  readonly translations?: Translation[]

  /** Alternative titles */
  readonly alternativeTitles?: AlternativeTitle[]

  /** External service IDs */
  readonly externalIds: ExternalIds

  /** Adult content flag */
  readonly isAdult?: boolean

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date
}

/**
 * Movie-specific detail information
 */
export interface MovieDetail extends MediaDetail {
  readonly mediaType: MediaType.MOVIE

  /** Belongs to collection */
  readonly collection?: Collection

  /** Release dates by country */
  readonly releaseDates?: ReleaseDateInfo[]
}

/**
 * TV series detail information
 */
export interface TVDetail extends MediaDetail {
  readonly mediaType: MediaType.TV_SERIES

  /** First air date */
  readonly firstAirDate?: Date

  /** Last air date */
  readonly lastAirDate?: Date

  /** Number of seasons */
  readonly numberOfSeasons?: number

  /** Number of episodes */
  readonly numberOfEpisodes?: number

  /** Episode runtime */
  readonly episodeRuntime?: number[]

  /** Series type */
  readonly type?: string

  /** Networks */
  readonly networks?: Network[]

  /** Production companies for TV */
  readonly networks_production?: Network[]

  /** Created by */
  readonly createdBy?: Person[]

  /** Seasons */
  readonly seasons?: Season[]

  /** Last episode to air */
  readonly lastEpisodeToAir?: Episode

  /** Next episode to air */
  readonly nextEpisodeToAir?: Episode

  /** In production */
  readonly inProduction?: boolean

  /** Content ratings by country */
  readonly contentRatings?: ContentRatingInfo[]
}

/**
 * Person detail information
 */
export interface PersonDetail extends MediaDetail {
  readonly mediaType: MediaType.PERSON

  /** Also known as (aliases) */
  readonly alsoKnownAs?: string[]

  /** Biography */
  readonly biography?: string

  /** Birthday */
  readonly birthday?: Date

  /** Death day */
  readonly deathday?: Date

  /** Place of birth */
  readonly placeOfBirth?: string

  /** Profile path */
  readonly profilePath?: string

  /** Known for department */
  readonly knownForDepartment?: string

  /** Gender */
  readonly gender?: number

  /** Profile images */
  readonly profiles?: MediaImage[]

  /** Movie credits */
  readonly movieCredits?: {
    readonly cast?: MovieCastCredit[]
    readonly crew?: MovieCrewCredit[]
  }

  /** TV credits */
  readonly tvCredits?: {
    readonly cast?: TVCastCredit[]
    readonly crew?: TVCrewCredit[]
  }

  /** Combined credits */
  readonly combinedCredits?: {
    readonly cast?: CombinedCastCredit[]
    readonly crew?: CombinedCrewCredit[]
  }
}

/**
 * Language information
 */
export interface Language {
  /** ISO 639-1 language code */
  readonly iso_639_1: LanguageCode

  /** English language name */
  readonly englishName: string

  /** Native language name */
  readonly name: string
}

/**
 * Country information
 */
export interface Country {
  /** ISO 3166-1 country code */
  readonly iso_3166_1: CountryCode

  /** Country name */
  readonly name: string
}

/**
 * Keyword information
 */
export interface Keyword {
  /** Keyword ID */
  readonly id: number

  /** Keyword name */
  readonly name: string
}

/**
 * Production company information
 */
export interface ProductionCompany {
  /** Company ID */
  readonly id: number

  /** Company name */
  readonly name: string

  /** Company logo path */
  readonly logoPath?: string

  /** Origin country */
  readonly originCountry?: CountryCode
}

/**
 * Cast member information
 */
export interface CastMember {
  /** Person ID */
  readonly id: number

  /** Person name */
  readonly name: string

  /** Character name */
  readonly character: string

  /** Cast ID */
  readonly castId?: number

  /** Credit ID */
  readonly creditId: string

  /** Order in credits */
  readonly order: number

  /** Profile image path */
  readonly profilePath?: string

  /** Gender */
  readonly gender?: number

  /** Known for department */
  readonly knownForDepartment?: string

  /** Adult content flag */
  readonly adult?: boolean
}

/**
 * Crew member information
 */
export interface CrewMember {
  /** Person ID */
  readonly id: number

  /** Person name */
  readonly name: string

  /** Job title */
  readonly job: string

  /** Department */
  readonly department: string

  /** Credit ID */
  readonly creditId: string

  /** Profile image path */
  readonly profilePath?: string

  /** Gender */
  readonly gender?: number

  /** Known for department */
  readonly knownForDepartment?: string

  /** Adult content flag */
  readonly adult?: boolean
}

/**
 * Video information
 */
export interface Video {
  /** Video ID */
  readonly id: string

  /** Video key (YouTube, Vimeo, etc.) */
  readonly key: string

  /** Video name */
  readonly name: string

  /** Video site (YouTube, Vimeo) */
  readonly site: string

  /** Video type */
  readonly type: VideoType

  /** Video size (resolution) */
  readonly size?: number

  /** Official video flag */
  readonly official?: boolean

  /** Published date */
  readonly publishedAt?: Date

  /** ISO 639-1 language code */
  readonly iso_639_1?: LanguageCode

  /** ISO 3166-1 country code */
  readonly iso_3166_1?: CountryCode
}

/**
 * Media image information
 */
export interface MediaImage {
  /** Image file path */
  readonly filePath: string

  /** Image aspect ratio */
  readonly aspectRatio: number

  /** Image width */
  readonly width: number

  /** Image height */
  readonly height: number

  /** Image type */
  readonly imageType: ImageType

  /** Vote average */
  readonly voteAverage?: number

  /** Vote count */
  readonly voteCount?: number

  /** ISO 639-1 language code */
  readonly iso_639_1?: LanguageCode | null
}

/**
 * Review information
 */
export interface Review {
  /** Review ID */
  readonly id: string

  /** Author name */
  readonly author: string

  /** Author details */
  readonly authorDetails?: {
    readonly name?: string
    readonly username?: string
    readonly avatarPath?: string
    readonly rating?: number
  }

  /** Review content */
  readonly content: string

  /** Creation date */
  readonly createdAt: Date

  /** Last updated date */
  readonly updatedAt?: Date

  /** Review URL */
  readonly url?: string
}

/**
 * Rating information
 */
export interface Rating {
  /** Rating source */
  readonly source: string

  /** Rating value */
  readonly value: number

  /** Maximum rating value */
  readonly maxValue: number

  /** Number of votes */
  readonly voteCount?: number

  /** Rating date */
  readonly ratedAt?: Date
}

/**
 * Recommendation item
 */
export interface RecommendationItem {
  /** Item ID */
  readonly id: number

  /** Media type */
  readonly mediaType: MediaType

  /** Title */
  readonly title: string

  /** Original title */
  readonly originalTitle?: string

  /** Overview */
  readonly overview?: string

  /** Release date */
  readonly releaseDate?: Date

  /** Poster path */
  readonly posterPath?: string

  /** Backdrop path */
  readonly backdropPath?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Vote count */
  readonly voteCount?: number

  /** Popularity */
  readonly popularity?: number

  /** Adult content flag */
  readonly adult?: boolean

  /** Original language */
  readonly originalLanguage?: LanguageCode

  /** Genre IDs */
  readonly genreIds?: number[]
}

/**
 * Similar item (similar to RecommendationItem but separate for clarity)
 */
export type SimilarItem = RecommendationItem

/**
 * Watch provider information
 */
export interface WatchProvider {
  /** Provider ID */
  readonly providerId: number

  /** Provider name */
  readonly providerName: string

  /** Provider logo path */
  readonly logoPath?: string

  /** Display priority */
  readonly displayPriority: number

  /** Availability by country */
  readonly availability: WatchProviderAvailability[]
}

/**
 * Watch provider availability by country
 */
export interface WatchProviderAvailability {
  /** Country code */
  readonly country: CountryCode

  /** Available for rent */
  readonly rent?: WatchProviderOption[]

  /** Available for purchase */
  readonly buy?: WatchProviderOption[]

  /** Available on subscription */
  readonly flatrate?: WatchProviderOption[]

  /** Available for free */
  readonly free?: WatchProviderOption[]

  /** Provider link */
  readonly link?: string
}

/**
 * Watch provider option
 */
export interface WatchProviderOption {
  /** Provider ID */
  readonly providerId: number

  /** Provider name */
  readonly providerName: string

  /** Logo path */
  readonly logoPath?: string

  /** Display priority */
  readonly displayPriority: number
}

/**
 * Release information
 */
export interface ReleaseInfo {
  /** Country code */
  readonly country: CountryCode

  /** Release dates */
  readonly releaseDates: ReleaseDateInfo[]
}

/**
 * Release date information
 */
export interface ReleaseDateInfo {
  /** Release date */
  readonly releaseDate: Date

  /** Release type */
  readonly type: ReleaseType

  /** Certification */
  readonly certification?: string

  /** Descriptive note */
  readonly note?: string
}

/**
 * Release types
 */
export enum ReleaseType {
  PREMIERE = 1,
  THEATRICAL_LIMITED = 2,
  THEATRICAL = 3,
  DIGITAL = 4,
  PHYSICAL = 5,
  TV = 6
}

/**
 * Translation information
 */
export interface Translation {
  /** ISO 639-1 language code */
  readonly iso_639_1: LanguageCode

  /** ISO 3166-1 country code */
  readonly iso_3166_1: CountryCode

  /** Language name */
  readonly name: string

  /** English language name */
  readonly englishName: string

  /** Translated data */
  readonly data: {
    readonly title?: string
    readonly overview?: string
    readonly homepage?: string
    readonly tagline?: string
  }
}

/**
 * Alternative title information
 */
export interface AlternativeTitle {
  /** Title */
  readonly title: string

  /** ISO 3166-1 country code */
  readonly iso_3166_1?: CountryCode

  /** Title type */
  readonly type?: string
}

/**
 * Collection information
 */
export interface Collection {
  /** Collection ID */
  readonly id: number

  /** Collection name */
  readonly name: string

  /** Collection overview */
  readonly overview?: string

  /** Poster path */
  readonly posterPath?: string

  /** Backdrop path */
  readonly backdropPath?: string

  /** Collection parts */
  readonly parts?: CollectionPart[]
}

/**
 * Collection part
 */
export interface CollectionPart {
  /** Movie ID */
  readonly id: number

  /** Movie title */
  readonly title: string

  /** Original title */
  readonly originalTitle?: string

  /** Overview */
  readonly overview?: string

  /** Release date */
  readonly releaseDate?: Date

  /** Poster path */
  readonly posterPath?: string

  /** Backdrop path */
  readonly backdropPath?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Vote count */
  readonly voteCount?: number

  /** Adult content flag */
  readonly adult?: boolean
}

/**
 * Network information
 */
export interface Network {
  /** Network ID */
  readonly id: number

  /** Network name */
  readonly name: string

  /** Logo path */
  readonly logoPath?: string

  /** Origin country */
  readonly originCountry?: CountryCode
}

/**
 * Person information
 */
export interface Person {
  /** Person ID */
  readonly id: number

  /** Person name */
  readonly name: string

  /** Credit ID */
  readonly creditId?: string

  /** Gender */
  readonly gender?: number

  /** Profile path */
  readonly profilePath?: string
}

/**
 * Season information
 */
export interface Season {
  /** Season ID */
  readonly id: number

  /** Season name */
  readonly name: string

  /** Overview */
  readonly overview?: string

  /** Air date */
  readonly airDate?: Date

  /** Episode count */
  readonly episodeCount: number

  /** Poster path */
  readonly posterPath?: string

  /** Season number */
  readonly seasonNumber: number
}

/**
 * Episode information
 */
export interface Episode {
  /** Episode ID */
  readonly id: number

  /** Episode name */
  readonly name: string

  /** Overview */
  readonly overview?: string

  /** Air date */
  readonly airDate?: Date

  /** Episode number */
  readonly episodeNumber: number

  /** Production code */
  readonly productionCode?: string

  /** Runtime in minutes */
  readonly runtime?: number

  /** Season number */
  readonly seasonNumber: number

  /** Show ID */
  readonly showId?: number

  /** Still path */
  readonly stillPath?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Vote count */
  readonly voteCount?: number
}

/**
 * Content rating information
 */
export interface ContentRatingInfo {
  /** Country code */
  readonly country: CountryCode

  /** Rating */
  readonly rating: string

  /** Descriptors */
  readonly descriptors?: string[]
}

/**
 * Movie cast credit
 */
export interface MovieCastCredit {
  /** Movie ID */
  readonly id: number

  /** Character name */
  readonly character: string

  /** Credit ID */
  readonly creditId: string

  /** Movie title */
  readonly title: string

  /** Original title */
  readonly originalTitle?: string

  /** Overview */
  readonly overview?: string

  /** Release date */
  readonly releaseDate?: Date

  /** Poster path */
  readonly posterPath?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Adult content flag */
  readonly adult?: boolean

  /** Backdrop path */
  readonly backdropPath?: string

  /** Genre IDs */
  readonly genreIds?: number[]

  /** Original language */
  readonly originalLanguage?: LanguageCode

  /** Popularity */
  readonly popularity?: number

  /** Vote count */
  readonly voteCount?: number

  /** Video flag */
  readonly video?: boolean
}

/**
 * Movie crew credit
 */
export interface MovieCrewCredit extends Omit<MovieCastCredit, 'character'> {
  /** Department */
  readonly department: string

  /** Job */
  readonly job: string
}

/**
 * TV cast credit
 */
export interface TVCastCredit {
  /** TV show ID */
  readonly id: number

  /** Character name */
  readonly character: string

  /** Credit ID */
  readonly creditId: string

  /** Episode count */
  readonly episodeCount: number

  /** Show name */
  readonly name: string

  /** Original name */
  readonly originalName?: string

  /** Overview */
  readonly overview?: string

  /** First air date */
  readonly firstAirDate?: Date

  /** Poster path */
  readonly posterPath?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Backdrop path */
  readonly backdropPath?: string

  /** Genre IDs */
  readonly genreIds?: number[]

  /** Origin countries */
  readonly originCountry?: CountryCode[]

  /** Original language */
  readonly originalLanguage?: LanguageCode

  /** Popularity */
  readonly popularity?: number

  /** Vote count */
  readonly voteCount?: number
}

/**
 * TV crew credit
 */
export interface TVCrewCredit extends Omit<TVCastCredit, 'character'> {
  /** Department */
  readonly department: string

  /** Job */
  readonly job: string
}

/**
 * Combined cast credit
 */
export interface CombinedCastCredit {
  /** Media ID */
  readonly id: number

  /** Media type */
  readonly mediaType: MediaType

  /** Character name */
  readonly character: string

  /** Credit ID */
  readonly creditId: string

  /** Title (movie) or name (TV) */
  readonly title?: string
  readonly name?: string

  /** Original title */
  readonly originalTitle?: string
  readonly originalName?: string

  /** Overview */
  readonly overview?: string

  /** Release/air date */
  readonly releaseDate?: Date
  readonly firstAirDate?: Date

  /** Poster path */
  readonly posterPath?: string

  /** Vote average */
  readonly voteAverage?: number

  /** Adult content flag */
  readonly adult?: boolean

  /** Backdrop path */
  readonly backdropPath?: string

  /** Genre IDs */
  readonly genreIds?: number[]

  /** Original language */
  readonly originalLanguage?: LanguageCode

  /** Popularity */
  readonly popularity?: number

  /** Vote count */
  readonly voteCount?: number

  /** Episode count (TV only) */
  readonly episodeCount?: number

  /** Origin countries (TV only) */
  readonly originCountry?: CountryCode[]

  /** Video flag (movie only) */
  readonly video?: boolean
}

/**
 * Combined crew credit
 */
export interface CombinedCrewCredit extends Omit<CombinedCastCredit, 'character'> {
  /** Department */
  readonly department: string

  /** Job */
  readonly job: string
}