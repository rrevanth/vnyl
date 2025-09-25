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
      appearance: 'Appearance',
      appearance_description: 'Choose how the app looks',
      accent_color_description: 'Select your preferred accent color',
      preview: 'Preview',
      preview_description: 'See how your theme choices look',
      preview_title: 'Sample Title',
      preview_subtitle: 'Sample subtitle text',
      preview_body: 'This is how regular text will appear with your current theme settings.',
      preview_button: 'Action Button'
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
      line_height_description: 'Adjust spacing between lines of text',
      compact_mode: 'Compact Mode',
      compact_mode_description: 'Reduce spacing for a denser layout',
      animation_scale: 'Animation Scale',
      typography: 'Typography',
      typography_description: 'Customize text appearance',
      layout: 'Layout',
      spacing: 'Spacing',
      spacing_description: 'Control layout density and spacing',
      preview: 'Preview',
      preview_description: 'See how your typography choices look',
      preview_heading: 'Sample Heading Text',
      preview_body: 'This is how regular paragraph text will appear with your current display settings. You can adjust the font size, line height, and spacing to make it more comfortable to read.',
      preview_caption: 'This is smaller caption text that appears in various places throughout the app.'
    },
    providers: {
      title: 'Providers',
      description: 'Configure API services',
      status: {
        configured: 'Configured',
        notConfigured: 'Not Configured'
      },
      sections: {
        database: 'Database',
        streaming: 'Streaming',
        tracking: 'Tracking',
        info: 'Information'
      },
      info: {
        title: 'Information',
        description: 'Provider information and documentation'
      },
      tmdb: {
        title: 'TMDB (The Movie Database)',
        description: 'Movie and TV show metadata',
        using_defaults: 'Using Default Configuration',
        using_custom_config: 'Using Custom Configuration',
        defaults_description: 'Using built-in API keys and default settings. Configure custom settings below to use your own API keys.',
        custom_config_description: 'Using your custom API configuration. All requests will use your provided API keys.',
        authentication: 'Authentication',
        authentication_description: 'Configure your TMDB API credentials. You need either a Bearer Token or API Key.',
        bearer_token: 'Bearer Token',
        bearer_token_placeholder: 'Enter your TMDB Bearer Token',
        bearer_token_description: 'Preferred method. Get from TMDB API settings.',
        api_key: 'API Key',
        api_key_placeholder: 'Enter your TMDB API Key',
        api_key_description: 'Alternative to Bearer Token. Get from TMDB API settings.',
        configuration: 'Configuration',
        configuration_description: 'Customize TMDB API behavior and content preferences.',
        language: 'Language',
        language_description: 'Language for movie and TV show metadata',
        include_adult: 'Include Adult Content',
        include_adult_description: 'Show adult/mature content in search results',
        validation_error_title: 'Validation Error',
        validation_error_message: 'Please provide either a Bearer Token or API Key.',
        save_success_title: 'Settings Saved',
        save_success_message: 'Your TMDB configuration has been saved successfully.',
        save_error_message: 'Failed to save TMDB settings. Please try again.'
      }
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