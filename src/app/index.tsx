import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import { useLogging, useStorage, useApiClient } from '@/src/infrastructure/di'

export default function Index() {
  const logger = useLogging()
  const storage = useStorage()
  const apiClient = useApiClient()
  const [storageValue, setStorageValue] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<string>('Ready')

  useEffect(() => {
    logger.info('Index screen mounted')

    // Test storage on mount
    const testStorage = async () => {
      try {
        const value = await storage.getItem('test-key')
        setStorageValue(value)
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to get storage item', errorInstance)
      }
    }

    testStorage()
  }, [logger, storage])

  const handleTestServices = async () => {
    try {
      setTestStatus('Testing...')

      // Test logging
      logger.info('Testing services from UI')

      // Test storage
      await storage.setItem('test-key', `Test value ${Date.now()}`)
      const newValue = await storage.getItem('test-key')
      setStorageValue(newValue)

      // Test API client config (won't make actual request without proper config)
      const config = apiClient.getDefaultConfig()
      logger.info('API client config retrieved', { baseURL: config.baseURL })

      setTestStatus('All services working! ✅')

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger.error('Service test failed', errorInstance)
      setTestStatus('Service test failed ❌')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VNYL App</Text>
      <Text style={styles.subtitle}>Infrastructure Ready</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Services Status: {testStatus}</Text>
        {storageValue && (
          <Text style={styles.storageText}>Storage Value: {storageValue}</Text>
        )}
      </View>

      <Pressable
        style={styles.testButton}
        onPress={handleTestServices}
        accessibilityRole="button"
        accessibilityLabel="Test services"
      >
        <Text style={styles.testButtonText}>Test Services</Text>
      </Pressable>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesTitle}>Available Services:</Text>
        <Text style={styles.serviceItem}>✅ Logging Service</Text>
        <Text style={styles.serviceItem}>✅ Storage Service (AsyncStorage)</Text>
        <Text style={styles.serviceItem}>✅ API Client (Axios)</Text>
        <Text style={styles.serviceItem}>✅ Config Client</Text>
        <Text style={styles.serviceItem}>✅ DI Container</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2
  },
  subtitle: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 32
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8
  },
  storageText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center'
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 32
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  servicesContainer: {
    alignItems: 'center'
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16
  },
  serviceItem: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4
  }
})
