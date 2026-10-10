import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { useAuthStatus } from '@/features/auth/api'
import { LoginPage } from '@/features/auth/login-page'
import { SetupPage } from '@/features/auth/setup-page'
import { HomePage } from '@/features/home/home-page'
import { ComingSoonPage } from '@/features/placeholder/coming-soon-page'
import { ProductsPage } from '@/features/products/products-page'
import { useSettings } from '@/features/settings/api'
import { SettingsPage } from '@/features/settings/settings-page'
import { applyLanguage } from '@/i18n'

function useSavedLanguage() {
  const { data: settings } = useSettings()
  useEffect(() => {
    if (settings) applyLanguage(settings.language)
  }, [settings?.language]) // eslint-disable-line react-hooks/exhaustive-deps
}

export function App() {
  useSavedLanguage()
  const { data: auth, isPending } = useAuthStatus()

  if (isPending || !auth) return null
  if (!auth.isSetUp) return <SetupPage />
  if (!auth.isLoggedIn) return <LoginPage />

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
