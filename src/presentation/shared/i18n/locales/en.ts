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