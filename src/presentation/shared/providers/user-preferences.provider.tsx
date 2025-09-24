import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient, setupQueryPersistence, createUserQueries } from '@/src/infrastructure/query'
import { setUserQueryHooks } from '@/src/presentation/shared/hooks'
import { userStoreActions } from '@/src/presentation/shared/stores'
import { useGetOrCreateUserUseCase, useUpdateUserPreferencesUseCase, useResetUserPreferencesUseCase } from '@/src/infrastructure/di/hooks'
import { useAppInitialization } from './app-initialization.provider'

interface UserPreferencesProviderProps {
  children: ReactNode
}

interface UserPreferencesContextType {
  queryClient: QueryClient
  isReady: boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null)

export const useUserPreferencesContext = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferencesContext must be used within UserPreferencesProvider')
  }
  return context
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({
  children
}) => {
  const [queryClient] = React.useState(() => createQueryClient())
  const [isReady, setIsReady] = React.useState(false)

  // Wait for app initialization before accessing DI services
  const { isInitialized, error: appError } = useAppInitialization()

  // Always call hooks unconditionally, but only use them when initialized
  const getOrCreateUserUseCase = useGetOrCreateUserUseCase()
  const updateUserPreferencesUseCase = useUpdateUserPreferencesUseCase()
  const resetUserPreferencesUseCase = useResetUserPreferencesUseCase()

  useEffect(() => {
    // Don't initialize until app and all services are ready
    if (!isInitialized || appError) {
      return
    }
    const initializeProvider = async () => {
      try {
        // Setup query persistence
        await setupQueryPersistence(queryClient)

        // Create user query hooks
        const userQueries = createUserQueries(
          getOrCreateUserUseCase,
          updateUserPreferencesUseCase,
          resetUserPreferencesUseCase
        )

        // Inject query hooks into the hook system
        setUserQueryHooks(userQueries)

        // Initialize user data
        userStoreActions.setLoading(true)

        try {
          const user = await getOrCreateUserUseCase.execute()
          userStoreActions.setUser(user)
          userStoreActions.setLoading(false)
        } catch (error) {
          const errorInstance = error instanceof Error ? error : new Error(String(error))
          userStoreActions.setError(errorInstance.message)
          userStoreActions.setLoading(false)
        }

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize UserPreferencesProvider:', error)
        userStoreActions.setError('Failed to initialize user preferences')
        userStoreActions.setLoading(false)
        setIsReady(true) // Still set ready to prevent blocking
      }
    }

    initializeProvider()
  }, [getOrCreateUserUseCase, updateUserPreferencesUseCase, resetUserPreferencesUseCase, queryClient, isInitialized, appError])

  const contextValue: UserPreferencesContextType = {
    queryClient,
    isReady
  }

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </UserPreferencesContext.Provider>
  )
}