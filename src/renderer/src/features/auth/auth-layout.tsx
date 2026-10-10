import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '@/components/layout/language-toggle'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-chrome to-primary">
      <div className="flex justify-end p-4">
        <LanguageToggle variant="onDark" />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-2xl">
          <p className="mb-1 text-sm font-semibold text-primary">{t('app.name')}</p>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
      <p className="p-4 text-center text-xs text-chrome-text/80">{t('app.footer')}</p>
    </div>
  )
}
