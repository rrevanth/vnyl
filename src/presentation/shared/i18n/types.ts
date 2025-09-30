import type { Locale } from '@/src/domain/entities/locale.entity'

export type { Locale } from '@/src/domain/entities/locale.entity'

export interface TranslationKey {
  // Common
  common: {
    loading: string
    loading_more: string
    load_more: string
    error: string
    success: string
    retry: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    done: string
    close: string
    ok: string
    go_back: string
  }

  // Navigation
  navigation: {
    home: string
    search: string
    library: string
    settings: string
  }

  // Home
  home: {
    welcome: string
    discover_content: string
    providers_active: string
    total_items: string
    top_ten: string
    top_ten_description: string
    award_winners: string
    award_winners_description: string
    no_catalogs: string
    no_catalogs_description: string
    error: string
    generic_error: string
  }

  // Catalog
  catalog: {
    item_count: string
    last_updated: string
    see_all: string
    load_more_items: string
    show_more: string
    loading_more: string
  }

  // Settings
  settings: {
    title: string
    theme: {
      title: string
      description: string
      dark_mode: string
      light_mode: string
      system_mode: string
      accent_color: string
      high_contrast: string
      adapt_to_content: string
      appearance: string
      appearance_description: string
      accent_color_description: string
      preview: string
      preview_description: string
      preview_title: string
      preview_subtitle: string
      preview_body: string
      preview_button: string
    }
    language: {
      title: string
      english: string
      spanish: string
    }
    locale: {
      title: string
      description: string
      language: string
      region: string
      date_format: string
      time_format: string
      currency: string
    }
    display: {
      title: string
      description: string
      font_size: string
      font_family: string
      line_height: string
      line_height_description: string
      compact_mode: string
      compact_mode_description: string
      animation_scale: string
      typography: string
      typography_description: string
      layout: string
      spacing: string
      spacing_description: string
      preview: string
      preview_description: string
      preview_heading: string
      preview_body: string
      preview_caption: string
    }
    providers: {
      title: string
      description: string
      status: {
        configured: string
        notConfigured: string
      }
      sections: {
        database: string
        streaming: string
        tracking: string
        info: string
      }
      info: {
        title: string
        description: string
      }
      tmdb: {
        title: string
        description: string
        status: {
          connected_bearer_token: string
          connected_api_key: string
          connected_default: string
          hierarchy_description: string
          custom_bearer_token: string
          custom_api_key: string
          default_api_key: string
        }
        authentication: string
        authentication_description: string
        api_key: string
        api_key_description: string
        api_key_placeholder: string
        bearer_token: string
        bearer_token_description: string
        bearer_token_placeholder: string
        regional_settings: string
        regional_description: string
        preferences: string
        preferences_description: string
        content_settings: string
        content_description: string
        language: string
        language_description: string
        language_placeholder: string
        country: string
        country_description: string
        country_placeholder: string
        region: string
        region_description: string
        include_adult: string
        include_adult_description: string
        image_quality: string
        image_quality_description: string
        image_quality_placeholder: string
        save_settings: string
        reset_settings: string
        test_connection: string
        validate_connection: string
        validate_and_save: string
        setup_guide: string
        setup_guide_description: string
        setup_steps: {
          title: string
          step_1: string
          step_2: string
          step_3: string
          step_4: string
          step_5: string
        }
        validation: {
          api_key_required: string
          api_key_invalid: string
          bearer_token_invalid: string
          connection_failed: string
          connection_success: string
          settings_saved: string
          settings_reset: string
          no_custom_credentials: string
          invalid_credentials: string
        }
      }
    }
    about: {
      title: string
      description: string
      version: string
      build: string
      license: string
      privacy_policy: string
      terms_of_service: string
    }
  }

  // Colors
  colors: {
    blue: string
    green: string
    purple: string
    red: string
    orange: string
  }

  // Sizes
  sizes: {
    small: string
    medium: string
    large: string
    extra_large: string
  }

  // Media
  media: {
    movie: string
    tv: string
    person: string
    title: string
    description: string
    cast: string
    director: string
    rating: string
    releaseDate: string
    genre: string
    duration: string
    watchNow: string
    addToLibrary: string
  }

  // Media Detail
  mediaDetail: {
    title: string
    id_placeholder: string
    coming_soon: string
    
    // Loading states
    loading_details: string
    loading_content: string
    
    // Error states
    error_title: string
    error_message: string
    
    // Hero section
    runtime_minutes: string
    show_more: string
    show_less: string
    
    // Action buttons
    play: string
    play_title: string
    play_message: string
    watchlist: string
    add_to_watchlist: string
    remove_from_watchlist: string
    in_watchlist: string
    added_to_watchlist: string
    removed_from_watchlist: string
    share: string
    share_title: string
    share_message: string
    
    // External services
    watch_on: string
    
    // Content sections
    trailers: string
    seasons: string
    cast_crew: string
    you_might_like: string
    recommended: string
    similar: string
    
    // Load more functionality
    load_more_title: string
    load_more_message: string
    load_more_error_title: string
    load_more_error_message: string
    
    // Season details
    episode_count: string
    
    // Episodes section
    episodes: {
      title: string
      loading_season: string
      play_hint: string
      show_more: string
      show_less: string
      expand: string
      collapse: string
      episode_title: string
      no_air_date: string
      no_runtime: string
      no_rating: string
      minutes_short: string
      hours_short: string
      season_episode_format: string
    }
    
    // Seasons subsection
    seasonsDetail: {
      title: string
      loading_text: string
      episode_singular: string
      episode_plural: string
      season_selector_hint: string
    }
    
    // Navigation
    go_back: string
  }

  // Person Detail
  person_detail: {
    // Loading states
    loading_details: string
    loading_filmography: string
    loading_biography: string
    
    // Error states
    error_title: string
    error_message: string
    
    // Hero section
    age: string
    age_at_death: string
    born: string
    life_dates: string
    
    // Personal information
    biography: string
    also_known_as: string
    personal_details: string
    known_for_department: string
    gender: string
    popularity: string
    age_label: string
    years_old: string
    show_more: string
    show_less: string
    
    // Filmography section
    filmography: {
      title: string
      loading: string
      loading_more: string
      total_works: string
      movies: string
      tv_shows: string
      acting: string
      crew: string
      directing: string
      writing: string
      producing: string
    }
    
    // Load more functionality
    load_more_error_title: string
    load_more_error_message: string
  }

  // Search
  search: {
    placeholder: string
    noResults: string
    recentSearches: string
    clearHistory: string
  }

  // Library
  library: {
    title: string
    empty: string
    favorites: string
    watchlist: string
    history: string
  }

  // Errors
  errors: {
    networkError: string
    serverError: string
    notFound: string
    unauthorized: string
    generic: string
  }
}

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof TranslationKey | string) => string
  formatMessage: (key: keyof TranslationKey | string, values?: Record<string, string | number>) => string
}