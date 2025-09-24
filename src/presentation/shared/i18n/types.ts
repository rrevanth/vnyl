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
      light: string
      dark: string
    }
    language: {
      title: string
      english: string
      spanish: string
    }
    about: {
      title: string
      version: string
    }
  }

  // Providers
  providers: {
    title: string
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
    tmdb: {
      title: string
      header: {
        title: string
        status: {
          bearerConfigured: string
          apiKeyConfigured: string
          defaultKeyActive: string
          notConfigured: string
        }
      }
      form: {
        title: string
        bearerToken: string
        bearerTokenPlaceholder: string
        apiKey: string
        apiKeyPlaceholder: string
        language: string
        region: string
        includeAdult: string
        includeAdultDescription: string
      }
      status: {
        title: string
        authentication: string
        apiKey: string
        bearerToken: string
        configured: string
        notConfigured: string
        apiKeyConfigured: string
        bearerTokenConfigured: string
      }
      config: {
        title: string
        info: {
          title: string
          description: string
        }
        apiKey: string
        apiKeyPlaceholder: string
        bearerToken: string
        bearerTokenPlaceholder: string
        defaultApiKey: {
          title: string
          description: string
        }
      }
      preferences: {
        title: string
        language: string
        region: string
        includeAdult: string
        includeAdultDescription: string
      }
      language: {
        title: string
      }
      region: {
        title: string
      }
      actions: {
        save: string
        testConnection: string
        validateAndSave: string
        reset: string
      }
      success: {
        title: string
        message: string
      }
      error: {
        title: string
        message: string
      }
      validateSave: {
        success: {
          title: string
          message: string
        }
        error: {
          title: string
          message: string
        }
      }
      test: {
        success: {
          title: string
          message: string
        }
        error: {
          title: string
          message: string
        }
      }
      reset: {
        title: string
        message: string
        confirm: string
      }
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