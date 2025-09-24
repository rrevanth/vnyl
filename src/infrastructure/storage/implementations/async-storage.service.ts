import AsyncStorage from '@react-native-async-storage/async-storage'
import { IStorageService, ILoggingService } from '@/src/domain/services'

export class AsyncStorageService implements IStorageService {
  constructor(private readonly logger: ILoggingService) {}

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.logger.debug(`Setting storage item: ${key}`)
      await AsyncStorage.setItem(key, value)
      this.logger.debug(`Successfully set storage item: ${key}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Failed to set storage item: ${key}`, errorInstance)
      throw new Error(`Failed to set item ${key}: ${errorInstance.message}`)
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      this.logger.debug(`Getting storage item: ${key}`)
      const result = await AsyncStorage.getItem(key)
      this.logger.debug(`Successfully retrieved storage item: ${key}`, undefined, { hasValue: result !== null })
      return result
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Failed to get storage item: ${key}`, errorInstance)
      throw new Error(`Failed to get item ${key}: ${errorInstance.message}`)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.logger.debug(`Removing storage item: ${key}`)
      await AsyncStorage.removeItem(key)
      this.logger.debug(`Successfully removed storage item: ${key}`)
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Failed to remove storage item: ${key}`, errorInstance)
      throw new Error(`Failed to remove item ${key}: ${errorInstance.message}`)
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.info('Clearing all storage items')
      await AsyncStorage.clear()
      this.logger.info('Successfully cleared all storage items')
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to clear storage', errorInstance)
      throw new Error(`Failed to clear storage: ${errorInstance.message}`)
    }
  }

  async getAllKeys(): Promise<readonly string[]> {
    try {
      this.logger.debug('Getting all storage keys')
      const keys = await AsyncStorage.getAllKeys()
      this.logger.debug('Successfully retrieved all storage keys', undefined, { keyCount: keys.length })
      return keys
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get all storage keys', errorInstance)
      throw new Error(`Failed to get all keys: ${errorInstance.message}`)
    }
  }

  async multiGet(keys: readonly string[]): Promise<readonly (readonly [string, string | null])[]> {
    try {
      this.logger.debug('Getting multiple storage items', undefined, { keyCount: keys.length })
      const result = await AsyncStorage.multiGet([...keys])
      this.logger.debug('Successfully retrieved multiple storage items', undefined, { keyCount: keys.length })
      return result
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to get multiple storage items', errorInstance, { keyCount: keys.length })
      throw new Error(`Failed to get multiple items: ${errorInstance.message}`)
    }
  }

  async multiSet(keyValuePairs: readonly (readonly [string, string])[]): Promise<void> {
    try {
      this.logger.debug('Setting multiple storage items', undefined, { pairCount: keyValuePairs.length })
      const mutablePairs = keyValuePairs.map(([key, value]) => [key, value] as [string, string])
      await AsyncStorage.multiSet(mutablePairs)
      this.logger.debug('Successfully set multiple storage items', undefined, { pairCount: keyValuePairs.length })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to set multiple storage items', errorInstance, { pairCount: keyValuePairs.length })
      throw new Error(`Failed to set multiple items: ${errorInstance.message}`)
    }
  }

  async multiRemove(keys: readonly string[]): Promise<void> {
    try {
      this.logger.debug('Removing multiple storage items', undefined, { keyCount: keys.length })
      await AsyncStorage.multiRemove([...keys])
      this.logger.debug('Successfully removed multiple storage items', undefined, { keyCount: keys.length })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to remove multiple storage items', errorInstance, { keyCount: keys.length })
      throw new Error(`Failed to remove multiple items: ${errorInstance.message}`)
    }
  }
}