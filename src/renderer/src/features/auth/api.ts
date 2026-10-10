import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Credentials, SetupInput } from '@shared/schemas/auth'
import { call } from '@/lib/api'

export const authKeys = { status: ['auth', 'status'] as const }

export function useAuthStatus() {
  return useQuery({ queryKey: authKeys.status, queryFn: () => call('auth:status') })
}

function useAuthMutation<I>(fn: (input: I) => ReturnType<typeof call<'auth:status'>>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (status) => {
      // Settings etc. may have changed (setup saves the shop name); refetch everything.
      void qc.invalidateQueries()
      qc.setQueryData(authKeys.status, status)
    }
  })
}

export const useSetup = () => useAuthMutation((input: SetupInput) => call('auth:setup', input))
export const useLogin = () => useAuthMutation((input: Credentials) => call('auth:login', input))
export const useLogout = () => useAuthMutation(() => call('auth:logout'))
