import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs"
import { observer } from '@legendapp/state/react'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useTheme } from '@/src/presentation/shared/theme'

export default observer(function TabLayout() {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <NativeTabs
      tintColor={theme.colors.interactive.primary}
    >
      <NativeTabs.Trigger name="index">
        <Label>{t('navigation.home')}</Label>
        <Icon sf="house.fill" drawable="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Label>{t('navigation.search')}</Label>
        <Icon sf="magnifyingglass" drawable="search" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Label>{t('navigation.library')}</Label>
        <Icon sf="books.vertical.fill" drawable="library" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>{t('navigation.settings')}</Label>
        <Icon sf="gear" drawable="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
})