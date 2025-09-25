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
      description: 'Customize appearance',
      dark_mode: 'Dark Mode',
      light_mode: 'Light Mode',
      system_mode: 'System',
      accent_color: 'Accent Color',
      high_contrast: 'High Contrast',
      adapt_to_content: 'Adapt to Content',
      appearance: 'Appearance'
    },
    language: {
      title: 'Language',
      english: 'English',
      spanish: 'Spanish'
    },
    locale: {
      title: 'Language & Region',
      description: 'Language and formatting',
      language: 'Language',
      region: 'Region',
      date_format: 'Date Format',
      time_format: 'Time Format',
      currency: 'Currency'
    },
    display: {
      title: 'Display',
      description: 'Typography and layout',
      font_size: 'Font Size',
      font_family: 'Font Family',
      line_height: 'Line Height',
      compact_mode: 'Compact Mode',
      animation_scale: 'Animation Scale',
      typography: 'Typography',
      layout: 'Layout'
    },
    about: {
      title: 'About',
      description: 'App information',
      version: 'Version',
      build: 'Build',
      license: 'License',
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Terms of Service'
    }
  },

  colors: {
    blue: 'Blue',
    green: 'Green',
    purple: 'Purple',
    red: 'Red',
    orange: 'Orange'
  },

  sizes: {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extra_large: 'Extra Large'
  },

  providers: {
    title: 'Providers',
    description: 'External service configuration',
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