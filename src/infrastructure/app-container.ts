import { initializeDI } from '@/src/infrastructure/di'
import { ApiConfig } from '@/src/domain/services'

export const initializeApp = (): void => {
  const apiConfig: ApiConfig = {
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Initialize DI Container with proper logger injection
  initializeDI(apiConfig)

  // DI container will log successful initialization with injected logger
}