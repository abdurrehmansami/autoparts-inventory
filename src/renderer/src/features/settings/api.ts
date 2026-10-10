import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SettingsPatch } from '@shared/schemas/settings'
import { call } from '@/lib/api'

export const settingsKeys = { all: ['settings'] as const, info: ['app', 'info'] as const }

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.all, queryFn: () => call('settings:get') })
}

export function useAppInfo() {
  return useQuery({ queryKey: settingsKeys.info, queryFn: () => call('app:info'), staleTime: Infinity })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: SettingsPatch) => call('settings:update', patch),
    onSuccess: (settings) => qc.setQueryData(settingsKeys.all, settings)
  })
}
