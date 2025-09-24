import type { TranslationKey } from '../types'

export const en: TranslationKey = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    close: 'Close'
  },

  navigation: {
    home: 'Home',
    search: 'Search',
    library: 'Library',
    settings: 'Settings'
  },

  settings: {
    title: 'Settings',
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark'
    },
    language: {
      title: 'Language',
      english: 'English',
      spanish: 'Spanish'
    },
    about: {
      title: 'About',
      version: 'Version'
    }
  },

  providers: {
    title: 'Providers',
    comingSoon: 'Coming Soon',
    status: {
      configured: 'Configured',
      notConfigured: 'Not Configured'
    },
    sections: {
      database: 'Media Database',
      streaming: 'Streaming Services',
      tracking: 'Tracking Services',
      info: 'Information'
    },
    info: {
      title: 'About Providers',
      description: 'Configure external services to enhance your media experience'
    },
    tmdb: {
      title: 'TMDB Settings',
      header: {
        title: 'API Status',
        status: {
          bearerConfigured: 'Bearer Token Active',
          apiKeyConfigured: 'API Key Active',
          defaultKeyActive: 'Default Key Active',
          notConfigured: 'Authentication Required'
        }
      },
      form: {
        title: 'Configuration',
        bearerToken: 'Bearer Token (Read Access Token)',
        bearerTokenPlaceholder: 'Enter your TMDB Bearer token',
        apiKey: 'API Key',
        apiKeyPlaceholder: 'Enter your TMDB API key',
        language: 'Language',
        region: 'Region',
        includeAdult: 'Include Adult Content',
        includeAdultDescription: 'Include adult content in search results'
      },
      status: {
        title: 'Configuration Status',
        authentication: 'Authentication',
        apiKey: 'API Key',
        bearerToken: 'Bearer Token',
        configured: 'Configured',
        notConfigured: 'Not Configured',
        apiKeyConfigured: 'API Key Configured',
        bearerTokenConfigured: 'Bearer Token Configured'
      },
      config: {
        title: 'API Configuration',
        info: {
          title: 'Authentication Options',
          description: 'Use either Bearer Token (recommended) or API Key. Bearer Token provides better security and rate limits.'
        },
        apiKey: 'API Key',
        apiKeyPlaceholder: 'Enter your TMDB API key',
        bearerToken: 'Bearer Token (Read Access Token)',
        bearerTokenPlaceholder: 'Enter your TMDB Bearer token',
        defaultApiKey: {
          title: 'Using Default API Key',
          description: 'Currently using default API key from environment: {key}'
        }
      },
      preferences: {
        title: 'Preferences',
        language: 'Language',
        region: 'Region',
        includeAdult: 'Include Adult Content',
        includeAdultDescription: 'Include adult content in search results'
      },
      language: {
        title: 'Select Language'
      },
      region: {
        title: 'Select Region'
      },
      actions: {
        save: 'Save Configuration',
        testConnection: 'Test Connection',
        validateAndSave: 'Validate & Save',
        reset: 'Reset to Defaults'
      },
      success: {
        title: 'Success',
        message: 'TMDB configuration saved successfully'
      },
      error: {
        title: 'Configuration Error',
        message: 'Failed to save TMDB configuration. Please check your settings and try again.'
      },
      validateSave: {
        success: {
          title: 'Configuration Validated',
          message: 'TMDB configuration validated and saved successfully'
        },
        error: {
          title: 'Validation Failed',
          message: 'Failed to validate TMDB configuration. Please check your credentials and try again.'
        }
      },
      test: {
        success: {
          title: 'Connection Successful',
          message: 'Successfully connected to TMDB API'
        },
        error: {
          title: 'Connection Failed',
          message: 'Failed to connect to TMDB API. Please check your credentials.'
        }
      },
      reset: {
        title: 'Reset Configuration',
        message: 'This will reset all TMDB settings to default values. Are you sure?',
        confirm: 'Reset'
      }
    }
  },

  media: {
    title: 'Title',
    description: 'Description',
    cast: 'Cast',
    director: 'Director',
    rating: 'Rating',
    releaseDate: 'Release Date',
    genre: 'Genre',
    duration: 'Duration',
    watchNow: 'Watch Now',
    addToLibrary: 'Add to Library'
  },

  search: {
    placeholder: 'Search movies and TV shows...',
    noResults: 'No results found',
    recentSearches: 'Recent Searches',
    clearHistory: 'Clear History'
  },

  library: {
    title: 'My Library',
    empty: 'Your library is empty',
    favorites: 'Favorites',
    watchlist: 'Watchlist',
    history: 'Watch History'
  },

  errors: {
    networkError: 'Network connection error. Please check your internet connection.',
    serverError: 'Server error. Please try again later.',
    notFound: 'Content not found.',
    unauthorized: 'Unauthorized access. Please log in.',
    generic: 'Something went wrong. Please try again.'
  }
}