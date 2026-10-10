import { Construction } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { allNavItems } from '@/components/layout/navigation'

export function ComingSoonPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const item = allNavItems.find((i) => i.path.split('?')[0] === pathname)
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <Construction className="size-12 text-muted" />
      <h1 className="text-xl font-semibold">{item ? t(`menu.${item.key}`) : t('common.comingSoon')}</h1>
      <p className="max-w-sm text-muted">{t('common.comingSoonText')}</p>
    </div>
  )
}
