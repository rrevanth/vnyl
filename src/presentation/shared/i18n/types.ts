export type Locale = 'en' | 'es'

export interface TranslationKey {
  // Common
  common: {
    loading: string
    error: string
    retry: string
    cancel: string
    confirm: string
    save: string
    reset: string
    delete: string
    edit: string
    done: string
    close: string
    expand: string
    collapse: string
    refresh: string
    and_more: string
  }

  // Navigation
  navigation: {
    home: string
    search: string
    library: string
    settings: string
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
        using_defaults: string
        using_custom_config: string
        defaults_description: string
        environment_credentials_description: string
        custom_config_description: string
        authentication: string
        authentication_description: string
        bearer_token: string
        bearer_token_placeholder: string
        bearer_token_description: string
        api_key: string
        api_key_placeholder: string
        api_key_description: string
        configuration: string
        configuration_description: string
        language: string
        language_description: string
        include_adult: string
        include_adult_description: string
        validation_error_title: string
        validation_error_message: string
        save_success_title: string
        save_success_message: string
        save_error_message: string
        validate_and_save: string
        
        // Stack navigation titles
        account_settings_title: string
        capabilities_title: string
        
        // Account settings screen
        capabilities_section_title: string
        capabilities_section_description: string
        manage_capabilities: string
        manage_capabilities_description: string
        
        // Capabilities screen
        capabilities_header_title: string
        capabilities_header_description: string
        available_capabilities: string
        loading_capabilities: string
        capabilities_error_title: string
        capabilities_save_success_title: string
        capabilities_save_success_message: string
        capabilities_save_error_message: string
        capabilities_reset_title: string
        capabilities_reset_message: string
        
        // Individual capability descriptions
        capability_metadata_title: string
        capability_metadata_description: string
        capability_catalog_title: string
        capability_catalog_description: string
        capability_search_title: string
        capability_search_description: string
        capability_stream_title: string
        capability_stream_description: string
        capability_recommendation_title: string
        capability_recommendation_description: string
        capability_collection_title: string
        capability_collection_description: string
        capability_watchlist_title: string
        capability_watchlist_description: string
        capability_progress_title: string
        capability_progress_description: string
        capability_rating_title: string
        capability_rating_description: string
        capability_image_title: string
        capability_image_description: string
        capability_video_title: string
        capability_video_description: string
        capability_subtitle_title: string
        capability_subtitle_description: string
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

  // Providers
  providers: {
    capabilities: {
      metadata: {
        title: string
        description: string
      }
      catalog: {
        title: string
        description: string
      }
      search: {
        title: string
        description: string
      }
      stream: {
        title: string
        description: string
      }
      recommendation: {
        title: string
        description: string
      }
      collection: {
        title: string
        description: string
      }
      watchlist: {
        title: string
        description: string
      }
      progress: {
        title: string
        description: string
      }
      rating: {
        title: string
        description: string
      }
      image: {
        title: string
        description: string
      }
      video: {
        title: string
        description: string
      }
      subtitle: {
        title: string
        description: string
      }
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

  // Catalog
  catalog: {
    no_items: string
    one_item: string
    items_count: string
    items_k_count: string
    items_m_count: string
    has_more: string
    updated: string
    card_accessibility: string
    loading_catalogs: string
    no_catalogs: string
    error_loading: string
    retry_loading: string
    all_providers: string
    healthy_providers: string
    total_catalogs: string
  }

  // Provider
  provider: {
    toggle_expansion: string
    catalog_count: string
    catalog_count_one: string
    show_more: string
    show_more_catalogs: string
    no_catalogs: string
    health: {
      healthy: string
      unhealthy: string
    }
    type: {
      official: string
      addon: string
      custom: string
      local: string
    }
  }

  // Content Type
  content_type: {
    movie: string
    tv: string
    person: string
    collection: string
    network: string
    company: string
  }

  // Homescreen
  homescreen: {
    title: string
    welcome: string
    loading_providers: string
    no_providers: string
    provider_error: string
    stats: {
      providers: string
      catalogs: string
      healthy: string
      response_time: string
    }
  }

  // Media
  media: {
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