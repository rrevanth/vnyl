import React from 'react'
import { ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from '@legendapp/state/react'
import {
  SettingsSection,
  SettingRow,
  Heading,
  Text,
  useTheme,
  createStyles
} from '@/src/presentation/shared/ui'

export default observer(function SettingsScreen() {
  const { theme } = useTheme()
  const styles = createStyles(theme)

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true)
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false)

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your collection data to CSV or JSON format.',
      [{ text: 'OK' }]
    )
  }

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'Backup your collection to iCloud or Google Drive.',
      [{ text: 'OK' }]
    )
  }

  const handleAbout = () => {
    Alert.alert(
      'About VNYL',
      'VNYL App v1.0.0\nYour digital vinyl collection manager.',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <div style={styles.content}>
          <Heading variant="h1" letterSpacing={1}>
            Settings
          </Heading>
          <Text variant="body" color="secondary" style={{ marginBottom: 32 }}>
            Customize your VNYL experience
          </Text>

          {/* Preferences Section */}
          <SettingsSection
            title="Preferences"
            description="Customize app behavior and notifications"
          >
            <SettingRow
              label="Push Notifications"
              description="Get notified about new releases and price changes"
              variant="switch"
              switchProps={{
                value: notificationsEnabled,
                onValueChange: setNotificationsEnabled
              }}
            />

            <SettingRow
              label="Dark Mode"
              description="Use dark appearance throughout the app"
              variant="switch"
              switchProps={{
                value: darkModeEnabled,
                onValueChange: setDarkModeEnabled
              }}
            />

            <SettingRow
              label="Biometric Authentication"
              description="Use Face ID or Touch ID to secure your collection"
              variant="switch"
              switchProps={{
                value: biometricsEnabled,
                onValueChange: setBiometricsEnabled
              }}
            />
          </SettingsSection>

          {/* Data Management Section */}
          <SettingsSection
            title="Data Management"
            description="Export and backup your collection data"
          >
            <SettingRow
              label="Export Data"
              description="Export your collection to CSV or JSON"
              variant="navigation"
              leftIcon={<Text style={{ fontSize: 24 }}>📎</Text>}
              onPress={handleExportData}
            />

            <SettingRow
              label="Backup Data"
              description="Sync your collection to cloud storage"
              variant="navigation"
              leftIcon={<Text style={{ fontSize: 24 }}>☁️</Text>}
              onPress={handleBackupData}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection
            title="About"
            description="App information and version details"
          >
            <SettingRow
              label="About VNYL"
              description="App version and information"
              variant="navigation"
              leftIcon={<Text style={{ fontSize: 24 }}>ℹ️</Text>}
              onPress={handleAbout}
            />
          </SettingsSection>

          {/* Coming Soon Section */}
          <SettingsSection
            title="Coming Soon"
            description="Features currently in development"
            showTopDivider
            bottomMargin={false}
          >
            <div style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Heading variant="h3" align="center" style={{ marginBottom: 24 }}>
                ⚙️ Settings Features Coming Soon
              </Heading>
              <div style={{ alignItems: 'flex-start' }}>
                <Text variant="caption" color="secondary" style={{ marginBottom: 8 }}>
                  • Account management and sync
                </Text>
                <Text variant="caption" color="secondary" style={{ marginBottom: 8 }}>
                  • Integration with Discogs API
                </Text>
                <Text variant="caption" color="secondary" style={{ marginBottom: 8 }}>
                  • Custom collection categories
                </Text>
                <Text variant="caption" color="secondary" style={{ marginBottom: 8 }}>
                  • Privacy and security settings
                </Text>
                <Text variant="caption" color="secondary" style={{ marginBottom: 8 }}>
                  • Appearance customization
                </Text>
              </div>
            </div>
          </SettingsSection>
        </div>
      </ScrollView>
    </SafeAreaView>
  )
})