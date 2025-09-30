/**
 * Person Detail Route
 * 
 * Expo Router dynamic route for person detail screen.
 * Handles person ID parameter extraction and PersonDetailScreen initialization.
 * Integrates with the homescreen store for person selection context.
 */

import React, { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { PersonDetailScreen } from '@/src/presentation/features/person-detail/PersonDetailScreen'
import { useLogging } from '@/src/infrastructure/di'
import { homescreenSelectors } from '@/src/presentation/shared/stores/homescreen-store'

export default function PersonDetailRoute() {
  const { id, person } = useLocalSearchParams<{ id: string; person?: any }>()
  const logger = useLogging()

  // Log navigation for analytics and debugging
  useEffect(() => {
    if (id) {
      const selectedItem = homescreenSelectors.selectedItem.get()
      
      logger.info('Person detail route accessed', {
        context: 'person_detail_route',
        personId: id,
        hasSelectedItem: !!selectedItem,
        selectedItemType: selectedItem?.mediaType,
        hasPersonParam: !!person
      })
    }
  }, [id, person, logger])

  return <PersonDetailScreen />
}