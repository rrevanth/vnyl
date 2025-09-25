import React from 'react'
import { Stack } from 'expo-router'
import { observer } from '@legendapp/state/react'
import { useTheme } from '@/src/presentation/shared/theme'
import { useTranslation } from '@/src/presentation/shared/i18n'

export default observer(function SettingsLayout() {
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
          fontSize: theme.typography.heading2.fontSize,
          fontWeight: theme.typography.heading2.fontWeight,
          color: theme.colors.text.primary
        } as any,
        headerShadowVisible: false,
        headerShown: true
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('settings.title'),
          headerShown: false // We'll handle the header in the main settings screen
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          title: t('settings.theme.title'),
          headerShown: true,
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="locale"
        options={{
          title: t('settings.locale.title'),
          headerShown: true,
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="display"
        options={{
          title: t('settings.display.title'),
          headerShown: true,
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="providers"
        options={{
          title: t('providers.title'),
          headerShown: true,
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: t('settings.about.title'),
          headerShown: true,
          presentation: 'card'
        }}
      />
    </Stack>
  )
})