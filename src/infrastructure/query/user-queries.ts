import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, UserPreferences } from '@/src/domain/entities'
import { GetOrCreateUserUseCase, UpdateUserPreferencesUseCase, ResetUserPreferencesUseCase } from '@/src/domain/usecases'

export const USER_QUERY_KEYS = {
  all: ['user'] as const,
  user: () => [...USER_QUERY_KEYS.all, 'current'] as const,
  preferences: () => [...USER_QUERY_KEYS.all, 'preferences'] as const
} as const

export interface UseUserQueryResult {
  data: User | undefined
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

export interface UseUserPreferencesQueryResult {
  data: UserPreferences | undefined
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

export interface UseUpdatePreferencesMutationResult {
  mutate: (preferences: Partial<UserPreferences>) => void
  mutateAsync: (preferences: Partial<UserPreferences>) => Promise<User>
  isPending: boolean
  isSuccess: boolean
  error: Error | null
}

export interface UseResetPreferencesMutationResult {
  mutate: () => void
  mutateAsync: () => Promise<User>
  isPending: boolean
  isSuccess: boolean
  error: Error | null
}

export const createUserQueries = (
  getOrCreateUserUseCase: GetOrCreateUserUseCase,
  updateUserPreferencesUseCase: UpdateUserPreferencesUseCase,
  resetUserPreferencesUseCase: ResetUserPreferencesUseCase
) => {
  const useUserQuery = (): UseUserQueryResult => {
    const query = useQuery({
      queryKey: USER_QUERY_KEYS.user(),
      queryFn: () => getOrCreateUserUseCase.execute(),
      staleTime: 1000 * 60 * 10, // 10 minutes - user data doesn't change often
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 1 // Retry once on failure
    })

    return {
      data: query.data,
      isLoading: query.isPending,
      error: query.error,
      isSuccess: query.isSuccess
    }
  }

  const useUserPreferencesQuery = (): UseUserPreferencesQueryResult => {
    const query = useQuery({
      queryKey: USER_QUERY_KEYS.preferences(),
      queryFn: async () => {
        const user = await getOrCreateUserUseCase.execute()
        return user.preferences
      },
      staleTime: 1000 * 60 * 5, // 5 minutes - preferences might change more often
      gcTime: 1000 * 60 * 30 // 30 minutes
    })

    return {
      data: query.data,
      isLoading: query.isPending,
      error: query.error,
      isSuccess: query.isSuccess
    }
  }

  const useUpdatePreferencesMutation = (): UseUpdatePreferencesMutationResult => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
      mutationFn: (preferences: Partial<UserPreferences>) =>
        updateUserPreferencesUseCase.execute(preferences),
      onMutate: async (newPreferences) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: USER_QUERY_KEYS.all })

        // Snapshot the previous values
        const previousUser = queryClient.getQueryData<User>(USER_QUERY_KEYS.user())
        const previousPreferences = queryClient.getQueryData<UserPreferences>(USER_QUERY_KEYS.preferences())

        // Optimistically update user data
        if (previousUser) {
          const optimisticUser: User = {
            ...previousUser,
            preferences: { ...previousUser.preferences, ...newPreferences },
            updatedAt: new Date().toISOString()
          }
          queryClient.setQueryData(USER_QUERY_KEYS.user(), optimisticUser)
          queryClient.setQueryData(USER_QUERY_KEYS.preferences(), optimisticUser.preferences)
        }

        // Return context with previous values for rollback
        return { previousUser, previousPreferences }
      },
      onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousUser) {
          queryClient.setQueryData(USER_QUERY_KEYS.user(), context.previousUser)
        }
        if (context?.previousPreferences) {
          queryClient.setQueryData(USER_QUERY_KEYS.preferences(), context.previousPreferences)
        }
      },
      onSuccess: (updatedUser) => {
        // Update cache with server response
        queryClient.setQueryData(USER_QUERY_KEYS.user(), updatedUser)
        queryClient.setQueryData(USER_QUERY_KEYS.preferences(), updatedUser.preferences)
      }
    })

    return {
      mutate: mutation.mutate,
      mutateAsync: mutation.mutateAsync,
      isPending: mutation.isPending,
      isSuccess: mutation.isSuccess,
      error: mutation.error
    }
  }

  const useResetPreferencesMutation = (): UseResetPreferencesMutationResult => {
    const queryClient = useQueryClient()

    const mutation = useMutation({
      mutationFn: () => resetUserPreferencesUseCase.execute(),
      onSuccess: (updatedUser) => {
        // Update cache with reset user data
        queryClient.setQueryData(USER_QUERY_KEYS.user(), updatedUser)
        queryClient.setQueryData(USER_QUERY_KEYS.preferences(), updatedUser.preferences)
      }
    })

    return {
      mutate: mutation.mutate,
      mutateAsync: mutation.mutateAsync,
      isPending: mutation.isPending,
      isSuccess: mutation.isSuccess,
      error: mutation.error
    }
  }

  return {
    useUserQuery,
    useUserPreferencesQuery,
    useUpdatePreferencesMutation,
    useResetPreferencesMutation
  }
}