/**
 * Storage layer barrel exports
 */

export { AsyncStorageService } from './async-storage.service'
export { 
  StorageEncryption,
  createEncryptedStorageItem,
  extractFromEncryptedStorageItem,
  type EncryptedStorageItem,
} from './storage-encryption'