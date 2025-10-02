/**
 * Example usage of the i18n system
 * This file demonstrates how to use the VNYL i18n system in React Native components
 */

// Example 1: Basic usage in a React Native component
/*
import React from 'react'
import { View, Text } from 'react-native'
import { useTranslation, useLocale } from '@/src/presentation/shared/i18n'

const ExampleComponent: React.FC = () => {
  const { t } = useTranslation('common')
  const { formatDate, formatCurrency } = useLocale()

  return (
    <View>
      <Text>{t('actions.play')}</Text>
      <Text>{t('status.loading')}</Text>
      <Text>{formatDate(new Date())}</Text>
      <Text>{formatCurrency(19.99, 'USD')}</Text>
    </View>
  )
}
*/

// Example 2: Using namespaced translations
/*
import React from 'react'
import { View, Text } from 'react-native'
import { useNamespacedTranslation } from '@/src/presentation/shared/i18n'

const MediaDetailComponent: React.FC = () => {
  const { nt } = useNamespacedTranslation('media_detail')

  return (
    <View>
      <Text>{nt('actions.play')}</Text>
      <Text>{nt('metadata.rating')}</Text>
      <Text>{nt('metadata.duration')}</Text>
    </View>
  )
}
*/

// Example 3: Using translation keys with interpolation
/*
import React from 'react'
import { View, Text } from 'react-native'
import { useTranslation } from '@/src/presentation/shared/i18n'

const SearchResultsComponent: React.FC<{ count: number; query: string }> = ({ count, query }) => {
  const { t, plural } = useTranslation('search')

  return (
    <View>
      <Text>{plural('results.found_results', count, { count })}</Text>
      <Text>{t('results.no_results_found', { query })}</Text>
    </View>
  )
}
*/

// Example 4: Using I18nProvider in app setup
/*
import React from 'react'
import { I18nProvider } from '@/src/presentation/shared/i18n'
import { AppContent } from './AppContent'

const App: React.FC = () => {
  return (
    <I18nProvider 
      defaultLanguage="en" 
      fallbackLanguage="en" 
      autoDetect={true}
      preloadNamespaces={['common', 'home']}
    >
      <AppContent />
    </I18nProvider>
  )
}
*/

// Example 5: Setting up i18n without React context
/*
import { setupI18n } from '@/src/presentation/shared/i18n'

const initializeApp = async () => {
  try {
    const i18nService = await setupI18n({
      defaultLanguage: 'en',
      autoDetect: true,
      preloadNamespaces: ['common', 'home', 'search']
    })
    
    console.log('i18n initialized successfully')
    // Continue with app initialization
  } catch (error) {
    console.error('Failed to initialize i18n:', error)
  }
}
*/

export const exampleUsage = {
  // This file is for documentation purposes
  // Remove this file if not needed in production
}