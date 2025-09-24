/**
 * Settings Configuration
 *
 * Defines the structure, validation rules, and metadata for all settings.
 * This configuration drives the dynamic settings UI generation.
 */

import type {
  SettingConfig,
  SettingSection,
  SettingCategory
} from '../model/settings.types'

// Theme Settings
const themeSettings: SettingConfig[] = [
  {
    key: 'theme',
    label: 'Appearance',
    description: 'Choose how VNYL looks on your device',
    type: 'select',
    category: 'theme',
    defaultValue: 'system',
    options: [
      { label: 'Light', value: 'light', description: 'Light mode always' },
      { label: 'Dark', value: 'dark', description: 'Dark mode always' },
      { label: 'System', value: 'system', description: 'Follow system setting' }
    ],
    icon: '🎨'
  }
]

// API Keys Settings
const apiKeySettings: SettingConfig[] = [
  {
    key: 'tmdb',
    label: 'TMDB API Key',
    description: 'Required for movie and TV show information',
    type: 'password',
    category: 'apiKeys',
    placeholder: 'Enter your TMDB API key',
    secure: true,
    validation: [
      { type: 'required', message: 'TMDB API key is required' },
      { type: 'minLength', value: 32, message: 'API key must be at least 32 characters' }
    ],
    icon: '🎬'
  },
  {
    key: 'spotify',
    label: 'Spotify API Key',
    description: 'Connect with Spotify for music integration',
    type: 'password',
    category: 'apiKeys',
    placeholder: 'Enter your Spotify API key',
    secure: true,
    validation: [
      { type: 'minLength', value: 32, message: 'API key must be at least 32 characters' }
    ],
    icon: '🎵'
  },
  {
    key: 'lastfm',
    label: 'Last.fm API Key',
    description: 'Enhanced music metadata and scrobbling',
    type: 'password',
    category: 'apiKeys',
    placeholder: 'Enter your Last.fm API key',
    secure: true,
    validation: [
      { type: 'minLength', value: 32, message: 'API key must be at least 32 characters' }
    ],
    icon: '📻'
  }
]

// Streaming Settings
const streamingSettings: SettingConfig[] = [
  {
    key: 'streamQuality',
    label: 'Stream Quality',
    description: 'Choose default streaming quality',
    type: 'select',
    category: 'streaming',
    defaultValue: 'auto',
    options: [
      { label: 'Auto', value: 'auto', description: 'Adjust based on connection' },
      { label: 'High', value: 'high', description: 'Best quality (more data)' },
      { label: 'Medium', value: 'medium', description: 'Balanced quality and data' },
      { label: 'Low', value: 'low', description: 'Lower quality (less data)' }
    ],
    icon: '📺'
  },
  {
    key: 'autoplay',
    label: 'Autoplay',
    description: 'Automatically play next episode or track',
    type: 'switch',
    category: 'streaming',
    defaultValue: true,
    icon: '▶️'
  },
  {
    key: 'downloadOnWifi',
    label: 'Download on Wi-Fi Only',
    description: 'Only download content when connected to Wi-Fi',
    type: 'switch',
    category: 'streaming',
    defaultValue: true,
    icon: '📶'
  },
  {
    key: 'offlineMode',
    label: 'Offline Mode',
    description: 'Enable offline content playback',
    type: 'switch',
    category: 'streaming',
    defaultValue: false,
    icon: '📱'
  }
]

// Notification Settings
const notificationSettings: SettingConfig[] = [
  {
    key: 'notificationsEnabled',
    label: 'Push Notifications',
    description: 'Receive notifications about updates and new content',
    type: 'switch',
    category: 'notifications',
    defaultValue: true,
    icon: '🔔'
  },
  {
    key: 'notificationTypes',
    label: 'Notification Types',
    description: 'Choose what notifications you want to receive',
    type: 'multiSelect',
    category: 'notifications',
    defaultValue: ['new_releases', 'recommendations'],
    options: [
      { label: 'New Releases', value: 'new_releases', description: 'New movies and TV shows' },
      { label: 'Recommendations', value: 'recommendations', description: 'Personalized recommendations' },
      { label: 'Updates', value: 'updates', description: 'App updates and features' },
      { label: 'Promotions', value: 'promotions', description: 'Special offers and deals' }
    ],
    icon: '📢'
  },
  {
    key: 'emailNotifications',
    label: 'Email Notifications',
    description: 'Receive notifications via email',
    type: 'switch',
    category: 'notifications',
    defaultValue: false,
    icon: '📧'
  }
]

// Home Layout Settings
const homeLayoutSettings: SettingConfig[] = [
  {
    key: 'homeLayout',
    label: 'Home Screen Layout',
    description: 'Choose how content is displayed on the home screen',
    type: 'select',
    category: 'homeLayout',
    defaultValue: 'grid',
    options: [
      { label: 'Grid', value: 'grid', description: 'Card grid layout' },
      { label: 'List', value: 'list', description: 'Detailed list view' },
      { label: 'Carousel', value: 'carousel', description: 'Horizontal scrolling' }
    ],
    icon: '📱'
  }
]

// Account & Data Settings
const accountSettings: SettingConfig[] = [
  {
    key: 'exportData',
    label: 'Export Data',
    description: 'Export your collection and preferences',
    type: 'button',
    category: 'account',
    icon: '📎'
  },
  {
    key: 'backupData',
    label: 'Backup to Cloud',
    description: 'Backup your data to iCloud or Google Drive',
    type: 'button',
    category: 'account',
    icon: '☁️'
  },
  {
    key: 'resetPreferences',
    label: 'Reset All Preferences',
    description: 'Reset all settings to default values',
    type: 'button',
    category: 'account',
    icon: '🔄'
  }
]

// About Settings
const aboutSettings: SettingConfig[] = [
  {
    key: 'appVersion',
    label: 'App Version',
    description: 'Current app version and build information',
    type: 'navigation',
    category: 'about',
    icon: 'ℹ️'
  },
  {
    key: 'privacyPolicy',
    label: 'Privacy Policy',
    description: 'Read our privacy policy',
    type: 'navigation',
    category: 'about',
    icon: '🔒'
  },
  {
    key: 'termsOfService',
    label: 'Terms of Service',
    description: 'Read our terms of service',
    type: 'navigation',
    category: 'about',
    icon: '📄'
  },
  {
    key: 'support',
    label: 'Support',
    description: 'Get help and contact support',
    type: 'navigation',
    category: 'about',
    icon: '🛟'
  }
]

// Complete Settings Configuration
export const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: 'theme',
    title: 'Appearance',
    description: 'Customize the look and feel',
    icon: '🎨',
    settings: themeSettings,
    order: 1
  },
  {
    id: 'apiKeys',
    title: 'API Keys',
    description: 'Configure service integrations',
    icon: '🔑',
    settings: apiKeySettings,
    order: 2
  },
  {
    id: 'streaming',
    title: 'Streaming',
    description: 'Audio and video preferences',
    icon: '📺',
    settings: streamingSettings,
    order: 3
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage your notifications',
    icon: '🔔',
    settings: notificationSettings,
    order: 4
  },
  {
    id: 'homeLayout',
    title: 'Home Layout',
    description: 'Customize home screen appearance',
    icon: '🏠',
    settings: homeLayoutSettings,
    order: 5
  },
  {
    id: 'account',
    title: 'Account & Data',
    description: 'Manage your account and data',
    icon: '👤',
    settings: accountSettings,
    order: 6
  },
  {
    id: 'about',
    title: 'About',
    description: 'App information and legal',
    icon: 'ℹ️',
    settings: aboutSettings,
    order: 7
  }
]

// Helper functions
export const getSettingByKey = (key: string): SettingConfig | undefined => {
  return SETTINGS_SECTIONS
    .flatMap(section => section.settings)
    .find(setting => setting.key === key)
}

export const getSettingsByCategory = (category: SettingCategory): SettingConfig[] => {
  return SETTINGS_SECTIONS
    .find(section => section.id === category)?.settings || []
}

export const validateSettingValue = (key: string, value: any): string[] => {
  const setting = getSettingByKey(key)
  if (!setting?.validation) return []

  const errors: string[] = []

  for (const rule of setting.validation) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(rule.message)
        }
        break
      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          errors.push(rule.message)
        }
        break
      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value) {
          errors.push(rule.message)
        }
        break
      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          errors.push(rule.message)
        }
        break
      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          errors.push(rule.message)
        }
        break
    }
  }

  return errors
}