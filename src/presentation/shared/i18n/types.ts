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
    delete: string
    edit: string
    done: string
    close: string
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

  // Providers
  providers: {
    title: string
    description: string
    comingSoon: string
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