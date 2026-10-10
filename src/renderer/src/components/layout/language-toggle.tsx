import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUpdateSettings } from '@/features/settings/api'
import { applyLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

/** Switches English ⇄ اردو. Persists to settings when logged in; otherwise only for this session. */
export function LanguageToggle({ variant = 'default', persist = false }: { variant?: 'default' | 'onDark'; persist?: boolean }) {
  const { i18n } = useTranslation()
  const update = useUpdateSettings()
  const next = i18n.language === 'ur' ? 'en' : 'ur'

  return (
    <button
      type="button"
      onClick={() => {
        applyLanguage(next)
        if (persist) update.mutate({ language: next })
      }}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm',
        variant === 'onDark' ? 'bg-white/15 text-white hover:bg-white/25' : 'text-chrome-text hover:bg-white/15'
      )}
    >
      <Languages className="size-4" />
      <span className={next === 'ur' ? 'font-urdu' : 'font-sans'}>{next === 'ur' ? 'اردو' : 'English'}</span>
    </button>
  )
}
