import type { TranslationKey } from '@/src/presentation/shared/i18n/types'

export const en: TranslationKey = {
  common: {
    loading: 'Loading...',
    loading_more: 'Loading more...',
    load_more: 'Load More',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    close: 'Close',
    ok: 'OK',
    go_back: 'Go Back',
  },

  navigation: {
    home: 'Home',
    search: 'Search',
    library: 'Library',
    settings: 'Settings'
  },

  home: {
    welcome: 'Welcome to VNYL',
    discover_content: 'Discover amazing movies and TV shows',
    providers_active: '{{count}} of {{total}} providers active',
    total_items: '{{count}} items available',
    top_ten: 'Top 10',
    top_ten_description: 'Most popular content across all providers',
    award_winners: 'Award Winners',
    award_winners_description: 'Critically acclaimed movies and shows',
    no_catalogs: 'No Content Available',
    no_catalogs_description: 'Configure your providers in settings to discover content',
    error: 'Unable to Load Content',
    generic_error: 'Something went wrong while loading content'
  },

  catalog: {
    item_count: '{{count}} items',
    last_updated: 'Updated {{date}}',
    see_all: 'See All',
    load_more_items: 'Load more items',
    show_more: 'Show {{count}} more',
    loading_more: 'Loading more items...'
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
        title: 'The Movie Database (TMDB)',
        description: 'Configure TMDB API settings',
        status: {
          connected_bearer_token: 'Connected with Custom Bearer Token',
          connected_api_key: 'Connected with Custom API Key', 
          connected_default: 'Connected with Default API Key',
          hierarchy_description: 'API key priority order (higher priority is used):',
          custom_bearer_token: 'Custom Bearer Token (highest priority)',
          custom_api_key: 'Custom API Key (medium priority)',
          default_api_key: 'Default API Key (lowest priority)'
        },
        authentication: 'Authentication',
        authentication_description: 'API credentials for TMDB access',
        api_key: 'API Key',
        api_key_description: 'Your TMDB API key for authentication',
        api_key_placeholder: 'Enter your TMDB API key',
        bearer_token: 'Bearer Token',
        bearer_token_description: 'Bearer token for enhanced authentication (recommended)',
        bearer_token_placeholder: 'Enter your TMDB bearer token',
        regional_settings: 'Regional Settings',
        regional_description: 'Language and location preferences',
        preferences: 'Preferences',
        preferences_description: 'Content and regional preferences',
        content_settings: 'Content & Media',
        content_description: 'Image quality and content filtering',
        language: 'Language',
        language_description: 'Preferred language for movie and TV show data',
        language_placeholder: 'Select language',
        country: 'Country',
        country_description: 'Your country for regional content filtering',
        country_placeholder: 'Select country',
        region: 'Region',
        region_description: 'Regional settings for content availability',
        include_adult: 'Include Adult Content',
        include_adult_description: 'Include adult content in search results and recommendations',
        image_quality: 'Image Quality',
        image_quality_description: 'Quality of images (posters, backdrops, etc.)',
        image_quality_placeholder: 'Select image quality',
        save_settings: 'Save Settings',
        reset_settings: 'Reset to Defaults',
        test_connection: 'Test Connection',
        validate_connection: 'Validate Connection',
        validate_and_save: 'Validate & Save',
        setup_guide: 'Setup Guide',
        setup_guide_description: 'How to get your TMDB API credentials',
        setup_steps: {
          title: 'How to get TMDB API credentials:',
          step_1: '1. Visit themoviedb.org and create a free account',
          step_2: '2. Go to Settings → API in your account',
          step_3: '3. Request an API key for personal use',
          step_4: '4. Copy your API key or Bearer token',
          step_5: '5. Paste it in the form above'
        },
        validation: {
          api_key_required: 'API Key or Bearer Token is required',
          api_key_invalid: 'Invalid API key format',
          bearer_token_invalid: 'Invalid bearer token format',
          connection_failed: 'Failed to connect to TMDB API',
          connection_success: 'Successfully connected to TMDB API',
          settings_saved: 'TMDB settings saved successfully',
          settings_reset: 'TMDB settings reset to defaults',
          no_custom_credentials: 'Please enter your API key or Bearer token to validate',
          invalid_credentials: 'Invalid API credentials. Please check your API key or Bearer token'
        }
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
    movie: 'Movie',
    tv: 'TV Show',
    person: 'Person',
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

  mediaDetail: {
    title: 'Media Details',
    id_placeholder: 'Media ID: {{id}}',
    coming_soon: 'Detailed media information will be displayed here.',
    
    // Loading states
    loading_details: 'Loading media details...',
    loading_content: 'Loading enriched content...',
    
    // Error states
    error_title: 'Unable to Load Details',
    error_message: 'Something went wrong while loading media information. Please try again.',
    
    // Hero section
    runtime_minutes: '{{minutes}}m',
    show_more: 'Show more',
    show_less: 'Show less',
    
    // Action buttons
    play: 'Play',
    play_title: 'Play Media',
    play_message: 'This would start playing the selected media.',
    watchlist: 'Watchlist',
    add_to_watchlist: 'Add to Watchlist',
    remove_from_watchlist: 'Remove from Watchlist',
    in_watchlist: 'In Watchlist',
    added_to_watchlist: 'Added to watchlist',
    removed_from_watchlist: 'Removed from watchlist',
    share: 'Share',
    share_title: 'Share Media',
    share_message: 'Share "{{title}}" with friends',
    
    // External services
    watch_on: 'Watch on',
    
    // Content sections
    trailers: 'Trailers & Videos',
    seasons: 'Seasons',
    cast_crew: 'Cast & Crew',
    you_might_like: 'You Might Also Like',
    recommended: 'Recommended',
    similar: 'Similar',
    
    // Load more functionality
    load_more_title: 'Load More',
    load_more_message: 'This would load more items from this section.',
    load_more_error_title: 'Unable to Load More',
    load_more_error_message: 'Something went wrong while loading more items. Please try again.',
    
    // Season details
    episode_count: '{{count}} episodes',
    
    // Episodes section
    episodes: {
      title: 'Episodes',
      loading_season: 'Loading episodes...',
      play_hint: 'Double tap to play episode',
      show_more: 'Show more',
      show_less: 'Show less',
      expand: 'Show episode details',
      collapse: 'Hide episode details',
      episode_title: 'Episode {{number}}',
      no_air_date: 'Air date unavailable',
      no_runtime: 'Runtime unavailable',
      no_rating: 'Rating unavailable',
      minutes_short: 'm',
      hours_short: 'h',
      season_episode_format: 'S{{season}}E{{episode}}'
    },
    
    // Seasons subsection
    seasonsDetail: {
      title: 'Seasons & Episodes',
      loading_text: 'Loading...',
      episode_singular: 'episode',
      episode_plural: 'episodes',
      season_selector_hint: 'Double tap to open season selector'
    },
    
    // Navigation
    go_back: 'Go Back'
  },

  person_detail: {
    // Loading states
    loading_person: 'Loading person...',
    loading_details: 'Loading person details...',
    loading_filmography: 'Loading filmography...',
    loading_biography: 'Loading biography...',

    // Error states
    error_title: 'Unable to Load Person Details',
    error_message: 'Something went wrong while loading person information. Please try again.',

    // Hero section
    age: '{{age}} years old',
    age_at_death: 'Died at {{age}} years old',
    born: 'Born {{date}}',
    died: 'Died',
    life_dates: '{{birth}} - {{death}}',
    place_of_birth: 'Place of Birth',
    known_for_works: 'Known For',

    // Personal information
    biography: 'Biography',
    also_known_as: 'Also Known As',
    personal_details: 'Personal Details',
    personal_info: 'Personal Information',
    known_for_department: 'Known For',
    gender: 'Gender',
    popularity: 'Popularity',
    age_label: 'Age',
    years_old: 'years old',
    show_more: 'Show more',
    show_less: 'Show less',
    read_more: 'Read more',

    // Apple TV+ style sections
    about: 'About',
    information: 'Information',
    career_highlights: 'Career Highlights',

    // Action buttons
    share: 'Share',
    share_title: 'Share Person',
    share_message: 'Check out {{name}} on VNYL',

    // Filmography section
    filmography: {
      title: 'Filmography',
      loading: 'Loading filmography...',
      loading_more: 'Loading more...',
      total_works: '{{count}} total works',
      see_all: 'See All',
      load_more: 'Load More',
      movies: 'Movies',
      tv_shows: 'Shows',  // Apple TV+ style naming
      acting: 'Acting',
      crew: 'Production',  // Apple TV+ style naming
      directing: 'Directing',
      writing: 'Writing',
      producing: 'Producing'
    },

    // Load more functionality
    load_more_error_title: 'Unable to Load More',
    load_more_error_message: 'Something went wrong while loading more filmography. Please try again.',

    // Awards section
    awards_nominations: 'Awards & Nominations',
    wins: 'Wins',
    nominations: 'Nominations',
    major_awards: 'Major Awards',
    win: 'Win',
    nomination: 'Nomination',
    loading_awards: 'Loading awards...',
    loading_more_awards: 'Loading more awards...',

    // Career timeline section
    career_timeline: 'Career Timeline',
    major_milestones: 'Major Milestones',
    breakthroughs: 'Breakthroughs',
    award_milestones: 'Award Milestones',
    early_career: 'Early Career',
    established_career: 'Established Career',
    mature_career: 'Mature Career',
    loading_timeline: 'Loading timeline...',
    loading_more_timeline: 'Loading more timeline...',

    // Trivia section
    trivia_facts: 'Trivia & Facts',
    trivia_summary: 'Interesting Facts',
    show_more_trivia: 'Show More Trivia',
    loading_trivia: 'Loading trivia...',
    loading_more_trivia: 'Loading more trivia...',

    // Related people section
    related_people: 'Related People',
    collaborations: 'Collaborations',
    connections_summary: 'Connections',
    related_to: 'Related to',
    for_work: 'for work',
    in_work: 'in work',
    notable: 'Notable',
    loading_related_people: 'Loading related people...',
    loading_more_relations: 'Loading more relations...',

    // Social media section
    social_media: 'Social Media',
    social_profiles: 'Social Profiles',
    professional_links: 'Professional Links',
    followers: 'Followers',
    source: 'Source',
    loading_social_media: 'Loading social media...',
    loading_more_social: 'Loading more social...',
    external_link_title: 'External Link',
    external_link_message: 'This will open in your web browser.',
    link_error_title: 'Unable to Open Link',
    link_error_message: 'There was an error opening this link.',
    invalid_url_title: 'Invalid Link',
    invalid_url_message: 'This link appears to be invalid.',
    unsupported_url_title: 'Unsupported Link',
    unsupported_url_message: 'This type of link is not supported.',
    external_links_security: 'External links are verified for security before opening.'
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