import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { allNavItems, toolbar } from '@/components/layout/navigation'
import { useSettings } from '@/features/settings/api'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const { data: settings } = useSettings()
  const shopName = i18n.language === 'ur' && settings?.shopNameUr ? settings.shopNameUr : settings?.shopName
  const tiles = toolbar.filter((i) => i !== 'separator')

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">{shopName || t('home.title')}</h1>
        <p className="mt-1 text-muted">{t('home.subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-5 text-center hover:border-primary hover:bg-primary-soft"
          >
            <item.icon className="size-7 text-primary" />
            <span className="text-sm font-medium">{t(`menu.${item.key}`)}</span>
          </Link>
        ))}
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{t('home.shortcuts')}</h2>
        <div className="flex flex-wrap gap-2">
          {allNavItems
            .filter((i) => i.shortcut)
            .map((i) => (
              <span key={i.key} className="rounded-md border border-border bg-surface px-3 py-1 text-sm">
                <kbd className="num me-2 font-semibold">{i.shortcut}</kbd>
                {t(`menu.${i.key}`)}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}
