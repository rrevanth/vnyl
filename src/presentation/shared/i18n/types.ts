/**
 * TypeScript types for i18n in the presentation layer
 * Provides type safety for translation keys and parameters
 */

import { SupportedLanguage, InterpolationOptions } from '@/src/domain/services/i18n.service.interface'

// Re-export types from utils
export type { PluralForm, PluralRuleFunction } from './utils/pluralization'

// Feature-based namespaces matching app architecture
export type TranslationNamespace = 
  | 'common'
  | 'home'
  | 'search'
  | 'library'
  | 'settings'
  | 'media_detail'
  | 'person_detail'
  | 'stream_selection'
  | 'player'

// Translation key patterns for type safety
export interface TranslationKeys {
  common: {
    actions: {
      save: string
      cancel: string
      delete: string
      edit: string
      share: string
      download: string
      play: string
      pause: string
      stop: string
      next: string
      previous: string
      back: string
      close: string
      open: string
      retry: string
      refresh: string
      loading: string
      search: string
      filter: string
      sort: string
      clear: string
      select: string
      confirm: string
      view_all: string
      add_to_list: string
      remove_from_list: string
    }
    status: {
      loading: string
      error: string
      success: string
      empty: string
      offline: string
      connecting: string
      connected: string
      disconnected: string
      syncing: string
      synced: string
      failed: string
      completed: string
      pending: string
      in_progress: string
    }
    navigation: {
      home: string
      search: string
      library: string
      settings: string
      profile: string
      back: string
      close: string
      menu: string
    }
    time: {
      now: string
      today: string
      yesterday: string
      tomorrow: string
      this_week: string
      last_week: string
      this_month: string
      last_month: string
      this_year: string
      last_year: string
      minutes_ago: string
      hours_ago: string
      days_ago: string
      weeks_ago: string
      months_ago: string
      years_ago: string
    }
  }
  home: {
    hero: {
      title: string
      subtitle: string
      featured_content: string
      trending_now: string
    }
    categories: {
      movies: string
      tv_shows: string
      documentaries: string
      kids: string
      sports: string
      news: string
      music: string
      trending: string
      new_releases: string
      popular: string
      recommended: string
      continue_watching: string
    }
    recommendations: {
      title: string
      based_on_viewing: string
      because_you_watched: string
      similar_content: string
      top_picks: string
      staff_picks: string
    }
  }
  search: {
    placeholder: string
    recent_searches: string
    suggestions: string
    no_results: string
    filters: {
      all: string
      movies: string
      tv_shows: string
      people: string
      genre: string
      year: string
      rating: string
      duration: string
      language: string
      country: string
    }
    results: {
      found_results: string
      no_results_found: string
      try_different_terms: string
      clear_filters: string
    }
  }
  library: {
    tabs: {
      downloads: string
      watchlist: string
      history: string
      favorites: string
    }
    downloads: {
      title: string
      subtitle: string
      available_offline: string
      download_quality: string
      manage_storage: string
      auto_download: string
      wifi_only: string
    }
    watchlist: {
      title: string
      subtitle: string
      add_to_watchlist: string
      remove_from_watchlist: string
      empty_state: string
    }
    history: {
      title: string
      subtitle: string
      continue_watching: string
      recently_watched: string
      clear_history: string
      empty_state: string
    }
  }
  settings: {
    account: {
      profile: string
      subscription: string
      billing: string
      privacy: string
      parental_controls: string
      sign_out: string
    }
    preferences: {
      language: string
      region: string
      notifications: string
      autoplay: string
      data_usage: string
      download_quality: string
      streaming_quality: string
    }
    display: {
      theme: string
      dark_mode: string
      light_mode: string
      system_default: string
      font_size: string
      high_contrast: string
      reduce_motion: string
    }
    accessibility: {
      title: string
      subtitles: string
      audio_descriptions: string
      screen_reader: string
      voice_over: string
      closed_captions: string
    }
    about: {
      version: string
      terms_of_service: string
      privacy_policy: string
      help_center: string
      contact_support: string
      rate_app: string
    }
  }
  media_detail: {
    metadata: {
      rating: string
      duration: string
      release_date: string
      genre: string
      director: string
      cast: string
      studio: string
      languages: string
      subtitles: string
      country: string
    }
    actions: {
      play: string
      download: string
      add_to_watchlist: string
      share: string
      rate: string
      review: string
      report: string
    }
    sections: {
      overview: string
      cast_crew: string
      episodes: string
      trailers: string
      reviews: string
      recommendations: string
      details: string
    }
    episodes: {
      season: string
      episode: string
      all_episodes: string
      next_episode: string
      previous_episode: string
    }
  }
  person_detail: {
    biography: string
    filmography: string
    known_for: string
    personal_info: {
      born: string
      birthplace: string
      height: string
      spouse: string
      children: string
      awards: string
    }
    career: {
      acting: string
      directing: string
      producing: string
      writing: string
      other_roles: string
    }
  }
  stream_selection: {
    quality: {
      auto: string
      low: string
      medium: string
      high: string
      ultra_hd: string
      hdr: string
    }
    audio: {
      original: string
      dubbed: string
      commentary: string
      descriptive: string
    }
    subtitles: {
      off: string
      auto: string
      forced: string
      full: string
    }
    playback: {
      resume: string
      start_over: string
      start_from_beginning: string
      continue_from: string
    }
  }
  player: {
    controls: {
      play: string
      pause: string
      stop: string
      rewind: string
      fast_forward: string
      skip_intro: string
      skip_credits: string
      next_episode: string
      previous_episode: string
      fullscreen: string
      exit_fullscreen: string
      volume: string
      mute: string
      unmute: string
    }
    settings: {
      playback_speed: string
      audio_track: string
      subtitle_track: string
      video_quality: string
      picture_in_picture: string
    }
    status: {
      buffering: string
      connecting: string
      error: string
      paused: string
      playing: string
      ended: string
    }
  }
}

// Hook types
export interface UseTranslationReturn {
  t: (key: string, options?: InterpolationOptions, namespace?: TranslationNamespace) => string
  plural: (key: string, count: number, options?: InterpolationOptions, namespace?: TranslationNamespace) => string
  tWithContext: (key: string, context: string, options?: InterpolationOptions, namespace?: TranslationNamespace) => string
  tWithGender: (key: string, gender: 'male' | 'female' | 'neutral', options?: InterpolationOptions, namespace?: TranslationNamespace) => string
  hasTranslation: (key: string, namespace?: TranslationNamespace) => boolean
  loadNamespace: (namespace: TranslationNamespace) => Promise<void>
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => Promise<void>
  isLoading: boolean
  error: string | null
}

export interface UseLocaleReturn {
  locale: SupportedLanguage
  setLocale: (locale: SupportedLanguage) => Promise<void>
  supportedLocales: SupportedLanguage[]
  systemLocale: SupportedLanguage
  textDirection: 'ltr' | 'rtl'
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string
  formatRelativeTime: (date: Date | string, baseDate?: Date) => string
  formatList: (items: string[], type?: 'conjunction' | 'disjunction') => string
  formatPercentage: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCompactNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatDuration: (seconds: number, format?: 'short' | 'long') => string
  formatFileSize: (bytes: number, decimals?: number) => string
  getLocaleConfig: (locale?: SupportedLanguage) => LocaleConfig
  isRTL: (locale?: SupportedLanguage) => boolean
}

// Translation parameter types for interpolation
export interface TranslationParams {
  [key: string]: string | number | boolean
}

// Plural form types
export interface PluralOptions extends TranslationParams {
  count: number
}

// Context types for conditional translations
export type ContextType = 'formal' | 'informal' | 'technical' | 'casual'
export type GenderType = 'male' | 'female' | 'neutral'

// Translation validation types
export interface ValidationResult {
  valid: boolean
  missingKeys: string[]
  emptyTranslations: string[]
  invalidInterpolations: string[]
}

// Locale configuration
export interface LocaleConfig {
  code: SupportedLanguage
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  region?: string
  currency?: string
  dateFormat?: string
  timeFormat?: string
  numberFormat?: Intl.NumberFormatOptions
}

// Translation loading state
export interface TranslationState {
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  loadedNamespaces: Set<TranslationNamespace>
}

// Export utility types
export type DeepKeyOf<T> = T extends object 
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeyOf<T[K]>}`
          : K
        : never
    }[keyof T]
  : never

export type TranslationKey = DeepKeyOf<TranslationKeys>