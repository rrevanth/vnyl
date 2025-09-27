/**
 * TMDB Settings Stack Layout
 * 
 * Stack navigator for TMDB provider settings with two main sections:
 * - Account settings (index.tsx)
 * - Capabilities management (capabilities.tsx)
 * 
 * Uses Expo Router Stack navigator with theme integration
 * and proper header styling matching app design.
 */

import React from 'react'
import { Stack } from 'expo-router'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'

export default observer(function TMDBSettingsLayout() {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: theme.typography.heading3.fontSize,
          fontFamily: theme.typography.heading3.fontFamily,
          color: theme.colors.text.primary
        },
        headerShadowVisible: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('settings.providers.tmdb.account_settings_title'),
          headerShown: true
        }}
      />
      <Stack.Screen
        name="capabilities"
        options={{
          title: t('settings.providers.tmdb.capabilities_title'),
          headerShown: true
        }}
      />
    </Stack>
  )
})