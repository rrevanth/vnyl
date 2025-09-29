/**
 * Content types and shared enums for media entities
 * Provides type-safe definitions for media content classification
 */

/**
 * Media content types supported by the application
 */
export enum MediaType {
  MOVIE = 'movie',
  TV_SERIES = 'tv',
  PERSON = 'person',
  COLLECTION = 'collection'
}

/**
 * Content rating systems and classifications
 */
export enum ContentRating {
  G = 'G',
  PG = 'PG',
  PG_13 = 'PG-13',
  R = 'R',
  NC_17 = 'NC-17',
  NR = 'NR', // Not Rated
  TV_Y = 'TV-Y',
  TV_Y7 = 'TV-Y7',
  TV_G = 'TV-G',
  TV_PG = 'TV-PG',
  TV_14 = 'TV-14',
  TV_MA = 'TV-MA'
}

/**
 * Video quality definitions
 */
export enum VideoQuality {
  SD = 'SD',
  HD = 'HD',
  FULL_HD = '1080p',
  ULTRA_HD = '4K',
  HDR = 'HDR',
  DOLBY_VISION = 'Dolby Vision'
}

/**
 * Audio quality definitions
 */
export enum AudioQuality {
  STEREO = 'Stereo',
  SURROUND_5_1 = '5.1',
  SURROUND_7_1 = '7.1',
  DOLBY_ATMOS = 'Dolby Atmos',
  DTS_X = 'DTS:X'
}

/**
 * Media status for TV series and movies in production
 */
export enum MediaStatus {
  RUMORED = 'Rumored',
  PLANNED = 'Planned',
  IN_PRODUCTION = 'In Production',
  POST_PRODUCTION = 'Post Production',
  RELEASED = 'Released',
  CANCELED = 'Canceled',
  ENDED = 'Ended',
  RETURNING_SERIES = 'Returning Series'
}

/**
 * Genre classifications for media content
 */
export enum Genre {
  ACTION = 'Action',
  ADVENTURE = 'Adventure',
  ANIMATION = 'Animation',
  COMEDY = 'Comedy',
  CRIME = 'Crime',
  DOCUMENTARY = 'Documentary',
  DRAMA = 'Drama',
  FAMILY = 'Family',
  FANTASY = 'Fantasy',
  HISTORY = 'History',
  HORROR = 'Horror',
  MUSIC = 'Music',
  MYSTERY = 'Mystery',
  ROMANCE = 'Romance',
  SCIENCE_FICTION = 'Science Fiction',
  THRILLER = 'Thriller',
  WAR = 'War',
  WESTERN = 'Western',
  TV_MOVIE = 'TV Movie',
  NEWS = 'News',
  REALITY = 'Reality',
  TALK = 'Talk'
}

/**
 * Image types for media assets
 */
export enum ImageType {
  POSTER = 'poster',
  BACKDROP = 'backdrop',
  STILL = 'still',
  PROFILE = 'profile',
  LOGO = 'logo'
}

/**
 * Video types for media content
 */
export enum VideoType {
  TRAILER = 'Trailer',
  TEASER = 'Teaser',
  CLIP = 'Clip',
  FEATURETTE = 'Featurette',
  BEHIND_THE_SCENES = 'Behind the Scenes',
  BLOOPERS = 'Bloopers',
  OPENING_CREDITS = 'Opening Credits'
}

/**
 * Credit types for cast and crew
 */
export enum CreditType {
  CAST = 'cast',
  CREW = 'crew'
}

/**
 * Crew job categories
 */
export enum CrewJob {
  DIRECTOR = 'Director',
  PRODUCER = 'Producer',
  EXECUTIVE_PRODUCER = 'Executive Producer',
  WRITER = 'Writer',
  SCREENPLAY = 'Screenplay',
  CINEMATOGRAPHER = 'Director of Photography',
  EDITOR = 'Editor',
  COMPOSER = 'Original Music Composer',
  PRODUCTION_DESIGNER = 'Production Designer',
  COSTUME_DESIGNER = 'Costume Designer',
  SOUND_DESIGNER = 'Sound Designer'
}

/**
 * Common language codes (ISO 639-1)
 */
export enum LanguageCode {
  EN = 'en', // English
  ES = 'es', // Spanish
  FR = 'fr', // French
  DE = 'de', // German
  IT = 'it', // Italian
  PT = 'pt', // Portuguese
  JA = 'ja', // Japanese
  KO = 'ko', // Korean
  ZH = 'zh', // Chinese
  RU = 'ru', // Russian
  AR = 'ar', // Arabic
  HI = 'hi'  // Hindi
}

/**
 * Country codes (ISO 3166-1 alpha-2)
 */
export enum CountryCode {
  US = 'US', // United States
  CA = 'CA', // Canada
  GB = 'GB', // United Kingdom
  FR = 'FR', // France
  DE = 'DE', // Germany
  IT = 'IT', // Italy
  ES = 'ES', // Spain
  BR = 'BR', // Brazil
  MX = 'MX', // Mexico
  JP = 'JP', // Japan
  KR = 'KR', // South Korea
  CN = 'CN', // China
  IN = 'IN', // India
  AU = 'AU', // Australia
  RU = 'RU'  // Russia
}

/**
 * Catalog types for organizing content
 */
export enum CatalogType {
  TRENDING = 'trending',
  POPULAR = 'popular',
  TOP_RATED = 'top_rated',
  NOW_PLAYING = 'now_playing',
  UPCOMING = 'upcoming',
  ON_THE_AIR = 'on_the_air',
  AIRING_TODAY = 'airing_today',
  SEARCH_RESULTS = 'search_results',
  RECOMMENDATIONS = 'recommendations',
  SIMILAR = 'similar',
  WATCHLIST = 'watchlist',
  FAVORITES = 'favorites',
  CUSTOM = 'custom'
}

/**
 * Time windows for trending content
 */
export enum TimeWindow {
  DAY = 'day',
  WEEK = 'week'
}

/**
 * Sort order options
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Sort criteria for content
 */
export enum SortBy {
  POPULARITY = 'popularity',
  RELEASE_DATE = 'release_date',
  REVENUE = 'revenue',
  PRIMARY_RELEASE_DATE = 'primary_release_date',
  ORIGINAL_TITLE = 'original_title',
  VOTE_AVERAGE = 'vote_average',
  VOTE_COUNT = 'vote_count',
  FIRST_AIR_DATE = 'first_air_date',
  NAME = 'name'
}