import React from 'react'
import { observer } from '@legendapp/state/react'
import { Screen } from '@/src/presentation/components'
import { useTranslation } from '@/src/presentation/shared/i18n'

export default observer(function SettingsScreen() {
  const { t } = useTranslation()
  return <Screen title={t('navigation.settings')} />
})