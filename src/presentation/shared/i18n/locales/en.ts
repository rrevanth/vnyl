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
    close: 'Close',
    expand: 'Expand',
    collapse: 'Collapse',
    refresh: 'Refresh',
    and_more: 'and {{count}} more'
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
        environment_credentials_description: 'Using environment credentials for authentication. You can still customize language and content preferences below.',
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
        save_error_message: 'Failed to save TMDB settings. Please try again.',
        validate_and_save: 'Validate & Save',
        
        // Stack navigation titles
        account_settings_title: 'Account Settings',
        capabilities_title: 'Capabilities',
        
        // Account settings screen
        capabilities_section_title: 'Provider Capabilities',
        capabilities_section_description: 'Configure which TMDB features are enabled for your app',
        manage_capabilities: 'Manage Capabilities',
        manage_capabilities_description: 'Enable or disable specific TMDB features',
        
        // Capabilities screen
        capabilities_header_title: 'TMDB Capabilities',
        capabilities_header_description: 'Control which TMDB features are active. Disabling unused capabilities can improve performance.',
        available_capabilities: 'Available Capabilities',
        loading_capabilities: 'Loading capabilities...',
        capabilities_error_title: 'Error Loading Capabilities',
        capabilities_save_success_title: 'Capabilities Saved',
        capabilities_save_success_message: 'Your TMDB capability settings have been updated successfully.',
        capabilities_save_error_message: 'Failed to save capability settings',
        capabilities_reset_title: 'Reset Capabilities',
        capabilities_reset_message: 'This will reset all capability settings to their current saved values. Are you sure?',
        
        // Individual capability descriptions
        capability_metadata_title: 'Metadata',
        capability_metadata_description: 'Detailed movie and TV show information',
        capability_catalog_title: 'Catalog',
        capability_catalog_description: 'Browse movie and TV show collections',
        capability_search_title: 'Search',
        capability_search_description: 'Search for movies and TV shows',
        capability_stream_title: 'Streaming',
        capability_stream_description: 'Stream links and playback information',
        capability_recommendation_title: 'Recommendations',
        capability_recommendation_description: 'Similar content and recommendations',
        capability_collection_title: 'Collections',
        capability_collection_description: 'Movie collections and series',
        capability_watchlist_title: 'Watchlist',
        capability_watchlist_description: 'Personal watchlist management',
        capability_progress_title: 'Progress Tracking',
        capability_progress_description: 'Watch progress and history',
        capability_rating_title: 'Ratings',
        capability_rating_description: 'User and critic ratings',
        capability_image_title: 'Images',
        capability_image_description: 'Posters, backdrops, and artwork',
        capability_video_title: 'Videos',
        capability_video_description: 'Trailers and video content',
        capability_subtitle_title: 'Subtitles',
        capability_subtitle_description: 'Subtitle files and captions'
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

  catalog: {
    no_items: 'No items',
    one_item: '1 item',
    items_count: '{{count}} items',
    items_k_count: '{{count}}K items',
    items_m_count: '{{count}}M items',
    has_more: 'More available',
    updated: 'Updated {{date}}',
    card_accessibility: '{{title}} catalog from {{provider}} containing {{type}} content',
    loading_catalogs: 'Loading catalogs...',
    no_catalogs: 'No catalogs available',
    error_loading: 'Failed to load catalogs',
    retry_loading: 'Retry loading catalogs',
    all_providers: 'All Providers',
    healthy_providers: 'Healthy providers: {{count}}',
    total_catalogs: 'Total catalogs: {{count}}'
  },

  provider: {
    toggle_expansion: 'Toggle {{provider}} catalogs ({{state}})',
    catalog_count: '{{count}} catalogs',
    catalog_count_one: '1 catalog',
    show_more: 'Show {{count}} more',
    show_more_catalogs: 'Show {{count}} more catalogs from {{provider}}',
    no_catalogs: 'No catalogs available',
    health: {
      healthy: 'Healthy',
      unhealthy: 'Unhealthy'
    },
    type: {
      official: 'Official',
      addon: 'Addon',
      custom: 'Custom',
      local: 'Local'
    }
  },

  content_type: {
    movie: 'Movies',
    tv: 'TV Shows',
    person: 'People',
    collection: 'Collections',
    network: 'Networks',
    company: 'Companies'
  },

  homescreen: {
    title: 'Home',
    welcome: 'Welcome to VNYL',
    loading_providers: 'Loading providers...',
    no_providers: 'No providers configured',
    provider_error: 'Error loading providers',
    stats: {
      providers: 'Providers',
      catalogs: 'Catalogs',
      healthy: 'Healthy',
      response_time: 'Avg Response Time'
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