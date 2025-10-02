/**
 * AsyncStorage implementation of IStorageService
 * Provides persistent storage with encryption, TTL, and user namespacing
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  IStorageService,
  StorageOptions,
  StorageItem,
} from '@/src/domain/services/storage.service.interface'
import {
  StorageEncryption,
  EncryptedStorageItem,
  createEncryptedStorageItem,
  extractFromEncryptedStorageItem,
} from './storage-encryption'

export class AsyncStorageService implements IStorageService {
  private static readonly VERSION = '1.0'
  private static readonly KEY_PREFIX = 'vnyl:'
  private static readonly USER_PREFIX = 'user:'
  private static readonly APP_PREFIX = 'app:'
  private static readonly CACHE_PREFIX = 'cache:'
  private static readonly SECURE_PREFIX = 'secure:'
  private static readonly METADATA_SUFFIX = ':meta'

  private readonly enableLogging: boolean

  constructor(options: { enableLogging?: boolean } = {}) {
    this.enableLogging = options.enableLogging ?? __DEV__
  }

  // Basic operations
  async set<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      const storageItem = createEncryptedStorageItem(value, {
        encrypt: options.encrypt,
        expiry: options.expiry,
        generateHash: true,
      })

      const serializedItem = JSON.stringify(storageItem)
      
      if (options.encrypt) {
        const encryptedItem = StorageEncryption.encrypt(serializedItem)
        await AsyncStorage.setItem(fullKey, encryptedItem)
      } else {
        await AsyncStorage.setItem(fullKey, serializedItem)
      }

      this.log(`Set key: ${key}`, { encrypted: !!options.encrypt, expiry: options.expiry })
    } catch (error) {
      this.logError(`Failed to set key: ${key}`, error)
      throw new Error(`Storage set failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key)
      const rawValue = await AsyncStorage.getItem(fullKey)
      
      if (rawValue === null) {
        return null
      }

      let storageItem: EncryptedStorageItem<T>
      
      // Try to decrypt if it looks encrypted
      if (StorageEncryption.isEncrypted(rawValue)) {
        const decryptedValue = StorageEncryption.decrypt(rawValue)
        storageItem = JSON.parse(decryptedValue)
      } else {
        storageItem = JSON.parse(rawValue)
      }

      // Check expiry
      if (storageItem.expiry && Date.now() > storageItem.expiry) {
        await this.remove(key)
        this.log(`Expired key removed: ${key}`)
        return null
      }

      const value = extractFromEncryptedStorageItem(storageItem, { verifyHash: true })
      this.log(`Get key: ${key}`, { expired: false, encrypted: storageItem.encrypted })
      
      return value
    } catch (error) {
      this.logError(`Failed to get key: ${key}`, error)
      return null
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      await AsyncStorage.removeItem(fullKey)
      this.log(`Removed key: ${key}`)
    } catch (error) {
      this.logError(`Failed to remove key: ${key}`, error)
      throw new Error(`Storage remove failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const vnylKeys = keys.filter(key => key.startsWith(AsyncStorageService.KEY_PREFIX))
      await AsyncStorage.multiRemove(vnylKeys)
      this.log(`Cleared ${vnylKeys.length} keys`)
    } catch (error) {
      this.logError('Failed to clear storage', error)
      throw new Error(`Storage clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Batch operations
  async setMultiple<T>(items: { key: string; value: T; options?: StorageOptions }[]): Promise<void> {
    try {
      const pairs: [string, string][] = []
      
      for (const item of items) {
        const fullKey = this.buildKey(item.key)
        const storageItem = createEncryptedStorageItem(item.value, {
          encrypt: item.options?.encrypt,
          expiry: item.options?.expiry,
          generateHash: true,
        })

        let serializedItem = JSON.stringify(storageItem)
        
        if (item.options?.encrypt) {
          serializedItem = StorageEncryption.encrypt(serializedItem)
        }
        
        pairs.push([fullKey, serializedItem])
      }

      await AsyncStorage.multiSet(pairs)
      this.log(`Set multiple keys: ${items.length}`)
    } catch (error) {
      this.logError('Failed to set multiple keys', error)
      throw new Error(`Storage setMultiple failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMultiple<T>(keys: string[]): Promise<{ key: string; value: T | null }[]> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key))
      const keyValuePairs = await AsyncStorage.multiGet(fullKeys)
      
      const results = await Promise.allSettled(
        keyValuePairs.map(async ([fullKey, rawValue], index) => {
          const originalKey = keys[index]
          
          if (rawValue === null) {
            return { key: originalKey, value: null as T | null }
          }

          try {
            let storageItem: EncryptedStorageItem<T>
            
            if (StorageEncryption.isEncrypted(rawValue)) {
              const decryptedValue = StorageEncryption.decrypt(rawValue)
              storageItem = JSON.parse(decryptedValue)
            } else {
              storageItem = JSON.parse(rawValue)
            }

            // Check expiry
            if (storageItem.expiry && Date.now() > storageItem.expiry) {
              await this.remove(originalKey)
              return { key: originalKey, value: null as T | null }
            }

            const value = extractFromEncryptedStorageItem(storageItem, { verifyHash: true })
            return { key: originalKey, value: value as T | null }
          } catch (parseError) {
            this.logError(`Failed to parse key: ${originalKey}`, parseError)
            return { key: originalKey, value: null as T | null }
          }
        })
      )

      return results
        .filter((result): result is PromiseFulfilledResult<{ key: string; value: T | null }> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
    } catch (error) {
      this.logError('Failed to get multiple keys', error)
      throw new Error(`Storage getMultiple failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async removeMultiple(keys: string[]): Promise<void> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key))
      await AsyncStorage.multiRemove(fullKeys)
      this.log(`Removed multiple keys: ${keys.length}`)
    } catch (error) {
      this.logError('Failed to remove multiple keys', error)
      throw new Error(`Storage removeMultiple failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Key management
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return keys
        .filter(key => key.startsWith(AsyncStorageService.KEY_PREFIX))
        .map(key => key.slice(AsyncStorageService.KEY_PREFIX.length))
    } catch (error) {
      this.logError('Failed to get all keys', error)
      return []
    }
  }

  async hasKey(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key)
      const value = await AsyncStorage.getItem(fullKey)
      return value !== null
    } catch (error) {
      this.logError(`Failed to check key existence: ${key}`, error)
      return false
    }
  }

  async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys()
      return keys.length
    } catch (error) {
      this.logError('Failed to get storage size', error)
      return 0
    }
  }

  // Pattern-based operations
  async getKeysMatching(pattern: RegExp): Promise<string[]> {
    try {
      const allKeys = await this.getAllKeys()
      return allKeys.filter(key => pattern.test(key))
    } catch (error) {
      this.logError('Failed to get keys matching pattern', error)
      return []
    }
  }

  async removeKeysMatching(pattern: RegExp): Promise<string[]> {
    try {
      const matchingKeys = await this.getKeysMatching(pattern)
      if (matchingKeys.length > 0) {
        await this.removeMultiple(matchingKeys)
      }
      return matchingKeys
    } catch (error) {
      this.logError('Failed to remove keys matching pattern', error)
      return []
    }
  }

  // Expiry management
  async setWithExpiry<T>(key: string, value: T, expiryMs: number): Promise<void> {
    const expiry = Date.now() + expiryMs
    await this.set(key, value, { expiry })
  }

  async getWithoutExpiry<T>(key: string): Promise<StorageItem<T> | null> {
    try {
      const fullKey = this.buildKey(key)
      const rawValue = await AsyncStorage.getItem(fullKey)
      
      if (rawValue === null) {
        return null
      }

      let storageItem: EncryptedStorageItem<T>
      
      if (StorageEncryption.isEncrypted(rawValue)) {
        const decryptedValue = StorageEncryption.decrypt(rawValue)
        storageItem = JSON.parse(decryptedValue)
      } else {
        storageItem = JSON.parse(rawValue)
      }

      const value = extractFromEncryptedStorageItem(storageItem, { verifyHash: true })
      
      return {
        value,
        timestamp: storageItem.timestamp,
        expiry: storageItem.expiry,
      }
    } catch (error) {
      this.logError(`Failed to get key without expiry: ${key}`, error)
      return null
    }
  }

  async cleanupExpiredItems(): Promise<string[]> {
    try {
      const allKeys = await this.getAllKeys()
      const expiredKeys: string[] = []
      
      for (const key of allKeys) {
        const item = await this.getWithoutExpiry(key)
        if (item?.expiry && Date.now() > item.expiry) {
          expiredKeys.push(key)
        }
      }
      
      if (expiredKeys.length > 0) {
        await this.removeMultiple(expiredKeys)
        this.log(`Cleaned up ${expiredKeys.length} expired items`)
      }
      
      return expiredKeys
    } catch (error) {
      this.logError('Failed to cleanup expired items', error)
      return []
    }
  }

  // JSON operations
  async setJson<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    await this.set(key, value, options)
  }

  async getJson<T>(key: string): Promise<T | null> {
    return this.get<T>(key)
  }

  // User-specific storage
  async setUserData<T>(userId: string, key: string, value: T, options: StorageOptions = {}): Promise<void> {
    const userKey = `${AsyncStorageService.USER_PREFIX}${userId}:${key}`
    await this.set(userKey, value, options)
  }

  async getUserData<T>(userId: string, key: string): Promise<T | null> {
    const userKey = `${AsyncStorageService.USER_PREFIX}${userId}:${key}`
    return this.get<T>(userKey)
  }

  async removeUserData(userId: string, key: string): Promise<void> {
    const userKey = `${AsyncStorageService.USER_PREFIX}${userId}:${key}`
    await this.remove(userKey)
  }

  async clearUserData(userId: string): Promise<void> {
    const pattern = new RegExp(`^${AsyncStorageService.USER_PREFIX}${userId}:`)
    await this.removeKeysMatching(pattern)
  }

  async getUserKeys(userId: string): Promise<string[]> {
    const pattern = new RegExp(`^${AsyncStorageService.USER_PREFIX}${userId}:(.+)`)
    const allKeys = await this.getAllKeys()
    return allKeys
      .filter(key => pattern.test(key))
      .map(key => {
        const match = key.match(pattern)
        return match ? match[1] : key
      })
  }

  // App-specific storage namespaces
  async setAppData<T>(namespace: string, key: string, value: T, options: StorageOptions = {}): Promise<void> {
    const appKey = `${AsyncStorageService.APP_PREFIX}${namespace}:${key}`
    await this.set(appKey, value, options)
  }

  async getAppData<T>(namespace: string, key: string): Promise<T | null> {
    const appKey = `${AsyncStorageService.APP_PREFIX}${namespace}:${key}`
    return this.get<T>(appKey)
  }

  async removeAppData(namespace: string, key: string): Promise<void> {
    const appKey = `${AsyncStorageService.APP_PREFIX}${namespace}:${key}`
    await this.remove(appKey)
  }

  async clearAppData(namespace: string): Promise<void> {
    const pattern = new RegExp(`^${AsyncStorageService.APP_PREFIX}${namespace}:`)
    await this.removeKeysMatching(pattern)
  }

  // Cache-like operations with TTL
  async setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const cacheKey = `${AsyncStorageService.CACHE_PREFIX}${key}`
    await this.setWithExpiry(cacheKey, value, ttlMs)
  }

  async getCache<T>(key: string): Promise<T | null> {
    const cacheKey = `${AsyncStorageService.CACHE_PREFIX}${key}`
    return this.get<T>(cacheKey)
  }

  async invalidateCache(keyPattern?: RegExp): Promise<string[]> {
    const cachePattern = keyPattern 
      ? new RegExp(`^${AsyncStorageService.CACHE_PREFIX}${keyPattern.source}`)
      : new RegExp(`^${AsyncStorageService.CACHE_PREFIX}`)
    return this.removeKeysMatching(cachePattern)
  }

  // Encrypted storage for sensitive data
  async setSecure<T>(key: string, value: T): Promise<void> {
    const secureKey = `${AsyncStorageService.SECURE_PREFIX}${key}`
    await this.set(secureKey, value, { encrypt: true })
  }

  async getSecure<T>(key: string): Promise<T | null> {
    const secureKey = `${AsyncStorageService.SECURE_PREFIX}${key}`
    return this.get<T>(secureKey)
  }

  async removeSecure(key: string): Promise<void> {
    const secureKey = `${AsyncStorageService.SECURE_PREFIX}${key}`
    await this.remove(secureKey)
  }

  // Storage statistics and monitoring
  async getStorageStats(): Promise<{
    totalKeys: number
    totalSize: number
    expiredKeys: number
    encryptedKeys: number
    oldestEntry: number
    newestEntry: number
  }> {
    try {
      const allKeys = await this.getAllKeys()
      let expiredKeys = 0
      let encryptedKeys = 0
      let oldestEntry = Date.now()
      let newestEntry = 0
      let totalSize = 0

      for (const key of allKeys) {
        const item = await this.getWithoutExpiry(key)
        if (item) {
          totalSize += JSON.stringify(item).length
          
          if (item.expiry && Date.now() > item.expiry) {
            expiredKeys++
          }
          
          if (item.timestamp < oldestEntry) {
            oldestEntry = item.timestamp
          }
          
          if (item.timestamp > newestEntry) {
            newestEntry = item.timestamp
          }
        }
        
        // Check if key is encrypted by checking the raw value
        const fullKey = this.buildKey(key)
        const rawValue = await AsyncStorage.getItem(fullKey)
        if (rawValue && StorageEncryption.isEncrypted(rawValue)) {
          encryptedKeys++
        }
      }

      return {
        totalKeys: allKeys.length,
        totalSize,
        expiredKeys,
        encryptedKeys,
        oldestEntry: allKeys.length > 0 ? oldestEntry : 0,
        newestEntry: allKeys.length > 0 ? newestEntry : 0,
      }
    } catch (error) {
      this.logError('Failed to get storage stats', error)
      return {
        totalKeys: 0,
        totalSize: 0,
        expiredKeys: 0,
        encryptedKeys: 0,
        oldestEntry: 0,
        newestEntry: 0,
      }
    }
  }

  // Migration and backup
  async exportData(keys?: string[]): Promise<Record<string, unknown>> {
    try {
      const keysToExport = keys || await this.getAllKeys()
      const data: Record<string, unknown> = {}
      
      for (const key of keysToExport) {
        const value = await this.get(key)
        if (value !== null) {
          data[key] = value
        }
      }
      
      return data
    } catch (error) {
      this.logError('Failed to export data', error)
      return {}
    }
  }

  async importData(data: Record<string, unknown>, overwrite = false): Promise<string[]> {
    try {
      const importedKeys: string[] = []
      
      for (const [key, value] of Object.entries(data)) {
        const exists = await this.hasKey(key)
        
        if (!exists || overwrite) {
          await this.set(key, value)
          importedKeys.push(key)
        }
      }
      
      this.log(`Imported ${importedKeys.length} keys`)
      return importedKeys
    } catch (error) {
      this.logError('Failed to import data', error)
      return []
    }
  }

  // Memory management
  async optimize(): Promise<{
    removedExpired: number
    removedOrphaned: number
    compressedEntries: number
  }> {
    try {
      // Clean up expired items
      const expiredKeys = await this.cleanupExpiredItems()
      
      // For now, we don't have orphaned key detection or compression
      // These could be implemented based on specific app needs
      
      this.log(`Optimization complete: ${expiredKeys.length} expired items removed`)
      
      return {
        removedExpired: expiredKeys.length,
        removedOrphaned: 0,
        compressedEntries: 0,
      }
    } catch (error) {
      this.logError('Failed to optimize storage', error)
      return {
        removedExpired: 0,
        removedOrphaned: 0,
        compressedEntries: 0,
      }
    }
  }

  // Private utility methods
  private buildKey(key: string): string {
    return `${AsyncStorageService.KEY_PREFIX}${key}`
  }

  private log(message: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[AsyncStorage] ${message}`, data || '')
    }
  }

  private logError(message: string, error: any): void {
    if (this.enableLogging) {
      console.error(`[AsyncStorage] ${message}`, error)
    }
  }
}