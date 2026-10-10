import { LogOut } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStatus, useLogout } from '@/features/auth/api'
import { useAppInfo, useSettings } from '@/features/settings/api'
import { LanguageToggle } from './language-toggle'
import { allNavItems, menus, toolbar } from './navigation'

function useGlobalShortcuts() {
  const navigate = useNavigate()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const item = allNavItems.find((i) => i.shortcut === e.key)
      if (item && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        // `t` param forces a re-trigger (e.g. refocus search) even on the same route
        navigate(item.path + (item.path.includes('?') ? '&' : '?') + `t=${Date.now()}`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])
}

function MenuBar() {
  const { t, i18n } = useTranslation()
  const { data: settings } = useSettings()
  const shopName = (i18n.language === 'ur' && settings?.shopNameUr) || settings?.shopName
  const { data: auth } = useAuthStatus()
  const logout = useLogout()

  return (
    <div className="flex h-9 items-center gap-1 bg-chrome px-2 text-chrome-text">
      <Link to="/" className="me-3 px-2 text-sm font-semibold text-white">
        {shopName || t('app.name')}
      </Link>
      {menus.map((menu) => (
        <DropdownMenu.Root key={menu.key}>
          <DropdownMenu.Trigger className="rounded px-3 py-1 text-sm hover:bg-white/15 data-[state=open]:bg-white/20 focus:outline-none">
            {t(`menu.${menu.key}`)}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={4}
              className="z-50 min-w-56 rounded-md border border-border bg-surface p-1 text-text shadow-lg"
            >
              {menu.items.map((item, i) =>
                item === 'separator' ? (
                  <DropdownMenu.Separator key={i} className="my-1 h-px bg-border" />
                ) : (
                  <DropdownMenu.Item key={item.key} asChild>
                    <Link
                      to={item.path}
                      className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-primary-soft"
                    >
                      <item.icon className="size-4 text-muted" />
                      <span className="flex-1">{t(`menu.${item.key}`)}</span>
                      {item.shortcut && <span className="num text-xs text-muted">{item.shortcut}</span>}
                    </Link>
                  </DropdownMenu.Item>
                )
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ))}
      <div className="ms-auto flex items-center gap-2">
        <LanguageToggle persist />
        <span className="text-xs opacity-80">{auth?.username}</span>
        <button
          type="button"
          onClick={() => logout.mutate()}
          className="rounded p-1.5 hover:bg-white/15"
          title={t('auth.logout')}
          aria-label={t('auth.logout')}
        >
          <LogOut className="size-4 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  )
}

function Toolbar() {
  const { t } = useTranslation()
  return (
    <div className="flex items-stretch gap-0.5 overflow-x-auto border-b border-border bg-surface px-2 py-1">
      {toolbar.map((item, i) =>
        item === 'separator' ? (
          <div key={i} className="mx-1 w-px self-stretch bg-border" />
        ) : (
          <Link
            key={item.key}
            to={item.path}
            title={item.shortcut ? `${t(`menu.${item.key}`)} (${item.shortcut})` : t(`menu.${item.key}`)}
            className="flex min-w-16 flex-col items-center gap-0.5 rounded px-2 py-1 text-xs text-text hover:bg-primary-soft"
          >
            <item.icon className="size-5 text-primary" />
            <span className="whitespace-nowrap">{t(`menu.${item.key}`)}</span>
          </Link>
        )
      )}
    </div>
  )
}

function StatusBar() {
  const { t } = useTranslation()
  const { data: info } = useAppInfo()
  return (
    <div className="flex h-7 items-center justify-between border-t border-border bg-surface-2 px-3 text-xs text-muted">
      <span>{t('app.footer')}</span>
      <span className="num">v{info?.version}</span>
    </div>
  )
}

export function AppShell() {
  useGlobalShortcuts()
  return (
    <div className="flex h-full flex-col">
      <MenuBar />
      <Toolbar />
      <main className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </main>
      <StatusBar />
    </div>
  )
}
