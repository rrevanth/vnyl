import React from 'react'
import { Tabs } from 'expo-router'
import { Platform, Text } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1C1C1E',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="house" color={color} />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="magnifyingglass" color={color} />
          ),
          tabBarAccessibilityLabel: 'Search tab',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="books.vertical" color={color} />
          ),
          tabBarAccessibilityLabel: 'Library tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="gearshape" color={color} />
          ),
          tabBarAccessibilityLabel: 'Settings tab',
        }}
      />
    </Tabs>
  )
}

// Simple icon component using native symbols
interface TabBarIconProps {
  name: string
  color: string
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color }) => {
  // Using emoji icons for cross-platform compatibility
  // These will work consistently across iOS and Android
  const iconMap: Record<string, string> = {
    house: '🏠',
    magnifyingglass: '🔍',
    'books.vertical': '📚',
    gearshape: '⚙️',
  }

  return (
    <Text style={{ fontSize: 24, color }}>
      {iconMap[name] || '❓'}
    </Text>
  )
}